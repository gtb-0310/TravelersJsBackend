const mongoose = require('mongoose');
const { Schema } = mongoose;

const reasonReportingSchema = new Schema({
    reason: {
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

const ReasonReporting = mongoose.model('ReasonReporting', reasonReportingSchema, 'ReasonReportings');
module.exports = ReasonReporting;