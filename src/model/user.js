const mongoose = require('mongoose')
const { Schema } = mongoose;

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    
    password: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: [0, 1],
        required: true
    },
    is_social: {
        type: String,
        enum: [0, 1],
        default: 0
    },
    profile: {
        type:String,
        required:true
    },
    isEmailVerify: {
        type: String,
        enum: [0, 1],
        default: 0
    },
    token: {
        type: String,
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