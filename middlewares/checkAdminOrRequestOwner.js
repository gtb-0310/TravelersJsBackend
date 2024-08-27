const GroupJoinRequest = require('../models/groupJoinRequest.model');
const Group = require('../models/group.model');
const getLanguageFromHeaders = require('../utils/languageUtils');
const messages = require('../utils/messages');

async function checkAdminOrRequestOwner(req, res, next) {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;
        const lang = getLanguageFromHeaders(req) || 'en';


        if (groupId) {
            const group = await Group.findById(groupId);

            if (!group) {
                return res.status(404).json({ message: messages[lang].GROUP_NOT_FOUND });
            }

            if (group.administrators.includes(userId)) {
                return next();
            } else {
                return res.status(403).json({ message: messages[lang].NOT_ADMIN_DENIED_ACCESS });
            }
        }

        return res.status(403).json({ message: messages[lang].NOT_ADMIN_DENIED_ACCESS });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = checkAdminOrRequestOwner;
