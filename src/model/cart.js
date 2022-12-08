const mongoose = require('mongoose')
const { Schema } = mongoose;

const cartSchema = new Schema({
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

const Cart = mongoose.model('cart', cartSchema);
module.exports = Cart;