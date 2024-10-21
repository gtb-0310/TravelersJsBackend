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
    reasonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReasonReporting',
        required: true
    },
    description: {
        type: String,
        required: false,
        maxlength: 500
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    evidence: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

const ReportedUser = mongoose.model('ReportedUser', reportedUserSchema, 'ReportedUsers');

module.exports = ReportedUser;