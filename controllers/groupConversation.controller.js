const GroupConversation = require('../models/groupConversation.model');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');
const GroupMessage = require('../models/groupMessage.model');

/***
 * ---------------------------------------
 * GET
 * ---------------------------------------
 */
//Récupère toutes les conversations de groupe pour l'utilisateur connecté
exports.getConversationsForAuthenticateUser = async (req,res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const userId = req.user.id;

    try {
        const conversations = await GroupConversation.find({ participants: userId })
            .populate('groupId', 'name')
            .populate('lastMessage.senderId', 'firstName lastName');

        if (!conversations || conversations.length === 0) {
            return res.status(404).json({ message: messages[lang].NO_CONVERSATIONS_GROUP_FOUND });
        }

        return res.status(200).json(conversations);
    } catch (err) {
        return res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};

// Récupère une conversation de groupe par son ID
exports.getGroupConversationById = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const userId = req.user.id;
    const conversationId = req.params.conversationId;

    try {
        const conversation = await GroupConversation.findById(conversationId)
            .populate('participants', 'firstName lastName')
            .populate({
                path: 'messages',
                populate: {
                    path: 'senderId',
                    select: 'firstName lastName'
                }
            })
            .exec();

        if (!conversation) {
            return res.status(404).json({ message: messages[lang].CONVERSATION_NOT_FOUND });
        }

        const unreadMessages = await GroupMessage.find({
            groupId: conversation.groupId,
            readBy: { $ne: userId },
            senderId: { $ne: userId }
        });

        if (unreadMessages.length > 0) {
            for (let unreadMessage of unreadMessages) {
                unreadMessage.readBy.push(userId);
                await unreadMessage.save();
            }
        }

        return res.status(200).json(conversation);
    } catch (err) {
        return res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};

