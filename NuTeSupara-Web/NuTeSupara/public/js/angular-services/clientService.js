'use strict';

(function () {
    angular.module('clientServiceModule', [])
        .factory('clientService', function ($http) {
            
            var id;
            
            var getQuerryParameters = function () {
                if (!id)
                    id = getQueryStringParams('id');
                
                return {
                    id: id
                };
            };
            
            var postNotification = function (callback) {
                var parameters = getQuerryParameters(),
                    url = 'notifyWaiterAccessCode';
                
                $http.post(url, parameters)
            .success(function () {
                        console.log('Success');
                        callback(false);
                    })
            .error(function (data, status) {
                        console.log('Error');
                        console.log(data.errorMessage);
                        console.log(data.timeElapsed);
                        callback(true, data);
                    });
            };
            
            return {
                getQuerryParameters : getQuerryParameters,
                postNotification: postNotification
            };
        });
    
    function getQueryStringParams(sParam) {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] === sParam) {
                return sParameterName[1];
            }
        }
    }
})();