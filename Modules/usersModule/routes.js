const ctrl = require('./controller');

exports.init = (app) => {
    app.post('/api/v1/userStatusUpdate', ctrl.updateUserStatus);
    app.post('/api/v1/userAndCompanyCheck', ctrl.checkUserAndCompany);
};