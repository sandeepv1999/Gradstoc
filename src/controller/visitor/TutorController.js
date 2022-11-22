const express = require('express');
const app = express();
const User = require('../../model/user');
const School = require('../../model/school');
const Subject = require('../../model/subject');
const Course = require('../../model/course');
const Tag = require('../../model/tag');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const AuthController = require('./AuthController');

class TutorController {

    constructor() { }

    //***************** DASHBOARD *******************

    dashboard = async (req, res) => {
        try {
            let isUserLoggedIn = false;
            let userData = ''
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
            res.render('user/dashboard', data);
        } catch (error) {
            console.log('dashboard error', error);
        }
    }

    //***************** GET CHANGE PASSWORD ***********************

    getChangePassword = async (req, res) => {
        try {
            let isUserLoggedIn = false;
            let userData = ''
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
            res.render('user/change-password', data);
        } catch (error) {
            console.log('get change password page error', error)
        }
    }

    //***************** POST CHANGE PASSWORD ***********************

    changePassword = async (req, res) => {
        try {
            let currentPass = req.body.currentPassword;
            let newPassword = req.body.newPassword;
            var hashPassword = bcrypt.hashSync(newPassword, salt);
            let user_id = req.session.isCustomerLoggedIn;
            user_id = mongoose.Types.ObjectId(user_id);
            let user = await User.findById({ _id: user_id });
            await bcrypt.compare(currentPass
                , user.password, async (err, isMatch) => {
                    console.log('isMatch', isMatch);
                    if (isMatch) {
                        let resp = await User.updateOne({ _id: userId }, { password: hashPassword });
                        req.session.status = 'success';
                        req.session.message = 'Your password has been changed successFully';
                        res.redirect('/change-password');
                    } else {
                        req.session.status = 'error';
                        req.session.message = 'Please enter correct currrent password';
                        res.redirect('/change-password');
                    }
                });
        } catch (error) {
            console.log('change passsword error ss', error);
        }
    }

    //*************** GET UPDATE PROFILE PAGE ****************

    update_profile = async (req, res) => {
        try {
            let isUserLoggedIn = false;
            let userData = ''
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
            res.render('user/update-profile', data);
        } catch (error) {
            console.log('get update profile error', error)
        }
    }

    //***************  UPDATE PROFILE  ****************

    updateUserProfile = async (req, res) => {
        try {
            let userId = req.session.isCustomerLoggedIn;
            userId = mongoose.Types.ObjectId(userId);
            let body = req.body;
            let userData = {
                firstName: body.firstName,
                lastName: body.lastName,
                phone: body.phone
            }
            if (req.files && req.files.profile) {
                let image = req.files.profile;
                userData.profile = await AuthController.saveImageDirectorys(image);
            }
            let resp = await User.updateOne({ _id: userId }, userData);
            if (resp.acknowledged) {
                req.session.status = 'success';
                req.session.message = 'Your profile successfully updated'
                res.redirect('/update-profile');
            } else {
                req.session.status = 'Error';
                req.session.message = 'Something went wrong'
                res.redirect('/update-profile');
            }
        } catch (error) {
            console.log('update profile error', error);
            res.send({ message: error.message });
        }
    }

    //*************** GET SETTING PAGE ****************

    setting = async (req, res) => {
        try {
            let isUserLoggedIn = false;
            let userData = ''
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
            res.render('user/setting', data);
        } catch (error) {
            console.log('Setting page error', error);
            res.send({ messsage: error.message })
        }
    }

    //*************** GET MY UPLOAD PAGE ****************

    // myUploadedBooks = async (req, res) => {
    //     try {
    //         let isUserLoggedIn = false;
    //         let userData, schoolData;
    //         if (req.session.isCustomerLoggedIn) {
    //             isUserLoggedIn = true;
    //             let loginId = req.session.isCustomerLoggedIn;
    //             loginId = mongoose.Types.ObjectId(loginId);
    //             userData = await User.findOne({ _id: loginId });
    //             schoolData = await School.find({});
    //         }
    //         let data = {
    //             status: "",
    //             message: "",
    //             isUserLoggedIn,
    //             userData,
    //             schoolData,
    //         }
    //         if (req.session.status && req.session.message) {
    //             data.status = req.session.status;
    //             data.message = req.session.message;
    //             delete req.session.status, req.session.message;
    //         }
    //         res.render('user/my-upload-books', data);
    //     } catch (error) {
    //         res.send({ messsage: error.message })
    //     }
    // }

    //*************** ADD NEW BOOK PAGE ****************

