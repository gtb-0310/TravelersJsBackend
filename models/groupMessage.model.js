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
        default: Date.now,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false,
        required: true
    }
}, {
    timestamp: true
});

const GroupMessage = mongoose.model('GroupMessage', groupMessageSchema, 'GroupMessages');

module.exports = GroupMessage;