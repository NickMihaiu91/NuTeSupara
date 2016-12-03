'use strict';

(function () {
    angular.module('loginServiceModule', [])
.factory('loginService', function ($http) {

    var authenticate = function (parameters, callback) {
        //var url = 'http://localhost:9876/authenticate';
        var url = 'http://nutesupara.ro/authenticate';

        $http.post(url, parameters)
        .success(function () {
            console.log('Success');
            callback(false);
        })
        .error(function (data, status) {
            console.log('Error');
            callback(true, data);
        });
    };

    var service = {
        authenticate: authenticate
    };

    return service;
});

})();