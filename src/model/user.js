const { string } = require('joi');
const mongoose = require('mongoose')
const { Schema } = mongoose;

const UserSchema = new Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
        unique: true
    },

    password: {
        type: String,
    },
    type: {
        type: String,
        enum: [0, 1],
    },
    is_social: {
        type: String,
        enum: [0, 1],
        default: 0
    },
    profile: {
        type: String,
    },
    isEmailVerify: {
        type: String,
        enum: [0, 1],
        default: 0
    },
    token: {
        type: String,
    },
    phone: {
        type: String
    },
    provider: {
        type: String
    },
    providerId: {
        type: String
    },
    expiry_time: {
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    },
});
const user = mongoose.model('user', UserSchema)
module.exports = user