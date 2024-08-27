const mongoose = require('mongoose');
const { Schema } = mongoose;

const groupJoinRequestSchema = new Schema({
    message: {
        type: String,
        required: false
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const GroupJoinRequest = mongoose.model('GroupJoinRequest', groupJoinRequestSchema, 'GroupJoinRequests');

module.exports = GroupJoinRequest;