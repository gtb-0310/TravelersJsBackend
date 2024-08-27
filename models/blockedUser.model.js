const mongoose = require('mongoose');
const { Schema } = mongoose;

const blockedUserSchema = new Schema({
    blockingUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    blockedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, {
    timestamps: true
});

const BlockedUser = mongoose.model('BlockedUser', blockedUserSchema, 'BlockedUsers');

module.exports = BlockedUser;