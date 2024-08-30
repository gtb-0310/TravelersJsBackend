const Transport = require('../models/transport.model');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');

/***
 * ---------------------------------------
 * GET
 * ---------------------------------------
 */
exports.getAllTransports = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    try {
        const transports = await Transport.find();
        if(!transports || transports.length === 0){
            return res.status(404).json({ message: messages[lang].NO_TRANSPORTS_FOUND });
        }
        res.json(transports);
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};

exports.getTransportsById = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const transportsIds = req.params.transportsIds.split(',');

    try {
        const transports = await Transport.find({ _id: { $in: transportsIds } });

        if (!transports || transports.length === 0) {
            return res.status(404).json({ message: messages[lang].NO_TRANSPORTS_FOUND });
        }
        res.json(transports);
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};