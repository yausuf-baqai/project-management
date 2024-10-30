const moment = require('moment');
const logger = require("../../../Config/loggerConfig");
const { DateTime } = require('luxon');
const { SCHEMA_TYPE } = require('../../../Config/schemaType');
const { MongoDbCrudOpration } = require("../../../utils/mongo-handler/mongoQueries");
const { default: mongoose } = require('mongoose');
const { updateSprintCount } = require('../../notification-count/controller');
const { updateSprintFun } = require('../../sprints/controller');
/* ------------- TASK ------------- */
exports.HandleTask = async (companyId, object, isUpdate, id = null, userData) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Check if is update
            if (isUpdate && id === null) {
                reject("Id field should not be empty or undefined.");
                return;
            }

            // Required keys for validation
            let keys = ["TaskName", "TaskKey", "TaskType", "ProjectID", "CompanyId"];
            let valid = "";

            object = JSON.parse(JSON.stringify(object));

            keys.forEach(key => {
                if (typeof object[key] !== "object" && (object[key] === undefined || !object[key].length)) {
                    valid += key + ", ";
                } else if (typeof object[key] === "object" && object[key] !== undefined && Object.keys(object[key]).length) {
                    valid += key + ", ";
                }
            })

            if (valid.length) {
                // Is invalid
                valid += "fields should not be empty or undefined."
                reject({ message: valid });
                return;
            }

            // MAKE CHANGES FOR DUE DATE & START DATE
            if (object.startDate && object.startDate.length) {
                object.startDate = new Date(object.startDate);
            }
            if (object.DueDate && object.DueDate.length) {
                object.dueDateDeadLine = object.dueDateDeadLine.map((x) => new Date(x.date));
                object.DueDate = new Date(object.DueDate);
            }

            let data;
            if (isUpdate || id !== null) {
                data = [{
                    _id: id
                }, {...object}]
            } else {
                data = {...object}
            }

            data.CompanyId = new mongoose.Types.ObjectId(data.CompanyId);
            data.ProjectID = new mongoose.Types.ObjectId(data.ProjectID);
            let objSchema = {
                type: SCHEMA_TYPE.TASKS,
                data: data
            }

            MongoDbCrudOpration(companyId, objSchema, isUpdate ? 'updateOne' : 'save')
                .then((response) => {
                    resolve({ status: true, id: isUpdate? id : response._id, message: "Task created successfully." });
                    const historyObj = {
                        message: `<b>${userData.Employee_Name}</b> has created new <b>${object.TaskName}</b> ${object.TaskType.replace(/_/g, '-')}.`,
                        key: "Task_Created",
                        sprintId: object.sprintId,
                        mainChat: object?.mainChat || false
                    }
                    exports.HandleHistory('task', companyId, object.ProjectID, isUpdate? id : response._id, historyObj, userData)
                    .catch((error) => {
                        reject(error);
                    })
                    exports.HandleHistory('project',companyId, object.ProjectID, null, historyObj, userData)
                    .catch((error) => {
                        reject(error);
                    })
                }).catch(error => {
                    reject(error);
                })
        } catch (error) {
            reject(error);
        }
    })
}

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

