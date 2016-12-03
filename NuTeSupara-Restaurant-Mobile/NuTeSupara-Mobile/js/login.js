'use strict';

(function () {
    angular.module('loginApp', ['loginServiceModule'])
    .controller('PageCtrl', function ($scope, loginService) {

        $scope.login = function () {
            var params = {
                email: $scope.email,
                password: $scope.password
            };

            loginService.authenticate(params, function (error, data) {
                if (error)
                    $scope.errorMessage = data;
                else
                    window.location.replace('index.html');
            });
        };
    });

})();