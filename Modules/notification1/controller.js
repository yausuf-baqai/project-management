const logger = require("../../Config/loggerConfig");
const sendMail = require("../service.js");
const { dbCollections } = require("../../Config/firebaseCollections");
const { admin, fcm } = require("../../Config/firebaseConfig");
const config = require("../../Config/config");
const db = admin.firestore(); 
const { convert } = require('html-to-text');
const redirectionFromMail = require("../Template/redirectionFromMail.js");
const { bulkPush } = require("../../utils/fcmFunction");
const { default: mongoose } = require("mongoose");
const { MongoDbCrudOpration } = require("../../utils/mongo-handler/mongoQueries.js");
const { SCHEMA_TYPE } = require("../../Config/schemaType.js");

/**
 * Main API function
 * @param {Objcet} req
 * @param {Object} res
 * @returns
 */
exports.sendNotification = async (req,res) => {
    try {
        let uniqueIds;
        let filteredIds = [];
        let notificationSettings = [];
        let companyId = req.body.companyId;
        let notificationKey = req.body.notificationKey;
        let notificationId = req.body.notificationId;
        let reqKey = req.body.key;
        let companyOwnerId = req.body.companyOwnerId;
        let notificationTitle = req.body.notificationTitle;
        let notificationType = [];
        let tokensArr = [];

        if (!companyId) {
            res.status(404).send({
                status: false,
                statusText: "Company Id is Required."
            });
            return;
        }
        if (!notificationTitle) {
            res.status(404).send({
                status: false,
                statusText: "Notification Title is Required."
            });
            return;
        }
        if (!notificationKey) {
            res.status(404).send({
                status: false,
                statusText: "Notification Key is Required."
            });
            return;
        }
        if (!reqKey) {
            res.status(404).send({
                status: false,
                statusText: "Key is Required."
            });
            return;
        }
        if (!notificationId) {
            res.status(404).send({
                status: false,
                statusText: "Notification Id is Required."
            });
            return;
        }
        if (!companyOwnerId) {
            res.status(404).send({
                status: false,
                statusText: "Company Owner Id is Required."
            });
            return;
        }

        // GET NOTIFICATION DATA
        let notificationRef = db.collection(companyId).doc(companyId).collection(dbCollections.NOTIFICATIONS).doc(notificationId)
        let notificationsDoc = await notificationRef.get()
        .catch(error => {
            logger.error(`Get Notifications Data Catch Error: ${error.message}`);
            res.status(404).send({
                status: false,
                statusText: "Get Notifications Data Catch Error!"
            });
            return; 
        });

        if (!notificationsDoc.exists) {
            res.status(404).send({
                status: false,
                statusText: "Notifications Document not Found!"
            });
            return;
        }
        let ownId = notificationsDoc.data().UserId;
        let body =  notificationsDoc.data().NotificationMessage;
        uniqueIds =  notificationsDoc.data().assigneeUsers;
        let projectId = notificationsDoc.data().ProjectId
        let sprintId =  notificationsDoc.data().sprintId
        let folderId =  notificationsDoc.data().folderId
        let taskId = notificationsDoc.data().TaskId

        if (ownId && uniqueIds) {
            filteredIds = filteredIds.concat(uniqueIds.filter(e => e !== ownId))
        }
        if (!filteredIds.length) {
            res.status(404).send({
                status: false,
                statusText: "No Assignee Ids Found in Notification Collection!"
            });
            return;
        }

        logger.info(`total Assignees => ${JSON.stringify(filteredIds)}`);
        // GET NOTIFICATION SETTING DATA BASED ON ASSIGNEE ID
        await Promise.all(filteredIds.map( async (ele) => {
            await db.collection(companyId).doc(companyId).collection(dbCollections.NOTIFICATIONS_SETTING)
            .where("id","==", ele).get()
            .then((snapshot) => {
                if (!snapshot.empty) {
                    notificationSettings.push(snapshot.docs[0].data());
                }  
            })
            .catch((error) => {
                logger.error(`Get Notification Settings Data Catch Error: ${error.message}`);
            });
        }))
        .catch((error) => {
            logger.error(`Map filteredIds Array Catch Error: ${error.message}`);
        });

        let browserArray = []; 
        let emailArray = [];
        let mobileArray = [];
        let keyObj = [];
        logger.info(`notificationSettings length => ${JSON.stringify(notificationSettings.length)}`);
        if (!notificationSettings.length) {
            res.status(404).send({
                status: false,
                statusText: "Notification Permission not Found for Given Assignee or Lead User ID!"
            });
            return;
        }

        // KEY BASED SEARCHING 
        await Promise.all(notificationSettings.map( async (ele) => {
            let allKey = Object.keys(ele);
            if (allKey.includes(reqKey)) {
                keyObj.push({"id": ele.id , ...ele[req.body.key]});
            }
        }))
        .catch((error) => {
            logger.error(`Map notificatio Settings Array Catch Error: ${error.message}`);
        });

        if (!keyObj.length) {
            res.status(403).send({
                status: false,
                statusText: "Please check Key Once Again! Wrong Key!"
            });
            return;
        } 

        // CHECK PERMISSIONS FOR NOTIFICATION SETTING  
        await Promise.all(keyObj.map( async (ele) => {
            let itemArr = ele.items;
            logger.info(`Checking settings of user => ${JSON.stringify(ele.id)}`);
            await Promise.all(itemArr?.map( async (e) => {
                // NOTIFICATION KEY BASED SEARCHING
                if (e.key === notificationKey) {
                    logger.info(`Notification Key in request => ${JSON.stringify(notificationKey)}`);
                    notificationType.push(e);
                    if (e.browser) {
                        logger.info(`user id pushed in browser array => ${JSON.stringify(ele.id)}`);
                        browserArray.push(ele.id);
                    }
                    if (e.email) {
                        emailArray.push(ele.id);
                    } 
                    if (e.mobile) {
                        mobileArray.push(ele.id);
                    } 
                } 
            })) 
        }))
        if (!notificationType.length) {
            res.status(403).send({
                status: false,
                statusText: "Notification Key Not Found!"
            });
            return;
        }

        // SEND MAIL NOTIFICATION
        if (emailArray.length) { 
            let emailIds = [];
            await Promise.all(emailArray.map( async (e) => {
                await db.collection(dbCollections.USERS).where('id',"==", e).get()
                .then(async(userEmailDoc) => {
                    if (!userEmailDoc.empty) {
                        emailIds.push(userEmailDoc.docs[0].data().Employee_Email);
                    }
                })
                .catch((error) => {
                    logger.error(`Get User Email Catch Error: ${error.message}`);
                });
            }))
            .catch((error) => {
                logger.error(`Map all ids to get User Email Catch Error: ${error.message}`);
            });
            if (!emailIds.length) {
                res.status(404).send({
                    status: false,
                    statusText: "Get User Email Id error!" 
                });
                return;
            }
            // CALLING SEND MAIL FUNCTION
            this.sendMailNotification( req, res, body, emailIds,projectId,sprintId,folderId,taskId);
        }

        logger.info(`sent browser notification user ids => ${JSON.stringify(browserArray)}`);
        // SEND BROWSER NOTIFICATION
        if (browserArray.length) { 
            await Promise.all(browserArray.map( async (uid) => {
                await db.collection(dbCollections.USERS).where('id',"==", uid).get()
                .then(async(usersDoc) => { 
                    if (!usersDoc.empty) {
                        let browserToken = usersDoc.docs[0].data().webTokens;
                        if (browserToken && browserToken.length) {
                            tokensArr = tokensArr.concat(browserToken)
                            logger.info(`webToken => ${JSON.stringify(browserToken)} of user ${JSON.stringify(usersDoc.docs[0].data().Employee_Name)}`);
                        }
                    } 
                })
                .catch((error) => {
                    logger.error(`Get Browser Token Data in User collection Catch Error: ${error.message}`);
                });
            }))
            if (tokensArr.length) {
                exports.sendBrowserNotification(req, body, tokensArr, projectId, folderId, sprintId,taskId, (resp) => {
                    logger.info(`sendBrowserNotification called => ${JSON.stringify(resp.messageId)}`);
                    if (!resp.status) {
                        if (!res.headersSent) {
                            res.status(403).send({
                                status: false,
                                statusText:  `Send Browser Notification Function Catch Error => ${resp.error.message}`
                            });
                            return;
                        }
                    } 
                    const unsubscribePromises = tokensArr.map(token => {
                        return fcm.unsubscribeFromTopic(token,"fcmNotification");
                    });
                    Promise.all(unsubscribePromises)
                        .then(response => {
                           logger.info(`Sent notification vie AWS mail => ${JSON.stringify(response)}`);
                        })
                        .catch(error => {
                           logger.info(`Error unsubscribing tokens from topic: => ${error.message}`);
                        });

                    if (!res.headersSent) {
                        res.send({
                            status: true, 
                            statusText: `Success ${resp.messageId}`,
                            browserArray: browserArray,
                            emailArray: emailArray,
                            mobileArray: mobileArray, 
                        });
                    }
                })
            }
        }
        if (!res.headersSent) {
            res.send({
                status: true, 
                statusText: `Success*`,
                browserArray: browserArray,
                emailArray: emailArray,
                mobileArray: mobileArray, 
            });
        }
    }
    catch (error) {
        if (!res.headersSent) {
            logger.error(`Something went Wrong!: ${error.message}`);
            res.status(403).send({
                status: false,
                statusText: `Catch ${error}`
            });
            return;
        }
    }
};

