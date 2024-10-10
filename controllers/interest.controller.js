const Interest = require('../models/interest.model');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');

/***
 * ---------------------------------------
 * GET
 * ---------------------------------------
 */

exports.getAllInterest = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    try {
        const allInterests = await Interest.find({}, { [`name.${lang}`]: 1 });
        if(allInterests.length === 0) {
            return res.status(404).json({ message: messages[lang].INTEREST_NOT_FOUND });
        }
        return res.status(200).json(allInterests);
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};

exports.getInterestsByIds = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const interestIds = req.params.interestIds.split(',');

    try {
        const interests = await Interest.find(
            { _id: { $in: interestIds } },
            { [`name.${lang}`]: 1 }
        );

        if (interests.length === 0) {
            return res.status(404).json({ message: messages[lang].INTERESTS_NOT_FOUND });
        }

        return res.status(200).json(interests);
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};
