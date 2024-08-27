const Language = require('../models/language.model');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');

exports.getAllLanguages = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    try {
        const allLanguages = await Language.find();
        if (allLanguages.length === 0) {
            return res.status(404).json({ message: messages[lang].LANGUAGES_NOT_FOUND });
        }
        return res.status(200).json(allLanguages);
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};


exports.getLanguagesByIds = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const languageIds = req.params.languageIds.split(',');

    try {
        const languages = await Language.find({ _id: { $in: languageIds } });

        if (languages.length === 0) {
            return res.status(404).json({ message: messages[lang].LANGUAGES_NOT_FOUND });
        }

        return res.status(200).json(languages);
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};
