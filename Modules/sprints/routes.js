const ctrl = require('./controller');

exports.init = (app) => {
    app.post('/api/v1/sprint', ctrl.addSprint);
    app.patch('/api/v1/sprint/:id', (req, res) => {
        if(!req?.body?.type) {
            res.send({status: false, statusText: "type not found"});
            return;
        }
        if(!req?.params?.id) {
            res.send({status: false, statusText: "id is required"});
            return;
        }
        ctrl[req.body.type](req,res);
    });

    app.post('/api/v1/folder', ctrl.addFolder);
    app.patch('/api/v1/folder/:id', (req, res) => {
        if(!req?.body?.type) {
            res.send({status: false, statusText: "type not found"});
            return;
        }
        if(!req?.params?.id) {
            res.send({status: false, statusText: "id is required"});
            return;
        }
        ctrl[req.body.type](req,res);
    });
}