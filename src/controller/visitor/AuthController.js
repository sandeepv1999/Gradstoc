const express = require('express');
const app = express();
const User = require('../../model/user');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const verification = require('../../../mail')
const jwt = require('jsonwebtoken');
const joi = require('joi');
const joiValidation = require('../../../middleware/joiValidation');

class AuthController {

    constructor() { }

    //***************** User Registration ************************

    registration = async (req, res) => {
        try {
            const body = req.body
            let image = req.files.profile;
            let password = body.password;
            let profileImage = await this.saveImageDirectorys(image);
            var hashPassword = bcrypt.hashSync(password, salt);

            let userData = {
                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email,
                type: body.type, // type = 0  student , 1 = tutor
                profile: profileImage,
                password: hashPassword
            }
            let schema = joi.object({
                firstName: joi.string().trim().required(),
                lastName: joi.string().trim().required(),
                email: joi.string().required().email(),
                password: joi.string().trim().required(),
                type: joi.string().trim().required(),
                profile: joi.string().required()
            });

            await joiValidation.validateBodyRequest(userData, schema);
            let response = await User.create(userData);
            req.session.status = 'Success'
            req.session.message = 'Thank you for register .We have sent you a verification email please verify'
            let now = new Date();
            let token = jwt.sign(userData.email, 'gradstoctoken');
            response.token = token;
            let template = `<div>
            <h1>Email Confirmation</h1>
            <h2>Hello ${response.firstName}</h2>
            <p>Thank you for register. Please confirm your email by clicking on the following link</p>
            <a href=http://localhost:3300/verify?token=${response.token} => Click here</a>
            </div>`
            let expiryTime = this.AddMinutesToDate(now, 10);
            await verification.send_mail(response.email, 'verification Email', template);
            await User.updateOne({ _id: response._id }, { token: token, expiry_time: expiryTime });
            res.redirect('/')
        } catch (error) {
            console.log('registration Error', error);
            res.send({ message: error.message })
        }
    }

    //***************** Email Verification ***********************

    emailVerification = async (req, res) => {
        try {
            const email = req.body.email;
            let user = await User.findOne({ email: email });
            if (user) {
                let data = {
                    message: 'email alredy exist',
                    success: true,
                }
                res.json(data);
            } else {
                let data = {
                    success: false
                }
                res.json(data);
            }
        } catch (error) {
            console.log('email verification error', error);
            res.json({ message: error.message });

        }
    }

    //***************** LOGIN WITH GOOGLE  ***********************

    googleLogin = async (req, res) => {
        try {
            let data = {};
            let socialDetails = req.user;
            let user = await User.findOne({ email: socialDetails.email });
            if (user) {
                if (user.is_social == 1 && user.type) {
                    req.session.status = 'success';
                    req.session.message = 'You have successfully logged in';
                    req.session.isCustomerLoggedIn = user._id;
                    res.redirect('/');
                } else if (user.is_social == 1) {
                    req.session.status = 'success';
                    req.session.message = 'You have successfully logged in ,please fill the form otherwise you can not access all this functionality';
                    if (req.session.status && req.session.message) {
                        data.status = req.session.status;
                        data.message = req.session.message;
                        delete req.session.status, req.session.message;
                    }
                    data.userData = user;
                    data.isUserLoggedIn = false;
                    res.render('visitor/addInfo', data);
                } else {
                    req.session.status = 'error';
                    req.session.message = 'This email is already registerd';
                    res.redirect('/');
                }
            } else {
                let userDetails = {
                    firstName: socialDetails.given_name,
                    lastName: socialDetails.family_name,
                    email: socialDetails.email,
                    profile: socialDetails.picture,
                    provider: socialDetails.provider,
                    providerId: socialDetails.id,
                    is_social: 1,
                    isEmailVerify: 1,
                }
                let response = await User.create(userDetails);
                req.session.status = 'success';
                req.session.message = 'You have successfully logged in ,please fill the form otherwise you can not access all this functionality';
                if (req.session.status && req.session.message) {
                    data.status = req.session.status;
                    data.message = req.session.message;
                    delete req.session.status, req.session.message;
                }
                data.userData = response;
                data.isUserLoggedIn = false;
                res.render('visitor/addInfo', data);
            }
        } catch (error) {
            res.json({ message: error.message });
        }
    }

