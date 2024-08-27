const mongoose = require('mongoose');
const { Schema } = mongoose;

const interestSchema = new Schema({
    name: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Interest = mongoose.model('Interest', interestSchema, 'Interests');
module.exports = Interest;