const GroupMessage = require('../models/groupMessage.model');
const GroupConversation = require('../models/groupConversation.model');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');


/***
 * ---------------------------------------
 * GET
 * ---------------------------------------
 */
exports.getGroupMessageById = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const messageId = req.params.messageId;  
    const groupId = req.params.groupId;

    try {
        const groupMessage = await GroupMessage.findOne({ _id: messageId, groupId: groupId });

        if (!groupMessage) {
            return res.status(404).json({ message: messages[lang].MSG_NOT_FOUND });
        }

        return res.status(200).json(groupMessage);
    } catch (err) {
        return res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};


/***
 * ---------------------------------------
 * POST
 * ---------------------------------------
 */
exports.sendMessage = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const { groupId } = req.params;
    const { content } = req.body;
    const senderId = req.user.id;

    if (!content || content.trim() === "") {
        return res.status(400).json({ message: messages[lang].MSG_REQUIRED });
    }

    try {
        let conversation = await GroupConversation.findOne({ groupId: groupId });

        if (!conversation) {
            conversation = new GroupConversation({
                groupId: groupId,
                participants: [senderId],
                lastMessage: {},
                messages: []
            });

            await conversation.save();
        }


        const newMessage = new GroupMessage({
            content: content,
            groupId: groupId,
            senderId: senderId,
            timestamp: new Date(),
            readBy: []
        });

        const savedMessage = await newMessage.save();


        conversation.lastMessage = {
            senderId: senderId,
            content: content,
            timestamp: new Date()
        };


        conversation.messages.push(savedMessage._id);

        await conversation.save();

        // Réponse réussie
        return res.status(201).json({ message: messages[lang].MESSAGE_SEND_WITH_SUCCES });
    } catch (err) {
        console.error("Erreur dans sendMessage :", err);
        return res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};




/***
 * ---------------------------------------
 * PUT
 * ---------------------------------------
 */
exports.updateGroupMessage = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const messageId = req.params.id;
    const { content } = req.body;

    try {
        const groupMessage = await GroupMessage.findById(messageId);

        if (!groupMessage) {
            return res.status(404).json({ message: messages[lang].MSG_NOT_FOUND });
        }

        groupMessage.content = content;
        const updatedMessage = await groupMessage.save();

        const conversation = await GroupConversation.findOne({ groupId: groupMessage.groupId });

        if (conversation && conversation.lastMessage && conversation.lastMessage.senderId.equals(groupMessage.senderId)) {
            conversation.lastMessage.content = content;
            conversation.lastMessage.timestamp = new Date();
            await conversation.save();
        }

        return res.status(200).json(updatedMessage);
    } catch (err) {
        return res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};



/***
 * ---------------------------------------
 * DELETE
 * ---------------------------------------
 */
exports.deleteGroupMessage = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const messageId = req.params.id;
    
    try {
        const msgToDelete =  await GroupMessage.findByIdAndDelete(messageId);

        if(!msgToDelete){
            return res.status(404).json({ message: messages[lang].MSG_NOT_FOUND });
        }

        return res.status(200).json({ message: messages[lang].MESSAGE_DELETED_SUCCESS });
    } catch (err) {
        return res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};