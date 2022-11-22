const express = require('express');
const app = express();
const User = require('../../model/user');
const School = require('../../model/school');
const Subject = require('../../model/subject');
const Course = require('../../model/course');
const Book = require('../../model/book');
const Tag = require('../../model/tag');
const mongoose = require('mongoose');
const AuthController = require('./AuthController');

class BookController {

    constructor() { }

    //*************** GET MY UPLOAD PAGE ****************

    myUploadedBooks = async (req, res) => {
        try {
            let isUserLoggedIn = false;
            let userData, schoolData;
            if (req.session.isCustomerLoggedIn) {
                isUserLoggedIn = true;
                let loginId = req.session.isCustomerLoggedIn;
                loginId = mongoose.Types.ObjectId(loginId);
                userData = await User.findOne({ _id: loginId });
                schoolData = await School.find({});
            }
            let data = {
                status: "",
                message: "",
                isUserLoggedIn,
                userData,
                schoolData,
            }
            if (req.session.status && req.session.message) {
                data.status = req.session.status;
                data.message = req.session.message;
                delete req.session.status, req.session.message;
            }
            res.render('user/my-upload-books', data);
        } catch (error) {
            res.send({ messsage: error.message })
        }
    }

    //*************** GET ADD BOOK PAGE ****************

    addNewBook = async (req, res) => {
        try {
            let isUserLoggedIn = false;
            let userData = ''
            if (req.session.isCustomerLoggedIn) {
                isUserLoggedIn = true;
                let loginId = req.session.isCustomerLoggedIn;
                loginId = mongoose.Types.ObjectId(loginId);
                userData = await User.findOne({ _id: loginId });
            }
            let school = await School.find({});
            let tags = await Tag.find({});
            let data = {
                status: "",
                message: "",
                isUserLoggedIn,
                userData,
                school,
                tags
            }
            if (req.session.status && req.session.message) {
                data.status = req.session.status;
                data.message = req.session.message;
                delete req.session.status, req.session.message;
            }
            res.render('user/add-new-book', data);
        } catch (error) {
            console.log('add books error', error);
            res.send({ messsage: error.message })
        }
    }

    //*************** ADD SCHOOL ****************

    addSchool = async (req, res) => {
        try {
            let userId = req.session.isCustomerLoggedIn;
            userId = mongoose.Types.ObjectId(userId);
            const body = req.body;
            const image = req.files.school_logo;
            let logo = await AuthController.saveImageDirectorys(image);
            let schoolData = {
                name: body.school_name,
                description: body.school_description,
                logo: logo,
                user_id: userId
            }
            await School.create(schoolData);
            let school = await School.find({});
            res.json({ success: true, school });
        } catch (error) {
            res.send({ message: error.message });
        }
    }

    //*************** GET SUBJECT BY SCL_ID ****************

    getSubjectById = async (req, res) => {
        try {
            let scl_id = req.query.scl_id;
            scl_id = mongoose.Types.ObjectId(scl_id);
            let scl_sub = await Subject.find({ school_id: scl_id });
            if (scl_sub.length > 0) {
                res.json({ success: true, scl_sub });
            } else {
                res.json({ success: false });
            }
        } catch (error) {
            res.send({ success: false, message: error.message });
        }
    }

    //*************** ADD SUBJECT BY SCL_ID ****************

    addSubject = async (req, res) => {
        try {
            let userId = req.session.isCustomerLoggedIn;
            userId = mongoose.Types.ObjectId(userId);
            const body = req.body;
            let scl_id = body.school_id;
            scl_id = mongoose.Types.ObjectId(scl_id);
            let subjectData = {
                name: body.subject_name,
                description: body.subject_description,
                user_id: userId,
                school_id: scl_id
            }
            await Subject.create(subjectData);
            res.json({ success: true });
        } catch (error) {
            res.send({ success: false, message: error.message });
        }
    }

    //*************** GET COURSE BY SCL AND SUB_ID ****************

    getCourseByIds = async (req, res) => {
        try {
            let { scl_id, sub_id } = req.query;
            scl_id = mongoose.Types.ObjectId(scl_id);
            sub_id = mongoose.Types.ObjectId(sub_id);
            let courses = await Course.find({ school_id: scl_id, subject_id: sub_id });
            if (courses.length > 0) {
                res.json({ success: true, courses });
            } else {
                res.json({ success: false });
            }
        } catch (error) {
            res.send({ success: false, message: error.message });
        }
    }

    //*************** ADD COURSE WITH SCL AND SUB ID ****************

    addCourse = async (req, res) => {
        try {
            let userId = req.session.isCustomerLoggedIn;
            userId = mongoose.Types.ObjectId(userId);
            const body = req.body;
            let school_id = body.school_id;
            school_id = mongoose.Types.ObjectId(school_id);
            let subject_id = body.subject_id;
            subject_id = mongoose.Types.ObjectId(subject_id);
            let courseData = {
                name: body.course_name,
                description: body.course_description,
                user_id: userId,
                school_id, subject_id
            }
            let course = await Course.create(courseData);
            res.json({ success: true, course });
        } catch (error) {
            res.send({ message: error.message });
        }
    }

    //*************** ADD TAGS ****************

    addTag = async (req, res) => {
        try {
            let userId = req.session.isCustomerLoggedIn;
            userId = mongoose.Types.ObjectId(userId);
            const body = req.body;
            let tags = {
                name: body.tag,
                user_id: userId,
            }
            await Tag.create(tags);
            let tag = await Tag.find();
            res.json({ success: true, tag });
        } catch (error) {
            res.send({ message: error.message });
        }
    }

    //*************** BOOK UPLOAD ****************

    bookUpload = async (req, res) => {
        try {
            const body = req.body;
            const { book_image, sample_file, main_file } = req.files;
            let userId = req.session.isCustomerLoggedIn;
            userId = mongoose.Types.ObjectId(userId);
            let scl_id = mongoose.Types.ObjectId(body.school_id);
            let sub_id = mongoose.Types.ObjectId(body.subject_id);
            let course_id = mongoose.Types.ObjectId(body.course_id);
            let mainFile = await AuthController.saveImageDirectorys(main_file);
            let bookImg = await AuthController.saveImageDirectorys(book_image);
            let samp_file = await AuthController.saveImageDirectorys(sample_file);
            console.log('filesssss', bookImg, samp_file);
            let book = {
                title: body.title,
                user_id: userId,
                scl_id: scl_id,
                sub_id: sub_id,
                course_id: course_id,
                main_file: mainFile,
                sample_file: samp_file,
                image: bookImg,
                price: body.price,
                tag: body.tags,
                short_description: body.short_description,
                full_description: body.full_description,
            }
            await Book.create(book);
            let schoolData = await School.find({});
            let userData = await User.findOne({_id : userId})
            console.log('userData',userData);
            let bookData = await Book.find({});
            console.log('bookData',);
            req.session.status = "success";
            req.session.message = "Book successfully uploaded";
            let data = {
                status: "",
                message: "",
                isUserLoggedIn:true,
                userData,
                schoolData,
                bookData
            }
            if (req.session.status && req.session.message) {
                data.status = req.session.status;
                data.message = req.session.message;
                delete req.session.status, req.session.message;
            }
            console.log('bookData', bookData);
            res.render('user/my-upload-books', data)
        } catch (error) {
            res.send({ message: error.message });
        }
    }



}

module.exports = new BookController();