exports.convertToSubTaskFunction = (companyId, projectData, sprintId, convertTask, task, oldProject, isMainSubTask,isSubTask,userData) => {
    return new Promise((resolve, reject) => {
        try {
            let deleteObj = {
                type: SCHEMA_TYPE.TASKS,
                data: [
                    {
                        _id: new mongoose.Types.ObjectId(convertTask._id)
                    },
                    {
                        $set: {deletedStatusKey : 1}
                    },
                ]
            }
            MongoDbCrudOpration(companyId, deleteObj, "updateOne").then(() => {
                let obj = {
                    isParentTask: false,
                    ParentTaskId: task._id,
                    subTasks: 0,
                    deletedStatusKey : 0
                };
                let unsetObj = {}
                if (convertTask.sprintId !== task.sprintId && JSON.parse(JSON.stringify(convertTask)).ProjectID === JSON.parse(JSON.stringify(task)).ProjectID) {
                    obj = {
                        ...obj,
                        sprintId: task.sprintId,
                        sprintArray: task.sprintArray,
                    }
                    if(task.folderObjId){
                        obj.folderObjId = task.folderObjId;
                    }else{
                        if(convertTask.folderObjId){
                            unsetObj = {
                                folderObjId:''
                            }
                            delete convertTask.folderObjId;
                        }
                    }
                }
                else if (JSON.parse(JSON.stringify(convertTask)).ProjectID !== JSON.parse(JSON.stringify(task)).ProjectID) {
                    let Ind = oldProject.taskStatusData.findIndex((x) => { return x.key === convertTask.statusKey });
                    let typeInd = oldProject.taskTypeCounts.findIndex((x) => { return x.value === convertTask.TaskType });
                    statusData = oldProject.taskStatusData[Ind];
                    typeData = oldProject.taskTypeCounts[typeInd];
                    obj = {
                        ...obj,
                        ProjectID: task.ProjectID,
                        sprintId: task.sprintId,
                        sprintArray: task.sprintArray,
                        status: {
                            key: statusData.convertStatus.key,
                            value: '',
                            text: statusData.convertStatus.name,
                            type: statusData.convertStatus.type
                        },
                        statusType: statusData.convertStatus.type,
                        statusKey: statusData.convertStatus.key,
                        TaskType: typeData.convertType.value,
                        TaskTypeKey: typeData.convertType.key
                    }
                    if(task.folderObjId){
                        obj.folderObjId = task.folderObjId;
                    }else{
                        if(convertTask.folderObjId){
                            unsetObj = {
                                folderObjId:''
                            }
                            delete convertTask.folderObjId;
                        }
                    }
                } else {
                    obj = {
                        ...obj,
                    }
                }
                let queryObj = {
                    type: SCHEMA_TYPE.TASKS,
                    data: [
                        {
                            _id: new mongoose.Types.ObjectId(convertTask._id)
                        },
                        {
                            $set: {...obj},
                            $unset: unsetObj
                        },
                    ]
                }
                MongoDbCrudOpration(companyId, queryObj, "updateOne").then(() => {
                    /*When a subtask is converted to another subtask within a parent task, and a subtask is removed, the count of the parent task is reduced.*/
                    if (isMainSubTask === true) {
                        let object = {
                            type:SCHEMA_TYPE.TASKS,
                            data: [
                                { _id: new mongoose.Types.ObjectId(convertTask.ParentTaskId) },
                                {$inc: {"subTasks": -1}}
                            ]
                        }
                        MongoDbCrudOpration(companyId, object, "updateOne")
                    }
                    /*When a task is converted into  asubtask, at that moment, if a subtask is added to the selected task, the count needs to be increased.*/
                    let object = {
                        type:SCHEMA_TYPE.TASKS,
                        data: [
                            { _id: new mongoose.Types.ObjectId(task._id) },
                            {$inc: {"subTasks": 1}}
                        ]
                    }
                    MongoDbCrudOpration(companyId, object, "updateOne")
                    // update comment count
                    exports.removeCommentCount(companyId,projectData.id,convertTask.sprintId,convertTask._id,convertTask.ParentTaskId).catch((error) => {
                        logger.error(`${error} ERROR IN REMOVE COMMENT COUNT`);
                    })
                    resolve({ status: true, statusText: "Converted in to subtask successfully"});
                    if(convertTask.isParentTask === true){
                        const historyObj = {
                            key: "Task_Convert_To_SubTask",
                            sprintId: sprintId,
                            mainChat: false
                        }
                        if(convertTask.sprintId === task.sprintId){
                            historyObj.message = `<b>${userData.Employee_Name}</b> has converted the <b>${convertTask.TaskName}</b> task to subtask of <b>${task.TaskName}</b> task ${isSubTask === true ? '<b>with all its sub tasks</b>' : ''}.`
                        }else if(convertTask.sprintId !== task.sprintId && JSON.parse(JSON.stringify(convertTask))?.ProjectID === JSON.parse(JSON.stringify(task))?.ProjectID){
                            historyObj.message = `<b>${userData.Employee_Name}</b> has converted the <b>${convertTask.TaskName}</b> task of <b>(${convertTask.folderObjId ?  convertTask.sprintArray.folderName + '/' : ''}${convertTask.sprintArray.name})</b> sprint to subtask of <b>${task.TaskName}</b> task <b>(${task.folderObjId ? task.sprintArray.folderName + '/'  : ''}${task.sprintArray.name})</b>${isSubTask === true ? '<b>with all its sub tasks</b>' : ''}.`
                        }else{
                            historyObj.message = `<b>${userData.Employee_Name}</b> has converted the <b>${convertTask.TaskName}</b> task of <b>(${oldProject.ProjectName}${convertTask.folderObjId ? '/' + convertTask.sprintArray.folderName : ''}/${convertTask.sprintArray.name})</b> sprint to subtask of <b>${task.TaskName}</b> task <b>(${projectData.ProjectName}${task.folderObjId ? '/' + task.sprintArray.folderName : ''}/${task.sprintArray.name})</b> ${isSubTask === true ? '<b>with all its sub tasks</b>' : ''}.`
                        }
                        exports.HandleHistory('task', companyId, projectData.id, convertTask._id, historyObj, userData);
                    }
                    if(convertTask.sprintId !== task.sprintId || JSON.parse(JSON.stringify(convertTask)).ProjectID !== JSON.parse(JSON.stringify(task)).ProjectID){
                        const incObj = {
                            body: {
                                companyId: companyId,
                                projectId: task.ProjectID,
                                updateObject: {$inc: {tasks: 1}},
                                folderId: task?.folderObjId,
                            },
                            params : {
                                id: task.sprintId
                            }
                        }
                        updateSprintFun(incObj).catch((error) => {
                            logger.error(`error in update task count : ${error}`)
                        });
                        const decObj = {
                            body: {
                                companyId: companyId,
                                projectId: convertTask.ProjectID,
                                updateObject: {$inc: {tasks: -1}},
                                folderId: convertTask?.folderObjId || null,
                            },
                            params : {
                                id: convertTask.sprintId
                            }
                        }
                        updateSprintFun(decObj).catch((error) => {
                            logger.error(`error in update task count : ${error}`)
                        });
                    }
                }).catch((error) => {
                    reject(error);
                })
            })
        } catch (error) {
            reject(error);
        }
    })
}

