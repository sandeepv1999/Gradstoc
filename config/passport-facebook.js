const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

passport.serializeUser(function (user, cb ) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});


passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: process.env.FACEBOOK_URL,
    profileFields: ['id', 'displayName']
},
    function (accessToken, refreshToken, profile, cb) {
        profile.accessToken = accessToken;
        return cb(null, profile );
    }
));