class checkUser {

    constructor() { }

    isValidUser = (req, res, next) => {
        if (!req.session.isCustomerLoggedIn) {
            req.session.status = 'Error'
            req.session.message = 'you are not authorized to access this service Please login'
            res.redirect('/');
            return false;
        }else{
            next();
        }
    }
}

module.exports = new checkUser();