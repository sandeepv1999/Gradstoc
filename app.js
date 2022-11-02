const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fileupload = require('express-fileupload');
const mainRouter = require('./src/routes/index');
const mongoConnection = require('./dbConnection/connection');
const flash = require('express-flash-messages');
const session = require('express-session')
const cookieParser = require('cookie-parser');


mongoConnection();

app.use(cookieParser());

const sessionTime = 1000 * 60 * 60 * 24;

const sessionConfig = {
    secret: 'gradStoc',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: sessionTime,
        path: '/',
        httpOnly: true
    }
}

app.use(session(sessionConfig));

app.set('view engine' , 'ejs');
app.use(express.static(__dirname + '/public'));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileupload());


// calling other router

app.use('/' , mainRouter);

// For server starting

const port = 3300;

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});