var Restaurant = require("../models/restaurantModel"),
    AccessCode = require("../models/accessCodeModel"),
    MINIMUM_PASSWORD_LENGTH = 6,
    MIN_NUMBER_OF_TABLES = 1,
    MAX_NUMBER_OF_TABLES = 1000,
    ACCESS_CODE_LENGTH = 5,
    ERROR_INVALID_PASSWORD = 'Parolă incorectă, vă rugăm reintroduceți parola.',
    ERROR_MISSING_PASSWORD = 'Pentru a putea face modificări introduceți parola actuală.',
    ERROR_NEW_PASSWORD_LENGTH = 'Noua parolă trebuie să aibe cel putin 6 caractere.',
    ERROR_INVALID_NUMBER_OF_TABLES = 'Introduceți un număr valid pentru numărul de mese.',
    ERROR_RANGE_NUMBER_OF_TABLES = 'Introduceți un număr între 1 si 1000.',
    ERROR_IN_CHANGING_PROFILE_INFO = 'A apărut o problemă în salvarea datelor.',
    ERROR_NO_OF_TABLES_MUST_BE_A_NUMBER = 'Numărul de mese din restaurant trebuie să fie un număr';

exports.findById = function (id, callback) {
    Restaurant.findById(id, callback);
};

exports.findByIdSpecifiedFields = function (id, fields, callback) {
    Restaurant.findById(id, fields, callback);
};

exports.find = function (object, fields, callback) {
    Restaurant.find(object)
        .select(fields)
        .exec(callback);
}

exports.createRestaurant = function (data, callback) {
    var newRestaurant = new Restaurant();
    newRestaurant.name = data.name;
    newRestaurant.email = data.email;
    newRestaurant.password = newRestaurant.generateHash(data.password);
    newRestaurant.noOfTables = data.numberOfTables;
    newRestaurant.timeOfRegistration = new Date();
    newRestaurant.facebookId = data.facebookId;
    
    newRestaurant.save(function (err, restaurant) {
        if (err) {
            return callback(err);
        }
        
        generateAccessCodesForRestaurant(restaurant, undefined, function (err) {
            callback(err);
        });
    });
};

exports.saveRestaurantProfileChanges = function (params, user, callback) {
    var validation = validateRestaurantProfileChanges(user, params);
    
    if (!validation.valid)
        return callback({ 'errorMessage': validation.error }, 400);
    
    if (params.newPassword)
        user.password = user.generateHash(params.newPassword);
    
    if (params.numberOfTables)
        user.noOfTables = params.numberOfTables;
    
    user.save(function (err) {
        if (err)
            return callback({ 'errorMessage': ERROR_IN_CHANGING_PROFILE_INFO }, 400);
        
        callback('Ok');
    });
};

exports.generateAccessCodesForRestaurantsThatDontHaveThem = function () {
    this.find({}, '_id noOfTables', function (err, restaurants) {
        for (var i = restaurants.length - 1; i >= 0; i--) {
            checkAccessCodeExistanceAndIfFalseCreateThem(restaurants[i]);
        }
    });
}

exports.changeTheNumberOfTables = function (restaurantId, newNoOfTables, callback) {
    if (isNaN(newNoOfTables))
        return callback(ERROR_NO_OF_TABLES_MUST_BE_A_NUMBER);
    
    var newNumber = parseInt(newNoOfTables);
    
    this.findByIdSpecifiedFields(restaurantId, 'noOfTables', function (err, restaurant) {
        if (err || !restaurant)
            return callback(err);
        
        restaurant.noOfTables = newNumber;
        
        restaurant.save(function (err) {
            if (err)
                callback(err);
            
            AccessCode.findOne({ restaurantId: restaurantId })
              .sort('-tableNo')// give me the max
              .exec(function (err, member) {
                    if (err)
                        return callback(err);
                    
                    //EQUAL
                    if (member.tableNo === newNumber)
                        return callback();
                    
                    //SMALLER
                    if (member.tableNo > newNumber) {
                        return AccessCode.find({
                            "restaurantId" : restaurantId, 
                            "tableNo" : { "$gt" : newNumber }
                        }).remove(function (err) {
                                return callback(err);
                            });
                    }
                    
                    //GREATER
                    if (member.tableNo < newNumber) {
                        return generateAccessCodesForRestaurant({
                            _id: restaurantId, 
                            noOfTables: newNumber
                        }, member.tableNo + 1, callback)
                    }
                });
        });
    });
};

/* Private Methods */

function validateRestaurantProfileChanges(user, data) {
    
    if (!data.oldPassword)
        return { valid : false, error: ERROR_MISSING_PASSWORD };
    
    if (!user.validPassword(data.oldPassword))
        return { valid : false, error: ERROR_INVALID_PASSWORD };
    
    if (data.newPassword && (data.newPassword.trim().length < MINIMUM_PASSWORD_LENGTH))
        return { valid : false, error: ERROR_INVALID_PASSWORD };
    
    if (data.numberOfTables) {
        if (isNaN(data.numberOfTables))
            return { valid : false, error: ERROR_INVALID_NUMBER_OF_TABLES };
        
        if (MIN_NUMBER_OF_TABLES > data.numberOfTables || MAX_NUMBER_OF_TABLES < data.numberOfTables)
            return { valid : false, error: ERROR_RANGE_NUMBER_OF_TABLES };
    }
    
    return { valid: true };
};

function generateAccessCodesForRestaurant(restaurant, startFrom, callback) {
    var startIndex = startFrom ? startFrom : 1;
    
    for (var i = startIndex; i <= restaurant.noOfTables; i++) {
        var code = generateRandomCode();
        
        var accessCode = new AccessCode({
            code : code,
            restaurantId : restaurant._id,
            tableNo: i,
        });
        
        saveAccessCode(accessCode, function (err) {
            if (err) {
                callback(err);
            }
        });
    }
}

function saveAccessCode(accessCode, callback) {
    accessCode.save(function (err) {
        /*Duplicate key*/
        if (err) {
            if (err.code == "11000" || err.code == "11001") {
                accessCode.code = generateRandomCode();
                return saveAccessCode(accessCode, callback);
            }
            
            return callback(err);
        }
        
        callback();
    });
}

function generateRandomCode() {
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
    
    for (var i = 0; i < ACCESS_CODE_LENGTH; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    
    if (checkTextForBadWords(text))
        return generateRandomCode();
    
    return text;
}

function checkTextForBadWords(text) {
    var badWords = ["pul", "mui", "sex", "cacat", "kkt", "pisat", "poola", "c4c4t", "pwl", "mu1e", "popo", "p0p0", "s3x", "slobo", "pi5at", "pizda", "pi5da", "pisda", "vagin", "porn", "p0rn", "falus", "cur", "gaoz", "ga0z", "g4oz", "coi", "coaie", "c0aie", "sfarc", "tigan"];
    
    for (var i = badWords.length; i >= 0; i--) {
        if (text.indexOf(badWords[i]) !== -1)
            return true;
    }
    
    return false;
}

function checkAccessCodeExistanceAndIfFalseCreateThem(restaurant) {
    AccessCode.findOne({ restaurantId: restaurant._id }, function (err, accessCode) {
        if (accessCode)
            return;
        
        generateAccessCodesForRestaurant(restaurant, undefined, function (err) {
            if (err) {
                return console.log("***ERROR*** There was an error generating access codes for " + restaurant._id + "!!!");
            }
            
            console.log("Generated access codes for " + restaurant._id);
        });
    });
}