const mongoose = require('mongoose');
const { Schema } = mongoose;

const groupMessageSchema = new Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    }
}, {
    timestamp: false
});

const GroupMessage = mongoose.model('GroupMessage', groupMessageSchema, 'GroupMessages');

module.exports = GroupMessage;