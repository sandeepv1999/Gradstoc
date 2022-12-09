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
    earning: {
        type: Number
    },
    transaction_id: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
});

const AdminEarning = mongoose.model('admin_earning', adminEarningSchema);
module.exports = AdminEarning;