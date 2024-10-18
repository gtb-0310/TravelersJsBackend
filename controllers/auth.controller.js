const User = require('../models/user.model'),
    bcrypt = require('bcrypt'),
    jwt = require('jsonwebtoken'),
    getLanguageFromHeaders = require('../utils/languageUtils'),
    messages = require('../utils/messages'),
    crypto = require('crypto'),
    nodemailer = require('nodemailer');

exports.login = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';

    try {
        const user = await User.findOne({ email: req.body.email});

        if (!user) {
            return res.status(400).json({ message: messages[lang].USER_NOT_FOUND});
        }

        if (!user.emailVerified) {
            return res.status(403).json({ message: messages[lang].EMAIL_NOT_VERIFIED });
        }

        if (await bcrypt.compare(req.body.password, user.password)) {
            const accessToken = jwt.sign({ id: user._id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'});
            const refreshToken = jwt.sign({ id: user._id}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '30d'});

            await User.findByIdAndUpdate(user._id, { refreshToken }, { new: true, runValidators: false });


            res.json({ accessToken, refreshToken});
        } else {
            res.status(401).json({ message: messages[lang].WRONG_PASSWORD});
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.refreshToken = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const refreshToken = req.body.token;
    if (!refreshToken) {
        return res.status(401).json({ message: messages[lang].SESSION_EXPIRED });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
        return res.status(403).json({ message: messages[lang].SESSION_EXPIRED });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: messages[lang].SESSION_EXPIRED });
        }

        const accessToken = jwt.sign({ id: decoded.id}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        res.json({ accessToken });
    })
};

exports.verifyEmail = async (req, res) => {
    const { token } = req.params;
    const lang = getLanguageFromHeaders(req) || 'en';

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');


        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).json({ message: messages[lang].INVALID_OR_EXPIRED_TOKEN });
        }


        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;

        await user.save();

        res.status(200).json({ message: messages[lang].EMAIL_VERIFIED_SUCCESS });
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

        const resetUrl = `http://localhost:3000/auth/reset-password/${resetToken}?lang=${lang}`;


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
    const { newPassword } = req.body;
    const resetToken = req.params.resetToken;
    const lang = getLanguageFromHeaders(req) || 'en';

    try {
        
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: messages[lang].INVALID_OR_EXPIRED_TOKEN });
        }


        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);


        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.refreshToken = undefined;

        await user.save();

        res.status(200).json({ message: messages[lang].PASSWORD_RESET_WITH_SUCCESS });
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};

exports.logout = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const refreshToken = req.body.token;

    if (!refreshToken) {
        return res.status(400).json({ message: messages[lang].SESSION_EXPIRED });
    }

    try {
        const user = await User.findOne({ refreshToken });

        if (!user) {
            return res.status(400).json({ message: messages[lang].USER_NOT_FOUND });
        }

        await User.findByIdAndUpdate(user._id, { refreshToken: '' }, { new: true, runValidators: false });

        res.status(200).json({ message: messages[lang].LOGOUT_SUCCESS });
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};
