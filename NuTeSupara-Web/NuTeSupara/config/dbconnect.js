var config = require("./config.json");
var mongoose = require('mongoose');

// Returns an object with the established connection
exports.connectToDatabase = function () {
    var db;
    //, socketTimeoutMS: config.mongooseTimeout 
    var options = {
        server: { socketOptions: { keepAlive: 1, connectTimeoutMS: config.mongooseTimeout } }, 
        replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : config.mongooseTimeout } }
    };
    
    mongoose.connect(config.dbConnectionUrl + config.databaseName, options);
    
    db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    
    return db;
}