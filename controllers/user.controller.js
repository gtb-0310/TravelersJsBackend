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
//const cloudinary = require('../config/cloudinaryConfig');

/***
 * ---------------------------------------
 * GET
 * ---------------------------------------
 */
exports.getUserById = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const userId = req.params.id;

    try {
        const user = await User.findById(userId).select('firstName lastName birthDate description languages interests');

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
exports.updateUser = async (req, res) => {
    const {
        firstName,
        lastName,
        profilePictureUrl,
        description,
        languages,
        interests
    } = req.body;

    const lang = getLanguageFromHeaders(req) || 'en';
    const userId = req.user.id;


    try {
        const userToUpdate = await User.findById(userId);

        if (!userToUpdate) {
            return res.status(404).json({ message: messages[lang].USER_ID_NOT_FOUND });
        }

        userToUpdate.firstName = firstName;
        userToUpdate.lastName = lastName;
        userToUpdate.profilePictureUrl = profilePictureUrl;
        userToUpdate.description = description;
        const oldLanguages = userToUpdate.languages;
        userToUpdate.languages = languages;
        userToUpdate.interests = interests;


        const updatedUser = await userToUpdate.save();


        if (oldLanguages !== languages) {
            const groups = await Group.find({ members: userId });

            for (let group of groups) {
                const members = await User.find({ _id: { $in: group.members } });
                const updatedLanguages = [...new Set(members.flatMap(member => member.languages.map(lang => lang.toString())))];
                group.languages = updatedLanguages;
                await group.save();
            }
        }

        res.status(200).json(updatedUser);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const lang = getLanguageFromHeaders(req) || 'en';
    const userId = req.user.id;

    try {

        if( newPassword!== confirmNewPassword ){
            return res.status(400).json({ message: messages[lang].PASSWORDS_DO_NOT_MATCH });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: messages[lang].USER_ID_NOT_FOUND });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: messages[lang].WRONG_CURRENT_PASSWORD });
        }


        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.status(200).json({ message: messages[lang].PASSWORD_UPDATED_WITH_SUCCESS });
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
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
            host: 'sandbox.smtp.mailtrap.io',
            port: 2525,
            auth: {
                user: process.env.MAILTRAP_USER,
                pass: process.env.MAILTRAP_PASS
            }
        });

        
        const mailOptions = {
            from: 'noreply@travelers.com',
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

        user.refreshToken = undefined;

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
// exports.deleteUserProfil = async (req, res) => {
//     const lang = getLanguageFromHeaders(req) || 'en';
//     const userId = req.user.id;

//     try {
//         const userProfilToDelete = await User.findByIdAndDelete(userId);

//         if (!userProfilToDelete) {
//             return res.status(404).json({ message: messages[lang].USER_ID_NOT_FOUND });
//         }

//         const groups = await Group.find({ members: userId });

//         for (const group of groups) {
//             if (group.administrator.toString() === userId) {
//                 if (group.members.length === 1) {
//                     await Trip.findOneAndDelete({ groupId: group._id });
//                     await Group.findByIdAndDelete(group._id);
//                     continue;
//                 } else {
//                     group.administrator = group.members[0];
//                     await Trip.updateOne({ groupId: group._id }, { userId: group.administrator });
//                 }
//             }


//             group.members.pull(userId);

//             const remainingMembers = await User.find({ _id: { $in: group.members } });
//             const updatedLanguages = [...new Set(remainingMembers.flatMap(member => member.languages.map(lang => lang.toString())))];

//             group.languages = updatedLanguages;
//             await group.save();

//         }


//         const conversations = await PrivateConversation.find({ participants: userId });

//         for (const conversation of conversations) {
//             conversation.participants.pull(userId);

//             if (conversation.participants.length === 0) {
//                 await PrivateConversation.findByIdAndDelete(conversation._id);
//             } else {
//                 await conversation.save();
//             }
//         }

//         await PrivateMessage.deleteMany({ senderId: userId });
//         await BlockedUser.deleteMany({ blockingUserId: userId });
//         await GroupJoinRequest.deleteMany({ userId: userId });
//         await GroupMessage.deleteMany({ senderId: userId });
//         await ReportedUser.deleteMany({ reportedUserId: userId });

//         res.json({ message: messages[lang].PROFIL_DELETE_WITH_SUCCESS });

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: messages[lang].SERVER_ERROR });
//     }
// };
exports.deleteUserProfil = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const userId = req.user.id;

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
                    const newAdmin = group.members.find(member => member.toString() !== userId);
                    group.administrator = newAdmin;
                    await Trip.updateOne({ groupId: group._id }, { userId: newAdmin });
                }
            }

            group.members.pull(userId);

            const remainingMembers = await User.find({ _id: { $in: group.members } });
            const updatedLanguages = [...new Set(remainingMembers.flatMap(member => member.languages.map(lang => lang.toString())))];
            group.languages = updatedLanguages;

            await group.save();
        }

        // Gestion des conversations privées
        const conversations = await PrivateConversation.find({ participants: userId });

        for (const conversation of conversations) {
            // Supprimer les messages de l'utilisateur du tableau `messages`
            const userMessages = await PrivateMessage.find({ senderId: userId });
            const messageIds = userMessages.map(msg => msg._id); // Récupère les IDs des messages à supprimer

            conversation.messages = conversation.messages.filter(messageId => !messageIds.includes(messageId));

            // Si le `lastMessage` a été envoyé par l'utilisateur, on cherche le dernier message valide
            if (conversation.lastMessage && conversation.lastMessage.senderId.toString() === userId) {
                // On cherche le dernier message valide envoyé par un autre utilisateur
                const lastValidMessage = await PrivateMessage.findOne({
                    _id: { $in: conversation.messages }, // Parmi les messages encore valides
                    senderId: { $ne: userId } // Un message envoyé par un autre utilisateur
                }).sort({ timestamp: -1 }); // Trier par date décroissante pour avoir le dernier message

                if (lastValidMessage) {
                    // Si on trouve un message valide, on met à jour `lastMessage`
                    conversation.lastMessage = {
                        senderId: lastValidMessage.senderId,
                        content: lastValidMessage.content,
                        timestamp: lastValidMessage.timestamp
                    };
                } else {
                    // Si aucun message valide n'est trouvé, on supprime le champ lastMessage
                    conversation.lastMessage = null;
                }
            }

            // Gérer la suppression de l'utilisateur de la conversation
            conversation.participants.pull(userId);
            if (conversation.participants.length <= 1) {
                await PrivateConversation.findByIdAndDelete(conversation._id);
            } else {
                await conversation.save();
            }
        }

        // Supprimer les messages de PrivateMessage
        await PrivateMessage.deleteMany({ senderId: userId });

        // Supprimer d'autres données associées
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



