const ctrl = require('./controller');

exports.init = (app) => {
    app.post('/api/v1/updateEmailTemplate', ctrl.updateEmailTemplate);
}