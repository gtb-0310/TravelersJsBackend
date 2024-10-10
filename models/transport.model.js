const mongoose = require('mongoose');
const { Schema } = mongoose;

const transportSchema = new Schema({
    typeTransport: {
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

const Transport = mongoose.model('Transport', transportSchema, 'Transports');
module.exports = Transport;