const mongoose = require('mongoose')
const { Schema } = mongoose;

const walletSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
         ref: 'user'
    },
    wallet_id:{
        type : String
    },
    balance : {
        type:mongoose.Decimal128,
        default: 0.00
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

const Wallet = mongoose.model('wallet', walletSchema);
module.exports = Wallet;