    //***************** ADDITIONAL INFORMATION ***********************

    add_additional_data = async (req, res) => {
        try {
            let body = req.body;
            let image = req.files.profile;
            let profileImage = await this.saveImageDirectorys(image);
            let userData = {
                firstName: body.firstName,
                lastName: body.lastName,
                type: body.type,
                profile: profileImage,
                email: body.email
            }
            let user = await User.findOne({ providerId: body.providerId });
            if (user) {
                let response = await User.updateOne({ _id: user._id }, userData);
                if (response.acknowledged) {
                    req.session.status = 'Success'
                    req.session.message = 'Successfully logged in'
                    req.session.isCustomerLoggedIn = user._id;
                    res.redirect('/');
                }
            } else {
                req.session.status = 'Success'
                req.session.message = 'Failed to login , try again';
                res.redirect('/');
            }
        } catch (error) {
            console.log('Additional data error', error);
            res.send({ message: error.message });
        }
    }

    //***************** LOGIN WITH GOOGLE  ***********************

    facebookLogin = async (req, res) => {
        try {
            let data = {};
            let socialDetails = req.user;
            let user = await User.findOne({ providerId: socialDetails.id });
            if (user) {
                if (user.is_social == 1 && user.type) {
                    req.session.status = 'success';
                    req.session.message = 'You have successfully logged in';
                    req.session.isCustomerLoggedIn = user._id;
                    res.redirect('/');
                } else if (user.is_social == 1) {
                    req.session.status = 'success';
                    req.session.message = 'You have successfully logged in ,please fill the form otherwise you can not access all this functionality';
                    if (req.session.status && req.session.message) {
                        data.status = req.session.status;
                        data.message = req.session.message;
                        delete req.session.status, req.session.message;
                    }
                    data.userData = user;
                    data.isUserLoggedIn = false;
                    res.render('visitor/addInfo', data);
                } else {
                    req.session.status = 'error';
                    req.session.message = 'This email is already registerd';
                    res.redirect('/');
                }
            } else {
                let fullName = socialDetails.displayName.split(' ');
                let userDetails = {
                    firstName: fullName[0],
                    lastName: fullName[1],
                    provider: socialDetails.provider,
                    providerId: socialDetails.id,
                    is_social: 1,
                    isEmailVerify: 1
                }
                let response = await User.create(userDetails);
                req.session.status = 'success';
                req.session.message = 'You have successfully logged in ,please fill the form otherwise you can not access all this functionality';
                if (req.session.status && req.session.message) {
                    data.status = req.session.status;
                    data.message = req.session.message;
                    delete req.session.status, req.session.message;
                }
                data.userData = response;
                data.isUserLoggedIn = false;
                res.render('visitor/addInfo', data);
            }
        } catch (error) {
            res.json({ message: error.message });
        }
    }

    //***************** User Login  ***********************

    login = async (req, res) => {
        try {
            let schema = joi.object({
                email: joi.string().required().email(),
                password: joi.string().trim().required()
            });
            await joiValidation.validateBodyRequest(req.body, schema);
            let { email, password } = req.body;
            let user = await User.findOne({ email: email });
            let data = {}
            if (user) {
                await bcrypt.compare(
                    password,
                    user.password,
                    async function (err , isMatch) {
                        if (isMatch) {
                            if (user.isEmailVerify == '0') {
                                data.success = false;
                                data.message = 'Your Email is not verify, please verify your email by click Resend Email link';
                                res.json(data);
                            } else {
                                req.session.status = 'Success';
                                req.session.message = 'Logged In Successfully ';
                                req.session.isCustomerLoggedIn = user._id;
                                data.success = true;
                                res.json(data);
                            }
                        } else {
                            data.success = false;
                            data.message = 'Invalid password';
                            res.json(data);
                        }
                    }
                );
            } else {
                data.success = false;
                data.message = 'Invalid credentials';
                res.json(data);
            }
        } catch (e) {
            res.json({ message: e.message });
        }
    }

