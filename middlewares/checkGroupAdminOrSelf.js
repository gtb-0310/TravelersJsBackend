const Group = require('../models/group.model');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');

async function checkGroupAdminOrSelf(req, res, next) {
    const lang = getLanguageFromHeaders(req) || 'en';
    const userId = req.user.id;
    const { groupId, userId: targetUserId } = req.params;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: messages[lang].GROUP_NOT_FOUND });
        }

        const isAdmin = group.administrator.toString() === userId;
        const isSelf = userId === targetUserId;

        if (isAdmin || isSelf) {
            return next();
        } else {
            return res.status(403).json({ message: messages[lang].NOT_ADMIN_DENIED_ACCESS });
        }

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = checkGroupAdminOrSelf;
