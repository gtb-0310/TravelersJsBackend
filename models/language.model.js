const mongoose = require('mongoose');
const { Schema } = mongoose;

const languageSchema = new Schema({
    name: {
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

const Interest = mongoose.model('Language', languageSchema, 'Languages');
module.exports = Interest;