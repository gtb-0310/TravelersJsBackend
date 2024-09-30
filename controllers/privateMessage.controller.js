const PrivateMessage = require('../models/privateMessage.model');
const PrivateConversation = require('../models/privateConversation.model');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');

/***
 * ---------------------------------------
 * GET
 * ---------------------------------------
 */
exports.getMessagesByConversationId = async (req, res) => {
    const { conversationId } = req.params;
    const lang = getLanguageFromHeaders(req) || 'en';
    try {
        const conversation = await PrivateConversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: messages[lang].PRIVATE_CONVERS_NOT_FOUND });
        }

        const messages = await PrivateMessage.find({ conversationId }).sort({ timestamp: 1 });

        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};

exports.getPrivateMessageById = async (req, res) => {
    const messageId = req.params.id;
    const lang = getLanguageFromHeaders(req) || 'en';

    try{
        const msg = await PrivateMessage.findById(messageId);
        if(!msg){
            return res.status(400).json({ message: messages[lang].PRIVATE_MSG_NOT_FOUND });
        }
        res.json(msg);
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
}


/***
 * ---------------------------------------
 * POST
 * ---------------------------------------
 */
exports.sendMessage = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const senderId = req.user.id;
    const { recipientId, content } = req.body;

    try {
        let conversation = await PrivateConversation.findOne({
            participants: { $all: [senderId, recipientId] }
        });


        
        if (!conversation) {
            conversation = new PrivateConversation({
                participants: [senderId, recipientId]
            });
            await conversation.save();
        }

        const newMessage = new PrivateMessage({
            conversationId: conversation._id,
            senderId,
            recipientId,
            content,
            timestamp: new Date(),
            isRead: false
        });

        const savedMessage = await newMessage.save();

        conversation.messages.push(savedMessage._id);
        
        conversation.lastMessage = {
            senderId: savedMessage.senderId,
            content: savedMessage.content,
            timestamp: savedMessage.timestamp
        };

        await conversation.save();

        res.status(201).json(savedMessage);
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};


/***
 * ---------------------------------------
 * PUT
 * ---------------------------------------
 */
exports.updateMessageById = async (req, res) => {
    const { id } = req.params;
    const lang = getLanguageFromHeaders(req) || 'en';
    const { content } = req.body;

    try {
        const message = await PrivateMessage.findById(id);

        if (!message) {
            return res.status(404).json({ message: messages[lang].PRIVATE_MSG_NOT_FOUND });
        }

        message.content = content;
        const updatedMessage = await message.save();

        res.json(updatedMessage);
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};

exports.markLastMessageAsRead = async (req, res) => {
    const { conversationId } = req.params;
    const lang = getLanguageFromHeaders(req) || 'en';

    try {
        const conversation = await PrivateConversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: messages[lang].PRIVATE_CONVERS_NOT_FOUND });
        }

        const lastMessage = await PrivateMessage.findOne({ conversationId }).sort({ timestamp: -1 });

        if (lastMessage) {
            lastMessage.isRead = true;
            await lastMessage.save();
        }

        res.json({ message: messages[lang].LAST_MESSAGE_MARKED_AS_READ });
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};



/***
 * ---------------------------------------
 * DELETE
 * ---------------------------------------
 */

exports.deleteMessageById = async (req, res) => {
    const { id } = req.params;
    const lang = getLanguageFromHeaders(req) || 'en';

    try {
        const message = await PrivateMessage.findByIdAndDelete(id);

        if (!message) {
            return res.status(404).json({ message: messages[lang].PRIVATE_MSG_NOT_FOUND });
        }

        let conversation = await PrivateConversation.findOneAndUpdate(
            { messages: id },
            { $pull: { messages: id } },
            { new: true }
        );

        if (conversation && conversation.messages.length === 0) {
            await PrivateConversation.findByIdAndDelete(conversation._id);
        } else if (conversation && conversation.lastMessage.toString() === id) {
            const lastMessage = await PrivateMessage.findOne({ conversationId: conversation._id })
                .sort({ timestamp: -1 });

            if (lastMessage) {
                conversation.lastMessage = lastMessage._id;
            } else {
                conversation.lastMessage = null;
            }

            await conversation.save();
        }

        res.status(200).json({ message: messages[lang].MESSAGE_DELETED_SUCCESS });
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};

