const { string } = require('joi');
const mongoose = require('mongoose')
const { Schema } = mongoose;

const orderSchema = new Schema({

    order_id: {
        type: String
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    subtotal: {
        type: mongoose.Decimal128,
    },
    total: {
        type: mongoose.Decimal128
    },
    wallet_discount: {
        type: mongoose.Decimal128
    },
    final_pay: {
        type: mongoose.Decimal128
    },
    use_wallet: {
        type: String,
        enum: [0, 1],
        default: '0'
    },
    transaction_id: {
        type: String
    },
    payment_status: {
        type: String,
    },
    payment_type: {
        type: String
    },
    payment_history: {
        type: Object
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

const Order = mongoose.model('order', orderSchema);
module.exports = Order