const mongoose = require('mongoose');
const { Schema } = mongoose;

const transactionSchema = new Schema(
  {
    trnxType: {
      type: String,
      required: true,
      enum: ['CR', 'DR']
    },
    amount: {
      type: mongoose.Decimal128,
      required: true,
      default: 0.00
    },
    wallet_user_id: {
      type: Schema.Types.ObjectId,
      ref: 'user'
    },
    transaction_id : {
      type : String
    },
    balanceBefore: {
      type: mongoose.Decimal128,
      required: true,
    },
    balanceAfter: {
      type: mongoose.Decimal128,
      required: true,
    },
    trnxSummary: { type: String, required: true }
  },
  { timestamps: true }
);

const Wallet_transaction = mongoose.model('wallet_transaction', transactionSchema);
module.exports = Wallet_transaction;