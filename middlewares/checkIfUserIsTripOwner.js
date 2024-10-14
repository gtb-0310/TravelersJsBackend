const Trip = require('../models/trip.model');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');

async function checkIfUserIsTripOwner(req, res, next) {
    const lang = getLanguageFromHeaders(req) || 'en';
    const userId = req.user.id;

    try {
        const trip = await Trip.findById(userId);

        if(!trip){
            return res.status(404).json({ message: messages[lang].TRIP_NOT_FOUND });
        }

        if(!trip.userId != userId ){
            return res.status(403).json({ messages: messages[lang].TRIP_OWNER_REQUIRED });
        }

        next();
        
    }catch (err) {
        return res.status(500).json({ message: messages[lang].SERVER_ERROR});
    }
}

module.exports = checkIfUserIsTripOwner;