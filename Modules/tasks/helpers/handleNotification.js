const { dbCollections } = require("../../../Config/firebaseCollections");
const { admin } = require("../../../Config/firebaseConfig");
const { getCollectionData, addUpdateDocument } = require("../../../utils/firebase_queries");
const axios = require("axios")
const apiEndRef = require("../../../Config/env");
const logger = require("../../../Config/loggerConfig");
const emailNotificationHandlerCtrl = require("../../notification/email-notification-handler/controllerV2")
const {handleNotificationtFun} = require("../../../Modules/notification/prepare-notification-data/controllerV2")
exports.HandleNotification = ({ type, companyId, projectId, taskId, folderId, sprintId, object, userData }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let projectPath = `${companyId}/${companyId}/${dbCollections.PROJECTS}/${projectId}`
            let path = projectPath;
            if (taskId !== undefined) {
                path = `${projectPath}/${sprintId}/${taskId}`
            }

            let projectData = null;

            if (taskId) {
                projectData = await getCollectionData(projectPath).then((doc) => doc.exists ? doc.data() : null).catch(() => null);

                if (!projectData) {
                    return reject(new Error(`Project not found ${projectPath}`));
                }
            }

            getCollectionData(path)
                .then((doc) => {
                    if (doc.exists) {
                        let watchers = doc.data() && doc.data().watchers ? doc.data().watchers : [];

                        if (!taskId) {
                            projectData = doc.data();
                        }

                        watchers = watchers?.filter((x) => {
                            if (projectData?.watchers?.[x] === "ignore") {
                                return false;
                            } else {
                                if (projectData?.watchers?.[x] === "all_activity") {
                                    return true;
                                } else {
                                    if (taskId) {
                                        return doc.data()?.watchers?.includes(x);
                                    } else {
                                        if (folderId && sprintId) {
                                            let folder = Object.values(doc.data()?.sprintsfolders || {})?.find((x) => x.folderId === folderId);
                                            if (folder) {
                                                let sprint = Object.values(folder?.sprintsObj || {})?.find((x) => x.id === sprintId)
                                                if (sprint) {
                                                    return sprint?.watchers?.includes(x);
                                                } else {
                                                    return false;
                                                }
                                            } else {
                                                return false;
                                            }
                                        } else if (sprintId) {
                                            let sprint = Object.values(doc.data()?.sprintsObj || {})?.find((x) => x.id === sprintId)
                                            if (sprint) {
                                                return sprint?.watchers?.includes(x);
                                            } else {
                                                return false;
                                            }
                                        } else {
                                            return false;
                                        }
                                    }
                                }
                            }
                        })

                        if (!watchers?.length) {
                            return reject({ status: false, error: new Error("No watchers") });
                        }

                        let users = [];
                        users = Array.from(new Set([...watchers]));

                        const obj = {
                            'Type': type,
                            'Key': object.key,
                            'UserId': userData.id,
                            'ProjectId': projectId,
                            'TaskId': taskId !== undefined ? taskId : "",
                            'NotificationMessage': object.message,
                            'CreatedAt': admin.firestore.FieldValue.serverTimestamp(),
                            'sprintId': sprintId !== undefined ? sprintId : "",
                            'folderId': folderId !== undefined ? folderId : "",
                            'isSelected': false,
                            'assigneeUsers': users,
                            'notSeen': users
                        }

                        addUpdateDocument(`${companyId}/${companyId}/${dbCollections.NOTIFICATIONS}`, obj)
                            .then((data) => {
                                resolve({ status: true, id: data.id });
                                try {
                                    const axiosData = {
                                        "companyId": companyId,
                                        "key": type === 'project' ? 'project' : 'tasks',
                                        "notificationKey": object.key,
                                        "notificationId": data.id,
                                        "companyOwnerId": userData.companyOwnerId,
                                        "notificationTitle": type === 'project' ? 'Project Notification' : 'Task Notification'
                                    };
                                    axios.post(process.env.APIURL + apiEndRef.SEND_NOTIFICATION, axiosData)
                                        .catch((err) => {
                                            logger.error(`ERROR in HandleNotification:${err.message}`);
                                        });

                                    // NOTIFICATION INFO DOC
                                    let infoObj = {};
                                    users.forEach((id) => {
                                        infoObj[id] = admin.firestore.FieldValue.increment(1);
                                    })
                                    addUpdateDocument(`${companyId}/${companyId}/${dbCollections.NOTIFICATIONS}/${dbCollections.COLLECTION_INFO}`, {
                                        ...infoObj
                                    })
                                        .catch((error) => {
                                            logger.error(`ERROR in add mentions info:${error.message}`);
                                            return;
                                        })
                                } catch (error) {
                                    logger.error(`ERROR in add counter info::${error.message}`);
                                }
                            })
                            .catch((error) => {
                                reject({ status: false, error: error });
                            })
                    } else {
                        reject({ status: false, error: new Error("No document found") });
                    }
                })
                .catch((error) => {
                    reject({ status: false, error: error });
                })
        } catch (error) {
            reject({ status: false, error: error });
        }
    });
}

