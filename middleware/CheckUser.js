class checkUser {

    constructor() { }

    isValidUser = (req, res, next) => {
        if (!req.session.isCustomerLoggedIn) {
            console.log('you are not authorized to access this service');
            res.redirect('/');
            return false;
        }else{
            next();
        }
    }

}

module.exports = new checkUser();