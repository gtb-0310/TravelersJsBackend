const GroupMessage = require('../models/groupMessage.model')
const messages = require('../utils/messages')
const getLanguageFromHeaders = require('../utils/languageUtils');


/***
 * ---------------------------------------
 * GET
 * ---------------------------------------
 */
exports.getConversationByGroupId = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const groupId = req.params.id;
    try {
        const conversation = await GroupMessage.find({ groupId: groupId});

        if (!conversation || conversation.length === 0) {
            return res.status(404).json({ message: messages[lang].GROUP_CONVERSATION_NOT_FOUND });
        }

        return res.status(200).json({ conversation });

    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};

exports.getGroupMessageById = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const messageId = req.params.id;

    try{
        const groupMessage = await GroupMessage.findById(messageId);

        if(!groupMessage) {
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
    const { groupId, senderId} = req.params;
    const { content } = req.body;

    if(!content || content.trim() === "" ){
        return res.status(400).json({ message: messages[lang].MSG_REQUIRED });
    }

    try {
        const newMessage = new GroupMessage({
            content: content,
            groupId: groupId,
            senderId: senderId,
            timestamp: new Date()
        });

        const savedMessage = await newMessage.save();

        return res.status(201).json(savedMessage);
    } catch (err) {
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

        return res.status(200).json({ message: messages[lang].MSG_DELETED });
    } catch (err) {
        return res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};