const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: false
    },
    lastName: {
        type: String,
        required: false
    },
    birthDate: {
        type: Date,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: true
    },
    profilePictureUrl: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    refreshToken: {
        type: String,
        required: false
    },
    languages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Language',
        required: true
    }],
    interests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interest',
        required: true
    }],
    resetPasswordToken: {
        type: String,
        required: false
    },
    resetPasswordExpires: {
        type: Date,
        required: false
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String,
        required: false
    },
    emailVerificationExpires: {
        type: Date,
        required: false
    },
    reportCount: {
        type: Number,
        default: 0
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    banTimeLapse: {
        type: Date,
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema, 'Users');

module.exports = User;
