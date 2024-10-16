const GroupConversation = require('../models/groupConversation.model');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');

async function checkIfConversationGroupMember(req, res, next) {
  const lang = getLanguageFromHeaders(req) || 'en';
  const userId = req.user.id;
  const conversationId = req.params.conversationId;

  try {
    const conversation = await GroupConversation.findById(conversationId).select('participants');

    if (!conversation) {
      return res.status(404).json({ message: messages[lang].CONVERSATION_NOT_FOUND });
    }

    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ message: messages[lang].NOT_ALLOWED });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: messages[lang].SERVER_ERROR });
  }
}

module.exports = checkIfConversationGroupMember;
