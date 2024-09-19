require('dotenv').config();
const User = require('../models/user.model');
const BlockedUser = require('../models/blockedUser.model');
const GroupJoinRequest = require('../models/groupJoinRequest.model');
const GroupMessage = require('../models/groupMessage.model');
const Group = require('../models/group.model');
const PrivateMessage = require('../models/privateMessage.model');
const PrivateConversation = require('../models/privateConversation.model');
const ReportedUser = require('../models/reportedUser.model');
const Trip = require('../models/trip.model');
const messages = require('../utils/messages');
const { calculateAge } = require('../utils/ageUtils');
const getLanguageFromHeaders = require('../utils/languageUtils');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

/***
 * ---------------------------------------
 * GET
 * ---------------------------------------
 */
exports.getUserById = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({ message: messages[lang].USER_ID_NOT_FOUND });
        }

        const age = calculateAge(user.birthDate);

        res.json({ ...user._doc, age });

    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};

/***
 * ---------------------------------------
 * POST
 * ---------------------------------------
 */
exports.createUser = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const { email, password, confirmPassword, birthDate } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: messages[lang].EMAIL_ALREADY_IN_USE });
        }

        if(password !== confirmPassword){
            return res.status(400).json({ message: messages[lang].PASSWORDS_DO_NOT_MATCH });
        }

        const age = calculateAge(birthDate);

        if (age < 16) {
            return res.status(400).json({ message: messages[lang].UNDERAGE_NOT_ALLOWED });
        }


        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);


        const verificationToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');


        const newUser = new User({
            email: email,
            password: hashedPassword,
            firstName: '',
            lastName: '',
            languages: [],
            interests: [],
            birthDate: new Date(birthDate),
            profilePictureUrl: '',
            description: 'Add a description',
            refreshToken: '',
            emailVerified: false,
            emailVerificationToken: hashedToken,
            emailVerificationExpires: Date.now() + 3600000 
        });

        const savedUser = await newUser.save();

        console.log(savedUser);

        const verificationUrl = `http://localhost:3000/auth/verify-email/${verificationToken}`;


        const transporter = nodemailer.createTransport({
            host: 'sandbox.smtp.mailtrap.io',
            port: 2525,
            auth: {
                user: process.env.MAILTRAP_USER,
                pass: process.env.MAILTRAP_PASS
            }
        });

        const mailOptions = {
            from: 'noreply@travelers.com',
            to: email,
            subject: messages[lang].VERIFY_EMAIL_SUBJECT,
            html: `
                <p>${messages[lang].VERIFY_EMAIL_BODY}</p>
                <p><a href="${verificationUrl}">${verificationUrl}</a></p>
                <p>${messages[lang].IGNORE_IF_NOT_YOU}</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: messages[lang].EMAIL_VERIFICATION_SENT, user: savedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};

/***
 * ---------------------------------------
 * PUT
 * ---------------------------------------
 */
exports.updateUserById = async (req, res) => {
    const {
        firstName,
        lastName,
        profilePictureUrl,
        description,
        languages,
        interests
    } = req.body;

    const lang = getLanguageFromHeaders(req) || 'en';
    const userId = req.params.id;

    try {
        const userToUpdate = await User.findById(userId);

        if (!userToUpdate) {
            return res.status(404).json({ message: messages[lang].USER_ID_NOT_FOUND });
        }

        userToUpdate.firstName = firstName;
        userToUpdate.lastName = lastName;
        userToUpdate.profilePictureUrl = profilePictureUrl;
        userToUpdate.description = description;
        userToUpdate.languages = languages;
        userToUpdate.interests = interests;

        const updatedUser = await userToUpdate.save();

        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const lang = getLanguageFromHeaders(req) || 'en';
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: messages[lang].USER_ID_NOT_FOUND });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: messages[lang].INVALID_CURRENT_PASSWORD });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.status(200).json({ message: messages[lang].PASSWORD_UPDATED_SUCCESS });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    const lang = getLanguageFromHeaders(req) || 'en';

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: messages[lang].EMAIL_NOT_FOUND });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000;

        await user.save();

        
        const resetUrl = `http://localhost:3000/resetPassword/${resetToken}`;

        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'your-email@gmail.com',
                pass: 'your-email-password'
            }
        });

        
        const mailOptions = {
            from: 'your-email@gmail.com',
            to: user.email,
            subject: messages[lang].RESET_PASSWORD,
            text: `${messages[lang].RESET_PASSWORD_TEXT} ${resetUrl}`,
            html: `<p>${messages[lang].RESET_PASSWORD_HTML}</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
        };
        

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: messages[lang].RESET_PASSWORD_EMAIL_SENT });
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    const lang = getLanguageFromHeaders(req) || 'en';

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: messages[lang].INVALID_OR_EXPIRED_TOKEN });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: messages[lang].PASSWORD_RESET_WITH_SUCCESS });
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};


/***
 * ---------------------------------------
 * DELETE
 * ---------------------------------------
 */
exports.deleteUserProfilById = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const userId = req.params.id;

    try {
        const userProfilToDelete = await User.findByIdAndDelete(userId);

        if (!userProfilToDelete) {
            return res.status(404).json({ message: messages[lang].USER_ID_NOT_FOUND });
        }

        const groups = await Group.find({ members: userId });

        for (const group of groups) {
            if (group.administrator.toString() === userId) {
                if (group.members.length === 1) {
                    await Trip.findOneAndDelete({ groupId: group._id });
                    await Group.findByIdAndDelete(group._id);
                    continue;
                } else {
                    group.administrator = group.members[0];
                    await Trip.updateOne({ groupId: group._id }, { userId: group.administrator });
                }
            }


            group.members.pull(userId);

            await group.save();
        }


        const conversations = await PrivateConversation.find({ participants: userId });

        for (const conversation of conversations) {
            conversation.participants.pull(userId);

            if (conversation.participants.length === 0) {
                await PrivateConversation.findByIdAndDelete(conversation._id);
            } else {
                await conversation.save();
            }
        }

        await PrivateMessage.deleteMany({ senderId: userId });
        await BlockedUser.deleteMany({ blockingUserId: userId });
        await GroupJoinRequest.deleteMany({ userId: userId });
        await GroupMessage.deleteMany({ senderId: userId });
        await ReportedUser.deleteMany({ reportedUserId: userId });

        res.json({ message: messages[lang].PROFIL_DELETE_WITH_SUCCESS });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};


