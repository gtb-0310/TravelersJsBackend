const mongoose = require('mongoose');
const { Schema } = mongoose;

const countrySchema = new Schema({
    name: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Country = mongoose.model('Country', countrySchema, 'Countries');

module.exports = Country;