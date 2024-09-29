const GroupMessage = require('../models/groupMessage.model');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');

async function checkMessageGroupSender(req, res, next) {
    const lang = getLanguageFromHeaders(req) || 'en';
    const messageId = req.params.id;
    const userId = req.user.id;

    try {
        const groupMessage = await GroupMessage.findById(messageId);

        
        if (!groupMessage) {
            return res.status(404).json({ message: messages[lang].MSG_NOT_FOUND });
        }

        if (groupMessage.senderId.toString() !== userId) {
            return res.status(403).json({ message: messages[lang].FORBIDDEN_NOT_MESSAGE_AUTHOR });
        }

        next();
    } catch (err) {
        return res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
}

module.exports = checkMessageGroupSender;