exports.HandleBothNotification = ({ type, companyId, projectId, taskId, folderId, sprintId, object, userData, changeType = '', changeData = {} }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let projectPath = `${companyId}/${companyId}/${dbCollections.PROJECTS}/${projectId}`
            let path = projectPath;
            if (taskId !== undefined) {
                path = `${projectPath}/${sprintId}/${taskId}`
            }

            let projectData = null;
            let taskData = null;
            if (taskId) {
                projectData = await emailNotificationHandlerCtrl.fetchProjectDetailsSingle(companyId, projectId).then(response => {
                    if (response?.length > 0) {
                        return response[0]
                    } else {
                        return null
                    }

                }).catch(error => {
                    return null
                })
                taskData = await emailNotificationHandlerCtrl.fetchTaskDetails(companyId, taskId).then(response => {
                    if (response?.length > 0) {
                        return response[0]
                    } else {
                        return null
                    }
    
                }).catch(error => {
                    return null
                })
            }

            if(taskData){
                let watchers = taskData?.watchers ? taskData.watchers : [];
                watchers = watchers?.filter((x) => {
                    if (projectData?.watchers?.[x] === "ignore") {
                        return false;
                    } else {
                        if (projectData?.watchers?.[x] === "all_activity") {
                            return true;
                        } else {
                            if (taskId) {
                                return taskData?.watchers?.includes(x);
                            } else {
                                if (folderId && sprintId) {
                                    let folder = Object.values(taskData?.sprintsfolders || {})?.find((x) => x.folderId === folderId);
                                    if (folder) {
                                        let sprint = Object.values(folder?.sprintsObj || {})?.find((x) => x.id === sprintId)
                                        if (sprint) {
                                            return sprint?.watchers?.includes(x);
                                        } else {
                                            return false;
                                        }
                                    } else {
                                        return false;
                                    }
                                } else if (sprintId) {
                                    let sprint = Object.values(taskData?.sprintsObj || {})?.find((x) => x.id === sprintId)
                                    if (sprint) {
                                        return sprint?.watchers?.includes(x);
                                    } else {
                                        return false;
                                    }
                                } else {
                                    return false;
                                }
                            }
                        }
                    }
                })

                if (!watchers?.length) {
                    reject({ status: false, message: "No watchers" });
                    return
                }
                let users = [];
                if (taskId !== undefined) {
                    users = Array.from(new Set([taskData.Task_Leader, ...watchers]));
                } else {
                    users = Array.from(new Set([...taskData.AssigneeUserId, ...doc.data().LeadUserId, ...watchers]));
                }

                var leaderId = ""
                if (taskData?.LeadUserId !== undefined && taskData?.LeadUserId != "") {
                    leaderId = taskData.LeadUserId
                }

                const obj = {
                    "createdAt": new Date(),
                    "key": object.key,
                    "message": object.message,
                    "projectId": projectId,
                    "taskId": taskId || "",
                    "type": type,
                    "userId": userData.id,
                    "assigneeUsers": users,
                    "folderId": folderId || "",
                    "isSelected": false,
                    "notSeen": users,
                    "sprintId": sprintId || "",
                    "updatedAt": new Date(),
                    "companyId": companyId || "",
                    "task_leader_ID": taskData?.Task_Leader || "",
                    "changeType": changeType || "",
                    "changeData": changeData || {}

                }
                handleNotificationtFun({body:obj})
                    .then((response) => {

                        resolve({ status: true });
                    })
                    .catch((error) => {
                        logger.error(`ERROR in Notification API info::${error.message}`);
                        reject({ status: false, message: error.message });
                    });

            }

        } catch (error) {

            logger.error(`ERROR in Notification API info::${error.message}`);
            reject({ status: false, message: error.message });
        }
    });
}