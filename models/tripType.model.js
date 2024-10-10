const mongoose = require('mongoose');
const { Schema } = mongoose;

const tripTypeSchema = new Schema({
    typeName: {
        fr: { type: String, required: true },
        en: { type: String },
        de: { type: String },
        es: { type: String },
        it: { type: String },
        nl: { type: String },
        pt: { type: String },
        pl: { type: String },
        ro: { type: String }
    }
}, {
    timestamps: true
});

const TripType = mongoose.model('TripType', tripTypeSchema, 'TripTypes');
module.exports = TripType;