exports.moveTaskFunction = (companyId, projectData, sprintObj, moveTask, oldSprintObj, oldProject,assignee,watcher,userData,isSubTask) => {
    return new Promise((resolve, reject) => {
        try {
            let deleteObj = {
                type: SCHEMA_TYPE.TASKS,
                data: [
                    {
                        _id: new mongoose.Types.ObjectId(moveTask._id)
                    },
                    {
                        $set: {deletedStatusKey : 1}
                    },
                ]
            }
            MongoDbCrudOpration(companyId, deleteObj, "updateOne").then(() => {
                let obj = {};
                let unsetObj = {}
                if (JSON.parse(JSON.stringify(moveTask.ProjectID)) !== JSON.parse(JSON.stringify(projectData.id))) {
                    let Ind = oldProject.taskStatusData.findIndex((x) => { return x.key === moveTask.statusKey });
                    let typeInd = oldProject.taskTypeCounts.findIndex((x) => { return x.value === moveTask.TaskType });
                    statusData = oldProject.taskStatusData[Ind];
                    typeData = oldProject.taskTypeCounts[typeInd];
                    obj = {
                        ProjectID: projectData.id,
                        sprintId: sprintObj.id,
                        sprintArray: sprintObj,
                        status: {
                            key: statusData.convertStatus.key,
                            value: '',
                            text: statusData.convertStatus.name,
                            type: statusData.convertStatus.type
                        },
                        statusType: statusData.convertStatus.type,
                        statusKey: statusData.convertStatus.key,
                        TaskType: typeData.convertType.value,
                        TaskTypeKey: typeData.convertType.key,
                        deletedStatusKey : 0,
                    }
                    if(sprintObj.folderId){
                        obj.folderObjId = sprintObj.folderId;
                    }else{
                        if(moveTask.folderObjId){
                            delete moveTask.folderObjId;
                            unsetObj = {
                                folderObjId:''
                            }
                        }
                    }
                }
                else {
                    obj = {
                        ProjectID: new mongoose.Types.ObjectId(moveTask.ProjectID),
                        sprintId: new mongoose.Types.ObjectId(sprintObj.id),
                        sprintArray: sprintObj,
                        deletedStatusKey: 0,
                    }
                    if(sprintObj.folderId){
                        obj.folderObjId = sprintObj.folderId;
                    }else{
                        if(moveTask.folderObjId){
                            unsetObj = {
                                folderObjId:''
                            }
                            delete moveTask.folderObjId;
                        }
                    }
                }
                obj.AssigneeUserId = assignee || [];
                obj.watchers = watcher || [];
                let queryObj = {
                    type: SCHEMA_TYPE.TASKS,
                    data: [
                        {
                            _id: new mongoose.Types.ObjectId(moveTask._id)
                        },
                        {
                            $set: {...obj},
                            $unset: unsetObj
                        },
                    ]
                }
                const historyObj = {
                    key: "Task_Moved",
                    sprintId: sprintObj.id,
                    mainChat: false
                }
                if(JSON.parse(JSON.stringify(moveTask))?.ProjectID !== projectData.id){
                    historyObj.message = `<b>${userData.Employee_Name}</b> has moved <b>${moveTask.TaskName}</b> task from <b>(${oldProject.ProjectName}${oldSprintObj.folderId ? '/' + oldSprintObj.folderName : ''}/${oldSprintObj.name})</b> to <b>(${projectData.ProjectName}${sprintObj.folderId ? '/' + sprintObj.folderName : ''}/${sprintObj.name})</b> project ${isSubTask === true ? '<b>with all its sub tasks</b>' : ''}.`
                }else{
                    historyObj.message = `<b>${userData.Employee_Name}</b> has moved <b>${moveTask.TaskName}</b> task from <b>(${oldSprintObj.folderId ?  oldSprintObj.folderName + '/' : ''}${oldSprintObj.name})</b> to <b>(${sprintObj.folderId ? sprintObj.folderName + '/'  : ''}${sprintObj.name})</b> sprint ${isSubTask === true ? '<b>with all its sub tasks</b>' : ''}.`
                }
                exports.HandleHistory('task', companyId, projectData.id, moveTask._id, historyObj, userData);
                MongoDbCrudOpration(companyId, queryObj, "updateOne").then(() => {
                    resolve({ status: true, statusText: "MOVE" });

                    exports.updateCommentCollection(companyId, moveTask,sprintObj,projectData).catch((err) => { logger.error(`${err},ERROR IN ADD COMMENTS IN SUBTASK`); })
                    if(moveTask.ProjectID !== projectData.id){
                        exports.updateHistoryCollection(companyId, moveTask,projectData).catch((err) => { logger.error(`${err},ERROR IN ADD HISTORY IN SUBTASK`); })
                    }
                    exports.removeCommentCount(companyId,oldProject.id,oldSprintObj.id,moveTask._id,moveTask.ParentTaskId).catch((error) => {
                        logger.error(`${error} ERROR IN REMOVE COMMENT COUNT`);
                    })
                    const incObj = {
                        body: {
                            companyId: companyId,
                            projectId: projectData.id,
                            updateObject :{$inc: { tasks: 1}},
                            folderId: sprintObj?.folderId || null,
                        },
                        params : {
                            id : sprintObj.id
                        }
                    }
                    updateSprintFun(incObj).catch((error) => {
                        logger.error(`error in update task count : ${error}`)
                    });
                    const decObj = {
                        body: {
                            companyId: companyId,
                            projectId: oldProject.id,
                            updateObject :{$inc: { tasks: -1}},
                            folderId: oldSprintObj?.folderId || null,
                        },
                        params : {
                            id : oldSprintObj.id
                        }
                    }
                    updateSprintFun(decObj).catch((error) => {
                        logger.error(`error in update task count : ${error}`)
                    });
                }).catch((error)=>{
                    logger.error(`${error} ERROR IN MONGO QUERY`);
                })
            })
        } catch (error) {
            reject(error);
        }
    })
}

