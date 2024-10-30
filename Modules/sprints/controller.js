const { makeUniqueId } = require("../../utils/commonFunctions");
const HandleHistoryref = require("../tasks/helpers/helper");
const logger = require("../../Config/loggerConfig");
const MongoQ = require("../../utils/mongo-handler/mongoQueries")
const mongoose = require("mongoose")
const { SCHEMA_TYPE } = require('../../Config/schemaType');
const RequestQueue = require("../../utils/requestQueue");
const requestQueue = new RequestQueue();

exports.addSprint = (req, res) => {
    exports.addSprintFun(req).then((data) => {
        res.json(data);
    }).catch((error) => {
        res.json(error);
    })
}

exports.updateChannelsCounts = (companyId, private, type) => {
    return new Promise((resolve, reject) => {
        let params = {};

        const channelType = private ? 'privateChannels' : 'publicChannels';
        params.$inc = {
            [`projectCount.${channelType}`]: type === 'inc' ? 1 : -1,
            [`projectCount.channels`]: type === 'inc' ? 1 : -1
        };
        const queryObj = [
            { _id: new mongoose.Types.ObjectId(companyId) },
            params,
            { new: true }
        ];

        const query = {
            type: SCHEMA_TYPE.COMPANIES,
            data: queryObj
        };

        requestQueue.enqueue(() => {
            MongoQ.MongoDbCrudOpration("global", query, "findOneAndUpdate")
            .then((response) => {
                if (response) {
                    const data = JSON.parse(JSON.stringify(response));

                    const privateChannels = data.projectCount.privateChannels || 0;
                    const maxPrivateChannels = data.planFeature.maxPrivateChannels;
                    const publicChannels = data.projectCount.publicChannels || 0;
                    const maxPublicChannels = data.planFeature.maxPublicChannels;

                    if(private) {
                        if(maxPrivateChannels === null) {
                            resolve(true);
                        } else {
                            const count = maxPrivateChannels - privateChannels;
                            if(count >= 0) {
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        }
                    } else {
                        if(maxPublicChannels === null) {
                            resolve(true);
                        } else {
                            const count = maxPublicChannels - publicChannels;
                            if(count >= 0) {
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        }
                    }

                } else {
                    resolve(false);
                }
            })
            .catch(error => reject(error));
        });
    })
}

exports.addSprintFun = (req) => {
    try {
        return new Promise((resolve, reject) => {
            const {companyId, projectId, folder, sprintName, userData, projectName, mainChat = false, private = false, sendMessage = true, AssigneeUserId = [], icon = {},from = '',taskSprintObj = {}} = req.body;
            const sprintObject = {
                tasks : 0,
                private: private,
                name: sprintName,
                deletedStatusKey : 0,
                projectId : new mongoose.Types.ObjectId(projectId),
                ...(Object.keys(icon || {}).length ? icon : {})
            }
            if(mainChat) {
                sprintObject.sendMessage = sendMessage;
                sprintObject.AssigneeUserId = AssigneeUserId;
            }

            if(folder && Object.keys(folder).length && folder.folderId && folder.folderId.length) {
                sprintObject.folderId = new mongoose.Types.ObjectId(folder.folderId);
            }

            const schema = SCHEMA_TYPE.SPRINTS
            let obj = {
                type: schema,
                data: sprintObject
            }

            if(mainChat) {
                exports.updateChannelsCounts(companyId, private, 'inc').then((result) => {
                    if(result) {
                        MongoQ.MongoDbCrudOpration(companyId, obj, "save").then((responsee) => {
                            resolve({ status: true, statusText: "Sprint added successfully",data: responsee});
                            if(mainChat) return
                        }).catch((error) => {
                            logger.error(`ERROR in add sprint function : ${error.message}`);
                            reject({ status: false, statusText: error });
                        });
                    } else {
                        exports.updateChannelsCounts(companyId, private, 'dec');
                        resolve({ status: false, statusText: "Channels creation limits have been exceeded" });
                    }
                })
            } else {
                MongoQ.MongoDbCrudOpration(companyId, obj, "save").then((responsee) => {
                    resolve({ status: true, statusText: "Sprint added successfully",data: responsee});
                    if(mainChat) return

                    // Call history function
                    let historyObj = {};
                    if(folder && folder.folderId !== "") {
                        historyObj = {
                            'message': `<b>${userData.Employee_Name}</b> has created new <b>Sprint</b> as <b>${sprintName}</b> in <b>${folder.folderName}</b> folder in <b>${projectName}</b> project ${from !== '' ? `from the (<b>${taskSprintObj.taskFodlerName ? '/' + taskSprintObj.taskFodlerName : ''}${taskSprintObj.taskSprintName}/${sprintName}</b>) task.` : ''}.`,
                            'key' : 'Sub_Sprint_Created',
                        }
                    } else {
                        historyObj = {
                            'message': `<b>${userData.Employee_Name}</b> has created new <b>Sprint</b> as <b>${sprintName}</b> in <b>${projectName}</b> project ${from !== '' ? `from the (<b>${taskSprintObj.taskSprintName}/${sprintName}</b>) task.` : ''}.`,
                            'key' : 'Create_Sprint',
                        }
                    }

                    HandleHistoryref.HandleHistory('project', companyId, projectId, null, historyObj, userData).catch((error) => {
                        logger.error(`ERROR in handle history : ${error.message}`);
                    });

                    // Call notification function
                    // let sprintObj = {
                    //     'ProjectName' : projectName,
                    //     'sprintName' : sprintName
                    // }
                    // if(folder && folder.folderId!=="") {
                    //     sprintObj.name = folder.folderName;
                    // }

                    // let notificationObject = {
                    //     'message': folder && folder.folderId !== "" ? createSubSprint(sprintObj) : createSprint(sprintObj),
                    //     'key': 'project_sprint_create'
                    // }
                    // HandleNotification({type:'project',companyId, projectId: projectId, sprintId: sprintObject.id, object: notificationObject, userData})
                    // .catch((error) => {
                    //     logger.error(`ERROR in handle notification : ${error.message}`);
                    // });
                }).catch((error) => {
                    logger.error(`ERROR in add sprint function : ${error.message}`);
                    reject({ status: false, statusText: error });
                });
            }

        })
    } catch (error) {
        logger.error(`ERROR : ${error.message}`);
        reject({ status: false, statusText:error });
    }
};

exports.editSprintName = (req, res) => {
    try {
        const {companyId, projectId, folder = null, sprintName, userData, projectName, prevData, mainChat = false} = req.body;
        let queryObject = null;
        queryObject = {
            $set: {
                name: sprintName
            }
        }
        const schema = SCHEMA_TYPE.SPRINTS
        let object = {
            type: schema,
            data: [
                {
                    _id: new mongoose.Types.ObjectId(prevData.id)
                },
                { ...queryObject }
            ]
        }
        MongoQ.MongoDbCrudOpration(companyId, object, "updateOne").then(() => {  
            res.send({status: true, statusText: "Sprint updated successfully"});
        }).catch((error)=>{
            logger.error(`EDIT SPRINT ERROR : ${error}`);
            res.send({status: false, statusText: "Error in sprit update"});
        });
        if(mainChat) return;

        // Call history function
        let historyObj = {};
        if(folder && folder.folderId !== "") {
            historyObj = {
                'message': `<b>${userData.Employee_Name}</b> has changed <b>Sprint</b> name from <b>${prevData.name}</b> to <b>${sprintName}</b> in <b>${folder.folderName}</b> folder in <b>${projectName}</b> project.`,
                'key' : 'Sub_Sprint_Created',
            }
        } else {
            historyObj = {
                'message': `<b>${userData.Employee_Name}</b> has changed <b>Sprint</b> name from <b>${prevData.name}</b> to <b>${sprintName}</b> in <b>${projectName}</b> project.`,
                'key' : 'Create_Sprint',
            }
        }

        HandleHistoryref.HandleHistory('project', companyId, projectId, null, historyObj, userData)
        .catch((error) => {
            logger.error("ERROR in handle history", error.message);
        });

        // Call notification function
        // let notifyObj = {
        //     'sprintName' : sprintName,
        //     'ProjectName' : projectName,
        //     'previousSprint' : prevData.name
        // }
        // if(folder!==null) {
        //     notifyObj.name = folder.folderName;
        // }

        // const notificationObject = {
        //     'message': folder !== null ? editSubSprint(notifyObj) : EditSprint(notifyObj),
        //     'key': 'project_sprint_create'
        // }
        // HandleNotification({type:'project',companyId, projectId: projectId, sprintId: id, object: notificationObject, userData})
        // .catch((error) => {
        //     logger.error("ERROR in handle notification", error.message);
        // });
    } catch (error) {
        logger.error(error.message);
        res.send({status: false, statusText: error.message});
    }
};

exports.updateSprint = (req, res) => {
    exports.updateSprintFun(req).then((data) => {
        res.json(data);
    }).catch((error) => {
        res.json(error);
    });
};

exports.updateSprintFun = (req) => {
    return new Promise((resolve, reject) => {
        try {
            const { companyId, projectId, folderId = null, updateObject, userData, sprintName = null, folderName = "", projectData = null, mainChat = false, updatedValueDeleteStatusKey, historyData } = req.body;
            const { id } = req.params;
            const schema = SCHEMA_TYPE.SPRINTS;
            let obj = {
                type: schema,
                data: [
                    { _id: new mongoose.Types.ObjectId(id) },
                    { ...updateObject },
                    { upsert: true }
                ]
            }
            
            MongoQ.MongoDbCrudOpration(companyId, obj, "updateOne").then((response) => {
                resolve({ status: true, statusText: "Sprint updated successfully" });
                if(mainChat) return;
                if (updatedValueDeleteStatusKey !== undefined) {
                    // UPDATE CHILD TASKS | TYPESENE
                    try {
                        let dsk = updatedValueDeleteStatusKey || 0;

                        let taskDeleteStatusKey = 0;
                        let deletedStatusKey;
                        if(!dsk) {
                            deletedStatusKey = 4;
                            taskDeleteStatusKey = 0;
                        } else {
                            deletedStatusKey = 0;
                            if(dsk === 2) {
                                taskDeleteStatusKey = 4
                            } else if(dsk === 5) {
                                taskDeleteStatusKey = 5
                            } else if(dsk === 1) {
                                taskDeleteStatusKey = 1
                            }
                        }

                        try {
                            const taskStatusUpdateQuery = {
                                type: SCHEMA_TYPE.TASKS,
                                data: [
                                    {
                                        ProjectID: new mongoose.Types.ObjectId(projectData ? projectData.id : projectId),
                                        sprintId: id,
                                        deletedStatusKey:deletedStatusKey
                                    },
                                    { $set: {deletedStatusKey: taskDeleteStatusKey}},
                                ]
                            }
                            
                            MongoQ.MongoDbCrudOpration(companyId,taskStatusUpdateQuery,"updateMany")
                            .catch((error) =>{
                                logger.error(`ERROR in update sprint tasks while update task: ${error.message}`);
                            })
                        } catch (error) {
                            logger.error(`ERROR in update sprint tasks from updating task deletestatuskey: ${error.message}`);
                        }
                    } catch (error) {
                        logger.error(`ERROR in update sprint tasks: ${error.message}`);
                    }
                }

                // Call histiory function
                let historyObj = {
                    key: "project_sprint",
                    sprintId: id,
                }
                if(updatedValueDeleteStatusKey) {
                    historyObj.message = `<b>${userData.Employee_Name}</b> has ${updatedValueDeleteStatusKey === 0 ? 'restored' : updatedValueDeleteStatusKey === 5 ? 'closed' : updatedValueDeleteStatusKey === 1 ? 'deleted' : 'archived'} <b>${sprintName}</b> sprint ${folderId === null ? '' : `in <b>${folderName}</b> folder`} in <b>${projectData.ProjectName}</b> project.`
                }else if(historyData && Object.keys(historyData).length > 0){
                    historyObj.message = `<b>${userData.Employee_Name}</b> has <b>${historyData.type}</b> <b>${historyData.userName ? historyData.userName : ''}</b> ${historyData.userName ? historyData.type === 'added' ? 'in' : 'from' : ''} <b>${sprintName}</b> sprint ${folderId === null ? '' : `in <b>${folderName}</b> folder`} in <b>${projectData.ProjectName}</b> project.`
                }
                if (historyObj && Object.keys(historyObj).length) {
                    HandleHistoryref.HandleHistory('project', companyId, projectId, null, historyObj, userData).catch((error) => {
                        logger.error(`ERROR in history: ${error.message}`);
                    });
                }

                // // Call notification function
                // let notificationObject = {
                //     'Type': 'project',
                //     'key': 'project_sprint_removed',
                //     'message': `<strong>${userData.Employee_Name}</strong> has ${updateObject.deletedStatusKey === 0 ? 'restored' : updateObject.deletedStatusKey === 5 ? 'closed' : updateObject.deletedStatusKey === 1 ? 'deleted' : 'archived'} <strong>${sprintName}</strong> sprint ${folderId === null ? '' : `in <b>${folderName}</b> folder`} in <strong>${projectData.ProjectName}</strong> project.`,
                // }
                // if (notificationObject && Object.keys(notificationObject).length) {
                //     HandleNotification({ type: "project", companyId, projectId, folderId: folderId !== null ? folderId : '', sprintId: id || '', object: notificationObject, userData })
                //     .catch((error) => {
                //         logger.error(`ERROR in add notification ${error.message}`);
                //     });
                // }
            })
            .catch((error) => {
                logger.error(`ERROR in update sprint function => ${error}`);
            })
        } catch (error) {
            logger.error(`ERROR ${error.message}`);
            reject({ status: false, statusText: error.message });
        }
    });
};

exports.addFolder = (req, res) => {
    try {
        const {companyId, projectId, folderName, userData, projectName, mainChat = false} = req.body;

        // const folderId = makeUniqueId(6);
        const updateObject = {
            name: folderName,
            projectId : new mongoose.Types.ObjectId(projectId),
            deletedStatusKey : 0
        }


        const schema = SCHEMA_TYPE.FOLDERS
        
        let obj = {
            type: schema,
            data: updateObject
        }

        MongoQ.MongoDbCrudOpration(companyId, obj, "save").then((response) => {
            res.send({status: true, statusText: "Folder added successfully"});
            if(mainChat) return;

            // Call history function
            const historyObject = {
                'message': `<b>${userData.Employee_Name}</b> has created new <b>Folder</b> as <b>${folderName}</b> in <b>${projectName}</b> project.`,
                'key' : 'Create_Folder',
            }
            HandleHistoryref.HandleHistory('project', companyId, projectId, null, historyObject, userData)
            .catch((error) => {
                logger.error("ERROR in handle history", error.message);
            });

            // Call notification function
            // const notifyObj = {
            //     'ProjectName' : projectName,
            //     'sprintFolderName' : folderName
            // } 
            // const notificationObject = {
            //     'message': createFolder(notifyObj),
            //     'key': 'project_folder_create'
            // }
            // HandleNotification({type:'project', companyId, projectId: projectId, folderId: folderId, object: notificationObject, userData})
            // .catch((error) => {
            //     logger.error(error.message);
            //     res.send({status: false, statusText: error.message});
            // })

            // res.send({status: true, statusText: "Folder added successfully"});
        }).catch((error) => {
            res.send({status: false, statusText: error.message});
        })

    } catch (error) {
        res.send({status: false, statusText: error.message});
    }
};

exports.editFolderName = (req, res) => {
    try {
        const {companyId, projectId, folderName, prevFolderName, userData, projectName, mainChat = false} = req.body;
        const {id} = req.params;

        const queryObject = {
            $set: {
                name: folderName
            }
        }

        const schema = SCHEMA_TYPE.FOLDERS
        let obj = {
            type: schema,
            data: [
                {
                    _id: new mongoose.Types.ObjectId(id)
                },
                { ...queryObject }
            ]
        }

        MongoQ.MongoDbCrudOpration(companyId, obj, "updateOne").then((response) => {
            res.send({status: true, statusText: "Folder renamed successfully"});
            if(mainChat) return;

            // Call history function
            let historyObj = {
                'message': `<b>${userData.Employee_Name}</b> has changed <b>Folder</b> name from <b>${prevFolderName}</b> to <b>${folderName}</b> in <b>${projectName}</b> project.`,
                'key' : 'Create_Folder',
            }
            HandleHistoryref.HandleHistory('project', companyId, projectId, null, historyObj, userData)
            .catch((error) => {
                logger.error("ERROR in handle history", error.message);
            });

            // Call notification function
            // let notifyObj = {
            //     'ProjectName' : projectName,
            //     'sprintFolderName' : folderName,
            //     'previousFolder' : prevFolderName
            // } 
            // let notificationObject = {
            //     'message': editFolder(notifyObj),
            //     'key': 'project_folder_create'
            // }
            // HandleNotification({type:'project', companyId, projectId:projectId, folderId: id, object:notificationObject, userData})
            // .catch((error) => {
            //     logger.error(error.message);
            //     res.send({status: false, statusText: error.message});
            // })
        })
    } catch (error) {
        logger.error(error.message);
        res.send({status: false, statusText: error.message});
    }
};

exports.updateFolder = (req, res) => {
    try {
        const {companyId, folderName = "", projectData, updateObject, userData, mainChat=false, sprints = [], projectId,updatedValueDeleteStatusKey} = req.body;
        const {id} = req.params;

        const schema = SCHEMA_TYPE.FOLDERS
        let obj = {
            type: schema,
            data: [
                { _id: new mongoose.Types.ObjectId(id) },
                { ...updateObject },
            ]
        }

        MongoQ.MongoDbCrudOpration(companyId, obj, "updateOne").then(() => {
            res.send({status: true, statusText: "Folder updated successfully"});
            if(mainChat) return;

            if(updatedValueDeleteStatusKey !== undefined) {
                if(sprints.length) {
                    let count = 0;
                    const next = () => {
                        count++;
                        loopFun(sprints[count]);
                    }

                    const loopFun = (sprintId) => {
                        if(count >= sprints.length) {
                            return;
                        } else {
                            let dsk = updatedValueDeleteStatusKey || 0;
                
                            let taskDeleteStatusKey = 0;
                            let deletedStatusKey;
                            if(!dsk) {
                                deletedStatusKey = 6;
                                taskDeleteStatusKey = 0;
                            } else {
                                deletedStatusKey = 0
                                if(dsk === 2) {
                                    taskDeleteStatusKey = 6
                                } else if(dsk === 1) {
                                    taskDeleteStatusKey = 1
                                }
                            }
                
                            const taskStatusUpdateQuery = {
                                type: SCHEMA_TYPE.TASKS,
                                data: [
                                    {
                                        ProjectID: new mongoose.Types.ObjectId(projectData.id),
                                        sprintId: sprintId,
                                        deletedStatusKey:deletedStatusKey
                                    },
                                    { $set: {deletedStatusKey: taskDeleteStatusKey}},
                                ]
                            }
                            
                            MongoQ.MongoDbCrudOpration(companyId,taskStatusUpdateQuery,"updateMany")
                            .then(()=>{
                                next()
                            })
                            .catch((error) =>{
                                logger.error(`ERROR in update Folder sprint tasks while update task: ${error.message}`);
                                next()
                            })
                        }
                    }
                    loopFun(sprints[count]);
                }
            }
            
            // Call history function
            let historyObj = {
                message: `<b>${userData.Employee_Name}</b> has ${updateObject[`sprintsfolders.${id}.deletedStatusKey`] === 0 ? 'restored' : updateObject[`sprintsfolders.${id}.deletedStatusKey`] === 1 ? 'deleted' : 'archieved'} <b>${folderName}</b> folder in <b>${projectData.ProjectName}</b> project.`,
                key: "project_sprint_removed",
            }
            if(historyObj && Object.keys(historyObj).length) {
                HandleHistoryref.HandleHistory('project', companyId, projectData.id, null, historyObj, userData).catch((error) => {
                    logger.error("ERROR in history: ", error.message);
                });
            }

            // Call notification function
            // let notificationObject = {
            //     'type': 'project',
            //     'key': 'project_sprint_removed',
            //     'message': `<strong>${userData.Employee_Name}</strong> has ${updateObject[`sprintsfolders.${id}.deletedStatusKey`] === 0 ? 'restored' : updateObject[`sprintsfolders.${id}.deletedStatusKey`] === 1 ? 'deleted' : 'archieved'} <strong>${folderName}</strong> folder in <strong>${projectData.ProjectName}</strong> project.`,
            // }
            // if(notificationObject && Object.keys(notificationObject).length) {
            //     HandleNotification({type: "project", companyId, projectId: projectData.id, folderId: id, sprintId: '',  object: notificationObject, userData}).catch((error) => {
            //         logger.error("ERRRO in add notification: ", error.message);
            //     })
            // }
        })
    } catch (error) {
        res.send({status: false, statusText: error.message});
    }
};