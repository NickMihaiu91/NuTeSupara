# NuTeSupara
NuTeSupara - Modern waiter notification system for restaurants. </br>
Part of the 2015 <a href="http://www.innovationlabs.ro/teams/Nu%20te%20supara/" target="_blank">Innovation Labs</a> pre-accelerator program.
This is the MVP implementation of our solution.

## How it works
![How it works](screenshots/how-it-works.jpg?raw=true "How it works")
</br></br>
1. On each restaurant table there is a flyer containing information on how to use the notification system to call the waiter with your own mobile phone.

![Flyer](screenshots/NuteSupara-table-flyer.jpg?raw=true "Flyer")
</br>
2. There are three ways for the client to call the waiter:
 - Typing the unique table code on the site
 - Scanning the QR code on the table
 - Sending a SMS message with the unique table code

![Home](screenshots/home.JPG?raw=true "Home")
</br>
3. If choosing one of the first two ways, the client will go to a web page with a button to notify the waiter

![After scan](screenshots/afterScanningQR.png?raw=true "After scan")
</br>
4. After tapping the button the notification goes to the waiter on his device
</br>
5. Waiter sees the notification(visual + sound + vibration) and goes to the table

## Project structure

 - NuTeSupara-Web </br>
The web solution with server, database and socket.io implementation
 - NuTeSupara-Restaurant-Mobile</br>
The hybrid mobile app solution for restaurants 
 - NuTeSupara-SmsNotification</br>
App solution to redirect SMS received to our server

## Buit with
 - MEAN stack
  - Mongo DB
  - Express.js
  - Angular.js
  - Node.js
 - Socket.io
 - Cordova
 - Ionic Framework
 - Bootstrap theme from <a href="http://www.scoopthemes.com/" target="_blank">ScoopThemes</a>
