const BlockedUser = require('../models/blockedUser.model'),
    getLanguageFromHeaders = require('../utils/languageUtils'),
    messages = require('../utils/messages');

exports.getBlockedUserById = async (req, res) => {
    const { blockingUserId } = req.params
    const lang = getLanguageFromHeaders(req) || 'en';
    try {
        const blockedUsers = await BlockedUser.find({ blockingUserId });
        if(!blockedUsers){
            return res.status(404).json({ message: messages[lang].USER_WITH_ID_NOT_FOUND });
        }
        res.json(blockedUsers);
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};

exports.createBlockedUser = async (req, res) => {
    const { blockingUserId, blockedUserId } = req.body;
    const lang = getLanguageFromHeaders(req) || 'en';

    if (!blockingUserId || !blockedUserId) {
        return res.status(400).json({ message: messages[lang].MISSING_FIELDS });
    }

    const blockedUser = new BlockedUser({ blockingUserId, blockedUserId });

    try {
        const newBlockedUser = await blockedUser.save();
        res.status(201).json(newBlockedUser);
    } catch (err) {
        res.status(400).json({ message: messages[lang].BAD_REQUEST });
    }
};

exports.deleteBlockedUser = async (req, res) => {
    const { blockingUserId, blockedUserId } = req.params;
    const lang = getLanguageFromHeaders(req) || 'en';

    if (!blockingUserId || !blockedUserId) {
        return res.status(400).json({ message: messages[lang].MISSING_FIELDS });
    }

    try {
        const unblockedUser = await BlockedUser.findOneAndDelete({ blockingUserId, blockedUserId });
        if (!unblockedUser) {
            return res.status(404).json({ message: messages[lang].ERROR_OCCURED });
        }
        res.json({ message: messages[lang].SUCCESS_UNBLOCKED_USER });
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};



