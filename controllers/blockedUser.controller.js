const BlockedUser = require('../models/blockedUser.model'),
    getLanguageFromHeaders = require('../utils/languageUtils'),
    messages = require('../utils/messages');

/***
 * ---------------------------------------
 * GET
 * ---------------------------------------
 */
exports.getBlockedUserList = async (req, res) => {
    const blockingUserId = req.user.id
    const lang = getLanguageFromHeaders(req) || 'en';
    try {
        const blockedUsers = await BlockedUser.find({ blockingUserId })
        .populate('blockedUserId', 'firstName lastName profilePictureUrl');
        
        if(!blockedUsers || blockedUsers.length < 1){
            return res.status(404).json({ message: messages[lang].NO_BLOCKED_USER_FOUND });
        }
        res.json(blockedUsers);
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};


/***
 * ---------------------------------------
 * POST
 * ---------------------------------------
 */
exports.createBlockedUser = async (req, res) => {
    const { blockedUserId } = req.body;
    const blockingUserId = req.user.id;
    const lang = getLanguageFromHeaders(req) || 'en';

    const blockedUser = new BlockedUser({ blockingUserId, blockedUserId });

    try {
        const newBlockedUser = await blockedUser.save();
        res.status(201).json({ message: messages[lang].USER_BLOCKED_WITH_SUCCESS });
    } catch (err) {
        res.status(400).json({ message: messages[lang].BAD_REQUEST });
    }
};


/***
 * ---------------------------------------
 * DELETE
 * ---------------------------------------
 */
exports.deleteBlockedUser = async (req, res) => {
    const blockedUserDocId = req.params.blockedUserDocId;
    const userId = req.user.id;
    const lang = getLanguageFromHeaders(req) || 'en';

    if (!blockedUserDocId) {
        return res.status(400).json({ message: messages[lang].BLOCKED_USER_NOT_FOUND });
    }

    try {
        const unblockedUser = await BlockedUser.findOneAndDelete(blockedUserDocId);
        if (!unblockedUser) {
            return res.status(404).json({ message: messages[lang].ERROR_OCCURED });
        }
        res.json({ message: messages[lang].SUCCESS_UNBLOCKED_USER });
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};




