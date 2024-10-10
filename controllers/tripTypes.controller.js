const TripType = require('../models/tripType.model');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');

/***
 * ---------------------------------------
 * GET
 * ---------------------------------------
 */
exports.getAllTripTypes = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    try {
        const tripTypes = await TripType.find({}, { [`name.${lang}`]: 1 });

        if(!tripTypes || tripTypes.length === 0){
            return res.status(404).json({ message: messages[lang].NO_TRIPTYPE_FOUND });
        }
        res.json(tripTypes);
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};

exports.getTripTypeById = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const id = req.params.id;

    try {
        const tripType = await TripType.findById(
            id,
            { [`name.${lang}`]: 1 }
        );

        if (!tripType) {
            return res.status(404).json({ message: messages[lang].NO_TRIPTYPE_FOUND });
        }
        res.json(tripType);
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};