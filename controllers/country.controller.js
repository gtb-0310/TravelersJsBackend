const Country = require('../models/country.model');
const messages = require('../utils/messages')
const getLanguageFromHeaders = require('../utils/languageUtils');

exports.getAllCountries = async (req, res) => {
    try {
        const lang = getLanguageFromHeaders(req) || 'en';
        const countries = await Country.find();
        res.json(countries);
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};

exports.getCountriesByIds = async (req, res) => {
    const { ids } = req.query;
    try {
        const lang = getLanguageFromHeaders(req) || 'en';
        const idsArray = ids.split(',');
        const countries = await Country.find({ _id: { $in: idsArray } });
        res.json(countries);
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};