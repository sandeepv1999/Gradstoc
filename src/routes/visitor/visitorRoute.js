require('dotenv').config()
const express = require('express');
const app = express();
const visitorController = require('../../controller/visitor/VisitorController');
const AuthController = require('../../controller/visitor/AuthController');
const CheckUser = require('../../../middleware/CheckUser');
const passport = require('passport');
const userController = require('../../controller/visitor/UserController');

app.get('/',visitorController.homePage);

app.post('/register',AuthController.registration);

app.post('/login' , AuthController.login);

app.post('/email_verify',AuthController.emailVerification);

app.get('/verify',visitorController.mailVerification);

app.post('/resendMail',visitorController.resendMail);

app.post('/forget_pasword',AuthController.forget_password);

app.get('/reset_password',AuthController.get_Reset_Pass_page);

app.post('/reset_password',AuthController.reset_user_password);

app.get('/logout',CheckUser.isValidUser,AuthController.logout);

app.get('/school',visitorController.school);

app.get('/product',visitorController.product);

app.get('/blog',visitorController.blog);

app.get('/google',passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/add_Info',passport.authenticate('google'), AuthController.googleLogin);

app.get('/auth/facebook', passport.authenticate('facebook',   { scope: 'email' } ));

app.get('/addInfo_fb',passport.authenticate('facebook'), AuthController.facebookLogin);

app.get('/add_Information', visitorController.addInformation);

app.post('/add_Information', AuthController.add_additional_data);

app.get('/terms-service', visitorController.termsAndService);

// app.get('*' ,CheckUser.isValidUser, userController.new);




module.exports = app