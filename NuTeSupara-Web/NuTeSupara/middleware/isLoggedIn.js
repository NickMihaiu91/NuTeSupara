module.exports.isLoggedIn = function (req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't send 401 Unauthorized 
    res.status(401).redirect('/login');
}

module.exports.isAdminAndLoggedIn = function (req, res, next) {
    
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated() && req.user && req.user.isAdmin)
        return next();
    
    // if they aren't send 401 Unauthorized 
    res.status(401).redirect('/adminLogin');
}

module.exports.isLoggedInWithoutRedirect = function (req, res, next) {

    if (req.isAuthenticated()) { 
        var username = req.user.name;
        return res.status(200).send(username);
    }
        
    res.status(401).send('Not authorized');
}
