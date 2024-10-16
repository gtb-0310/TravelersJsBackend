const mongoose = require('mongoose');
const { Schema } = mongoose;

const groupConversationSchema = new Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    lastMessage: {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false
        },
        content: {
            type: String,
            required: false
        },
        timestamp: {
            type: Date,
            required: false
        }
    },
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GroupMessage'
    }]
}, {
    timestamps: true
});

const GroupConversation = mongoose.model('GroupConversation', groupConversationSchema, 'GroupConversations');

module.exports = GroupConversation;
