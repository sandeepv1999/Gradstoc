const express = require('express');
const app = express();
const bookController = require('../../controller/visitor/BookController');
const CheckUser = require('../../../middleware/CheckUser');

app.get('/my-uploaded-books' , bookController.myUploadedBooks);

app.get('/add-new-book' , bookController.addNewBook);

app.post('/add-school' , bookController.addSchool);

app.post('/add-subject' , bookController.addSubject);

app.get('/subject' , bookController.getSubjectById);

app.post('/add-course' , bookController.addCourse);

app.get('/course' , bookController.getCourseByIds);

app.post('/add-tag' , bookController.addTag);

app.post('/book-upload' , bookController.bookUpload);

module.exports = app