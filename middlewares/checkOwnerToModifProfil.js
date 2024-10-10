const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');
const User = require('../models/user.model');

async function checkOwnerToModifProfil(req, res, next) {
    const lang = getLanguageFromHeaders(req) || 'en';
    const userIdFromToken = req.user.id;
    try {
        const user = await User.findById(userIdFromToken);

        if (!user) {
            return res.status(404).json({ message: messages[lang].USER_ID_NOT_FOUND });
        }

        if (user._id.toString() !== userIdFromToken) {
            return res.status(403).json({ message: messages[lang].NOT_ALLOWED_TO_DELETE_OTHER_PROFILE });
        }

        next();

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports = checkOwnerToModifProfil;
