const schedule = require("node-schedule");
const wasabi = require("./Modules/wasabi/controller");
const logger = require("./Config/loggerConfig");
const taskIndexRef = require("./Modules/taskIndex/controller");
const saasAdminRef = require("./Modules/SaasAdmin/controller");
const aiRef = require("./Modules/AI/controller")

// This cron job executes daily at midnight (12 AM) and retrieves the file size from Wasabi storage
schedule.scheduleJob('0 0 * * *', async () => {
    logger.info(`Enter in schedule job`);
    wasabi.getBucketSize();
})

// This cron job executes daily at midnight (1 AM) and add a company data in company object.
schedule.scheduleJob('0 1 * * *', async () => {
    saasAdminRef.addCompanyData();
})

// This cron job executes every 1 hour and Make Index for unIndex Task.
schedule.scheduleJob('0 * * * *', async () => {
    taskIndexRef.createUnIndexTask();
})

// This cron job executes daily at midnight (12 AM) and remove ai request count.
schedule.scheduleJob('0 0 * * *', async () => {
    aiRef.resetAiRequestCount();
})