/**
 * SEND EMAIL NOTIFICATION API FUNCTION
 * @param {String} req 
 * @param {String} res 
 * @param {String} body 
 * @param {Array} email 
 * @returns
 */
exports.sendMailNotification = async ( req, res, body, email,projectId,sprintId,folderId,taskId, err) => {
    let actionUrl = "";
    if(req.body.key.toLowerCase() === "project") {
        if(folderId !== undefined && folderId !== null && folderId !== '') {
            if(sprintId !== undefined && sprintId !== null && sprintId !== '') {
                actionUrl = `${req.body.companyId}/project/${projectId}/fs/${folderId}/${sprintId}`
            } else {
                actionUrl = `${req.body.companyId}/project/${projectId}/f/${folderId}`
            }
        } else if(sprintId !== undefined && sprintId !== null && sprintId !== '') {
            actionUrl = `${req.body.companyId}/project/${projectId}/s/${sprintId}`
        } else {
            actionUrl = `${req.body.companyId}/project/${projectId}/p?tab=ProjectDetail`
        }
    } else {
        if(folderId !== undefined && folderId !== null && folderId!== '') {
            actionUrl = `${req.body.companyId}/project/${projectId}/fst/${folderId}/${sprintId}/${taskId}${req.body.notificationKey === "logged_hours_notification" ? '?tab=ProjectListView&taskTab=TimeLog' : ''}`
        } else {
            actionUrl = `${req.body.companyId}/project/${projectId}/st/${sprintId}/${taskId}${req.body.notificationKey === "logged_hours_notification" ? '?tab=ProjectListView&taskTab=TimeLog' : ''}`
        }
    }
    let link =  `${config.WEBURL}/#/${actionUrl}`
    let mail = redirectionFromMail(body, link);
    await sendMail.SendNotificationEmail(`${config.APP_NAME}- ${req.body.notificationTitle}`, mail, email, true, (result) => {
        logger.info(`Sent notification vie AWS mail => ${JSON.stringify(result)}`);
        if (!result.status) {
            if (!res.headersSent) {
                res.send({
                    status: false,
                    statusText: result.error
                });
                return;
            }
        } 
    })
    if (err) {
        res.status(403).send({
            status: false,
            statusText: `Send Email Notification Function Error: ${err}`
        });
        return;
    }
}
 