exports.convertToListSubTask = (companyId, projectData, subTask, sprintObj, oldSprintObj) => {
    return new Promise((resolve, reject) => {
        try {
            let sprintObjData = sprintObj;
            let sprintId = sprintObjData._id
            let sprintName = sprintObjData.name;
            let parseSubTask = JSON.parse(JSON.stringify(subTask))
            let obj = {
                ...parseSubTask,
                sprintId: sprintId,
                sprintArray: {
                    id: sprintId,
                    name: sprintName,
                    value: sprintName.replace(/\s/g, "_").toUpperCase(),
                },
                ParentTaskId: '',
                isParentTask: true,
            }
            let unsetObj = {};
            if (sprintObjData.folderId !== undefined && sprintObjData?.folderId) {
                obj.sprintArray.folderId = sprintObjData.folderId,
                obj.sprintArray.folderName = sprintObjData.folderName
                obj.folderObjId = sprintObjData.folderId
            }else{
                if(parseSubTask.folderObjId){
                    unsetObj = {
                        folderObjId:''
                    }
                    delete parseSubTask.folderObjId;
                }
            }

            const schema = SCHEMA_TYPE.TASKS
            const query = {
                type: schema,
                data: [
                    { _id: new mongoose.Types.ObjectId(parseSubTask._id) },
                    { 
                        $set: { ...obj } ,
                        $unset: unsetObj
                    },
                ]
            }
            MongoDbCrudOpration(companyId, query, "updateOne").then(() => {
                exports.removeCommentCount(companyId,projectData,oldSprintObj.id,parseSubTask._id).catch((error) => {
                    logger.error(`${error} ERROR IN REMOVE COMMENT COUNT`);
                })
                resolve();
                const decObj = {
                    body: {
                        companyId: companyId,
                        projectId: projectData.id,
                        folderId: oldSprintObj?.folderId || null,
                        updateObject :{$inc: { tasks: -1}},
                    },
                    params : {
                        id : oldSprintObj.id
                    }
                }
                updateSprintFun(decObj).catch((error) => {
                    logger.error(`error in update task count : ${error}`)
                });
                const incObj = {
                    body: {
                        companyId: companyId,
                        projectId: projectData.id,
                        folderId: sprintObj?.folderId || null,
                        updateObject :{$inc: { tasks: 1}},
                    },
                    params : {
                        id : sprintId
                    }
                }
                updateSprintFun(incObj).catch((error) => {
                    logger.error(`error in update task count : ${error}`)
                });
            }).catch((error) => {
                console.log(error,"ERROR")
            });
        } catch (error) {
            reject(error);
        }
    })
}

