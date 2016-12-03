'use strict';

(function () {
    angular.module('restaurantServiceModule', [])
    .factory('restaurantService', function ($http) {
        
        var saveRestaurantProfileChanges = function (oldPassword, newPassword, numberOfTables, callback) {
            //var url = 'http://localhost:9876/saveRestaurantProfileChanges';
            var url = 'http://nutesupara.ro/saveRestaurantProfileChanges';

            $http.post(url, { oldPassword: oldPassword, newPassword: newPassword, numberOfTables: numberOfTables })
                    .success(function (data, status) {
                callback(data, status);
            })
                    .error(function (data, status) {
                callback(data, status);
            });
        };

        var checkIfUserIsAuthenticated = function (callback) {
            //var url = 'http://localhost:9876/isUserAuthenticated';
            var url = 'http://nutesupara.ro/isUserAuthenticated';

            $http.get(url).success(function (data) {
                callback(true, data);
            })
            .error(function (data) {
                callback(false, data);
            });
        };
        
        return {
            saveRestaurantProfileChanges: saveRestaurantProfileChanges,
            checkIfUserIsAuthenticated: checkIfUserIsAuthenticated
        };

    });
})();