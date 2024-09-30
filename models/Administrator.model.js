const mongoose = require('mongoose');
const { Schema } = mongoose;

const administratorSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});


const Administrator = mongoose.model('Administrator', administratorSchema, 'Administrators');

module.exports = Administrator;
