const Administrator = require('../models/Administrator.model');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');


const checkDatabaseAdministrator = async (req, res, next) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const userId = req.user.id;

    try {
        const isAdmin = await Administrator.findOne({ userId });

        if (isAdmin) {
            next();
        } else {
            return res.status(403).json({ message: messages[lang].NOT_MODERATOR_DENIED_ACCESS });
        }
    } catch (err) {
        return res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};

module.exports = checkDatabaseAdministrator;
