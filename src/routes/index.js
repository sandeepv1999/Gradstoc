const express = require('express');
const app = express();
const visitorRoute = require('./visitor/visitorRoute');
const tutorRoute = require('./visitor/tutorRoute');

app.use('/' , visitorRoute);

app.use('/' , tutorRoute);

module.exports = app