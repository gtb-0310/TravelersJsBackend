const mongoose = require('mongoose');
const { Schema } = mongoose;

const privateConversationSchema = new Schema({
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
        ref: 'PrivateMessage'
    }]
}, {
    timestamps: true
});

const PrivateConversation = mongoose.model('PrivateConversation', privateConversationSchema, 'PrivateConversations');

module.exports = PrivateConversation;
