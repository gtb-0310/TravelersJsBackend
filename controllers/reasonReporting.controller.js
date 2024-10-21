const ReasonReporting = require('../models/reasonReporting.model');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');

/***
 * ---------------------------------------
 * GET
 * ---------------------------------------
 */
exports.getAllReasons = async (req,res) => {
    const lang = getLanguageFromHeaders(req) || 'en';

    try {
        const reasons = await ReasonReporting.find({}, { [`reason.${lang}`]: 1 });
        const localizedReasons = reasons.map(reason => ({
            id: reason._id,
            text: reason.reason[lang]
        }));
        res.status(200).json(localizedReasons);
    } catch (error) {
        res.status(500).json({ message: messages[lang].FAILD_FETCH_REASONS_REPORTING });
    }
}

exports.getReasonById = async (req, res) => {
    const reasonId = req.params.reasonId;
    const lang = getLanguageFromHeaders(req) || 'en';
    try {
        const reason = await ReasonReporting.findById(reasonId, { [`reason.${lang}`]: 1 });
        if (reason) {
            const localizedReason = {
                id: reason._id,
                text: reason.reason[lang]
            };
            res.status(200).json(localizedReason);
        } else {
            res.status(404).json({ message: messages[lang].REASON_REPORTING_NOT_FOUND});
        }
    } catch (error) {
        res.status(500).json({ error: messages[lang].FAILD_FETCH_REASONS_REPORTING });
    }
};