/**
 * SEND MOBILE AND BROWSER NOTIFICATION API FUNCTION
 * @param {Object} req 
 * @param {String} body 
 * @param {Array} tokens 
 * @param {Object} callback 
 * @returns
 */
exports.sendBrowserNotification = async (req, body, tokens,projectId,folderId,sprintId,taskId, callback) => {
    try {
        const options = {
            selectors: [
                { selector: 'img', format: 'skip' },
            ]
        };
        const text = convert(body, options);
        const topicName = "fcmNotification"
        let actionUrl = "";

        if(req.body.key.toLowerCase() === "project") {
            if(folderId !== undefined && folderId !== null && folderId !== '') {
                if(sprintId !== undefined && sprintId !== null && sprintId !== '') {
                    actionUrl = `${req.body.companyId}/project/${projectId}/fs/${folderId}/${sprintId}`
                } else {
                    actionUrl = `${req.body.companyId}/project/${projectId}/f/${folderId}`
                }
            } else if(sprintId !== undefined && sprintId !== null && sprintId !== '') {
                actionUrl = `${req.body.companyId}/project/${projectId}/s/${sprintId}`
            } else {
                actionUrl = `${req.body.companyId}/project/${projectId}/p?tab=ProjectDetail`
            }
        } else {
            if(folderId !== undefined && folderId !== null && folderId!== '') {
                actionUrl = `${req.body.companyId}/project/${projectId}/fst/${folderId}/${sprintId}/${taskId}${req.body.notificationKey === "logged_hours_notification" ? '?tab=ProjectListView&taskTab=TimeLog' : ''}`
            } else {
                actionUrl = `${req.body.companyId}/project/${projectId}/st/${sprintId}/${taskId}${req.body.notificationKey === "logged_hours_notification" ? '?tab=ProjectListView&taskTab=TimeLog' : ''}`
            }
        }
        let payload = {
            notification: {
                title: `${config.APP_NAME} - ${req.body.notificationTitle}`,
                body: text,
                click_action:`${config.WEBURL}/#/${actionUrl}`
            },
        }
        // Using Promise.map and async/await:
        await Promise.all(tokens.map( async (deviceToken) => {
            // Promise.map awaits for returned promises as well.
            logger.info(`FCM token => ${JSON.stringify(deviceToken)}`);
            // Subscribing a device to a topic
            await fcm.subscribeToTopic(deviceToken, topicName)
            .then(() => {
                logger.info(`Successfully subscribed to topic: => ${topicName}`);
            })
            .catch(error => {
                logger.error(`Error subscribing to topic: => ${error.message}`);
            });
        })).catch((error) => {
            logger.error(`Browser fcm notification catch error => ${error.message}`);
            callback({
                status: false,
                error
            });
        });
    
        // Sending message to topic
        await admin.messaging().sendToTopic(topicName, payload)
        .then(response => {
            logger.info(`Successfully sent message to topic: => ${response.messageId}`);
            callback({
                status: true,
                data: response
            });
        })
        .catch(error => {
            logger.error(`Error sending message to topic: => ${error.message}`);
            callback({
                status: false,
                error
            });
        });
    }
    catch(error) {
        logger.error(`catch Error sending message to topic => ${error.message}`);
        callback({
            status: false,
            error
        });
    }
}

