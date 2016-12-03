var express = require('express');
var router = express.Router();
var restaurantRepo = require("../repositories/restaurantRepository");
var authCheck = require("../middleware/isLoggedIn");

module.exports = function (passport) {
    /* GET home page. */
    router.get('/', function (req, res) {
        res.render("index.html");
    });
    
    router.get('/adminLogin', function (req, res) {
        res.render("adminLogin.html");
    });
    
    router.get("/admin", authCheck.isAdminAndLoggedIn, function (req, res) {
        var restaurants = restaurantRepo.find({}, "name noOfTables", function (err, restaurants) {
            res.render("admin.html", { restaurants: restaurants });
        })
    });
    
    router.post('/adminLogin', passport.authenticate('admin-login', {
            successRedirect : '/admin',
            failureRedirect : '/adminLogin',
        }));
    
    router.post('/changeNoOfTables', authCheck.isAdminAndLoggedIn, function (req, res) {
        restaurantRepo.changeTheNumberOfTables(req.body.restId, req.body.newNo, function (err) {
            if (err) {
                return res.status(400).send(err);
            }
            
            res.status(200).send("Numarul de mese a fost modificat cu succes");
        });
    });
    
    router.post('/createRestaurant', authCheck.isAdminAndLoggedIn, function (req, res) {
        restaurantRepo.createRestaurant(req.body, function (err) {
            if (err) {
                return res.status(400).send("A aparut o eroare in crearea restaurantului");
            }
            
            res.status(200).send("Restaurantul a fost creat cu succes");
        });
    });
    
    return router;
}