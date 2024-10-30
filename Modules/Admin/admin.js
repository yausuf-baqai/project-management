const commonctrl = require('./common/controller');

exports.init = (app) => {
  // 
  app.get("/api/v1/getlogo", commonctrl.getlogo);
  app.get('/api/v1/getBrandSettingsData',commonctrl.getBrandSettingsData)
};