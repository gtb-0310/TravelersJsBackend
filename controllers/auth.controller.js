const User = require('../models/user.model'),
    bcrypt = require('bcrypt'),
    jwt = require('jsonwebtoken'),
    getLanguageFromHeaders = require('../utils/languageUtils'),
    messages = require('../utils/messages');

exports.login = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const user = await User.findOne({ email: req.body.email});
    if (!user) {
        return res.status(400).json({ message: messages[lang].USER_NOT_FOUND});
    }
    try{
        if (await bcrypt.compare(req.body.password, user.password)) {
            const accessToken = jwt.sign({ id: user._id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'});
            const refreshToken = jwt.sign({ id: user._id}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '30d'});

            await User.findByIdAndUpdate(user._id, { refreshToken }, { new: true, runValidators: false });

            // user.refreshToken = refreshToken;
            // await user.save();

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
}