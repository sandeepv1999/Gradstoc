const express = require('express');
const app = express();
const AdminController = require('../../controller/admin/AdminController');
const AuthController = require('../../controller/visitor/AuthController');

app.get('/',AdminController.homePage);
app.post('/register',AuthController.registration);
app.post('/login' , AuthController.login);
app.post('/email_verify',AuthController.emailVerification);
app.get('/verify',AdminController.mailVerification);
// app.get('/resendMail',AdminController.sendVerificationMail);
app.post('/forget_pasword',AuthController.forget_password);
app.get('/reset_password',AuthController.get_Reset_Pass_page);
app.post('/reset_password',AuthController.reset_user_password);





module.exports = app