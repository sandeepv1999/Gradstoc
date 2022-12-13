// utils/Wallet_transaction.js
const Wallets = require('../src/model/wallet');
const Wallet_transaction = require('../src/model/wallet_transaction');

const creditAccount = (amount, user_id, byer_id, transaction_id) => {
    try {
        return new Promise(async (resolve, reject) => {
            const wallet = await Wallets.findOne({ user_id });
            if (wallet) {
                const updatedWallet = await Wallets.findOneAndUpdate({ user_id }, { $inc: { balance: amount } });
                const transaction = await Wallet_transaction.create({
                    trnxType: 'CR',
                    amount,
                    wallet_user_id: user_id,
                    balanceBefore: Number(wallet.balance),
                    balanceAfter: Number(wallet.balance) + Number(amount),
                    transaction_id,
                    trnxSummary: `TRFR FROM: ${byer_id}. TRNX ID:${transaction_id} `
                });
                resolve({ status: true, message: 'data credit' });
            } else {
                reject({ status: false, message: 'error' })
            }
        })
    } catch (error) {
        console.log('credit amount  error', error);
    }
}

const debitAccount =  (amount, user_id, transaction_id) => {
    return new Promise(async (resolve, reject) => {
        const wallet = await Wallets.findOne({ user_id });
        console.log('wallet debit', wallet)
        if (wallet) {
            console.log('wallet.balance',wallet.balance);
            console.log('wallet.balance',parseFloat(wallet.balance));
            if (Number(wallet.balance) >= parseFloat(amount)) {
                const updatedWallet = await Wallets.findOneAndUpdate({ user_id }, { $inc: { balance: -amount } });
                console.log('updatedWallet',updatedWallet);
                const transaction = await Wallet_transaction.create({
                    trnxType: 'DR',
                    amount,
                    wallet_user_id: user_id,
                    balanceBefore: Number(wallet.balance),
                    balanceAfter: Number(wallet.balance) - Number(amount),
                    transaction_id,
                    trnxSummary: `TRFR FROM:${user_id} , TRNX ID:${transaction_id} `
                });
                console.log('transaction',transaction);
                resolve({ status: true, message: 'Debit successfull' })
            }else{
                reject({status : false , message : 'something went wrong'})
            }
        }else{
            reject({ status: false, message: 'something went wrong 1' })
        }
    });
}

module.exports = {
    creditAccount, debitAccount
};


