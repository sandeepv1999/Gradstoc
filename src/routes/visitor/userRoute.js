const express = require('express');
const app = express();
const userController = require('../../controller/visitor/UserController');
const CheckUser = require('../../../middleware/CheckUser');

app.get('/dashboard' ,CheckUser.isValidUser,userController.dashboard);

app.get('/change-password' ,CheckUser.isValidUser, userController.getChangePassword);

app.post('/change-password' ,userController.changePassword);

app.get('/update-profile' ,CheckUser.isValidUser, userController.update_profile);

app.post('/update-profile' , userController.updateUserProfile);

app.get('/my-order' ,CheckUser.isValidUser, userController.myOrder);

app.get('/bookmark' ,CheckUser.isValidUser, userController.myBookmark);

app.get('/order-details' ,CheckUser.isValidUser, userController.orderDetails);

app.get('/setting' ,CheckUser.isValidUser, userController.setting);

// app.get('*' ,CheckUser.isValidUser, userController.new);



module.exports = app