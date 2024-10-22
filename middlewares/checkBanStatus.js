const User = require('../models/user.model');
const getLanguageFromHeaders = require('../utils/languageUtils');
const messages = require('../utils/messages');

const checkBanStatus = async (req, res, next) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const email = req.body.email;

    try {
        const user = await User.findOne({ email });

        if(!user){
            res.status(404).json({ message: messages[lang].AUTH_USER_NOT_FOUND });
        }

        if (user && user.isBanned) {
            if (user.banTimeLapse && new Date() > user.banTimeLapse) {
                user.isBanned = false;
                user.banTimeLapse = undefined;
                await user.save();
            } else if (user.banTimeLapse) {
                return res.status(403).json({ message: messages[lang].ACCOUNT_BANNED_TEMPORARILY });
            } else {
                return res.status(403).json({ message: messages[lang].ACCOUNT_BANNED_PERMANENTLY });
            }
        }

        next();
    } catch (error) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};

module.exports = checkBanStatus;
