require('dotenv').config()
const express = require('express');
const app = express();
const AdminController = require('../../controller/admin/AdminController');
const AuthController = require('../../controller/visitor/AuthController');
const CheckUser = require('../../../middleware/CheckUser');
const passport = require('passport');


app.get('/',AdminController.homePage);

app.post('/register',AuthController.registration);

app.post('/login' , AuthController.login);

app.post('/email_verify',AuthController.emailVerification);

app.get('/verify',AdminController.mailVerification);

app.post('/resendMail',AdminController.resendMail);

app.post('/forget_pasword',AuthController.forget_password);

app.get('/reset_password',AuthController.get_Reset_Pass_page);

app.post('/reset_password',AuthController.reset_user_password);

app.get('/logout',CheckUser.isValidUser,AuthController.logout);

app.get('/school',AdminController.school);

app.get('/document',AdminController.document);

app.get('/book',AdminController.book);

app.get('/blog',AdminController.blog);

app.get('/google',passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/add_Info',passport.authenticate('google'), AuthController.socialLogin);


module.exports = app