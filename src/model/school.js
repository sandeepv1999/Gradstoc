const mongoose = require('mongoose')
const { Schema } = mongoose;

const schoolSchema = new Schema({
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    logo: {
        type: String,
    },
    user_id: {
        type: Schema.Types.ObjectId,
         ref: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }
});

const school = mongoose.model('school', schoolSchema);
module.exports = school;