    // addNewBook = async (req, res) => {
    //     try {
    //         let isUserLoggedIn = false;
    //         let userData = ''
    //         if (req.session.isCustomerLoggedIn) {
    //             isUserLoggedIn = true;
    //             let loginId = req.session.isCustomerLoggedIn;
    //             loginId = mongoose.Types.ObjectId(loginId);
    //             userData = await User.findOne({ _id: loginId });
    //         }
    //         let school = await School.find({});
    //         let tags = await Tag.find({});
    //         let data = {
    //             status: "",
    //             message: "",
    //             isUserLoggedIn,
    //             userData,
    //             school,
    //             tags
    //         }
    //         if (req.session.status && req.session.message) {
    //             data.status = req.session.status;
    //             data.message = req.session.message;
    //             delete req.session.status, req.session.message;
    //         }
    //         res.render('user/add-new-book', data);
    //     } catch (error) {
    //         console.log('add books error', error);
    //         res.send({ messsage: error.message })
    //     }
    // }

    //*************** ADD SCHOOL ****************

    // addSchool = async (req, res) => {
    //     try {
    //         let userId = req.session.isCustomerLoggedIn;
    //         userId = mongoose.Types.ObjectId(userId);
    //         const body = req.body;
    //         const image = req.files.school_logo;
    //         let logo = await AuthController.saveImageDirectorys(image);
    //         let schoolData = {
    //             name: body.school_name,
    //             description: body.school_description,
    //             logo: logo,
    //             user_id: userId
    //         }
    //         let resp = await School.create(schoolData);
    //         let school = await School.find({});
    //         res.json({ success: true, school });
    //     } catch (error) {
    //         res.send({ message: error.message });
    //     }
    // }

    //*************** GET SUBJECT BY SCL_ID ****************

    // getSubjectById = async (req, res) => {
    //     try {
    //         let scl_id = req.query.scl_id;
    //         scl_id = mongoose.Types.ObjectId(scl_id);
    //         let scl_sub = await Subject.find({ school_id: scl_id });
    //         if (scl_sub.length > 0) {
    //             res.json({ success: true, scl_sub });
    //         } else {
    //             res.json({ success: false });
    //         }
    //     } catch (error) {
    //         res.send({ success: false, message: error.message });
    //     }
    // }

    //*************** ADD SUBJECT BY SCL_ID ****************

    // addSubject = async (req, res) => {
    //     try {
    //         let userId = req.session.isCustomerLoggedIn;
    //         userId = mongoose.Types.ObjectId(userId);
    //         const body = req.body;
    //         let scl_id = body.school_id;
    //         scl_id = mongoose.Types.ObjectId(scl_id);
    //         let subjectData = {
    //             name: body.subject_name,
    //             description: body.subject_description,
    //             user_id: userId,
    //             school_id: scl_id
    //         }
    //         await Subject.create(subjectData);
    //         res.json({ success: true });
    //     } catch (error) {
    //         res.send({ success: false, message: error.message });
    //     }
    // }

    //*************** GET COURSE BY SCL AND SUB_ID ****************

    // getCourseByIds = async (req, res) => {
    //     try {
    //         let { scl_id, sub_id } = req.query;
    //         scl_id = mongoose.Types.ObjectId(scl_id);
    //         sub_id = mongoose.Types.ObjectId(sub_id);
    //         let courses = await Course.find({ school_id: scl_id, subject_id: sub_id });
    //         if (courses.length > 0) {
    //             res.json({ success: true, courses });
    //         } else {
    //             res.json({ success: false });
    //         }
    //     } catch (error) {
    //         res.send({ success: false, message: error.message });
    //     }
    // }

    //*************** ADD COURSE WITH SCL AND SUB ID ****************

    // addCourse = async (req, res) => {
    //     try {
    //         let userId = req.session.isCustomerLoggedIn;
    //         userId = mongoose.Types.ObjectId(userId);
    //         const body = req.body;
    //         let school_id = body.school_id;
    //         school_id = mongoose.Types.ObjectId(school_id);
    //         let subject_id = body.subject_id;
    //         subject_id = mongoose.Types.ObjectId(subject_id);
    //         let courseData = {
    //             name: body.course_name,
    //             description: body.course_description,
    //             user_id: userId,
    //             school_id, subject_id
    //         }
    //         let course = await Course.create(courseData);
    //         res.json({ success: true, course });
    //     } catch (error) {
    //         res.send({ message: error.message });
    //     }
    // }

    //*************** ADD TAGS ****************

    // addTag = async (req, res) => {
    //     try {
    //         let userId = req.session.isCustomerLoggedIn;
    //         userId = mongoose.Types.ObjectId(userId);
    //         const body = req.body;
    //         let tags = {
    //             name: body.tag,
    //             user_id: userId,
    //         }
    //         await Tag.create(tags);
    //         let tag = await Tag.find();
    //         res.json({ success: true,tag});
    //     } catch (error) {
    //         res.send({ message: error.message });
    //     }
    // }


}

module.exports = new TutorController();