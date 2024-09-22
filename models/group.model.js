const mongoose = require('mongoose');
const { Schema } = mongoose;

const groupSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        unique: true,
        ref: 'User',
        required: true
    }],
    administrator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    languages: [{
        type: mongoose.Schema.Types.ObjectId,
        unique: true,
        ref: 'Language',
        required: true
    }],
    trip: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Trip',
    }
}, {
    timestamps: true
});

const Group = mongoose.model('Group', groupSchema, 'Groups');

module.exports = Group;