exports.mergeSubTask = (companyId, subTask, mergeTask, projectData, oldProject) => {
    return new Promise((resolve, reject) => {
        try {
            let obj;
            if (subTask.ProjectID !== mergeTask.ProjectID) {
                let Ind = oldProject.taskStatusData.findIndex((x) => { return x.key === subTask.statusKey });
                let typeInd = oldProject.taskTypeCounts.findIndex((x) => { return x.value === subTask.TaskType });
                statusData = oldProject.taskStatusData[Ind];
                typeData = oldProject.taskTypeCounts[typeInd];
                obj = {
                    sprintId: mergeTask.sprintId,
                    sprintArray: {
                        id: mergeTask.sprintId,
                        name: mergeTask.sprintArray.name,
                        value: mergeTask.sprintArray.value,
                    },
                    ParentTaskId: mergeTask.isParentTask === true ? mergeTask._id : mergeTask.ParentTaskId,
                    ProjectID: mergeTask.ProjectID,
                    status: {
                        key: statusData.convertStatus.key,
                        value: '',
                        text: statusData.convertStatus.name,
                        type: statusData.convertStatus.type
                    },
                    statusType: statusData.convertStatus.type,
                    statusKey: statusData.convertStatus.key,
                    TaskType: typeData.convertType.value,
                    TaskTypeKey: typeData.convertType.key,
                }
            } else {
                obj = {
                    sprintId: mergeTask.sprintId,
                    sprintArray: {
                        id: mergeTask.sprintId,
                        name: mergeTask.sprintArray.name,
                        value: mergeTask.sprintArray.value,
                    },
                    ParentTaskId: mergeTask.isParentTask === true ? mergeTask._id : mergeTask.ParentTaskId,
                    ProjectID: mergeTask.ProjectID,
                }
            }
            let queryObj = {
                type: SCHEMA_TYPE.TASKS,
                data: [
                    {
                        _id: new mongoose.Types.ObjectId(subTask._id)
                    },
                    {
                        $set: {...obj}
                    },
                ]
            }
            MongoDbCrudOpration(companyId,queryObj,"updateOne").then(() => {
                resolve({ status: true, statusText: "Sub Task merged Succesfully" });
                let mergeId = mergeTask.isParentTask === true ? mergeTask._id : mergeTask.ParentTaskId;
                let incObj = {
                    type: SCHEMA_TYPE.TASKS,
                    data: [
                        { _id: new mongoose.Types.ObjectId(mergeId) },
                        {$inc: {"subTasks": 1}}
                    ]
                }
                MongoDbCrudOpration(companyId,incObj,"updateOne").catch((err) => {
                    logger.error(`ERROR in ${err}`);
                })
                if(subTask.sprintId !== mergeTask.sprintId || JSON.parse(JSON.stringify(subTask)).ProjectID !== JSON.parse(JSON.stringify(mergeTask)).ProjectID){
                    const incCountObj = {
                        body: {
                            companyId: companyId,
                            projectId: mergeTask.ProjectID,
                            folderId: mergeTask?.folderObjId || null,
                            updateObject :{$inc: { tasks: 1}},
                        },
                        params : {
                            id : mergeTask.sprintId
                        }
                    }
                    updateSprintFun(incCountObj).catch((error) => {
                        logger.error(`error in update task count : ${error}`)
                    });
                    const decObj = {
                        body: {
                            companyId: companyId,
                            projectId: oldProject.id,
                            folderId: subTask?.folderObjId || null,
                            updateObject :{$inc: { tasks: -1}},
                        },
                        params : {
                            id : subTask.sprintId
                        }
                    }
                    updateSprintFun(decObj).catch((error) => {
                        logger.error(`error in update task count : ${error}`)
                    });
                }
                exports.removeCommentCount(companyId,projectData.id,subTask.sprintId,subTask._id).catch((error) => {
                    logger.error(`${error} ERROR IN REMOVE COMMENT COUNT`);
                })
            }).catch((err) => {
                logger.error(`ERROR in merge task ${err}`);
            })
        } catch (error) {
            reject(error);
        }
    })
}

