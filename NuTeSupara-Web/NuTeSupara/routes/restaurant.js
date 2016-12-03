var express = require('express'),
    router = express.Router(),
    restaurantRepo = require("../repositories/restaurantRepository"),
    authCheck = require("../middleware/isLoggedIn"),
    genericController = require('../controllers/genericController'), 
    bodyParser = require('body-parser');

module.exports = function (passport) {
    router.get('/login', function (req, res) {
        res.render("login.html");
    });
    
    router.get("/index-for-restaurants", authCheck.isLoggedIn, function (req, res) {
        res.render("index-for-restaurants.html", { restaurantName: req.user.name });
    });
    
    router.post('/login', passport.authenticate('local-login', {
        successRedirect : '/index-for-restaurants',
        failureRedirect : '/login',
    }));
    
    router.post('/authenticate', bodyParser.urlencoded({ extended: true }), function (req, res) {
        passport.authenticate('local-login', function (err, user) {
            if (err)
                return res.status(401).send(err);

            req.logIn(user, {}, function (err) {
                if (err) {
                    console.log('Error to login user via API.');
                    return res.status(500).send('');
                }

                res.status(200).send('Ok');
            });
                
        })(req, res);
    });
    
    router.get("/isUserAuthenticated", authCheck.isLoggedInWithoutRedirect);
    
    router.post('/saveRestaurantProfileChanges', authCheck.isLoggedIn, genericController.processRequest(restaurantRepo.saveRestaurantProfileChanges));
    
    return router;
}