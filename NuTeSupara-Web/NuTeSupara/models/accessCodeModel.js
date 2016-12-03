var mongoose = require('mongoose');

var accessCodeSchema = mongoose.Schema({
    code : { type: String, unique: true },
    restaurantId : String,
    tableNo: Number,
});

module.exports = mongoose.model('AccessCode', accessCodeSchema);