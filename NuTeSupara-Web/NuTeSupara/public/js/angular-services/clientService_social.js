'use strict';

(function () {
    angular.module('clientServiceModule', [])
        .factory('clientService', function ($http) {
            
            var restaurantId, tableId;
            
            var getQuerryParameters = function () {
                if (!restaurantId)
                    restaurantId = getQueryStringParams('r');
                
                if (!tableId)
                    tableId = getQueryStringParams('t');
                
                return {
                    restaurantId: restaurantId, 
                    tableId: tableId
                };
            };
            
            var postNotification = function (callback) {
                var parameters = getQuerryParameters(),
                    url = 'notifyWaiter';
                
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