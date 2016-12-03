var AccessCode = require("../models/accessCodeModel");

exports.findOneSpecifiedFields = function (object, fields, callback) {
    AccessCode.findOne(object, fields, callback);
}