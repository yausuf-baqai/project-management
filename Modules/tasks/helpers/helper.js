const moment = require('moment');
const logger = require("../../../Config/loggerConfig");
const { DateTime } = require('luxon');
const { SCHEMA_TYPE } = require('../../../Config/schemaType');
const { MongoDbCrudOpration } = require("../../../utils/mongo-handler/mongoQueries");


/* ------------- HANDLE HISTIRY FOR ALL THE ACTIVITIES ------------- */
exports.HandleHistory = (type, companyId, projectId, taskId, object, userData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const obj = {
                'Type': type,
                'Key': object.key,
                'UserId': userData.id,
                'ProjectId': projectId,
                'TaskId': taskId !== null ? taskId : "",
                'Message': object.message
            }
            if (type == "Logtask") {
                obj.Type = "task";
            }
            const utcDateTime = DateTime.utc();
            const data = {
                'Type': type,
                'Key': object.key,
                'UserId': userData.id,
                'ProjectId': projectId,
                'TaskId': taskId !== null ? taskId : "",
                'Message': object.message,
                createdAt:utcDateTime.ts,
                updatedAt:utcDateTime.ts,
            }
            let typeSchema = SCHEMA_TYPE.HISTORY
          
            let objSchema = {
                type: typeSchema,
                data: data
            }
            MongoDbCrudOpration(companyId, objSchema, "save")
                .then((response) => {
                    resolve({ status: true });
                }).catch(error => {
                    logger.error(`History========>Error ${error.message}`);
                    reject({ status: false, error: error });
                })
        } catch (error) {
            reject({ status: false, error: error });
        }
    });
}

/* ------------- HANDLE HISTIRY FOR ALL THE ACTIVITIES ------------- */
exports.changeDateFormat = (date, format) => {
    if (date.seconds) {
        return moment(new Date(date.seconds * 1000)).format(format);
    } else {
        return moment(new Date(date)).format(format);
    }
}