var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var config = require('./config/config.json'); // configuration json file
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
require("./config/passport")(passport);

var routes = require('./routes/index')(passport);
var clients = require('./routes/clients');
var restaurants = require('./routes/restaurant')(passport);

require("./repositories/adminRepository").createAdmin();
require("./repositories/restaurantRepository").generateAccessCodesForRestaurantsThatDontHaveThem();

var app = express();
var server = require('http').Server(app);
// socket.io
var io = require('socket.io')(server);
var passportSocketIo = require("passport.socketio");
var socketIoConfig = require('./config/socketIo');

var db = require('./config/dbconnect').connectToDatabase();

// all environments
app.set('port', process.env.PORT || config.port);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine("html", require("ejs").renderFile);

// serve static files
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// set up mongo session store
var mongoStore = new MongoStore({
    db : config.databaseName
}, function (e) {
    
    app.use(session({
            secret: config.session.secret,
            saveUninitialized: true,
            resave: true,
            store: mongoStore,
            cookie: { maxAge: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000) } /* 5 years */
        }));
    
    app.use(passport.initialize());
    app.use(passport.session());
    
    // initialize Socket.IO
    var passportSocketIoParams = {
        passportSocketIo: passportSocketIo,
        passport: passport,
        cookieParser: cookieParser,
        sessionSecret: config.session.secret,
        store: mongoStore
    };
    socketIoConfig.initialize(io, passportSocketIoParams);
    
    require('./controllers/socketIoController')(io);
    
    // map routes
    app.use('/', routes);
    app.use('/', restaurants);
    app.use('/', clients);
    
    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });
    
    server.listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
    });
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
