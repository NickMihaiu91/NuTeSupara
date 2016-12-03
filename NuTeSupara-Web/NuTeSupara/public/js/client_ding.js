angular.module('ding', ['angular-svg-round-progress', 'clientServiceModule'])
.controller('dingCtrl', ['$scope', '$timeout', '$http', 'roundProgressService', 'clientService', 
    function ($scope, $timeout, $http, roundProgressService, clientService) {
            
            $scope.current = 0;
            $scope.max = 120;
            $scope.stroke = 15;
            $scope.radius = 100;
            $scope.isSemi = false;
            $scope.rounded = false;
            $scope.currentColor = '#700D3C';
            $scope.bgColor = '#eaeaea';
            $scope.iterations = 50;
            $scope.currentAnimation = 'easeInOutSine';
            
            $scope.message = 'Apasă pe clopoțel pentru a chema ospătarul!';
            $scope.messageType = 'Info';
            
            var timeout;
            setLikeBoxSize();
            
            $scope.notifyWaiter = function () {
                if (isCoolDownActive()) {
                    $scope.messageType = 'Info';
                    ga('send', 'event', 'Client', 'PushButton', 'Inactive');
                    return $scope.message = 'Doar un pic de răbdare, ospătarul a fost deja anunțat.';
                }
                
                clientService.postNotification(function (isError, data) {
                    if (isError) {
                        $scope.current = data.timeElapsed * 2;
                        $scope.start();
                        
                        $scope.messageType = 'Error';
                        $scope.message = 'Oops.. ' + data.errorMessage;
                        ga('send', 'event', 'Client', 'Error', data.errorMessage);
                    }
                    else {
                        $scope.messageType = 'Success';
                        $scope.message = 'Bravo! Ospătarul a fost anunțat și va veni în curând.';
                        
                        $scope.start();
                        $scope.shakeTheBell();
                    }
                });
                
                ga('send', 'event', 'Client', 'PushButton', 'Active');
            };
            
            $scope.shakeTheBell = function () {
                var bell = document.getElementsByClassName('fa-bell')[0];
                bell.className += " shake shake-rotate shake-constant";
                
                
                $timeout(function () {
                    bell.className = bell.className.replace(/(?:^|\s)shake shake-rotate shake-constant(?!\S)/g, '');
                    
                    $scope.goToFeed();
                }, 1000);
            };
            
            $scope.start = function () {
                $scope.stop();
                
                timeout = $timeout(function () {
                    $scope.current += 1;
                    
                    if ($scope.current < $scope.max + 1) {
                        $scope.start();
                    }
                    else {
                        $timeout(function () {
                            $scope.reset();
                        }, 1000);
                    }
                }, 500);
            };
            
            $scope.stop = function () {
                $timeout.cancel(timeout);
            };
            
            $scope.reset = function () {
                $scope.stop();
                $scope.current = 0;
            };
            
            $scope.animations = [];
            
            angular.forEach(roundProgressService.animations, function (value, key) {
                $scope.animations.push(key);
            });
            
            function isCoolDownActive() {
                return $scope.current !== 0;
            }
            
            function setLikeBoxSize() {
                document.getElementById('feed').setAttribute('data-height', window.innerHeight - 53);
                document.getElementById('feed').setAttribute('data-width', window.innerWidth - 10);
            }
            
            $scope.goToButton = function () {
                var bellContainer = document.getElementsByClassName('bell-container')[0];
                var socialFeed = document.getElementsByClassName('social-feed')[0];
                
                socialFeed.className = socialFeed.className.replace(/(?:^|\s)slideInRight(?!\S)/g, ' slideOutRight');
                bellContainer.className = bellContainer.className.replace(/(?:^|\s)slideOutLeft(?!\S)/g, ' slideInLeft');
                bellContainer.className = bellContainer.className.replace(/(?:^|\s)hidden(?!\S)/g, '');
                
                $timeout(function () {
                    socialFeed.className += " hidden";
                }, 175);
            }
            
            $scope.goToFeed = function () {
                var bellContainer = document.getElementsByClassName('bell-container')[0];
                var socialFeed = document.getElementsByClassName('social-feed')[0];
                
                if (bellContainer.className.indexOf("slideInLeft") > -1) {
                    bellContainer.className = bellContainer.className.replace(/(?:^|\s)slideInLeft(?!\S)/g, ' slideOutLeft');
                }
                else {
                    bellContainer.className += " slideOutLeft";
                }
                socialFeed.className = socialFeed.className.replace(/(?:^|\s)hidden(?!\S)/g, '');
                
                if (socialFeed.className.indexOf('slideOutRight') > -1) {
                    socialFeed.className = socialFeed.className.replace(/(?:^|\s)slideOutRight(?!\S)/g, ' slideInRight');
                }
                else {
                    socialFeed.className += " slideInRight";
                }
                
                $timeout(function () {
                    bellContainer.className += " hidden";
                }, 175);
                
                $timeout(function () {
                    document.getElementsByTagName("body")[0].style.lineHeight = "0";
                }, 500);
            }
        }]);

var setTop = function () {
    var likeBox = document.getElementById('like-box');
    var elementHeight = document.getElementsByClassName("progress-wrapper")[0].offsetHeight;
    var callToActionHeight = document.getElementsByClassName("call-to-action")[0].offsetHeight;
    positionTop = callToActionHeight + elementHeight / 2;
    
    if (window.innerHeight <= 450) {
        var outerContainers = document.getElementsByClassName("center-align");
        for (var i = 0; i < outerContainers.length; i++)
            outerContainers[i].style.top = positionTop + "px";
        
        likeBox.style.marginTop = positionTop + 50 + "px";
    }
    else {
        //FORMULA NUCLEARA!!!
        //likeBox-ul are margin-top de 50% din height minus height-ul textului de deasupra (ca likeBox-ul e randat sub el) + inca jumate din bell
        likeBox.style.marginTop = 50 * window.innerHeight / 100 - callToActionHeight + 150 + "px";
    }
};