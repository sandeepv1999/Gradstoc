const express = require('express');
const app = express();
const User = require('../../model/user');

class AdminController {

    constructor() { }

    homePage = async (req, res) => {
        let isUserLoggedIn = false;
        let userData = ""
        if (req.session.isCustomerLoggedIn) {
            isUserLoggedIn = true;
            userData = req.session.isCustomerLoggedIn;
        }
        let data = {
            status: "",
            message: "",
            isUserLoggedIn,
            userData
        }
        if (req.session.status && req.session.message) {
            data.status = req.session.status;
            data.message = req.session.message;
            delete req.session.status, req.session.message;
        }
        res.render('visitor/index', data);
    }

    mailVerification = async (req, res) => {
        let token = req.query.token;
        let user = await User.findOne({ token });
        console.log('user', user);
        if (user) {
            var now = new Date();
            var exp = user.expiry_time;
            if (now <= exp) {
                var response = await User.updateOne({ _id: user._id }, { isEmailVerify: "1", token: "" });
                req.session.status = 'success';
                req.session.message = 'You successFully verify your email , Please login';
                if (response) {
                    res.redirect('/');
                }
            } else {
                var response = await User.updateOne({ _id: user._id }, { token: "" });
                req.session.status = 'Warning';
                req.session.message = 'Your link is expire,try again';
                res.redirect('/');
            }
        } else {
            req.session.status = 'Information';
            req.session.message = 'you already verify your email';
            res.redirect('/');
        }
    }


    // sendVerificationMail = async (req, res) => {
    //     let token = req.query.token;
    //     let user = await User.findOne({ token });
    //     console.log('user',user);
    //     if (user) {
    //         var now = new Date();
    //         var exp = user.expiry_time;
    //         if (now <= exp) {
    //             var response = await User.updateOne({ _id:user._id }, { isEmailVerify: "1", token: ""});
    //             if (response) {
    //                 res.redirect('/');
    //             }
    //         } else {
    //             res.send('verification link is expire');
    //         }
    //     }else{
    //         res.send('you are not valid user please signUp');
    //     }
    // }
}

module.exports = new AdminController();