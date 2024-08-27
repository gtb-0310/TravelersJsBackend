const mongoose = require('mongoose');
const { Schema } = mongoose;

const transportSchema = new Schema({
    typeTransport: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Transport = mongoose.model('Transport', transportSchema, 'Transports');
module.exports = Transport;