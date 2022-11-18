const mongoose = require('mongoose')
const { Schema } = mongoose;

const tagSchema = new Schema({
    name: {
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

const tag = mongoose.model('tag', tagSchema);
module.exports = tag;