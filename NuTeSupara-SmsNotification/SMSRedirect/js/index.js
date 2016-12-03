// SMS cordova plugin - https://github.com/floatinghotpot/cordova-plugin-sms


var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        navigator.splashscreen.hide();
        startWatchingForSMS();
        bindOnSMSReceivedEvent();
    }
};

function startWatchingForSMS() {
    if (SMS) SMS.startWatch(function () {
        $('console').append('<p>Started watching</p>');
    }, function () {
        $('console').append('<p>FAILED to start watching</p>');
    });
}

function bindOnSMSReceivedEvent() {
    document.addEventListener('onSMSArrive', function (e) {
        var sms = e.data;
        addSMSReceivedMessage(sms);
        sendTableNotification(sms.body, sms.address);
    });
}

function addSMSReceivedMessage(sms) {
    $('.console').append('<p>' + 'Number: ' + sms.address + ' Content: ' + sms.body + ' Date: ' + new Date(sms.date) + '</p>');
}

function sendTableNotification(code, senderTelephoneNumber) {
    var url = "http://nutesupara.ro/notifyWaiterAccessCode",
        tableUrl = "www.nutesupara.ro/notifica_social?id=",
        successMessage = 'Bravo! Chelnerul a fost anuntat si va veni in curand.';

    $.post(url, { id: code }, function (data) {
        var msg = successMessage + ' Intra pe ' + tableUrl + code + ' pentru a notifica chelnerul direct de pe site.'
        sendSMSBack(senderTelephoneNumber, msg);

        ga('send', 'event', 'SMS', 'Success', senderTelephoneNumber + ' ' + code);
    })
        .fail(function (data) {
            sendSMSBack(senderTelephoneNumber, data.responseText);

            ga('send', 'event', 'SMS', 'Error', senderTelephoneNumber + ' ' + code + ' ' + data.responseText);
        });
}

function sendSMSBack(receiver, text) {
    if (SMS)
        SMS.sendSMS(receiver, text, function () { console.log('Sent with success', new Date()); }, function () { console.log('Fail to send message', new Date()); });
}
