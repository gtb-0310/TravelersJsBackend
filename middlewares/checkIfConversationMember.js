const privateConversation = require('../models/privateConversation.model');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');

async function checkIfConversationMember(req, res, next){
    const lang = getLanguageFromHeaders(req) || 'en';
    const conversationId = req.params.conversationId;
    const userId = req.user.id;

    try{
        const conversation = await privateConversation.findById(conversationId);

        if(!conversation){
            return res.status(404).json({ message: messages[lang].CONVERSATION_NOT_FOUND });
        }

        if (!conversation.participants.includes(userId)) {
            return res.status(403).json({ message: messages[lang].USER_NOT_IN_CONVERSATION });
        }

        next();

        
    } catch (err) {
        return res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
}

module.exports = checkIfConversationMember;