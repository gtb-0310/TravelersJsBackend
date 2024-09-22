const Trip = require('../models/trip.model');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');

async function checkTripAdministrator(req, res, next) {
  const lang = getLanguageFromHeaders(req) || 'en';
  const userId = req.user.id;
  const tripId = req.params.id;

  try {
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: messages[lang].TRIP_NOT_FOUND });
    }

    if (trip.userId.toString() !== userId) {
      return res.status(403).json({ message: messages[lang].NOT_ADMIN_DENIED_ACCESS });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = checkTripAdministrator;
