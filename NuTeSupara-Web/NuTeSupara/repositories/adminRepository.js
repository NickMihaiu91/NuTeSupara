var Admin = require("../models/adminModel"),
    ADMIN_EMAIL = "rocktheit91@gmail.com",
    ADMIN_PASS = "clestederufe";

exports.createAdmin = function () {
    Admin.findOne({ email: ADMIN_EMAIL }, function (err, admin) {
        if (err || admin) {
            return;
        }
        
        var admin = new Admin();
        admin.email = ADMIN_EMAIL;
        admin.password = admin.generateHash(ADMIN_PASS);
        admin.save();
    });
}