const Trip = require('../models/trip.model');
const Group = require('../models/group.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');
const { startOfDay, endOfDay } = require('../utils/dateUtils');


/***
 * ---------------------------------------
 * GET
 * ---------------------------------------
 */
exports.getTripsWithFilter = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const { startDate, endDate, budget, transport, destination, tripType, dateOption, languages } = req.query;
    let filter = {};

    try {
        if (startDate && endDate) {
            if (dateOption === 'exact') {
                filter.startDate = { $gte: startOfDay(startDate), $lte: endOfDay(startDate) };
                filter.endDate = { $gte: startOfDay(endDate), $lte: endOfDay(endDate) };
            } else if (dateOption === 'range') {
                filter.startDate = { $gte: startOfDay(startDate) };
                filter.endDate = { $lte: endOfDay(endDate) };
            }
        } else {
            if (dateOption === 'start' && startDate) {
                filter.startDate = { $gte: startOfDay(startDate), $lte: endOfDay(startDate) };
            } else if (dateOption === 'end' && endDate) {
                filter.endDate = { $gte: startOfDay(endDate), $lte: endOfDay(endDate) };
            } else {
                if (startDate) {
                    filter.startDate = { $gte: startOfDay(startDate) };
                }
                if (endDate) {
                    filter.endDate = { $lte: endOfDay(endDate) };
                }
            }
        }
        

        if (budget) {
            const [minBudget, maxBudget] = budget.split(',').map(Number);
            if (!isNaN(minBudget) && !isNaN(maxBudget)) {
                filter.budget = { $gte: minBudget, $lte: maxBudget };
            } else if (!isNaN(minBudget)) {
                filter.budget = { $gte: minBudget };
            } else if (!isNaN(maxBudget)) {
                filter.budget = { $lte: maxBudget };
            }
        }

        
        if (transport) {
            console.log(transport);
            const transportArray = transport.split(',');
            filter.transport = { $in: transportArray };
        }

        
        if (destination) {
            filter.destination = destination;
        }

        
        if (tripType) {
            filter.tripType = tripType;
        }

        let matchLanguages = {};
        if (languages) {
            const languagesArray = languages.split(',');
            matchLanguages = { languages: { $in: languagesArray } };
        }

        console.log(filter);

        const trips = await Trip.find(filter)
            .select('title budget startDate endDate transport destination groupId')
            .populate({ path: 'transport', select: 'typeTransport' })
            .populate({ path: 'destination', select: 'name' })
            .populate({
                path: 'groupId',
                match: matchLanguages,
                populate: {
                    path: 'languages',
                    select: 'name'
                }
            });

        res.status(200).json(trips);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: messages[lang].ERROR_TRIPS_RECUPERATION });
    }
};

exports.getTripById = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const tripId = req.params.id;

    try {
        const trip = await Trip.findById(tripId)
            .populate({ path: 'userId', select: 'firstName lastName' })
            .populate({ path: 'transport', select: 'typeTransport' })
            .populate({ path: 'destination', select: 'name' })
            .populate({ path: 'tripType', select: 'name' })
            .populate({
                path: 'groupId',
                populate: [
                    { path: 'languages', select: 'name' },
                    { path: 'members', select: 'firstName lastName' }
                ]
            });

        if (!trip) {
            return res.status(404).json({ message: messages[lang].TRIP_NOT_FOUND });
        }

        
        res.status(200).json(trip);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};

/***
 * ---------------------------------------
 * POST
 * ---------------------------------------
 */
exports.createTrip = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const { title, startDate, endDate, budget, userId, transport, destination, tripType } = req.body;

    try {
        const user = await User.findById(userId).select('languages');
        if (!user) {
            return res.status(404).json({ message: messages[lang].USER_NOT_FOUND });
        }

        const newTripData = {
            title,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            budget,
            userId,
            transport,
            destination,
            tripType
        };
        
        const newTrip = new Trip(newTripData);
        const savedTrip = await newTrip.save();


        const group = new Group({
            name: title, 
            members: [userId], 
            administrator: userId,
            languages: user.languages,
            trip: savedTrip._id
        });
        const savedGroup = await group.save();

        
        savedTrip.groupId = savedGroup._id;
        const updatedTrip = await savedTrip.save();

        // Réponse réussie
        res.status(201).json({ trip: updatedTrip, group: savedGroup });
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};

// exports.createTrip = async (req, res) => {
//     const lang = getLanguageFromHeaders(req) || 'en';
//     const { title, startDate, endDate, budget, userId, transport, destination, tripType } = req.body;

//     try {
//         const user = await User.findById(userId).select('languages');
//         if (!user) {
//             return res.status(404).json({ message: messages[lang].USER_NOT_FOUND });
//         }

//         const group = new Group({
//             name: title, 
//             members: [userId], 
//             administrator: userId,
//             languages: user.languages,
//             trip: null
//         });

        
//         const savedGroup = await group.save();

        
//         const newTrip = new Trip({
//             title,
//             startDate: new Date(startDate),
//             endDate: new Date(endDate),
//             budget,
//             userId,
//             transport,
//             destination,
//             tripType,
//             groupId: savedGroup._id 
//         });

        
//         const savedTrip = await newTrip.save();

//         savedGroup.trip = savedTrip._id;
//         await savedGroup.save();

//         res.status(201).json(savedTrip, savedGroup);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: messages[lang].SERVER_ERROR });
//     }
// };

/***
 * ---------------------------------------
 * PUT
 * ---------------------------------------
 */
exports.updateTrip = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const tripId = req.params.id;
    const { title, startDate, endDate, budget, transport, destination, tripType } = req.body;

    try {
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ message: messages[lang].TRIP_NOT_FOUND });
        }

        if (title) trip.title = title;
        if (startDate) trip.startDate = new Date(startDate);
        if (endDate) trip.endDate = new Date(endDate);
        if (budget) trip.budget = budget;
        if (transport) trip.transport = transport.map(id => mongoose.Types.ObjectId(id));
        if (destination) trip.destination = mongoose.Types.ObjectId(destination);
        if (tripType) trip.tripType = mongoose.Types.ObjectId(tripType);

        const updatedTrip = await trip.save();

        if (title) {
            const group = await Group.findById(trip.groupId);
            if (group) {
                group.name = title;
                await group.save();
            }
        }

        res.status(200).json(updatedTrip);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};

/***
 * ---------------------------------------
 * DELETE
 * ---------------------------------------
 */

exports.deleteTripById = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const tripId = req.params.id;

    try {
        const trip = await Trip.findByIdAndDelete(tripId);

        if (!trip) {
            return res.status(404).json({ message: messages[lang].TRIP_NOT_FOUND });
        }

        await Group.findByIdAndDelete(trip.groupId);

        res.status(200).json({ message: messages[lang].TRIP_DELETED_SUCCESS });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};
