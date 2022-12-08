const express = require('express');
const app = express();
const userController = require('../../controller/visitor/UserController');
const CheckUser = require('../../../middleware/CheckUser');

app.get('/dashboard' ,CheckUser.isValidUser,userController.dashboard);

app.get('/change-password' ,CheckUser.isValidUser, userController.getChangePassword);

app.post('/change-password' ,userController.changePassword);

app.get('/update-profile' , userController.update_profile);

app.post('/update-profile' , userController.updateUserProfile);

app.get('/setting' , userController.setting);


module.exports = app