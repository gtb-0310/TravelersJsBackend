const PrivateConversation = require('../models/privateConversation.model');
const PrivateMessage = require('../models/privateMessage.model');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');


exports.getAllConversationsByUserId = async (req, res) => {
    const userId = req.user.id;
    const lang = getLanguageFromHeaders(req) || 'en';

    try {
        const conversations = await PrivateConversation.find({ participants: userId })
            .populate('participants', 'firstName lastName')
            .populate({
                path: 'lastMessage',
                select: 'content timestamp senderId',
                populate: {
                    path: 'senderId',
                    select: 'firstName lastName'
                }
            });

        if (!conversations.length) {
            return res.status(404).json({ message: messages[lang].PRIVATE_CONVERS_NOT_FOUND });
        }

        res.json(conversations);
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};


exports.deleteConversationById = async (req, res) => {
    const { conversationId } = req.params;
    const lang = getLanguageFromHeaders(req) || 'en';

    try {
        const conversation = await PrivateConversation.findByIdAndDelete(conversationId);

        if (!conversation) {
            return res.status(404).json({ message: messages[lang].PRIVATE_CONVERS_NOT_FOUND });
        }

        await PrivateMessage.deleteMany({ conversationId });

        res.json({ message: messages[lang].CONVERSATION_DELETED_SUCCESS });
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};


exports.addParticipantToConversation = async (req, res) => {
    const { conversationId } = req.params;
    const { userId } = req.body;
    const lang = getLanguageFromHeaders(req) || 'en';

    try {
        const conversation = await PrivateConversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: messages[lang].PRIVATE_CONVERS_NOT_FOUND });
        }

        if (conversation.participants.includes(userId)) {
            return res.status(400).json({ message: messages[lang].USER_ALREADY_IN_CONVERSATION });
        }

        conversation.participants.push(userId);
        await conversation.save();

        res.json({ message: messages[lang].USER_ADDED_TO_CONVERSATION_SUCCESS });
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};
