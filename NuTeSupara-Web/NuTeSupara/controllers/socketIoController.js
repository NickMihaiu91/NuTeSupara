var restaurantSockets = {};

module.exports = function (io) {
    io.on('connection', function (socket) {
        console.log('Socket connection');
        console.log(socket.request.user._id);
        
        var socketIoCtrl = socketIoControllerBuilder(socket, io);
        
        if (socket.request.user._id) {
            var restaurantId = socket.request.user._id.toString();
            if (restaurantSockets[restaurantId])
                restaurantSockets[restaurantId].push(socket);
            else
                restaurantSockets[restaurantId] = [socket];
        }
        
        socket.on('disconnect', socketIoCtrl.removeSocketFromListOnDisconnect);
        socket.on('notifyTableAck', socketIoCtrl.sendAcknowledgementNotifications);
    });
};

module.exports.sendNotificationToRestaurant = function (restaurantId, tableId) {
    if (!restaurantId || !tableId) {
        console.log('Invalid parameters for sendNotificationToRestaurant.');
        return { errorMessage: 'Link-ul folosit nu este valid.' };
    }
    
    if (!restaurantSockets[restaurantId] || restaurantSockets[restaurantId].length <= 0) {
        console.log('No socket open for specific restaurant ', restaurantId);
        return { errorMessage: 'A apărut o problemă în a notifica ospătarul.' };
    }
    
    for (var i = 0; i < restaurantSockets[restaurantId].length; i++)
        restaurantSockets[restaurantId][i].emit('notification', { id: tableId });
    
    return {};
};

var socketIoControllerBuilder = function (socket, io) {
    return {
        removeSocketFromListOnDisconnect: function () {
            if (socket.request.user._id) {
                var restaurantId = socket.request.user._id.toString();
                if (restaurantSockets[restaurantId])
                    removeSocketFromList(restaurantId, socket.id);
            }
        },
        sendAcknowledgementNotifications: function (data) {
            var restaurantId = socket.request.user._id;
            var tableId = data.tableId;
            
            if (!restaurantId || !tableId) {
                console.log('Invalid parameters for sendAcknowledgementNotifications.');
                return { errorMessage: 'Numarul mesei nu este valid.' };
            }
            
            if (!restaurantSockets[restaurantId]) {
                console.log('No socket open for specific restaurant ', restaurantId);
                return { errorMessage: 'Nu este nici un dispozitiv care sa fie notificat.' };
            }
            
            for (var i = 0; i < restaurantSockets[restaurantId].length; i++) {
                if (restaurantSockets[restaurantId][i].id != socket.id)
                    restaurantSockets[restaurantId][i].emit('ackNotification', { tableId: tableId });
            }
            
            return {};
        }
    };
};

function removeSocketFromList(restaurantId, socketId) {
    for (var i = restaurantSockets[restaurantId].length - 1; i > -1; i--)
        if (restaurantSockets[restaurantId][i].id === socketId)
            break;
    
    if (i > -1)
        restaurantSockets[restaurantId].splice(i, 1);
};