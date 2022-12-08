const express = require('express');
const app = express();
const User = require('../../model/user');
const jwt = require('jsonwebtoken');
const verification = require('../../../mail');
const mongoose = require('mongoose');


class AdminController {

    constructor() { }

    // ************ GET HOME PAGE **************

    // homePage = async (req, res) => {
    //     let isUserLoggedIn = false;
    //     let userData = ""
    //     if (req.session.isCustomerLoggedIn) {
    //         isUserLoggedIn = true;
    //         let loginId = req.session.isCustomerLoggedIn;
    //         loginId = mongoose.Types.ObjectId(loginId);
    //         userData = await User.findOne({_id:loginId});
    //     }
    //     let data = {
    //         status: "",
    //         message: "",
    //         isUserLoggedIn,
    //         userData
    //     }
    //     if (req.session.status && req.session.message) {
    //         data.status = req.session.status;
    //         data.message = req.session.message;
    //         delete req.session.status, req.session.message;
    //     }
    //     res.render('visitor/index', data);
    // }

    // // ************ GET SCHOOL LIST **************

    // school = async (req, res) => {
    //     let isUserLoggedIn = false;
    //     let userData = ""
    //     if (req.session.isCustomerLoggedIn) {
    //         isUserLoggedIn = true;
    //         let loginId = req.session.isCustomerLoggedIn;
    //         loginId = mongoose.Types.ObjectId(loginId);
    //         userData = await User.findOne({_id:loginId});
    //     }
    //     let data = {
    //         status: "",
    //         message: "",
    //         isUserLoggedIn,
    //         userData
    //     }
    //     if (req.session.status && req.session.message) {
    //         data.status = req.session.status;
    //         data.message = req.session.message;
    //         delete req.session.status, req.session.message;
    //     }
    //     res.render('visitor/school-list', data);
    // }

    // // ************ GET DOCUMENT LIST **************

    // document = async (req, res) => {
    //     let isUserLoggedIn = false;
    //     let userData = ""
    //     if (req.session.isCustomerLoggedIn) {
    //         isUserLoggedIn = true;
    //         let loginId = req.session.isCustomerLoggedIn;
    //         loginId = mongoose.Types.ObjectId(loginId);
    //         userData = await User.findOne({_id:loginId});
    //     }
    //     let data = {
    //         status: "",
    //         message: "",
    //         isUserLoggedIn,
    //         userData
    //     }
    //     if (req.session.status && req.session.message) {
    //         data.status = req.session.status;
    //         data.message = req.session.message;
    //         delete req.session.status, req.session.message;
    //     }
    //     res.render('visitor/document', data);
    // }

    // // ************ GET BOOK LIST **************

    // book = async (req, res) => {
    //     let isUserLoggedIn = false;
    //     let userData = ""
    //     if (req.session.isCustomerLoggedIn) {
    //         isUserLoggedIn = true;
    //         let loginId = req.session.isCustomerLoggedIn;
    //         loginId = mongoose.Types.ObjectId(loginId);
    //         userData = await User.findOne({_id:loginId});
    //     }
    //     let data = {
    //         status: "",
    //         message: "",
    //         isUserLoggedIn,
    //         userData
    //     }
    //     if (req.session.status && req.session.message) {
    //         data.status = req.session.status;
    //         data.message = req.session.message;
    //         delete req.session.status, req.session.message;
    //     }
    //     res.render('visitor/book-list', data);
    // }

    // // ************ GET BLOGS **************

    // blog = async (req, res) => {
    //     let isUserLoggedIn = false;
    //     let userData = ""
    //     if (req.session.isCustomerLoggedIn) {
    //         isUserLoggedIn = true;
    //         let loginId = req.session.isCustomerLoggedIn;
    //         loginId = mongoose.Types.ObjectId(loginId);
    //         userData = await User.findOne({_id:loginId});
    //     }
    //     let data = {
    //         status: "",
    //         message: "",
    //         isUserLoggedIn,
    //         userData
    //     }
    //     if (req.session.status && req.session.message) {
    //         data.status = req.session.status;
    //         data.message = req.session.message;
    //         delete req.session.status, req.session.message;
    //     }
    //     res.render('visitor/blog', data);
    // }

    // // ************ GET BLOGS **************

    // addInformation = async (req, res) => {
    //     let isUserLoggedIn = false;
    //     let userData = ""
    //     if (req.session.isCustomerLoggedIn) {
    //         isUserLoggedIn = true;
    //         let loginId = req.session.isCustomerLoggedIn;
    //         loginId = mongoose.Types.ObjectId(loginId);
    //         userData = await User.findOne({_id:loginId});
    //     }
    //     let data = {
    //         status: "",
    //         message: "",
    //         isUserLoggedIn,
    //         userData
    //     }
    //     if (req.session.status && req.session.message) {
    //         data.status = req.session.status;
    //         data.message = req.session.message;
    //         delete req.session.status, req.session.message;
    //     }
    //     res.render('visitor/addInfo', data);
    // }

    // // ************ EMAIL VERIFICATION BY URL **************

    // mailVerification = async (req, res) => {
    //     let token = req.query.token;
    //     let user = await User.findOne({ token });
    //     if (user) {
    //         var now = new Date();
    //         var exp = user.expiry_time;
    //         if (now <= exp) {
    //             var response = await User.updateOne({ _id: user._id }, { isEmailVerify: "1", token: "" });
    //             req.session.status = 'success';
    //             req.session.message = 'You successFully verify your email , Please login';
    //             if (response) {
    //                 res.redirect('/');
    //             }
    //         } else {
    //             var response = await User.updateOne({ _id: user._id }, { token: "" });
    //             req.session.status = 'Warning';
    //             req.session.message = 'Your link is expire,try again';
    //             res.redirect('/');
    //         }
    //     } else {
    //         req.session.status = 'Information';
    //         req.session.message = 'you already verify your email';
    //         res.redirect('/');
    //     }
    // }

    // // ************ RESEND EMAIL FUNCTIONALITY **************

    // resendMail = async (req, res) => {
    //     let email = req.body.email
    //     let user = await User.findOne({ email });
    //     console.log('user', user);
    //     let data = {};
    //     if (user) {
    //         if (user.isEmailVerify == '1') {
    //             data.message = 'The email that you entereds,It is already verify'
    //             res.json(data);
    //         } else {
    //             let now = new Date();
    //             let token = jwt.sign({ email: user.email, id: user._id }, 'gradstoctoken');
    //             user.token = token;
    //             let template = `<div>
    //             <h1>Email Confirmation</h1>
    //             <h2>Hello ${user.firstName}</h2>
    //             <p>Thank you for register. Please confirm your email by clicking on the following link</p>
    //             <a href=http://localhost:3300/verify?token=${user.token} => Click here</a>
    //             </div>`
    //             let expiryTime = this.AddMinutesToDate(now, 10);
    //             await verification.send_mail(user.email, 'verification Email', template);
    //             await User.updateOne({ _id: user._id }, { token: token, expiry_time: expiryTime });
    //             data.success = true;
    //             data.message = 'We have sent you a verification email please verify';
    //             res.json(data);
    //         }
    //     } else {
    //         data.success = false;
    //         data.message = 'Please enter valid email address';
    //         res.json(data);
    //     }
    // }

    // AddMinutesToDate = (date, minutes) => {
    //     return new Date(date.getTime() + minutes * 60000);
    // }
}

module.exports = new AdminController();