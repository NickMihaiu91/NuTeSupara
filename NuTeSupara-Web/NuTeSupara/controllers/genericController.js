exports.processRequest = function (repositoryMethod) {
    return function (req, res) {
        
        params = Object.keys(req.query).length ? req.query :            /*GET*/ 
                    Object.keys(req.body).length ? req.body :           /*POST*/
                        undefined;                                      /*Default*/
        
        repositoryMethod(params, req.user, function (val, code) {
            var fuct = exports.processResponse(val, code);
            fuct(req, res);
        });
    };
}

exports.processResponse = function (returnValue, code) {
    return function (req, res) {
        if (code)
            res.status(code).send(returnValue);
        else
            res.status(200).send(returnValue);
    }
};