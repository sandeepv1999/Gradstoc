const express = require('express');
const app = express();
const paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox',
    'client_id': process.env.CLIENT_ID,
    'client_secret': process.env.CLIENT_SECRET
})

module.exports.createPayment = async (payment) => {
    return new Promise((resolve, reject) => {
        paypal.payment.create(payment, (err, payment) => {
            if (err) {
                reject(err);
            } else {
                resolve(payment);
            }
        });
    });
}

module.exports.paymentExecute = async (paymentId, execute_payment_json) => {
    return new Promise((resolve, reject) => {
        paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
            if (error) {
                reject(error.response);
            } else {
                console.log('response',payment);
                resolve(payment);
            }
        });
    })
}