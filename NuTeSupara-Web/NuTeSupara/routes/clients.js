var express = require('express');
var restaurantRepo = require('../repositories/restaurantRepository');
var accessCodeRepo = require('../repositories/accessCodeRepository');
var router = express.Router();

var sendNotificationToRestaurantMehod = require('../controllers/socketIoController').sendNotificationToRestaurant;

var restaurantNotifications = {};

var ERROR_CODE_INVALID = 'Codul introdus nu este valid.';

router.post('/notifyWaiter', function (req, res) {
    var restId = req.body.restaurantId;
    var tableId = req.body.tableId;
    var now = new Date();
    
    if (typeof restId === "undefined" || typeof tableId === "undefined")
        return res.status(400).send({ errorMessage: 'Link-ul folosit nu este valid.' });
    
    if (isNaN(tableId)) {
        return res.status(400).send({ errorMessage: 'Identificarea meselor se face doar numeric. Nu mai schimbati URL-ul!' });
    }
    
    if (!restaurantNotifications[restId])
        restaurantNotifications[restId] = {};
    
    if (restaurantNotifications[restId][tableId]) {
        var timeElapsed = now - restaurantNotifications[restId][tableId];
        
        if (timeElapsed < 60 * 1000) {
            var response = {
                timeElapsed : Math.round(timeElapsed / 1000),
                errorMessage : 'Ospătarul a fost deja anunțat.'
            };
            return res.status(400).send(response);
        }
        
        restaurantNotifications[restId][tableId] = now;
    }
    else {
        restaurantNotifications[restId][tableId] = now;
    }
    
    var result = sendNotificationToRestaurantMehod(restId, tableId); // send notification via socket to restaurant
    if (result.errorMessage)
        return res.status(400).send(result);
    
    res.send('Ok');
});

router.post('/notifyWaiterAccessCode', function (req, res) {
    var id = req.body.id;
    var now = new Date();
    
    if (typeof id === "undefined")
        return res.status(400).send({ errorMessage: 'Link-ul folosit nu este valid.' });
    
    checkAccessCode(id, function (err, accessObject) {
        if (err)
            return res.status(400).send(err.errorMessage);
        
        var restId = accessObject.restaurantId;
        var tableNo = accessObject.tableNo;
        
        if (!restaurantNotifications[restId])
            restaurantNotifications[restId] = {};
        
        if (restaurantNotifications[restId][tableNo]) {
            var timeElapsed = now - restaurantNotifications[restId][tableNo];
            
            if (timeElapsed < 60 * 1000) {
                var response = {
                    timeElapsed: Math.round(timeElapsed / 1000),
                    errorMessage: 'Ospătarul a fost deja anunțat.'
                };

                return res.status(400).send(response);
            }

            restaurantNotifications[restId][tableNo] = now;
        }
        else {
            restaurantNotifications[restId][tableNo] = now;
        }

        var result = sendNotificationToRestaurantMehod(restId, tableNo);
        if (result.errorMessage)
            return res.status(400).send(result);

        res.send('Ok');
    });
});

router.post('/checkAccessCode', function (req, res) {
    var id = req.body.id;

    if (!id)
        return res.status(400).send({ errorMessage: 'Codul folosit nu este valid.' });

    checkAccessCode(id, function (err) {
        if (err)
            return res.status(400).send(err.errorMessage);

        res.send('Ok');
    });
});

router.get('/notifica', function (req, res) {
    //res.render("client_index.html");
    renderClientSocial(req, res);
});

router.get('/notifica_social', function (req, res) {
    renderClientAccessCodes(req, res);
});

var renderClientSocial = function (req, res) {
    var fullUrl = req.protocol + '://' + "nutesupara.ro/" + req.originalUrl;
    var redirectUrl = encodeURIComponent(fullUrl);
    
    restaurantRepo.findById(req.query.r, function (err, restaurant) {
        if (!err)
            res.render("client_index_social.html", {
                facebookId: restaurant.facebookId, 
                redirectUrl : redirectUrl, 
                name: restaurant.name
            });
    });
}

var renderClientAccessCodes = function (req, res) {
    var fullUrl = req.protocol + '://' + "nutesupara.ro/" + req.originalUrl,
        redirectUrl = encodeURIComponent(fullUrl),
        id = req.query.id;
    
    if (!id)
        return res.status(400).send('Cerere incorecta');
    
    accessCodeRepo.findOneSpecifiedFields({ 'code': id.toLowerCase() }, 'restaurantId', function (err, accessObject) {
        if (err || accessObject === null) {
            //TODO: cand codul nu e valid
        }
        else {
            restaurantRepo.findByIdSpecifiedFields(accessObject.restaurantId, 'facebookId name', function (err, restaurant) {
                if (!err && restaurant)
                    res.render("client_index.html", {
                        facebookId: restaurant.facebookId, 
                        redirectUrl : redirectUrl, 
                        name: restaurant.name
                    });
            });
        }
    });
}

var checkAccessCode = function (id, callback) {
    if (id === null)
        return callback({ 'errorMessage': ERROR_CODE_INVALID });

    if (id.length !== 5 || id.trim().length !== 5)
        return callback({ 'errorMessage': ERROR_CODE_INVALID });
    
    accessCodeRepo.findOneSpecifiedFields({ 'code': id.toLowerCase() }, 'restaurantId tableNo', function (err, accessObject) {
        if (!err && accessObject) {
            return callback(null, {
                'restaurantId': accessObject.restaurantId,
                'tableNo': accessObject.tableNo
            });
        }
        else
            return callback({ 'errorMessage': ERROR_CODE_INVALID });
    });
}

module.exports = router;