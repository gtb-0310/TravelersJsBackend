const mongoose = require('mongoose');
const { Schema } = mongoose;

const privateMessageSchema = new Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String
    },
    timestamp: {
        type: Date,
        required: true
    }
}, {
    timestamp: false
});

const PrivateMessage = mongoose.model('PrivateMessage', privateMessageSchema, 'PrivateMessages');

module.exports = PrivateMessage;