exports.duplicateSubTaskFunction = (companyId, projectData, sprintObj, subtask, parentId, userData, oldProject, duplicateData) => {
    return new Promise((resolve, reject) => {
        try {
            let obj = {};
            let parsedMap = JSON.parse(JSON.stringify(subtask))
            if (JSON.parse(JSON.stringify(subtask))?.ProjectID !== projectData.id) {
                let Ind = oldProject.taskStatusData.findIndex((x) => { return x.key === subtask.statusKey });
                let typeInd = oldProject.taskTypeCounts.findIndex((x) => { return x.value === subtask.TaskType });
                let statusData = oldProject.taskStatusData[Ind];
                let typeData = oldProject.taskTypeCounts[typeInd];
                obj = {
                    ...parsedMap,
                    ProjectID: projectData.id,
                    sprintId: sprintObj.id,
                    sprintArray: sprintObj,
                    status: JSON.stringify({
                        key: statusData.convertStatus.key,
                        value: '',
                        text: statusData.convertStatus.name,
                        type: statusData.convertStatus.type
                    }),
                    statusType: statusData.convertStatus.type,
                    statusKey: statusData.convertStatus.key,
                    TaskType: typeData.convertType.value,
                    TaskTypeKey: typeData.convertType.key,
                    AssigneeUserId: [],
                    ParentTaskId: parentId,
                    attachments: duplicateData.includes('Attachments') && subtask.attachments ? subtask.attachments || [] : [],
                    DueDate: duplicateData.includes('Due Date') && subtask.DueDate !== undefined && subtask.DueDate !== null ? new Date(subtask.DueDate) || null : null,
                    dueDateDeadLine: duplicateData.includes('Due Date') && subtask.dueDateDeadLine && subtask.dueDateDeadLine.length ? subtask.dueDateDeadLine.map((x) => ({ date: x && x.date ? new Date(x.date) : '' })) : [],
                    checklistArray: duplicateData.includes('Checklists') && subtask.checklistArray ? subtask.checklistArray : [],
                    startDate: subtask.startDate !== undefined ? new Date(subtask.startDate) || null : null,
                }
            } else {
                obj = {
                    ...parsedMap,
                    ProjectID: subtask.ProjectID,
                    sprintId: sprintObj.id,
                    sprintArray: sprintObj,
                    ParentTaskId: parentId,
                    AssigneeUserId: [],
                    attachments: duplicateData.includes('Attachments') && subtask.attachments ? subtask.attachments : [],
                    DueDate: duplicateData.includes('Due Date') && subtask.DueDate !== undefined && subtask.DueDate !== null ? new Date(subtask.DueDate) || null : null,
                    dueDateDeadLine: duplicateData.includes('Due Date') && subtask.dueDateDeadLine && subtask.dueDateDeadLine.length ? subtask.dueDateDeadLine.map((x) => ({ date: x && x.date ? new Date(x.date) : '' })) : [],
                    checklistArray: duplicateData.includes('Checklists') && subtask.checklistArray ? subtask.checklistArray : [],
                    startDate: subtask.startDate !== undefined ? new Date(subtask.startDate) || null : null,
                }
            }
            if(sprintObj.folderId){
                obj.folderObjId = sprintObj.folderId;
            }else{
                delete obj.folderObjId;
            }
            delete obj._id;
            let object = {
                type:SCHEMA_TYPE.PROJECTS,
                data: [
                    { _id : new mongoose.Types.ObjectId(obj.ProjectID)},
                    {$inc: {
                        'taskTypeCounts.$[elementIndex].taskCount': 1,
                        lastTaskId:1
                    }},
                    {
                        arrayFilters: [
                            { "elementIndex.key": obj.TaskTypeKey}
                        ],
                        new: true
                    }
                ]
            }
            MongoDbCrudOpration(companyId, object, "findOneAndUpdate").then((response) => {
                obj.TaskKey = projectData.ProjectCode + '-' +  response.lastTaskId;
                exports.HandleTask(companyId, obj, false, null, userData).then((taskResult) => {
                    let updateObject = {
                        $inc: { tasks: 1}
                    }
                    const countObj = {
                        body: {
                            companyId: companyId,
                            projectId: projectData.id,
                            updateObject :updateObject
                        },
                        params : {
                            id :obj.sprintId
                        }
                    }
                    if(obj.folderObjId){
                        countObj.body.folder = {
                            folderId: obj.folderObjId,
                            folderName: obj.sprintArray.folderName
                        }
                    }

                    updateSprintFun(countObj).catch((error) => {
                        logger.error(`error in update task count : ${error}`)
                    });
                    resolve({ status: true, statusText: "Duplicate Task Added"});
                    try {
                        if (duplicateData.includes('Activity')) {
                            exports.addHistoryCollection(companyId, projectData, subtask, taskResult, sprintObj).catch((err) => { logger.error(`${err},ERROR IN ADD HISTORY IN SUBTASK`); })
                        }
                        if (duplicateData.includes('Comments')) {
                            exports.addCommentCollection(companyId, projectData, subtask, taskResult, sprintObj)
                            .catch((err) => { logger.error(`${err},ERROR IN ADD COMMENTS IN SUBTASK`); })
                        }
                    } catch (error) {
                        reject()
                        logger.error(`${error}ERROR add comment and Activity collection`);
                    }
                }).catch((error) => {
                    logger.error(`${error}ERROR in create task`);
                    reject(error)
                })
            }).catch((err) => {
                reject(err)
            })
        } catch (error) {
            reject(error);
        }
    })
}

