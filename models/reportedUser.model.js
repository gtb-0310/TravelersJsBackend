const mongoose = require('mongoose');
const { Schema } = mongoose;

const reportedUserSchema = new Schema({
    reportingUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reportedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const ReportedUser = mongoose.model('ReportedUser', reportedUserSchema, 'ReportedUsers');

module.exports = ReportedUser;