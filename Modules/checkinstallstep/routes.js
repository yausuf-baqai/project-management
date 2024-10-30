const ctrl = require('./controller');
const mongoCtl = require("./mongoinstallation/controller.js")
const { handleEvents } = require('./eventController');

exports.init = (app) => {
    //
    app.post('/api/v1/checkinstallstep', ctrl.checkinstallstep);
    app.post('/api/v1/checkinstallmongostep', mongoCtl.checkinstallmongostep);
    app.get('/api/v1/checkinstallstep/events/:id', (req, res) => {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        handleEvents(req, res)
    });
    
    app.get('/api/v1/installstep/get', ctrl.installstepget);
    app.get('/api/v1/getAiModels', ctrl.getAiModels);
    if (process.env.CANYONLICENSEKEY) {
        const createCompanyctrl = require('./createCompany');
        app.post('/api/v1/installstep/createUserAndCompany', createCompanyctrl.createUserAndCompany);
    }

    app.get('/api/v1/mongocluster/get', mongoCtl.mongoclusterget);
    app.get('/api/v1/mongoclusterregions/get', mongoCtl.mongoclusterregionsget);
    app.get('/api/v1/mongonetwork/getandadd', mongoCtl.mongonetworkgetandadd);
};