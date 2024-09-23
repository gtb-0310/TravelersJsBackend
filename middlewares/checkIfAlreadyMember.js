const User = require('../models/user.model');
const Group = require('../models/group.model');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');

async function checkIfAlreadyMember(req, res, next) {
    const lang = getLanguageFromHeaders(req) || 'en';
    const userId = req.user.id; 
    const groupId = req.params.groupId;

    try {
        const user = await User.findById(userId);
        const group = await Group.findById(groupId);

        if(!user){
            return res.status(404).json({ message: messages[lang].USER_NOT_FOUND });
        }

        if(!group){
            return res.status(404).json({ message: messages[lang].GROUP_NOT_FOUND})
        }

        const isMember = group.members.includes(userId);

        if(isMember){
            res.status(400).json({ message: messages[lang].ALREADY_MEMBER });
        }

        next();
    } catch (err) {
        return res.status(500).json({ message: messages[lang].SERVER_ERROR});
    }
}

module.exports = checkIfAlreadyMember;