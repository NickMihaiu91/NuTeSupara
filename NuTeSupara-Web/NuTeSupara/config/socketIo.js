exports.initialize = function (io, params) {
    passportSocketIo = params.passportSocketIo;
    
    io.use(
        function (socket, next) {
            passportSocketIo.authorize({
                passport : params.passport,
                cookieParser: params.cookieParser,
                key: 'connect.sid',       // the name of the cookie where express/connect stores its session_id
                secret: params.sessionSecret,    // the session_secret to parse the cookie
                store: params.store,        
                success: onAuthorizeSuccess,  
                fail: onAuthorizeFail,
            })(socket, next);
        }
    );
    
    function onAuthorizeSuccess(data, accept) {
        accept();
    }
    
    function onAuthorizeFail(data, message, error, accept) {
        if (error)
            throw new Error(message);
        //console.log('failed connection to socket.io:', message);
        
        // If you don't want to accept the connection
        if (error)
            accept(new Error(message));
        // this error will be sent to the user as a special error-package
        // see: http://socket.io/docs/client-api/#socket > error-object
        
        accept();
    }
};