exports.addHistoryCollection = (companyId, projectData, task, newTaskData, sprintObj) => {
    return new Promise(async (resolve, reject) => {
        try {
            let promisesArr = [];
            const history = await MongoDbCrudOpration(companyId, {type: SCHEMA_TYPE.HISTORY,data: [{TaskId : task._id}]}, "find").then((querySnapshot) => {
                if (querySnapshot.length == 0) {
                    return [];
                } else {
                    return querySnapshot;
                }
            })
            history.forEach(async (data) => {
                if (data.Key !== 'Task_Created') {
                    promisesArr.push(
                        new Promise(async (resolve1, reject1) => {
                            try {
                                const utcDateTime = DateTime.utc();
                                const obj = {
                                    'Type': data.Type,
                                    'Key': data.Key,
                                    'UserId': data.UserId,
                                    'ProjectId': projectData.id,
                                    'TaskId': newTaskData.id,
                                    'Message': data.Message,
                                    createdAt:utcDateTime.ts,
                                    updatedAt:utcDateTime.ts,
                                }
                                let queryObj = {
                                    type: SCHEMA_TYPE.HISTORY,
                                    data: obj
                                }
                                MongoDbCrudOpration(companyId, queryObj, "save").then(() => {
                                    resolve1({ status: true });
                                })
                                .catch((error) => {
                                    reject1({ status: false, error: error });
                                })
                            } catch (error) {
                                reject1(error)
                            }
                        })
                    )
                }
            });
            Promise.allSettled(promisesArr).then(() => {
                resolve({ 'status': true, statusText: 'Added HISTORY'});
            }).catch((error) => {
                reject(error);
            })
        } catch (error) {
            reject(error);
        }
    })
}

