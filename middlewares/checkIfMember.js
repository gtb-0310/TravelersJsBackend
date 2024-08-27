const Group = require('../models/group.model');
const getLanguageFromHeaders = require('../utils/languageUtils');
const messages = require('../utils/messages');

async function checkIfMember(req, res, next) {
    try {
        const { groupId, userId } = req.params;
        const lang = getLanguageFromHeaders(req) || 'en';

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: messages[lang].GROUP_NOT_FOUND });
        }

        if (group.members.includes(userId)) {
            return res.status(400).json({ message: messages[lang].ALREADY_MEMBER });
        }

        next();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = checkIfMember;
