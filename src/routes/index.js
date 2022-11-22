const express = require('express');
const app = express();
const visitorRoute = require('./visitor/visitorRoute');
const tutorRoute = require('./visitor/tutorRoute');
const bookRoute = require('./visitor/bookRoute');

app.use('/' , visitorRoute);

app.use('/' , tutorRoute);

app.use('/' , bookRoute);

module.exports = app