const { string } = require('joi');
const mongoose = require('mongoose')
const { Schema } = mongoose;

const orderDetailsSchema = new Schema({
    order_id: {
        type: String
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    product_id:{
        type: Schema.Types.ObjectId,
        ref: 'product'
    },
    quantity: {
        type: String,
        default: 1
    },
    price: {
        type: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updateddAt: {
        type: Date,
        default: Date.now
    },
});

const OrderDetail = mongoose.model('orderDetail', orderDetailsSchema);
module.exports = OrderDetail