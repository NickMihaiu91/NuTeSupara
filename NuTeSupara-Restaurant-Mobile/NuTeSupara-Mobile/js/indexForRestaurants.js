'use strict';

(function () {
    angular.module('ionicApp', ['ionic', 'relativeDate', 'restaurantServiceModule', 'socketIoServiceModule']);

    angular.module('ionicApp').run(function ($rootScope, restaurantService) {
        restaurantService.checkIfUserIsAuthenticated(function (isAuthenticated, data) {
            if (!isAuthenticated)
                return window.location.replace('login.html');

            $rootScope.restaurantName = data;
        });
    });

    angular.module('ionicApp').controller('MyCtrl', function ($scope, $rootScope, $interval, relativeDate, socketIoService) {

        $rootScope.safeApply = function (fn) {
            var phase = this.$root.$$phase;
            if (phase == '$apply' || phase == '$digest') {
                if (fn && (typeof (fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };

        var md = new MobileDetect(window.navigator.userAgent);
        
        $scope.currentView = 'home';
        $scope.viewDisplayName = 'Notificări';
        $rootScope.restaurantName = 'Restaurant';

        $scope.moveItem = function (item, fromIndex, toIndex) {
            $scope.items.splice(fromIndex, 1);
            $scope.items.splice(toIndex, 0, item);
        };

        $scope.onItemDelete = function (item) {
            $scope.items.splice($scope.items.indexOf(item), 1);
            setItemsToLocalStorage($scope.items);

            socketIoService.sendTableAck(item.id);
            ga('send', 'event', 'Restaurant', 'DismissNotification', item.id);
        };
        
        $scope.switchView = function (viewName) {
            $scope.currentView = viewName;
            
            if (viewName === 'home')
                $scope.viewDisplayName = 'Notificări';
            else
                $scope.viewDisplayName = 'Setări';

            $rootScope.safeApply();
            ga('send', 'event', 'Restaurant', 'Page', 'Changed');
        };

        $scope.items = getItemsFromLocalStorage();
		
		$interval(function () {
                checkAndNotifyWaiterOfMissedNotifications();
            }, 1 /*min*/ * 60 /*sec*/ * 1000/*ms*/);
		
        for (var i = $scope.items.length - 1; i >= 0; i--) {
            setRelativeDate($scope.items[i], relativeDate);
        }
        
        var addNewItem = function (item) {
            for (var i = 0; i < $scope.items.length; i++)
                if ($scope.items[i].id === item.id)
                    return;
            
            item.timeWhenReceived = new Date();
            setRelativeDate(item, relativeDate);
            $scope.items.push(item);
            $rootScope.safeApply();
            
            playSound('dingalert');
            if (md.phone())
                navigator.notification.vibrate(1000);
            setItemsToLocalStorage($scope.items);

            if (window.isAppInBackground)
                window.plugin.notification.local.add({
                    id: item.id,
                    title: 'Masa ' + item.id,
                    sound: null,
                    led: 'A0FF05',
                    autoCancel: true
                });

            //window.plugin.notification.local.oncancel = function (id, state, json) {
            //    alert('cancel ' + id);
            //    var item = {};
            //    item.id = id;
            //    $scope.items.splice($scope.items.indexOf(item), 1);
            //    setItemsToLocalStorage($scope.items);
            //};
        };
		
		var checkAndNotifyWaiterOfMissedNotifications = function () {
                var thisMoment = new Date();
                
                for (var i = 0; i < $scope.items.length; i++)
                    if (thisMoment - new Date($scope.items[i].timeWhenReceived) > 2 /*min*/ * 60 /*sec*/ * 1000/*ms*/) {
                        playSound('dingalert');
						
						if (md.phone())
							navigator.notification.vibrate(1000);
							
						return;
                    }
            };

        socketIoService.onReceivedNotification = function (data) { 
            if (!data.id)
                return;

            addNewItem(data);
        };

        socketIoService.onReceivedAckNotification = function (data) {
            if (!data.tableId)
                return;

            for (var i = $scope.items.length - 1; i >= 0; i--) {
                if ($scope.items[i].id == data.tableId) {
                    $scope.items.splice(i, 1);
                    setItemsToLocalStorage($scope.items);
                    break;
                }
            }

            $rootScope.safeApply();
        }
    });
    
    angular.module('ionicApp').controller('SettingsCtrl', function ($scope, $rootScope, restaurantService) {
        $scope.passwordError = '';
        $scope.numberOfTablesError = '';
        $scope.serverSaveChangesError = '';
        $scope.displaySuccessMessage = false;

        $scope.saveChanges = function () {
            var dataIsValid = true;
            $scope.displaySuccessMessage = false;
            resetErrors();
            
            if (!$scope.newPassword && !$scope.numberOfTables)
                return;

            dataIsValid = validatePassword($scope.oldPassword, $scope.newPassword);

            if ($scope.numberOfTables)
                dataIsValid &= validateNumberOfTables($scope.numberOfTables, $scope.numberOfTablesError);

            // send data if valid
            if(dataIsValid)
                restaurantService.saveRestaurantProfileChanges($scope.oldPassword, $scope.newPassword, $scope.numberOfTables, function (data, status) {
                    if (status === 200) {
                        $scope.displaySuccessMessage = true;
                        resetFormData();
                    }
                    else {
                        $scope.serverSaveChangesError = data.errorMessage;
                    }
                });
        };

        function validatePassword(oldPassword, newPassword) {
            var MINIMUM_PASSWORD_LENGTH = 6;

            if (!oldPassword) {
                $scope.passwordError = 'Introduceți parola actuală.';
                return false;
            }
            
            if (newPassword && (newPassword.trim().length < MINIMUM_PASSWORD_LENGTH)) {
                $scope.passwordError = 'Noua parolă trebuie să aibe cel putin 6 caractere.';
                return false;
            }

            return true;
        }

        function validateNumberOfTables(numberOfTables, numberOfTablesError) {
            var MIN_NUMBER_OF_TABLES = 1,
                MAX_NUMBER_OF_TABLES = 1000;

            if (!numberOfTables)
                return true;

            if (isNaN(numberOfTables)) {
                $scope.numberOfTablesError = 'Introduceți un număr valid pentru numărul de mese.';
                return false;
            }
            
            if (MIN_NUMBER_OF_TABLES > numberOfTables || MAX_NUMBER_OF_TABLES < numberOfTables) {
                $scope.numberOfTablesError = 'Introduceți un număr între 1 si 1000.';
                return false;
            }

            return true;
        }

        function resetFormData() {
            $scope.oldPassword = '';
            $scope.newPassword = '';
            $scope.numberOfTables = '';
            resetErrors();
        }

        function resetErrors() { 
            $scope.numberOfTablesError = '';
            $scope.passwordError = '';
            $scope.serverSaveChangesError = '';
        }
    });

    function setItemsToLocalStorage(items) {
        window.localStorage.setItem("savedItems", JSON.stringify(items));
    }

    function getItemsFromLocalStorage() {
        var data = window.localStorage.getItem("savedItems");

        if (!data)
            return [];

        return JSON.parse(data);
    }

    function setRelativeDate(item, relativeDate) {
        relativeDate.set(item.timeWhenReceived, function (relativeTime) {
            item.relativeTime = relativeTime;
        });
    }

    function playSound(filename) {
        var url = getMediaURL("sounds/" + filename + ".ogg");
        var media = new Media(url, null, mediaError);
        media.play();
    }

    function getMediaURL(s) {
        if (device.platform.toLowerCase() === "android") return "/android_asset/www/" + s;
        return s;
    }

    function mediaError(e) {
        alert('Media Error');
        alert(JSON.stringify(e));
    }



})();
