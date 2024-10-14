const BlockedUser = require('../models/blockedUser.model');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');

async function isBlockingRequestFromConnectedUser(req, res, next) {
    const lang = getLanguageFromHeaders(req) || 'en';
    const userId = req.user.id;
    const blockedUserDocId = req.params.blockedUserDocId;

    try {
        const blockingRequest = await BlockedUser.findById(blockedUserDocId);

        if (!blockingRequest) {
            return res.status(404).json({ message: messages[lang].BLOCKING_REQUEST_NOT_FOUND });
        }

        if (blockingRequest.blockingUserId.toString() !== userId) {
            return res.status(403).json({ message: messages[lang].NOT_ALLOWED });
        }

        next();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = isBlockingRequestFromConnectedUser;
