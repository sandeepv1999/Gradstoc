const { string } = require('joi');
const mongoose = require('mongoose')
const { Schema } = mongoose;

const adminEarningSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    order_id: {
        type: String,
        ref: 'order'
    },
    order_amount: {
        type: Number
    },
    saving_amount : {
        type : mongoose.Decimal128
    },
    earning: {
        type: Number
    },
    transaction_id: {
        type: String
    },
    type:{
        type : String,
        enum : ['stripe','paypal','wallet']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
});

const AdminEarning = mongoose.model('admin_earning', adminEarningSchema);
module.exports = AdminEarning;