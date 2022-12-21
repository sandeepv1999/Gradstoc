const mongoose = require('mongoose')
const { Schema } = mongoose;

const reviewSchema = new Schema({

    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'product'
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    rating: {
        type: Number,
    },
    review : {
        type: String
    },
    createdAt: {
        type: Date,
        default : Date.now()
    },
});

const Review = mongoose.model('review', reviewSchema);
module.exports = Review