    //***************** FORGET PASSWORD ************************

    forget_password = async (req, res) => {
        try {
            let schema = joi.object({
                email: joi.string().required().email(),
            });
            await joiValidation.validateBodyRequest(req.body, schema);
            let email = req.body.email;
            let user = await User.findOne({ email: email });
            let data = {}
            if (user) {
                let token = jwt.sign(user.email, 'gradstoctoken');
                let now = new Date();
                let expiryTime = this.AddMinutesToDate(now, 10);
                let template = ` <div>
                <h1>Forget Password</h1>
                <h2>Hello ${user.firstName}</h2>
                <p>Use the link below to set up a new password for your account. If you did not request to reset your password , ignore this email and the link will expire on its own</p>
                <a href=http://localhost:3300/reset_Password?token=${token}&email=${user.email}  => Click here</a>
                </div>`
                await verification.send_mail(user.email, 'Forgot-Password', template);
                await User.updateOne({ _id: user._id }, { token: token, expiry_time: expiryTime });
                data.success = true;
                data.message = 'An Email has been sent to the address that you have provided.Please follow the link in the email to complete your password reset request';
                res.json(data);
            }
            else {
                data.success = false;
                data.message = 'Enter valid email address';
                res.json(data);
            }
        } catch (e) {
            console.log('ERROR', e);
            res.json({ success: false, message: e.message });
        }
    }

    //***************** Get reset password page ***********************

    get_Reset_Pass_page = async (req, res) => {
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
            const token = req.query.token;
            const email = req.query.email;
            let user = await User.findOne({ email: email });
            if (user) {
                var now = new Date();
                var exp = user.expiry_time;
                if (now <= exp) {
                    var response = await User.updateOne({ _id: user._id }, { token: "" });
                    if (response) {
                        data.email = user.email;
                        res.render('visitor/forget-password', data);
                    }
                } else {
                    var response = await User.updateOne({ _id: user._id }, { token: "" });
                    res.send('your reset password link is expired');
                }
            } else {
                res.send('You are not a valid user');
            }
        } catch (error) {
            console.log('recoverAccount', error);
            res.send({ message: error.message });
        }
    }

    //************* POST RESET PASSWORD PAGE ***************

    reset_user_password = async (req, res) => {
        let email = req.body.email;
        let password = req.body.password;

        let hashPassword = bcrypt.hashSync(password, salt);
        var response = await User.updateOne({ email: email }, { password: hashPassword });
        let data = {}
        if (response) {
            req.session.status = "success";
            req.session.message = "Your password has been set successfully";
            data.success = true;
            res.json(data)
        } else {
            data.success = false;
            res.json(data)
        }
    }

    //*************** LOGOUT ******************

    logout = async (req, res) => {
        if (req.session.isCustomerLoggedIn) {
            delete req.session.isCustomerLoggedIn;
            req.session.status = "success";
            req.session.message = "SuccessFully logged out"
            res.redirect('/');
        }
    }

    //***************** Save Image In Directory ***********************

    saveImageDirectorys = async (profileImage) => {
        return new Promise(function (resolve, reject) {
            const images = profileImage.name;
            const nameArray = images.split('.');
            const imageExtension = nameArray.slice(-1);
            const todaysDate = new Date();
            const imageFinalName = todaysDate.getTime() + '.' + imageExtension;
            const uploadPath = __dirname + '/../../../public/uploads/' + imageFinalName;
            profileImage.mv(uploadPath, function (error) {
                if (error) {
                    let response = {
                        error: error,
                        message: "Image Upload Error"
                    }
                    reject(response);
                } else {
                    resolve(imageFinalName);
                }
            });
        });
    }

    AddMinutesToDate = (date, minutes) => {
        return new Date(date.getTime() + minutes * 60000);
    }

}

module.exports = new AuthController();