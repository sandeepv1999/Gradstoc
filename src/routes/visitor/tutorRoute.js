const express = require('express');
const app = express();
const tutorController = require('../../controller/visitor/TutorController');
const CheckUser = require('../../../middleware/CheckUser');

app.get('/dashboard' ,CheckUser.isValidUser,tutorController.dashboard);

app.get('/change-password' ,CheckUser.isValidUser, tutorController.getChangePassword);

app.post('/change-password' ,tutorController.changePassword);


module.exports = app