var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var restaurantSchema = mongoose.Schema({
    email : String,
    password : String,
    name : String,
    noOfTables : Number,
    timeOfRegistration : Date,
    facebookId: String
});

// generating a hash
restaurantSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
restaurantSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Restaurant', restaurantSchema);
