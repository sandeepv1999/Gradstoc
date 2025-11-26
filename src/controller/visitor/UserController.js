const express = require('express');
const app = express();
const User = require('../../model/user');
const Product = require('../../model/product');
const Bookmark = require('../../model/bookmark');
const Tag = require('../../model/tag');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const AuthController = require('./AuthController');
const Wallet = require('../../model/wallet');
const Wallet_transaction = require('../../model/wallet_transaction');
const Order = require('../../model/order');
const OrderDetails = require('../../model/orderDetail');
const Review = require('../../model/review');
const School = require('../../model/school');


class UserController {

    constructor() { }

    //***************** DASHBOARD *******************

    dashboard = async (req, res) => {
        try {
            let isUserLoggedIn = false;
            let userData = ''
            if (req.session.isCustomerLoggedIn) {
                isUserLoggedIn = true;
                var loginId = req.session.isCustomerLoggedIn;
                loginId = mongoose.Types.ObjectId(loginId);
                userData = await User.findOne({ _id: loginId });
            }
            let myUploads = await Product.count({ user_id: loginId, type: 1 });
            let myBookmark = await Bookmark.count({ user_id: loginId });
            let remainingAmt = await Wallet.findOne({ user_id: loginId }).select('balance');
            let myEarning = await Wallet_transaction.aggregate([
                {
                    $match: {
                        $and: [{
                            wallet_user_id: loginId, trnxType: 'CR'
                        }]
                    }
                },
                { $group: { _id: null, sum: { $sum: "$amount" } } }
            ]);
            if (myEarning.length > 0) {
                myEarning = myEarning[0].sum;
            } else {
                myEarning = 0
            }
            remainingAmt = remainingAmt.balance;
            let myOrder = await Order.count({ user_id: loginId })
            let data = {
                status: "",
                message: "",
                isUserLoggedIn, remainingAmt,
                userData, myUploads,
                myBookmark, myEarning, myOrder
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
                let loginId = req.session.isCustomerLoggedIn;
                loginId = mongoose.Types.ObjectId(loginId);
                userData = await User.findOne({ _id: loginId });
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
            let user_id = req.session.isCustomerLoggedIn;
            user_id = mongoose.Types.ObjectId(user_id);
            let user = await User.findById({ _id: user_id });
            await bcrypt.compare(currentPass
                , user.password, async (err, isMatch) => {
                    console.log('isMatch', isMatch);
                    if (isMatch) {
                        let resp = await User.updateOne({ _id: user_id }, { password: hashPassword });
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
            console.log('change passsword error ss', error);
        }
    }

    //*************** GET UPDATE PROFILE PAGE ****************

    update_profile = async (req, res) => {
        try {
            let isUserLoggedIn = false;
            let userData = ''
            if (req.session.isCustomerLoggedIn) {
                isUserLoggedIn = true;
                let loginId = req.session.isCustomerLoggedIn;
                loginId = mongoose.Types.ObjectId(loginId);
                userData = await User.findOne({ _id: loginId });
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
            res.render('user/update-profile', data);
        } catch (error) {
            console.log('get update profile error', error)
        }
    }

    //***************  UPDATE PROFILE  ****************

    updateUserProfile = async (req, res) => {
        try {
            let userId = req.session.isCustomerLoggedIn;
            userId = mongoose.Types.ObjectId(userId);
            let body = req.body;
            let userData = {
                firstName: body.firstName,
                lastName: body.lastName,
                phone: body.phone
            }
            if (req.files && req.files.profile) {
                let image = req.files.profile;
                userData.profile = await AuthController.saveImageDirectorys(image);
            }
            let resp = await User.updateOne({ _id: userId }, userData);
            if (resp.acknowledged) {
                req.session.status = 'success';
                req.session.message = 'Your profile successfully updated'
                res.redirect('/update-profile');
            } else {
                req.session.status = 'Error';
                req.session.message = 'Something went wrong'
                res.redirect('/update-profile');
            }
        } catch (error) {
            console.log('update profile error', error);
            res.send({ message: error.message });
        }
    }

    //*************** MY ORDER ****************

    myOrder = async (req, res) => {
        try {
            let isUserLoggedIn = false;
            let userData = ''
            let whereClause = []
            let start_date, end_date;
            let page = 1;
            if (req.query && req.query.page) {
                page = req.query.page;
            }
            let limit = 5
            let skip = (page - 1) * limit;
            if (req.session.isCustomerLoggedIn) {
                isUserLoggedIn = true;
                let loginId = req.session.isCustomerLoggedIn;
                loginId = mongoose.Types.ObjectId(loginId);
                userData = await User.findOne({ _id: loginId });
                whereClause.push({ user_id: loginId });
                if (req.query.start_date !== "" && req.query.end_date !== "" &&
                    req.query.end_date != undefined && req.query.end_date != " undefined" &&
                    req.query.start_date != undefined && req.query.start_date != "undefined") {
                    start_date = req.query.start_date;
                    end_date = req.query.end_date;
                    var obj = {
                        createdAt: {
                            $gte: new Date(`${start_date}T00:00:00.00Z`),
                            $lte: new Date(`${end_date}T00:00:00.00Z`),
                        },
                    };
                    whereClause.push(obj);
                }
                var myOrder = await Order.find({ $and: whereClause }).limit(limit).skip(skip);
                var total_order = await Order.count({ $and: whereClause });
                var totalPages = Math.ceil(total_order / limit);
            }
            let data = {
                status: "",
                message: "",
                isUserLoggedIn,
                userData,
                myOrder,
                currentPage: page,
                total_order, totalPages,
                start_date, end_date
            }
            if (req.session.status && req.session.message) {
                data.status = req.session.status;
                data.message = req.session.message;
                delete req.session.status, req.session.message;
            }
            res.render('user/my-order', data);
        } catch (error) {
            console.log('Setting page error', error);
            res.send({ messsage: error.message })
        }
    }

    //*************** ORDER DEATILS PAGE ****************

    orderDetails = async (req, res) => {
        try {
            let isUserLoggedIn = false;
            let userData = ''
            var orderId = req.query.orderId;
            if (req.session.isCustomerLoggedIn) {
                isUserLoggedIn = true;
                let loginId = req.session.isCustomerLoggedIn;
                loginId = mongoose.Types.ObjectId(loginId);
                userData = await User.findOne({ _id: loginId });
                var order = await Order.findOne({ order_id: orderId });
                var orderDetails = await OrderDetails.aggregate([
                    {
                        $match: { order_id: order.order_id }
                    },
                    {
                        $project: { "product_id": 1, "user_id": 1 }
                    },
                    {
                        $lookup:
                        {
                            from: "products",
                            let: { productId: "$product_id" },
                            pipeline: [
                                {
                                    $match:
                                    {
                                        $expr:
                                            { $eq: ["$$productId", "$_id"] }
                                    }
                                },
                            ],
                            as: "product"
                        }
                    },
                    {
                        $lookup:
                        {
                            from: "reviews",
                            let: { order_user_id: "$user_id", order_productId: "$product_id" },
                            pipeline: [
                                {
                                    $match:
                                    {
                                        $expr:
                                        {
                                            $and: [
                                                { $eq: ['$$order_user_id', '$user_id'] },
                                                { $eq: ['$$order_productId', '$product_id'] },
                                            ]
                                        }
                                    }
                                },
                            ],
                            as: "review"
                        }
                    },
                ]);
            }
            let data = {
                status: "",
                message: "",
                isUserLoggedIn,
                userData,
                orderDetails,
                order,
            }
            if (req.session.status && req.session.message) {
                data.status = req.session.status;
                data.message = req.session.message;
                delete req.session.status, req.session.message;
            }
            res.render('user/order_details', data);
        } catch (error) {
            console.log('order details page error', error);
            res.send({ messsage: error.message })
        }
    }

    //*************** MY BOOKMARK  ****************

    myBookmark = async (req, res) => {
        try {
            let isUserLoggedIn = false;
            let page = 1;
            if (req.query && req.query.page) {
                page = req.query.page;
            }
            let limit = 3
            let skip = (page - 1) * limit;
            let whereClause = [];
            let userData, loginId;
            let start_date , end_date;
            if (req.session.isCustomerLoggedIn) {
                isUserLoggedIn = true;
                loginId = req.session.isCustomerLoggedIn;
                loginId = mongoose.Types.ObjectId(loginId);
                userData = await User.findOne({ _id: loginId });
                whereClause.push({ user_id: loginId });
            }
            var schoolData = await School.find({});
            if (req.query.start_date !== "" && req.query.end_date !== "" &&
                req.query.end_date != undefined && req.query.end_date != " undefined" &&
                req.query.start_date != undefined && req.query.start_date != "undefined") {
                start_date = req.query.start_date;
                end_date = req.query.end_date;
                var obj = {
                    createdAt: {
                        $gte: new Date(`${start_date}T00:00:00.00Z`),
                        $lte: new Date(`${end_date}T00:00:00.00Z`),
                    },
                };
                whereClause.push(obj);
            }
            if (req.query.search_school && req.query.search_school !== '') {
                search_school = req.query.search_school;
                var scl_id = mongoose.Types.ObjectId(search_school);
                whereClause.push({ scl_id: scl_id })
            }
            let productCount = await Bookmark.count({ $and: whereClause });
            let bookmarkData = await Bookmark.aggregate([
                {
                    $match: {
                        $and: whereClause
                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        let: { productId: '$product_id' },
                        pipeline: [
                            { $match: { $expr: { $eq: ['$_id', '$$productId'] } } },
                        ],
                        as: 'products'
                    },
                },
                // {
                //     $lookup: {
                //         from: 'users',
                //         let: { userId: '$products.user_id' },
                //         pipeline: [
                //             { $match: { $expr: { $eq: ['$$userId', '$_id'] } } },
                //         ],
                //         as: 'user'
                //     },
                // },
                {
                    $lookup: {
                        from: 'reviews',
                        let: { proId: '$product_id' },
                        pipeline: [
                            { $match: { $expr: { $eq: ['$product_id', '$$proId'] } } },
                            { $project : {'rating':1 , '_id':0 } }
                        ],
                        as: 'reviews'
                    },
                },
            ]).limit(limit).skip(skip);
            let data = {
                status: "",
                message: "",
                isUserLoggedIn,bookmarkData,
                userData,schoolData
            }
            if (req.session.status && req.session.message) {
                data.status = req.session.status;
                data.message = req.session.message;
                delete req.session.status, req.session.message;
            }
            res.render('user/bookmark', data);
        } catch (error) {
            console.log('Setting page error', error);
            res.send({ messsage: error.message })
        }
    }


    //*************** GET SETTING PAGE ****************

    setting = async (req, res) => {
        try {
            let isUserLoggedIn = false;
            let userData = ''
            if (req.session.isCustomerLoggedIn) {
                isUserLoggedIn = true;
                let loginId = req.session.isCustomerLoggedIn;
                loginId = mongoose.Types.ObjectId(loginId);
                userData = await User.findOne({ _id: loginId });
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
            res.render('user/setting', data);
        } catch (error) {
            console.log('Setting page error', error);
            res.send({ messsage: error.message })
        }
    }

    // new = async (req, res) => {

    //     res.redirect('/');
    // }
}

module.exports = new UserController();