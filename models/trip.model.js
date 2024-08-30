const mongoose = require('mongoose');
const { Schema } = mongoose;

const tripSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    budget: {
        type: Number,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    transport: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transport',
        required: true
    }],
    destination: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country',
        required: true
    },
    tripType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TripType',
        required: true
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    }
}, {
    timestamps: true
});

const Trip = mongoose.model('Trip', tripSchema, 'Trips');
module.exports = Trip;