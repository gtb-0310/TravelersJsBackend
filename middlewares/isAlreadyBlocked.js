const BlockedUser = require('../models/blockedUser.model');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');

async function isAlreadyBlocked(req, res, next) {
    const lang = getLanguageFromHeaders(req) || 'en';
    const userId = req.user.id;
    const blockedUserId = req.body.blockedUserId;

    try {
        const blockingRequest = await BlockedUser.findOne({
            blockingUserId: userId,
            blockedUserId: blockedUserId
        });

        if (blockingRequest) {
            return res.status(400).json({ message: messages[lang].USER_ALREADY_BLOCKED });
        }

        next();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = isAlreadyBlocked;
