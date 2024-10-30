const ctrl = require('./controller');

exports.init = (app) => {

    app.post('/api/v1/removeUserNotification',  ctrl.removeUserNotification);

    app.get('/api/v1/verifyLicense', ctrl.verifyLicense);


    app.get("/api/v1/checkAvaibility", ctrl.checkAvaibility);
};