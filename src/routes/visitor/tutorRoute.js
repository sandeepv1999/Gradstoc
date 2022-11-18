const express = require('express');
const app = express();
const tutorController = require('../../controller/visitor/TutorController');
const CheckUser = require('../../../middleware/CheckUser');

app.get('/dashboard' ,CheckUser.isValidUser,tutorController.dashboard);

app.get('/change-password' ,CheckUser.isValidUser, tutorController.getChangePassword);

app.post('/change-password' ,tutorController.changePassword);

app.get('/update-profile' , tutorController.update_profile);

app.post('/update-profile' , tutorController.updateUserProfile);

app.get('/setting' , tutorController.setting);

app.get('/my-uploaded-books' , tutorController.myUploadedBooks);

app.get('/add-new-book' , tutorController.addNewBook);

app.post('/add-school' , tutorController.addSchool);

app.post('/add-subject' , tutorController.addSubject);

app.get('/subject' , tutorController.getSubjectById);

app.post('/add-course' , tutorController.addCourse);

app.get('/course' , tutorController.getCourseByIds);

app.post('/add-tag' , tutorController.addTag);








module.exports = app