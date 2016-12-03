'use strict';

(function () {
    angular.module('restaurantServiceModule', [])
    .factory('restaurantService', function ($http) {
        
        var saveRestaurantProfileChanges = function (oldPassword, newPassword, numberOfTables, callback) {
            var url = '/saveRestaurantProfileChanges';

            $http.post(url, { oldPassword: oldPassword, newPassword: newPassword, numberOfTables: numberOfTables })
                    .success(function (data, status) {
                callback(data, status);
            })
                    .error(function (data, status) {
                callback(data, status);
            });
        };
        
        return {
            saveRestaurantProfileChanges: saveRestaurantProfileChanges
        };

    });
})();