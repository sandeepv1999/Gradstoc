const mongoose = require('mongoose')
const { Schema } = mongoose;

const bookmarkSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
         ref: 'user'
    },
    product_id: {
        type: Schema.Types.ObjectId,
         ref: 'product'
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

const Bookmark = mongoose.model('bookmark', bookmarkSchema);
module.exports = Bookmark;