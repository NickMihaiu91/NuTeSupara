'use strict';

(function () {
    angular.module('socketIoServiceModule', [])
.factory('socketIoService', function () {
        //var socket = io('http://localhost:9876');
        var socket = io('http://nutesupara.ro');
        
        socket.on('notification', function (data) {
            if (typeof service.onReceivedNotification === 'function') {
                service.onReceivedNotification(data);
            }
        });

        socket.on('ackNotification', function (data) {
            if (typeof service.onReceivedAckNotification === 'function') {
                service.onReceivedAckNotification(data);
            }
        });

        var service = {
            onReceivedNotification: undefined,
            onReceivedAckNotification: undefined,
            sendTableAck: function (tableId) {
                socket.emit('notifyTableAck', {
                    tableId: tableId
                });
            }
        };

        return service;
    });
})();