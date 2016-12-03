var ERR_LOGIN = "Adresa de email sau parola nu sunt corecte";

var LocalStrategy = require('passport-local').Strategy;
var Restaurant = require('../models/restaurantModel');
var Admin = require('../models/adminModel');

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, { id: user.id, isAdmin: user.isAdmin });
    });
    
    passport.deserializeUser(function (user, done) {
        if (!user.isAdmin) {
            Restaurant.findById(user.id, function (err, restaurant) {
                restaurant.isAdmin = false;
                done(err, restaurant);
            });
        } else {
            Admin.findById(user.id, function (err, admin) {
                admin.isAdmin = true;
                done(err, admin);
            });
        }
    });
    
    passport.use('local-login', new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true
        },
    function (req, email, password, done) {
            Restaurant.findOne({ 'email' : email }, function (err, user) {
                if (err)
                    return done(err);
                
                if (!user)
                    return done(null, false, ERR_LOGIN);
                
                if (!user.validPassword(password))
                    return done(null, false, ERR_LOGIN);
                
                user.isAdmin = false;
                
                return done(null, user);
            });
        }));
    
    passport.use('admin-login', new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true
        },
    function (req, email, password, done) {
            Admin.findOne({ 'email' : email }, function (err, user) {
                if (err)
                    return done(err);
                
                if (!user)
                    return done(null, false, ERR_LOGIN);
                
                if (!user.validPassword(password))
                    return done(null, false, ERR_LOGIN);
                
                user.isAdmin = true;
                
                return done(null, user);
            });
        }));
};