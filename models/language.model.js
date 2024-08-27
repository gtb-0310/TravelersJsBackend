const mongoose = require('mongoose');
const { Schema } = mongoose;

const languageSchema = new Schema({
    name: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Interest = mongoose.model('Language', languageSchema, 'Languages');
module.exports = Interest;