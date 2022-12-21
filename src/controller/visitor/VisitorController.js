const express = require('express');
const app = express();
const User = require('../../model/user');
const jwt = require('jsonwebtoken');
const verification = require('../../../mail');
const mongoose = require('mongoose');
const Product = require('../../model/product');
const School = require('../../model/school');
const Tag = require('../../model/tag');
const Cart = require('../../model/cart');
const OrderDetails = require('../../model/orderDetail');

class VisitorController {

    constructor() { }

    // ************ GET HOME PAGE **************

    homePage = async (req, res) => {
        let isUserLoggedIn = false;
        let userData = ""
        var productCount = '';
        if (req.cookies.cartItems && !req.session.isCustomerLoggedIn) {
            var cartItem = req.cookies.cartItems;
            productCount = cartItem.length
        }
        if (req.session.isCustomerLoggedIn) {
            isUserLoggedIn = true;
            let loginId = req.session.isCustomerLoggedIn;
            loginId = mongoose.Types.ObjectId(loginId);
            userData = await User.findOne({ _id: loginId });
            if (req.cookies.cartItems) {                // Add cookies product in database 
                let cartItem = req.cookies.cartItems;
                let newItem = [];
                let allProduct = await Product.find({ user_id: loginId }).select('_id');
                let x = allProduct.map((e) => {
                    return e._id.toString();
                })
                for (let i = 0; i < cartItem.length; i++) {
                    if (!x.includes(cartItem[i])) {
                        newItem.push(cartItem[i]);
                    }
                }
                let productIds = newItem.map((e) => {
                    return mongoose.Types.ObjectId(e);
                });
                for (let i = 0; i < productIds.length; i++) {   // Add cokkies 
                    let obj = {
                        user_id: loginId,
                        product_id: productIds[i]
                    }
                    let product = await Cart.findOne({ user_id: loginId, product_id: productIds[i] })
                    if (!product) {
                        await Cart.create(obj);
                    }
                }
                res.clearCookie("cartItems");   //  clear cookie after store data in db
            }
            productCount = await Cart.count({
                user_id: loginId,
            });
        }
        global.productCount = productCount
        let data = {
            status: "",
            message: "",
            isUserLoggedIn,
            userData,
        }
        if (req.session.status && req.session.message) {
            data.status = req.session.status;
            data.message = req.session.message;
            delete req.session.status, req.session.message;
        }
        res.render('visitor/index', data);
    }

    // ************ GET SCHOOL LIST **************