exports.addCommentCollection = (companyId, projectData, task, newTask, sprintObj) => {
    return new Promise(async (resolve, reject) => {
        try {
            let promisesArr = [];
            const comments = await MongoDbCrudOpration(companyId, {type: SCHEMA_TYPE.COMMENTS,data: [{taskId : task._id}]}, "find").then((querySnapshot) => {
                if (querySnapshot.length === 0) {
                    return [];
                } else {
                    return querySnapshot;
                }
            })
            comments.forEach((cmt) => {
                let parsedMap = JSON.parse(JSON.stringify(cmt))
                promisesArr.push(
                    new Promise(async (resolve1, reject1) => {
                        try {
                            const obj = {
                                ...parsedMap,
                                taskId: new mongoose.Types.ObjectId(newTask.id),
                                sprintId: new mongoose.Types.ObjectId(sprintObj.id),
                                projectId: new mongoose.Types.ObjectId(projectData.id)
                            }
                            delete obj._id;
                            objSchema = {
                                type:SCHEMA_TYPE.COMMENTS,
                                data : obj
                            }
                            await MongoDbCrudOpration(companyId, objSchema, "save").then((response) => {
                                resolve1({ status: true });
                            })
                            .catch((error) => {
                                reject1({ status: false, error: error });
                            })
                        } catch (error) {
                            reject1(error)
                        }
                    })
                );
                Promise.allSettled(promisesArr).then(() => {
                    resolve({ 'status': true, statusText: 'Added COMMENTS' });
                }).catch((error) => {
                    reject(error);
                })
            })
        } catch (error) {
            reject(error);
        }
    })
}

exports.updateCommentCollection = (companyId,task,sprintObj,newProjectData) => {
    return new Promise((resolve,reject) => {
        try {
            let obj = {
                type: SCHEMA_TYPE.COMMENTS,
                data: [
                    {
                        sprintId : new mongoose.Types.ObjectId(task.sprintId),
                        taskId: new mongoose.Types.ObjectId(task._id)
                    },
                    {
                        sprintId : new mongoose.Types.ObjectId(sprintObj.id),
                        projectId : new mongoose.Types.ObjectId(newProjectData.id)
                    },
                    { timestamps: false }
                ]
            }
            MongoDbCrudOpration(companyId,obj,"updateMany").then(() => {
                resolve();
            }).catch((error) => {
                logger.error(`${error}ERROR IN UPDATE COMMENTS`);
            })
        } catch (error) {
            reject(error)
        }
    })
}

exports.removeCommentCount = (companyId,projectId,sprintId,taskId,parentTaskId = '') => {
    return new Promise((resolve,reject) => {
        try {
            const sprintFieldName = `sprint_${projectId}_${sprintId}_comments`;
            const taskFieldName = `task_${projectId}_${sprintId}_${taskId}_comments`;
            let parentTaskField = ``;
            if(parentTaskId !== '') {
                parentTaskField = `parentTask_${projectId}_${sprintId}_${parentTaskId}_comments`
            }
            let obj = {
                type: "userId",
                data: [{
                    [taskFieldName]: {
                        $gte: 0
                    }
                }]
            }
            MongoDbCrudOpration(companyId,obj,"find").then((responsee) => {
                if(responsee.length > 0){
                    let obj = {
                        type: "userId",
                        data: [{
                            [taskFieldName]: {
                                $gte: 0
                            }
                        }, {
                            $unset: {
                                [taskFieldName]: ""
                            }
                        }]
                    }
                    MongoDbCrudOpration(companyId,obj,"updateMany").catch((error) => {
                        logger.error(`${error} ERROR IN MONGO QUERY`);
                    })
                    responsee.forEach((x) => {
                        let prevCount = x[taskFieldName] || 0;
                        updateSprintCount(companyId,[x], taskFieldName, sprintFieldName, parentTaskField, -prevCount, () => {
                            resolve(true);
                        })
                    })
                }else{
                    resolve(true);
                }
            })
        } catch (error) {
            reject(error)
        }
    })
}

exports.updateHistoryCollection = (companyId,task,newProjectData) => {
    return new Promise((resolve,reject) => {
        try {
            let obj = {
                type: SCHEMA_TYPE.HISTORY,
                data: [
                    {
                        TaskId: new mongoose.Types.ObjectId(task._id)
                    },
                    {
                        ProjectId : newProjectData.id   
                    },
                    { timestamps: false }
                ]
            }
            MongoDbCrudOpration(companyId,obj,"updateMany").then(() => {
                resolve();
            }).catch((error) => {
                logger.error(`${error}ERROR IN UPDATE COMMENTS`);
            })
        } catch (error) {
            reject(error)
        }
    })
}