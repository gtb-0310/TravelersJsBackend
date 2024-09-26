const Group = require('../models/group.model');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');

async function checkIfUserIsGroupMember(req, res, next) {
    const lang = getLanguageFromHeaders(req) || 'en';
    const userId = req.user.id;
    const groupId = req.params.groupId;

    try {
        const group = await Group.findById(groupId);

        if(!group){
            return res.status(404).json({ message: messages[lang].GROUP_NOT_FOUND });
        }

        if(!group.members.includes(userId)){
            return res.status(403).json({ messages: messages[lang].ONLY_GROUP_MEMBER_READ_MESSAGES });
        }

        next();
        
    }catch (err) {
        return res.status(500).json({ message: messages[lang].SERVER_ERROR});
    }
}

module.exports = checkIfUserIsGroupMember;