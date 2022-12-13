const express = require('express');
const app =  express();
const paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode':'sandbox',
    'client_id': process.env.CLIENT_ID,
    'client_secret':process.env.CLIENT_SECRET
})

module.exports.createPayment = async (payment)=>{
    return new Promise((resolve , reject)=>{
        paypal.payment.create(payment , (err, payment)=>{
            if(err){
                reject(err);
            }else{
                console.log('result',payment);
                resolve(payment);
            }
        })
    })
}