    school = async (req, res) => {
        let isUserLoggedIn = false;
        let userData = ""
        global.productCount = 0
        if (req.session.isCustomerLoggedIn) {
            isUserLoggedIn = true;
            let loginId = req.session.isCustomerLoggedIn;
            loginId = mongoose.Types.ObjectId(loginId);
            userData = await User.findOne({ _id: loginId });
            let count = await Cart.count({ user_id: loginId });
            global.productCount = count;
        }
        if (req.cookies.cartItems && !isUserLoggedIn) {
            global.productCount = req.cookies.cartItems.length
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
        res.render('visitor/school-list', data);
    }

    // ************ GET PRODUCT LIST **************

    product = async (req, res) => {
        let type = req.query.type;
        let isUserLoggedIn = false;
        let userData = ""
        let limit = 10
        let page = 1;
        let whereClause = [];
        var soldProduct = [];
        global.productCount = 0;
        if (req.query && req.query.page) {
            page = req.query.page;
        }
        let skip = (page - 1) * limit;
        if (req.session.isCustomerLoggedIn) {
            isUserLoggedIn = true;
            var loginId = req.session.isCustomerLoggedIn;
            loginId = mongoose.Types.ObjectId(loginId);
            userData = await User.findOne({ _id: loginId });
            whereClause.push({ user_id: { $ne: loginId } });       // user can not see its own book  
            var orderUser = await OrderDetails.find({user_id : loginId}).select('-_id   product_id');
            soldProduct = orderUser;
        }
        let search , search_school, subject , price_range , tag;
        whereClause.push({ type: type }, { isDeleted: '0' }, { visiblity: '1' });
        let school = await School.find({});
        let tags = await Tag.find({});
        if (req.query.search && req.query.search != '') {
            search = new RegExp(req.query.search, 'i');
            whereClause.push({ title: { $regex: search, $options: "i" } });
        }
        if (req.query.school && req.query.school != '') {
            search_school = req.query.school;
            search_school = mongoose.Types.ObjectId(search_school);
            whereClause.push({ scl_id: search_school });
        }
        if (req.query.subject && req.query.subject != '') {
            subject = req.query.subject;
            subject = mongoose.Types.ObjectId(subject);
            whereClause.push({ sub_id: subject });
        }
        if (req.query.price_range && req.query.price_range > 0) {
            price_range = parseInt(req.query.price_range) + 1;
            whereClause.push({ price: { $lte: price_range } });
        }
        if (req.query.tag && req.query.tag != '') {
            tag = req.query.tag;
            tag = mongoose.Types.ObjectId(tag);
            whereClause.push({ tag_id: { $in: tag } });
        }
        let bookCount = await Product.count({ $and: whereClause });
        let bookData = await Product.aggregate([
            {
                $match: {
                    $and: whereClause
                }
            },
            {
                $lookup: {
                    from: 'reviews',
                    let: { proId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$product_id', '$$proId'] } } },
                        { $project : {'rating':1 , '_id':0 } }
                    ],
                    as: 'reviews'
                },
            },
        ]).limit(limit).skip(skip);
        let totalPages = Math.ceil(bookCount / limit);
        let remaining = (bookCount - skip) + skip;
        let cartItems = [];
        let data = {
            status: "",
            message: "",
            isUserLoggedIn,
            userData, type, tags,
            currentPage: page,
            limit, skip, school,
            bookCount, bookData,
            totalPages, remaining, cartItems,
            search , search_school , subject ,
            price_range ,tag,soldProduct
        }
        if (req.session.isCustomerLoggedIn) {
            let userProducts = await Cart.find({ user_id: loginId }).select('product_id');
            if (userProducts.length > 0) {
                for (let i = 0; i < userProducts.length; i++) {
                    cartItems.push(userProducts[i].product_id.toString());
                }
            }
            global.productCount = userProducts.length;
            data.cartItems = cartItems;
        }
        if (req.cookies.cartItems && req.cookies.cartItems.length > 0) {
            cartItems = req.cookies.cartItems;
            data.cartItems = cartItems
            global.productCount = cartItems.length
        };
        if (req.session.status && req.session.message) {
            data.status = req.session.status;
            data.message = req.session.message;
            delete req.session.status, req.session.message;
        }
        res.render('visitor/product-list', data);
    }

    // ************ GET BLOGS **************

    blog = async (req, res) => {
        let isUserLoggedIn = false;
        let userData = ""
        global.productCount = 0
        if (req.session.isCustomerLoggedIn) {
            isUserLoggedIn = true;
            let loginId = req.session.isCustomerLoggedIn;
            loginId = mongoose.Types.ObjectId(loginId);
            userData = await User.findOne({ _id: loginId });
            let count = await Cart.count({ user_id: loginId });
            global.productCount = count;
        }
        if (req.cookies.cartItems && !isUserLoggedIn) {
            global.productCount = req.cookies.cartItems.length
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
        res.render('visitor/blog', data);
    }

    // ************ GET BLOGS **************

    addInformation = async (req, res) => {
        let isUserLoggedIn = false;
        let userData = ""
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
        res.render('visitor/addInfo', data);
    }

    // ************ EMAIL VERIFICATION BY URL **************

    mailVerification = async (req, res) => {
        let token = req.query.token;
        let user = await User.findOne({ token });
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

    // ************ RESEND EMAIL FUNCTIONALITY **************

    resendMail = async (req, res) => {
        let email = req.body.email
        let user = await User.findOne({ email });
        console.log('user', user);
        let data = {};
        if (user) {
            if (user.isEmailVerify == '1') {
                data.message = 'The email that you entered, It is already verify'
                res.json(data);
            } else {
                let now = new Date();
                let token = jwt.sign({ email: user.email, id: user._id }, 'gradstoctoken');
                user.token = token;
                let template = `<div>
                <h1>Email Confirmation</h1>
                <h2>Hello ${user.firstName}</h2>
                <p>Thank you for register. Please confirm your email by clicking on the following link</p>
                <a href=http://localhost:3300/verify?token=${user.token} => Click here</a>
                </div>`
                let expiryTime = this.AddMinutesToDate(now, 10);
                await verification.send_mail(user.email, 'verification Email', template);
                await User.updateOne({ _id: user._id }, { token: token, expiry_time: expiryTime });
                data.success = true;
                data.message = 'We have sent you a verification email please verify';
                res.json(data);
            }
        } else {
            data.success = false;
            data.message = 'Please enter valid email address';
            res.json(data);
        }
    }


    // ************ GET BLOGS **************

    termsAndService = async (req, res) => {
        let isUserLoggedIn = false;
        let userData = ""
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
        res.render('visitor/termsAndService', data);
    }

    AddMinutesToDate = (date, minutes) => {
        return new Date(date.getTime() + minutes * 60000);
    }
}

module.exports = new VisitorController();