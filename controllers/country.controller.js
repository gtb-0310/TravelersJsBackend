const Country = require('../models/country.model');
const messages = require('../utils/messages')
const getLanguageFromHeaders = require('../utils/languageUtils');

/***
 * ---------------------------------------
 * GET
 * ---------------------------------------
 */

exports.getAllCountries = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    try {
        const countries = await Country.find({}, { [`name.${lang}`]: 1 });
        if(!countries){
            return res.status(404).json({ message: messages[lang].COUNTRIES_NOT_FOUND });
        }
        res.json(countries);
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};

exports.getCountriesByIds = async (req, res) => {
    const { ids } = req.query;
    const lang = getLanguageFromHeaders(req) || 'en';
    const idsArray = ids.split(',');
    try {
        const countries = await Country.find(
            { _id: { $in: idsArray } },
            { [`name.${lang}`]: 1 }
        );
        if(!countries){
            return res.status(404).json({ message: messages[lang].COUNTRIES_NOT_FOUND });
        }
        
        res.json(countries);
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};