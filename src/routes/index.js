const express = require('express');
const app = express();
const visitorRoute = require('./visitor/visitorRoute');
const userRoute = require('./visitor/userRoute');
const productRoute = require('./visitor/productRoute');

app.use('/' , visitorRoute);

app.use('/' , userRoute);

app.use('/' , productRoute);

module.exports = app