exports.sendPushNotification = (body = null)  => {
    return new Promise(async(resolve, reject) => {
        try {
            if(!body) return reject(new Error(`Body required`));

            const {users = [], title="", message = "", image = "", redirection=""} = body;

            if(!users.length) return reject(new Error(`no users`));
            if(!title) return reject(new Error(`Title required`));
            if(!message && !image) return reject(new Error(`Nothing to send`));

            let query = {
                type: dbCollections.USERS,
                data: [
                    {
                        _id: {$in: users.map(user => new mongoose.Types.ObjectId(user))}
                    }
                ]
            };

            MongoDbCrudOpration(SCHEMA_TYPE.GOLBAL, query, "find")
            .then((response) => {
                let tokens = [];
                response = response.map((x) => x.webTokens || [])
                response?.forEach((uTokens) => {
                    tokens = [...tokens, ...uTokens];
                })

                if(!tokens.length) {
                    resolve("No tokens were found");
                    return;
                }

                let msgObj = {title, body: message, click_action: redirection};

                if(image) {
                    msgObj.image = image;
                }

                bulkPush(tokens, msgObj)
                .then((res) => {
                    resolve(res);
                })
                .catch((error) => {
                    reject(error);
                })
            })
            .catch((error) => {
                reject(error);
            })
        } catch (error) {
            reject(error);
        }
    })
}