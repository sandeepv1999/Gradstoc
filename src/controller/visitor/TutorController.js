const express = require('express');
const app = express();
const User = require('../../model/user');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

class TutorController {

    constructor() { }

    //***************** DASHBOARD *******************

    dashboard = async (req, res) => {
        try {
            let isUserLoggedIn = false;
            let userData = ''
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
            res.render('user/dashboard', data);
        } catch (error) {
            console.log('dashboard error', error);
        }
    }

    //***************** GET CHANGE PASSWORD ***********************

    getChangePassword = async (req, res) => {
        try {
            let isUserLoggedIn = false;
            let userData = ''
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
            res.render('user/change-password', data);
        } catch (error) {
            console.log('get change password page error', error)
        }
    }

    //***************** POST CHANGE PASSWORD ***********************

    changePassword = async (req, res) => {
        try {
            let currentPass = req.body.currentPassword;
            let newPassword = req.body.newPassword;
            var hashPassword = bcrypt.hashSync(newPassword, salt);
            let userData = req.session.isCustomerLoggedIn;
            let userId = mongoose.Types.ObjectId(userData._id);
            let user = await User.findById({ _id: userId });
            await bcrypt.compare(currentPass
                , user.password, async (err, isMatch) => {
                    if (isMatch) {
                        let resp = await User.updateOne({ _id: userId }, { password: hashPassword });
                        console.log('resp', resp);
                        req.session.status = 'success';
                        req.session.message = 'Your password has been changed successFully';
                        res.redirect('/change-password');
                    } else {
                        req.session.status = 'error';
                        req.session.message = 'Please enter correct currrent password';
                        res.redirect('/change-password');
                    }
                });
        } catch (error) {
            console.log('change passsword error', error);
        }
    }
}

module.exports = new TutorController();