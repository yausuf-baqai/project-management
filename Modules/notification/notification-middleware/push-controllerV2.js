const { convert } = require('html-to-text');
const config = require('../../../Config/config');
const logger = require("../../../Config/loggerConfig")
const { dbCollections } = require('../../../Config/firebaseCollections');
const { SCHEMA_TYPE } = require("../../../Config/schemaType")
const { MongoDbCrudOpration } = require("../../../utils/mongo-handler/mongoQueries");
const mongoose = require("mongoose")
const { sendFCMNotification } = require("./sendNotification")
const fs = require('fs');
const path = require('path');
var brandSettings = null; 
const filePath = path.join(__dirname, '../../../brandSettings.json');

exports.sendNotificationHandler = (notitificationData) => {
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        brandSettings = fileContent ? JSON.parse(fileContent) : null;
    }
    return new Promise((resolve, reject) => {
        try {
            if (notitificationData.length > 0) {
                Promise.all(notitificationData.map(item => this.sendNotificationBody(item))).then((values) => {
                    resolve(values)
                }).catch(error => {
                    logger.error(`notitificationData Step One Catch error: ${error.message}`);
                    reject(error)
                })

            }
            else {
                resolve([])
            }
        } catch (error) {
            logger.error(`Email Notification Step One Catch error: ${error.message}`);
            reject(error)
        }
    })
};

exports.sendNotificationBody = (body) => {
    return new Promise((resolve, reject) => {
        try {
            const options = {
                selectors: [
                    { selector: 'img', format: 'skip' },
                ]
            };
            const text = convert(body.message, options);
            const topicName = "fcmNotification"
            let actionUrl = "";
            var { folderId = "", sprintId = "", projectId = "", companyId = '', taskId = "" } = body
            if (body.type.toLowerCase() === "project") {
                if (folderId !== undefined && folderId !== null && folderId !== '') {
                    if (sprintId !== undefined && sprintId !== null && sprintId !== '') {
                        actionUrl = `${body.companyId}/project/${projectId}/fs/${folderId}/${sprintId}`
                    } else {
                        actionUrl = `${body.companyId}/project/${projectId}/f/${folderId}`
                    }
                } else if (sprintId !== undefined && sprintId !== null && sprintId !== '') {
                    actionUrl = `${body.companyId}/project/${projectId}/s/${sprintId}`
                } else {
                    actionUrl = `${body.companyId}/project/${projectId}/p?tab=ProjectDetail`
                }
            } else {
                if (folderId !== undefined && folderId !== null && folderId !== '') {
                    actionUrl = `${body.companyId}/project/${projectId}/fs/${folderId}/${sprintId}/${taskId}${body.key === "logged_hours_notification" ? '?tab=ProjectListView&taskTab=TimeLog' : ''}`
                } else {
                    actionUrl = `${body.companyId}/project/${projectId}/s/${sprintId}/${taskId}${body.key === "logged_hours_notification" ? '?tab=ProjectListView&taskTab=TimeLog' : ''}`
                }
            }

            var payload = {}
            if (body.key == "message_create" && type == "chat") {
                var Image = body.User_Employee_profileImage != "" ? body.User_Employee_profileImage : "https://firebasestorage.googleapis.com/v0/b/alian-hub-beta.appspot.com/o/default_images%2Fdefault_user.png?alt=media&token=26ed33f8-562e-4bba-a1d3-28f56cfe51a6"
                payload = {
                    notification: {
                        title: body.User_Employee_Name || `${brandSettings && brandSettings.productName ? brandSettings.productName :'Alian-Hub'}`,
                        body: changeText(text),
                        click_action: `${config.WEBURL}/#/${actionUrl}`,
                        icon: Image
                    },
                    tokens: body.webTokens,
                    sound: 'default',
                }
            } else {
                var notificationTitle = body.type === 'project' ? 'Project Notification' : 'Task Notification'
                payload = {
                    notification: {
                        title: `${brandSettings && brandSettings.productName ? brandSettings.productName :'Alian Hub'} - ${notificationTitle}`,
                        body: changeText(text),
                        click_action: `${config.WEBURL}/#/${actionUrl}`
                    },
                    tokens: body.webTokens,
                    sound: 'default',
                }
            }
            sendFCMNotification(payload).then((response) => {
                this.removeDocument(body)
                this.UpdateDocument(body)
                resolve(true)
            }).catch((error) => {
                this.removeDocument(body)
                this.UpdateDocument(body)
                reject(error)
            });
        } catch (error) {
            this.removeDocument(body)
            this.UpdateDocument(body)
            reject(error)

        }
    })
};
function changeText(msg) {
    const mentionRegex = /@\[[\w ]+?\]\(\w{4,30}\)/gi;
    let mentions = msg.match(mentionRegex);

    if (mentions !== null) {
        mentions.forEach((mention) => {
            msg = msg.replace(mention, `@${mention.split("]")[0].replace("@[", "")}`)
        })
    }
    return msg;
}
exports.removeDocument = (data) => {
    let obj = {
        type: SCHEMA_TYPE.NOTIFICATIONS,
        collection:SCHEMA_TYPE.NOTIFICATIONS,
        data: [
            {
                _id: new mongoose.Types.ObjectId(data._id)
            },
        ]
    }
    MongoDbCrudOpration(dbCollections.GLOBAL, obj, "deleteOne").then((res) => {
        logger.info("res in Remove NotificationDoc")
    }).catch((error) => {
        logger.error("ERROR For Remove NotificationDoc")
    })
}
exports.UpdateDocument = (data) => {
    let obj = {
        type: SCHEMA_TYPE.NOTIFICATIONS,
        collection:SCHEMA_TYPE.NOTIFICATIONS,
        data: [
            {
                _id: new mongoose.Types.ObjectId(data.notificationId)
            },
            { notificationStatus: "completed" }
        ]
    }
    MongoDbCrudOpration(data.companyId, obj, "updateOne").then((res) => {
        logger.info("res in Update NotificationDoc")
    }).catch((error) => {
        logger.error("ERROR For Update NotificationDoc")
    })
}