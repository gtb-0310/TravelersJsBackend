const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer'
        }
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
        required: true
    },
    description: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
        required: true
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
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema, 'Users');

module.exports = User;
