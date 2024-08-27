const mongoose = require('mongoose');
const { Schema } = mongoose;

const tripTypeSchema = new Schema({
    typeName: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const TripType = mongoose.model('TripType', tripTypeSchema, 'TripTypes');
module.exports = TripType;