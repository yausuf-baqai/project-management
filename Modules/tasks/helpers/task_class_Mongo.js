const { addUpdateDocument} = require("../../../utils/firebase_queries")
const { dbCollections } = require('../../../Config/firebaseCollections')
const { HandleHistory, changeDateFormat, HandleTask,convertToSubTaskFunction, moveTaskFunction, convertToListSubTask,mergeSubTask, duplicateSubTaskFunction, addHistoryCollection, addCommentCollection, removeCommentCount} = require("./mongo_helper")

const { updateDocument} = require('../../../utils/typesense_queries')
const { createTask, taskAssigneeAdd, taskAssigneeRemove,taskAssigneeReplace, taskNameEdit, taskPriorityChange, taskStatusChange, taskDescriptionAdd, taskDescriptionChange, taskAttachmentAdd, taskAttachmentRemove } = require('./notificationTemplate')
const { HandleBothNotification } = require("./handleNotification")
const admin = require('firebase-admin');
const logger = require("../../../Config/loggerConfig")
const db = admin.firestore();
const { addSprintFun, updateSprintFun } = require("../../sprints/controller")
const { SCHEMA_TYPE } = require('../../../Config/schemaType');
const { MongoDbCrudOpration } = require("../../../utils/mongo-handler/mongoQueries");
const { default: mongoose } = require("mongoose")
class Task {
    create({data, user, projectData ,indexObj}) {
        return new Promise((resolve,reject) => {
            try {
                // CHECK VALIDATION IF ANY
                HandleTask(projectData.CompanyId, data, false, data.id || null, user , indexObj)
                .then((taskResult) => {
                    resolve(taskResult);

                   // UPDATE TASK COUNT IN SPRINT 
                    let updateObject = {
                        $inc: { tasks: 1}
                    }
                    const countObj = {
                        body: {
                            companyId: projectData.CompanyId,
                            projectId: projectData._id,
                            updateObject :updateObject
                        },
                        params : {
                            id :data.sprintId
                        }
                    }
                    if(data.folderObjId){
                        countObj.body.folder = {
                            folderId: data.folderObjId,
                            folderName: data.sprintArray.folderName
                        }
                    }

                    updateSprintFun(countObj).catch((error) => {
                        logger.error(`error in update task count : ${error}`)
                    });

                    if(!data.isParentTask) {
                        // UPDATE SUBTASK COUNT IF SUB TASK CREATED
                        let obj = [
                            {
                                _id: new mongoose.Types.ObjectId(data.ParentTaskId)
                            }, {
                                $inc: {
                                    subTasks: 1
                                }
                            }
                        ]
                        let objSchema = {
                            type: data?.mainChat ? SCHEMA_TYPE.MAIN_CHATS : SCHEMA_TYPE.TASKS,
                            data: obj
                        }

                        MongoDbCrudOpration(projectData.CompanyId, objSchema, 'updateOne').catch(error => {
                            logger.error(`ERROR in update parent task: ${projectData?._id||data?.ProjectID}> ${data.id} : ${error.message}`);
                        })
                    }

                    this.updateTaskKey({
                        companyId: projectData.CompanyId,
                        projectCode: projectData.ProjectCode,
                        projectId: data.ProjectID,
                        taskId: taskResult.id,
                        taskTypeKey: data.TaskTypeKey,
                        sprintId: data.sprintId,
                        mainChat: data?.mainChat || false,
                        isParentTask: data.isParentTask,
                        indexObj: indexObj,
                    })
                    .catch((error) => {
                        logger.error(`ERROR in update task key: ${error.message}`);
                    })

                    if(data?.mainChat) return;

                    let taskObj = {
                        'ProjectName' : projectData.ProjectName,
                        'newTaskname' : data.TaskName
                    }
                    let notificationObject = {
                        'message': createTask(taskObj),
                        'key': 'task_create',
                    }
                    let changeData = {
                        'ProjectName' : projectData.ProjectName,
                        'taskName' : data.TaskName,
                        "previousDiscriptionText":"",
                        "textSimple":`${data.TaskName} task created`
                    };
                    HandleBothNotification({
                        type:'tasks',
                        userData: user,
                        companyId: projectData.CompanyId,
                        projectId: data.ProjectID,
                        taskId: taskResult.id,
                        folderId: data.folderObjId || "",
                        sprintId: data.sprintId,
                        object: notificationObject,
                        "changeType":"task-create",
                        "changeData":changeData
                    })
                    .catch((error) => {
                        logger.error(`ERROR in notification Task Create: ${error.message}`);
                    })
                })
                .catch((error) => {
                    reject(error)
                })
            } catch (error) {
                reject(error)
            }
        });
    }

    /* -------------- UPDATE KANBAN INDEX FUNCTION FOR TASK -----------------*/

    updateIndex({indexType, indexValue, project, sprintId, taskId}) {
        return new Promise((resolve,reject) => {
            try {
                const updateObj = {
                    [indexType]: indexValue
                }
                addUpdateDocument(`${project.CompanyId}/${project.CompanyId}/${dbCollections.PROJECTS}/${project.id}/${sprintId}/${taskId}`, {
                    ...updateObj,
                    Updated_At: new Date()
                })
                .then(() => {
                    resolve({status: true, statusText: "Index updated successfully"});
                    let collectionName = `${project.CompanyId+"_"+dbCollections.TASKS}`
                    updateDocument({collectionName, data: updateObj, docId: taskId}).then(() => {
                    }).catch((error) => {
                        let data = {
                            type : 'task',
                            companyId: project.CompanyId,
                            projectId: project.id,
                            taskId: taskId,
                            sprintId: sprintId
                        }
                        addUpdateDocument(`${project.CompanyId}/${project.CompanyId}/${dbCollections.UPDATE_TYPESENCE_REPO}`, data)
                        .catch((error) => {
                            logger.error(`ERROR in update Index : ${error.message}`);
                        })
                        logger.error(`ERROR in update Index : ${error.message}`);
                    })
                })
                .catch((error) => {
                    logger.error(`ERROR in update Index : ${error.message}`);
                    reject(error)
                })
            } catch (error) {
                logger.error(`ERROR in update Index : ${error.message}`);
                reject(error)
            }
        })
    }

    /* -------------- UPDATE DUE DATE FUNCTION FOR TASK -----------------*/

    updateDueDate({commonDateFormatString ,firebaseObj, project, task, obj,userData, isUpdateTask}) {
        return new Promise((resolve,reject) => {
            try {
                // MAKE CHANGES FOR DUE DATE
                if (isUpdateTask === false) {
                    if (obj && Object.keys(obj).length > 0) {
                        HandleBothNotification({
                            type:'tasks',
                            userData,
                            companyId: project.CompanyId,
                            projectId: project._id,
                            taskId: task._id,
                            folderId: task.folderObjId || "",
                            sprintId: task.sprintId,
                            object: obj
                        })
                        .catch((error) => {
                            logger.error(`ERROR in notification Update Due Date: ${error.message}`);
                        })
                    }
                    var historyObj = {};
                    historyObj.key = "Project_DueDate";
                    historyObj.message = `<b>${userData.Employee_Name}</b> has added <b> Due Date</b> as <b>${changeDateFormat(firebaseObj.DueDate, commonDateFormatString)}</b>.`;
                    historyObj.sprintId = task.sprintId;
                    HandleHistory('task',project.CompanyId, project._id,task._id,historyObj, userData).
                    catch((error) => {
                        logger.error(`ERROR in task history : ${error.message}`);
                    });
                    resolve({status: true, statusText: "Priority updated successfully"});
                } else {
                    firebaseObj.dueDateDeadLine = firebaseObj.dueDateDeadLine.map((x) => ({date: new Date(x.date)}));
                    firebaseObj.DueDate = firebaseObj.DueDate === null ? null : new Date(firebaseObj.DueDate);

                    let object = {
                        type: SCHEMA_TYPE.TASKS,
                        data: [{ _id: new mongoose.Types.ObjectId(task._id) },{
                            $set: { ...firebaseObj },
                            $unset: {
                                groupByDueDateIndex: ''
                            },
                        }]
                    }
                    MongoDbCrudOpration(project.CompanyId,object, "updateOne")
                    .then(() => {
                        resolve({status: true, statusText: "Due Date updated successfully"});
    
                        if (obj && Object.keys(obj).length > 0) {
                            HandleBothNotification({
                                type:'tasks',
                                userData,
                                companyId: project.CompanyId,
                                projectId: project._id,
                                taskId: task._id,
                                folderId: task.folderObjId || "",
                                sprintId: task.sprintId,
                                object: obj
                            })
                            .catch((error) => {
                                logger.error(`ERROR in notification Update Due Date: ${error.message}`);
                            })
                        }
                        var historyObj = {};
                        historyObj.key = "Project_DueDate";
                        historyObj.message = `<b>${userData.Employee_Name}</b> has added <b> Due Date</b> as <b>${changeDateFormat(firebaseObj.DueDate, commonDateFormatString)}</b>.`;
                        historyObj.sprintId = task.sprintId;
                        HandleHistory('task',project.CompanyId, project._id,task._id,historyObj, userData).
                        catch((error) => {
                            logger.error(`ERROR in task history : ${error.message}`);
                        });
                    })
                    .catch((error) => {
                        logger.error(`ERROR in task history : ${error.message}`);
                        reject(error)
                    })
                }
            } catch (error) {
                logger.error(`ERROR in task history : ${error.message}`);
                reject(error)
            }
        })
    }

    /* -------------- UPDATE Start DATE FUNCTION FOR TASK -----------------*/

    updateStartDate({commonDateFormatString ,firebaseObj, project, task, obj,userData,isUpdateTask = true}) {
        return new Promise((resolve,reject) => {
            try {
                // MAKE CHANGES FOR START DATE
                if (isUpdateTask == false) {
                    if (obj && Object.keys(obj).length > 0) {
                        HandleBothNotification({
                            type:'tasks',
                            userData,
                            companyId: project.CompanyId,
                            projectId: project._id,
                            taskId: task._id,
                            folderId: task.folderObjId || "",
                            sprintId: task.sprintId,
                            object: obj
                        })
                        .catch((error) => {
                            logger.error(`ERROR in update Start Date : ${error.message}`);
                        })
                    }
                    var historyObj = {};
                    historyObj.key = "Project_DueDate";
                    historyObj.message = `<b>${userData.Employee_Name}</b> has added <b> Start Date</b> as <b>${changeDateFormat(firebaseObj.startDate, commonDateFormatString)}</b>.`;
                    historyObj.sprintId = task.sprintId;
                    HandleHistory('task',project.CompanyId, project._id,task._id,historyObj, userData).
                    catch((error) => {
                        logger.error(`ERROR in update Start Date update hostory : ${error.message}`);
                    });
                } else {
                    firebaseObj.startDate = new Date(firebaseObj.startDate);

                    let object = {
                        type:SCHEMA_TYPE.TASKS,
                        data: [
                            { _id: new mongoose.Types.ObjectId(task._id) },
                            { ...firebaseObj }
                        ]
                    }
                    MongoDbCrudOpration(project.CompanyId,object, "updateOne")
                    .then(() => {
                        resolve({status: true, statusText: "Start Date updated successfully"});
    
                        if (obj && Object.keys(obj).length > 0) {
                            HandleBothNotification({
                                type:'tasks',
                                userData,
                                companyId: project.CompanyId,
                                projectId: project._id,
                                taskId: task._id,
                                folderId: task.folderObjId || "",
                                sprintId: task.sprintId,
                                object: obj
                            })
                            .catch((error) => {
                                logger.error(`ERROR in update Start Date : ${error.message}`);
                            })
                        }
                        var historyObj = {};
                        historyObj.key = "Project_DueDate";
                        historyObj.message = `<b>${userData.Employee_Name}</b> has added <b> Start Date</b> as <b>${changeDateFormat(firebaseObj.startDate, commonDateFormatString)}</b>.`;
                        historyObj.sprintId = task.sprintId;
                        HandleHistory('task',project.CompanyId, project._id,task._id,historyObj, userData).
                        catch((error) => {
                            logger.error(`ERROR in update Start Date update hostory : ${error.message}`);
                        });
                    })
                    .catch((error) => {
                        logger.error(`ERROR in update Start Date : ${error.message}`);
                        reject(error)
                    })
                }
            } catch (error) {
                logger.error(`ERROR in update Start Date : ${error.message}`);
                reject(error)
            }
        })
    }

    /* -------------- UPDATE STATUS FUNCTION FOR TASK -----------------*/

    updateStatus({newStatus, prevStatus, projectData, task, userData, isUpdateTask}) {
        return new Promise((resolve,reject) => {
            try {
                if (isUpdateTask === false) {
                    resolve({status: true, statusText: "Status updated successfully"});
                    let obj = {
                        'ProjectName': projectData.ProjectName,
                        'taskName': prevStatus.taskName,
                        'backColor': prevStatus.backColor,
                        'color': prevStatus.color,
                        'statusName': prevStatus.statusName,
                        'bgColor': prevStatus.bgColor,
                        'textColor': prevStatus.textColor,
                        'newStatusName': newStatus.status.text
                    }
                    let notificationObject = {
                        message: taskStatusChange(obj),
                        key: "task_status",
                        projectId: projectData._id,
                        taskId: prevStatus.taskId,
                        sprintId: task.sprintId
                    }
                    if (notificationObject && Object.keys(notificationObject).length > 0 && prevStatus.updatedTaskName !== prevStatus.name) {
                        HandleBothNotification({
                            type:'tasks',
                            userData,
                            companyId: projectData.CompanyId,
                            projectId:projectData._id,
                            taskId:prevStatus.taskId,
                            folderId: task.folderObjId || "",
                            sprintId:task.sprintId,
                            object:notificationObject,
                            changeType:'status',
                            changeData: obj
                        })
                        .catch((error) => {
                            logger.error(`ERROR in notification Task Status: ${error.message}`);
                        })
                    }

                    let historyObj = {};
                    historyObj.key = "Task_Status";
                    historyObj.message = `<b>${userData.Employee_Name}</b> has changed <b> Status</b> as <b>${prevStatus.updatedTaskName}</b>.`;
                    historyObj.sprintId = task.sprintId;
                    if (historyObj !== null && Object.keys(historyObj).length > 0) {
                        HandleHistory('task',projectData.CompanyId, projectData._id,prevStatus.taskId,historyObj, userData).then(async () => {})
                        .catch((error) => {
                            logger.error(`ERROR in task status update history : ${error.message}`);
                        })
                    }
                } else {
                    const query = {
                        type: dbCollections.TASKS,
                        data: [
                            {
                                _id: new mongoose.Types.ObjectId(prevStatus.taskId)
                            }, {
                                $set: {
                                    ...newStatus,
                                },
                                $unset: {
                                    groupByStatusIndex: 1
                                }
                            }
                        ]
                    }

                    MongoDbCrudOpration(projectData.CompanyId, query, "updateOne")
                    .then(() => {
                        resolve({status: true, statusText: "Status updated successfully"});

                        let obj = {
                            'ProjectName': projectData.ProjectName,
                            'taskName': prevStatus.taskName,
                            'backColor': prevStatus.backColor,
                            'color': prevStatus.color,
                            'statusName': prevStatus.statusName,
                            'bgColor': prevStatus.bgColor,
                            'textColor': prevStatus.textColor,
                            'newStatusName': newStatus.status.text
                        }
                        let notificationObject = {
                            message: taskStatusChange(obj),
                            key: "task_status",
                            projectId: projectData._id,
                            taskId: prevStatus.taskId,
                            sprintId: task.sprintId
                        }
                        if (notificationObject && Object.keys(notificationObject).length > 0 && prevStatus.updatedTaskName !== prevStatus.name) {
                            HandleBothNotification({
                                type:'tasks',
                                userData,
                                companyId: projectData.CompanyId,
                                projectId:projectData._id,
                                taskId:prevStatus.taskId,
                                folderId: task.folderObjId || "",
                                sprintId:task.sprintId,
                                object:notificationObject,
                                changeType:'status',
                                changeData: obj
                            })
                            .catch((error) => {
                                logger.error(`ERROR in notification Task Status: ${error.message}`);
                            })
                        }
    
                        let historyObj = {};
                        historyObj.key = "Task_Status";
                        historyObj.message = `<b>${userData.Employee_Name}</b> has changed <b> Status</b> as <b>${prevStatus.updatedTaskName}</b>.`;
                        historyObj.sprintId = task.sprintId;
                        if (historyObj !== null && Object.keys(historyObj).length > 0) {
                            HandleHistory('task',projectData.CompanyId, projectData._id,prevStatus.taskId,historyObj, userData).then(async () => {})
                            .catch((error) => {
                                logger.error(`ERROR in task status update history : ${error.message}`);
                            })
                        }
                    })
                    .catch((error) => {
                        logger.error(`ERROR in task status update history : ${error.message}`);
                        reject(error)
                    })
                }
            } catch (error) {
                logger.error(`ERROR in task status update history : ${error.message}`);
                reject(error)
            }
        })
    }

    /* -------------- UPDATE PRIORITY FUNCTION FOR TASK -----------------*/

    updatePriority({firebaseObj ,projectData ,taskData ,priorityObj, userData,isUpdateTask}) {
        return new Promise((resolve,reject) => {
            try {
                if (isUpdateTask === false) {
                    resolve({status: true, statusText: "Priority updated successfully"});
                    let notificationObj = {
                        'ProjectName' : projectData?.ProjectName,
                        'taskName' : priorityObj?.taskName,
                        'statusImage' : priorityObj?.statusImage,
                        'priorityName' : priorityObj?.priorityName,
                        'newStatusImage' : priorityObj?.newStatusImage,
                        'newPriorityName' : priorityObj?.newPriorityName
                    };
                    let notificationObject = {
                        key: "task_priority",
                        message : taskPriorityChange(notificationObj),
                    };
                  
                     if(notificationObject && Object.keys(notificationObject).length > 0 && priorityObj.newPriorityName !== priorityObj.priorityName) {
                        HandleBothNotification({
                            type:'tasks',
                            userData,
                            companyId: projectData.CompanyId,
                            projectId:projectData._id,
                            taskId:priorityObj.taskId,
                            folderId: taskData.folderObjId || "",
                            sprintId:taskData.sprintId,
                            object:notificationObject,
                            changeType:'priority',
                            changeData: notificationObj
                        })
                        .catch((error) => {
                            logger.error(`ERROR in notification Task Priority: ${error.message}`);
                        });
                    }

                    let historyObj = {
                        key: "task_priority",
                        message : `<b>${userData.Employee_Name}</b> has changed <b> Priority</b> as <b>${priorityObj.newPriorityName}</b>.`,
                        sprintId: taskData.sprintId
                    };
                    HandleHistory('task',projectData.CompanyId, projectData._id,priorityObj.taskId,historyObj, userData).then(async () => {});
                } else {
                    const query = {
                        type: dbCollections.TASKS,
                        data: [
                            {
                                _id: new mongoose.Types.ObjectId(priorityObj.taskId)
                            }, {
                                $set: {
                                    ...firebaseObj,
                                },
                                $unset: {
                                    groupByPriorityIndex: 1
                                }
                            }
                        ]
                    }

                    MongoDbCrudOpration(projectData.CompanyId, query, "updateOne")
                    .then(() => {

                        resolve({status: true, statusText: "Priority updated successfully"});
                        let notificationObj = {
                            'ProjectName' : projectData?.ProjectName,
                            'taskName' : priorityObj?.taskName,
                            'statusImage' : priorityObj?.statusImage,
                            'priorityName' : priorityObj?.priorityName,
                            'newStatusImage' : priorityObj?.newStatusImage,
                            'newPriorityName' : priorityObj?.newPriorityName
                        };
                        let notificationObject = {
                            key: "task_priority",
                            message : taskPriorityChange(notificationObj),
                        };
                     
                         if(notificationObject && Object.keys(notificationObject).length > 0 && priorityObj.newPriorityName !== priorityObj.priorityName) {
                            HandleBothNotification({
                                type:'tasks',
                                userData,
                                companyId: projectData.CompanyId,
                                projectId:projectData._id,
                                taskId:priorityObj.taskId,
                                folderId: taskData.folderObjId || "",
                                sprintId:taskData.sprintId,
                                object:notificationObject,
                                changeType:'priority',
                                changeData: notificationObj
                            })
                            .catch((error) => {
                                logger.error(`ERROR in notification Task Priority: ${error.message}`);
                            });
                        }

                        let historyObj = {
                            key: "task_priority",
                            message : `<b>${userData.Employee_Name}</b> has changed <b> Priority</b> as <b>${priorityObj.newPriorityName}</b>.`,
                            sprintId: taskData.sprintId
                        };
                        HandleHistory('task',projectData.CompanyId, projectData._id,priorityObj.taskId,historyObj, userData).then(async () => {});
                    })
                    .catch((error) => {
                        logger.error(`ERROR in task status: ${error.message}`);
                        reject(error)
                    })
                }
            } catch (error) {
                logger.error(`ERROR in task status : ${error.message}`);
                reject(error)
            }
        })
    }

    /* -------------- UPDATE TASK NAME FUNCTION -----------------*/

    updateTaskName({firebaseObj,projectData ,taskData , obj, userData}) {
        return new Promise((resolve,reject) => {
            try {
                const query = {
                    type: dbCollections.TASKS,
                    data: [
                        {
                            _id: new mongoose.Types.ObjectId(taskData._id)
                        }, {
                            $set: {
                                ...firebaseObj
                            }
                        }
                    ]
                }
                MongoDbCrudOpration(projectData.CompanyId, query, "updateOne")
                .then(() => {
                    resolve({status: true, statusText: "Task name updated successfully"});

                    let editTaskObj = {
                        'ProjectName' : projectData.ProjectName,
                        'previousTaskName' : obj.previousTaskName,
                        'TaskName' : firebaseObj.TaskName
                    } 
                    let notificationObject = {
                        key: "task_edit",
                        message : taskNameEdit(editTaskObj),
                    };
                    if(notificationObject && Object.keys(notificationObject).length > 0) {
                        HandleBothNotification({
                            type:'tasks',
                            userData,
                            companyId: projectData.CompanyId,
                            projectId:projectData._id,
                            taskId:taskData._id,
                            folderId: taskData.folderObjId || "",
                            sprintId:taskData.sprintId,
                            object:notificationObject,
                            changeType:'name',
                            changeData: editTaskObj
                        })
                        .catch((error) => {
                            logger.error(`ERROR in notification: ${error.message}`);
                        });
                    }
                    let historyObj = {
                        key: "task_name_edit",
                        message : `<b>${obj.userName}</b> has changed <b> Task name</b> from <b>${obj.previousTaskName}</b> to <b>${firebaseObj.TaskName}</b>.`,
                        sprintId: taskData.sprintId
                    };
                    HandleHistory('task',projectData.CompanyId, projectData._id,taskData._id,historyObj, userData).then(async () => {});
                })
                .catch((error) => {
                    logger.error(`ERROR in task Name update : ${error.message}`);
                    reject(error)
                })
            } catch (error) {
                logger.error(`ERROR in task Name update : ${error.message}`);
                reject(error)
            }
        })
    }

    /* -------------- UPDATE ASSIGNEE ADD OR ASSIGNEE REMOVE FUNCTION FOR TASK -----------------*/

    updateAssignee({firebaseObj,projectData ,taskData,employeeName,type,userData,isUpdateTask}) {
        return new Promise((resolve,reject) => {
            try {
                if (isUpdateTask === false) {
                    let obj = {
                        'ProjectName' : projectData.ProjectName,
                        'TaskName' : taskData.TaskName,
                        'Employee_Name' : (type === 'replace') ? employeeName && Array.isArray(employeeName) ? employeeName.join(",") : employeeName : employeeName
                    }
                    var notificationObject = {};
                    var historyObj = {};
                    if(type === "assigneeAdd"){
                            notificationObject = {
                            message: taskAssigneeAdd(obj),
                            key: "task_assignee",
                        };
                        historyObj.key = "Assignee_Changed";
                        historyObj.message = `<b>${userData.Employee_Name}</b> has added the <b>${employeeName}</b> to <b>Assignee</b>.`;
                    }
                    if(type === "assigneRemove"){
                        notificationObject = {
                            message: taskAssigneeRemove(obj),
                            key: "task_assignee",
                        };
                        historyObj.key = "Assignee_Removed";
                        historyObj.message = `<b>${userData.Employee_Name}</b> has removed the <b>${employeeName}</b> to <b>Assignee</b>.`;
                    }
                    if (type === "replace") {
                        if (firebaseObj.AssigneeUserId.length) {     
                            notificationObject = {
                                message: taskAssigneeReplace(obj),
                                key: "task_assignee",
                            };
                            historyObj.key = "Assignee_Changed";
                            historyObj.message = `<b>${userData.Employee_Name}</b> has has added the <b>${employeeName}</b> to <b>Assignee</b>.`;
                        } else {
                            notificationObject = {
                                message: taskAssigneeRemove(obj),
                                key: "task_assignee",
                            };
                            historyObj.key = "Assignee_Removed";
                            historyObj.message = `<b>${userData.Employee_Name}</b> has removed the <b>${employeeName}</b> to <b>Assignee</b>.`;
                        }
                    }
                    historyObj.sprintId = taskData.sprintId;
                    if(notificationObject && Object.keys(notificationObject).length > 0) {
                        HandleBothNotification({
                            type:'tasks',
                            userData,
                            companyId: projectData.CompanyId,
                            projectId:projectData._id,
                            taskId:taskData._id,
                            folderId:taskData.folderObjId || "",
                            sprintId:taskData.sprintId,
                            object:notificationObject
                        })
                        .catch((error) => {
                            logger.error(`ERROR in notification: ${error.message}`);
                        });
                    }
                    HandleHistory('task',projectData.CompanyId, projectData._id,taskData._id,historyObj, userData)
                    .catch((error) => {
                        logger.error(`ERROR in history: ${error.message}`);
                    });
                    resolve({status: true, statusText: "Priority updated successfully"});
                } else {
                    if(type !== "assigneeAdd" && type !== "assigneRemove" && type !== "replace") {
                        reject(new Error("Invalid type"))
                        return;
                    }
                    let uid = firebaseObj.AssigneeUserId;
                    let object = {
                        type: dbCollections.TASKS,
                        data: [
                            {
                                _id : taskData._id
                            }
                        ]
                    }

                    MongoDbCrudOpration(projectData.CompanyId,object, "findOne").then((response) => {
                        let updateTask = true;
                        if (!response) {
                            throw new Error("Task document does not exist!");
                        }
                        let assigneeUserId = response.AssigneeUserId || [];

                        let mongoUpdateObj = {}

                        if(type === "assigneeAdd") {
                            mongoUpdateObj = {
                                $addToSet: {AssigneeUserId: firebaseObj.AssigneeUserId}
                            }
                        } else if (type === "replace") {
                            mongoUpdateObj = {
                                $set: {AssigneeUserId: firebaseObj.AssigneeUserId}
                            }
                        } else {
                            mongoUpdateObj = {
                                $pull: {AssigneeUserId: firebaseObj.AssigneeUserId}
                            }
                        }

                        if(updateTask) {
                            let object = {
                                type: SCHEMA_TYPE.TASKS,
                                data: [
                                    { _id: new mongoose.Types.ObjectId(taskData._id) },
                                    {
                                        ...mongoUpdateObj,
                                        $unset: {
                                            groupByAssigneeIndex: ''
                                        },
                                    }
                                ]
                            }
                            MongoDbCrudOpration(projectData.CompanyId,object, "updateOne").then(() => {
                                resolve({status: true, statusText: "Assignee updated successfully"});
                                try {
                                    this.updateWatcher({companyId : projectData.CompanyId, projectId: projectData._id, sprintId: taskData.sprintId, taskId: taskData._id, userId: uid, add: type === "assigneeAdd", type: type,userData:userData,employeeName:employeeName})
                                    .catch((error) => {
                                        logger.error("ERROR in update watcher:", error);
                                    })
                                } catch (error) {
                                    logger.error("ERROR in update watcher:", error);
                                }
                                let obj = {
                                    'ProjectName' : projectData.ProjectName,
                                    'TaskName' : taskData.TaskName,
                                    'Employee_Name' : (type === 'replace') ? employeeName && Array.isArray(employeeName) ? employeeName.join(",") : employeeName : employeeName
                                }
                                var notificationObject = {};
                                var historyObj = {};
                                if(type === "assigneeAdd"){
                                        notificationObject = {
                                        message: taskAssigneeAdd(obj),
                                        key: "task_assignee",
                                    };
                                    historyObj.key = "Assignee_Changed";
                                    historyObj.message = `<b>${userData.Employee_Name}</b> has added the <b>${employeeName}</b> to <b>Assignee</b>.`;
                                }
                                if(type === "assigneRemove"){
                                    notificationObject = {
                                        message: taskAssigneeRemove(obj),
                                        key: "task_assignee",
                                    };
                                    historyObj.key = "Assignee_Removed";
                                    historyObj.message = `<b>${userData.Employee_Name}</b> has removed the <b>${employeeName}</b> to <b>Assignee</b>.`;
                                }
                                if (type === "replace") {
                                    if (firebaseObj.AssigneeUserId.length) {     
                                        notificationObject = {
                                            message: taskAssigneeReplace(obj),
                                            key: "task_assignee",
                                        };
                                        historyObj.key = "Assignee_Changed";
                                        historyObj.message = `<b>${userData.Employee_Name}</b> has has added the <b>${employeeName}</b> to <b>Assignee</b>.`;
                                    } else {
                                        notificationObject = {
                                            message: taskAssigneeRemove(obj),
                                            key: "task_assignee",
                                        };
                                        historyObj.key = "Assignee_Removed";
                                        historyObj.message = `<b>${userData.Employee_Name}</b> has removed the <b>${employeeName}</b> to <b>Assignee</b>.`;
                                    }
                                }
                                historyObj.sprintId = taskData.sprintId;
                                if(notificationObject && Object.keys(notificationObject).length > 0) {
                                    HandleBothNotification({
                                        type:'tasks',
                                        userData,
                                        companyId: projectData.CompanyId,
                                        projectId:projectData._id,
                                        taskId:taskData._id,
                                        folderId:taskData.folderObjId || "",
                                        sprintId:taskData.sprintId,
                                        object:notificationObject
                                    })
                                    .catch((error) => {
                                        logger.error(`ERROR in notification: ${error.message}`);
                                    });
                                }
                                HandleHistory('task',projectData.CompanyId, projectData._id,taskData._id,historyObj, userData)
                                .catch((error) => {
                                    logger.error(`ERROR in history: ${error.message}`);
                                });
                            })
                            return assigneeUserId;
                        } else {
                            return false;
                        }
                    })
                }
            } catch (error) {
                reject(error)
            }
        })
    }

    /* -------------- (AUTO RUN ON TASK CREATE) UPDATE TASK KEY -----------------*/
    updateTaskKey({companyId, projectCode, projectId, taskId, taskTypeKey, sprintId, mainChat = false,isParentTask=true , indexObj = {}}) {
        return new Promise((resolve, reject) => {
            try {
                let obj = [
                    {
                        _id: projectId
                    },
                    {
                        $inc: {
                            'taskTypeCounts.$[elementIndex].taskCount': 1,
                            lastTaskId:1
                        }
                    },
                    {
                        arrayFilters: [
                            { "elementIndex.key": taskTypeKey}
                        ],
                        returnNewDocument: true
                    }
                ]
                let objSchema = {
                    type: mainChat ? SCHEMA_TYPE.MAIN_CHATS : SCHEMA_TYPE.PROJECTS,
                    data: obj
                }
                MongoDbCrudOpration(companyId, objSchema, 'findOneAndUpdate').then(async(res)=>{
                    let taskObj;
                    if (isParentTask) {
                        taskObj = [
                            {
                                _id: taskId
                            },
                            {
                                $set: {
                                    TaskKey: `${projectCode}-${res.lastTaskId+1}`,
                                    [indexObj.indexName]:  await this.updateTaskIndex(companyId,projectId,taskId,indexObj,`${projectCode}-${res.lastTaskId+1}`,sprintId)
                                }
                            }
                        ]
                    } else {
                        taskObj = [
                            {
                                _id: taskId
                            },
                            {
                                $set: {
                                    TaskKey: `${projectCode}-${res.lastTaskId+1}`
                                }
                            }
                        ]
                    }
                    let objSh = {
                        type: SCHEMA_TYPE.TASKS,
                        data: taskObj
                    }
                    MongoDbCrudOpration(companyId, objSh, 'updateOne').then(()=>{
                        resolve();
                    }).catch((error)=>{
                        reject(error)
                    })
                }).catch(error => {
                    reject(error);
                })
            } catch (error) {
                reject(error);
            }
        })
    }

    /* -------------- UPDATE TASK WATCHER -----------------*/
    updateWatcher({companyId, projectId, sprintId, taskId, userId, add, userData, employeeName}) {
        return new Promise((resolve, reject) => {
            try {
                const schema = SCHEMA_TYPE.TASKS
                let queryObj = {};
                let queryFilter;

                if (add) {
                    queryObj.$addToSet = { watchers: userId };
                    queryFilter = { _id: new mongoose.Types.ObjectId(taskId) };
                } else {
                    // Update the 'name' of the specific object in the 'settings' array matching the given 'key'
                    queryFilter = {
                        _id: new mongoose.Types.ObjectId(taskId),
                    };
                    queryObj.$pull = { watchers: userId };
                };

                let obj = {
                    type: schema,
                    data: [
                        queryFilter,
                        queryObj,
                        { upsert: true }
                    ]
                }

                MongoDbCrudOpration(companyId, obj, "updateOne").then((response) => {
                    resolve({status: true, statusText: `Watcher updated successfully `});
                    var historyObj = {};
                    if(add === true){
                        historyObj.key = "Watcher_Changed";
                        historyObj.message = `<b>${userData.Employee_Name}</b> has added the <b>${employeeName}</b> to <b>Watcher</b>.`;
                    }
                    if(add === false){
                        historyObj.key = "Watcher_Removed";
                        historyObj.message = `<b>${userData.Employee_Name}</b> has removed the <b>${employeeName}</b> to <b>Watcher</b>.`;
                    }
                    HandleHistory('task',companyId, projectId,taskId,historyObj, userData)
                    .catch((error) => {
                        logger.error(`ERROR in history: ${error}`);
                    });
                });
            } catch (error) {
                reject(error);
            }
        })
    }

    /* -------------- UPDATE TAGS -----------------*/
    updateTags({companyId, projectId, sprintId, taskId, tagId, operation}) {
        return new Promise((resolve, reject) => {
            try {

                if(!operation) {
                    reject(new Error("Please provide an operation"));
                    return;
                } else if(!['add', 'remove'].includes(operation)) {
                    reject(new Error("Please provide a valid operation"));
                    return;
                }

                const schema = SCHEMA_TYPE.TASKS
                let queryObj = {};
                let queryFilter;

                if (operation === "add") {
                    queryFilter = { _id: new mongoose.Types.ObjectId(taskId) };
                    queryObj.$addToSet = { tagsArray: tagId };
                } else {
                    queryFilter = { _id: new mongoose.Types.ObjectId(taskId) };
                    queryObj.$pull = { tagsArray: tagId };
                };

                let obj = {
                    type: schema,
                    data: [
                        queryFilter,
                        queryObj,
                        { upsert: true }
                    ]
                }

                MongoDbCrudOpration(companyId, obj, "updateOne").then((response) => {
                    resolve({status: true, statusText: `Tag updated successfully`});
                });

            } catch (error) {
                reject(error);
            }
        })
    }

    /* -------------- UPDATE CHECKLISTS -----------------*/
    updateChecklists({companyId, projectId, sprintId, taskId, id = "", operation, data = {}}) {
        return new Promise((resolve, reject) => {
            try {
                let taskRef = db.collection(companyId).doc(companyId).collection(dbCollections.PROJECTS).doc(projectId).collection(sprintId).doc(taskId)

                db.runTransaction((transaction) => {
                    return transaction.get(taskRef).then((doc) => {
                        if (!doc.exists) {
                            reject(new Error("No document exists!"));
                            return;
                        }

                        let checklistArray = doc.data().checklistArray;

                        let updateObj = {};

                        if(operation === "add") {
                            updateObj = {
                                checklistArray: [...checklistArray, data],
                                Updated_At: new Date()
                            }
                        } else if(operation === "edit") {
                            let checkListIndex = checklistArray.findIndex(checklist => checklist.id === id);

                            if(checkListIndex !== -1) {
                                checklistArray[checkListIndex] = {...checklistArray[checkListIndex], ...data};

                                updateObj = {
                                    checklistArray,
                                    Updated_At: new Date()
                                }
                            }
                        } else if(operation === "remove") {
                            updateObj = {
                                checklistArray: checklistArray.filter((x) => x.id !== id),
                                Updated_At: new Date()
                            }
                        }

                        transaction.update({
                            ...updateObj
                        })
                        .then(() => {
                            resolve({status: true, statusText: "Checklist updated successfully"});
                            updateDocument({
                                collectionName: `${companyId}_${dbCollections.TASKS}`,
                                docId: taskId,
                                data: {
                                    ...updateObj,
                                    Updated_At: new Date().getTime()/1000
                                }
                            })
                            .catch((error) => {
                                logger.error("ERROR in update checklist: "+ JSON.stringify(error));
                            })
                        })
                        .catch((error) => {
                            reject(error);
                        })
                    })
                })
                .catch((error) => {
                    reject(error)
                })
            } catch (error) {
                reject(error);
            }
        })
    }

    /* -------------- UPDATE ATTACHMENTS -----------------*/
    updateAttachments({companyId, sprintId, taskId, taskData, id = "", operation, data = {}, userData, projectData}) {
        return new Promise((resolve, reject) => {
            try {

                const schema = SCHEMA_TYPE.TASKS
                let queryObj = {};
                let queryFilter;

                if (operation === 'add') {
                    queryObj.$push = { attachments: data };
                    queryFilter = { _id: new mongoose.Types.ObjectId(taskId) };
                } else {
                    // Update the 'name' of the specific object in the 'settings' array matching the given 'key'
                    queryFilter = { 
                        _id: new mongoose.Types.ObjectId(taskId),
                    };
                    queryObj.$pull = { attachments: { id: data.id } };
                };

                let obj = {
                    type: schema,
                    data: [
                        queryFilter,
                        queryObj,
                        { upsert: true }
                    ]
                }

                MongoDbCrudOpration(companyId, obj, "updateOne").then((response) => {
                    resolve({status: true, statusText: "Attachment updated successfully"});

                    let historyObj = {};
                    let notificationObject = {};
                    if(operation === "add") {
                        historyObj = {
                            message: `<b>${userData.name}</b> has attached <b>${data.filename}</b> on <b>${taskData.TaskName}</b>.`,
                            key: "Task_Attachment",
                            sprintId: taskData.sprintId,
                        }
                        notificationObject = {
                            message: taskAttachmentAdd({
                                'ProjectName': projectData.ProjectName,
                                'TaskName': taskData.TaskName,
                                'url': data.filename
                            }),
                            key: "task_attachments",
                        }
                    } else if(operation === "remove") {
                        historyObj = {
                            message: `<b>${data.filename}</b> removed from <b>${taskData.TaskName}</b>&apos;s attchments.`,
                            key: "Task_Attachment_Remove",
                            sprintId: taskData.sprintId,
                        }
                        notificationObject = {
                            'message': taskAttachmentRemove({
                                'ProjectName': projectData.ProjectName,
                                'TaskName': taskData.TaskName,
                                'removeFileName': data.filename
                            }),
                            'key': 'task_attachments',
                        }
                    }
                    HandleHistory('task',companyId, projectData.id, taskId, historyObj, userData).catch((error) => {
                        logger.error("ERROR in update Attachment handle history: "+ JSON.stringify(error));
                    })

                    if(notificationObject && Object.keys(notificationObject).length > 0) {
                        HandleBothNotification({
                            type: 'tasks',
                            companyId,
                            projectId: projectData.id,
                            taskId: taskId,
                            folderId: taskData.folderObjId || "",
                            sprintId: taskData.sprintId,
                            object: notificationObject,
                            userData: userData
                        })
                        .catch((error) => {
                            logger.error("ERROR in update Attachment handle notification: "+ JSON.stringify(error));
                        })
                    }
                })
                .catch((error) => {
                    reject(error)
                })
            } catch (error) {
                reject(error);
            }
        })
    }

    /* -------------- UPDATE DESCRIPTION -----------------*/
    updateDescription({companyId, projectData, sprintId, task, userData, text}) {
        return new Promise((resolve, reject) => {
            try {
                let description = text.blocks;
                const schema = SCHEMA_TYPE.TASKS
                let obj = {
                    type: schema,
                    data: [
                        {
                            _id: new mongoose.Types.ObjectId(task._id)
                        },
                        { 
                            descriptionBlock: description,
                            rawDescription: text.text
                        }
                    ]
                }

                MongoDbCrudOpration(companyId, obj, "updateOne").then(() => {
                    resolve({status: true, statusText: "Description updated successfully"});

                    let textSimple = text.text
                    let previousDiscriptionText = typeof task.description === 'object' ? task.description.text.replace(/<[^>]*>/g, "") : task.rawDescription;
                    let historyObj = {};
                    let notificationObject = {
                        'key': 'task_description'
                    }
                    let Descobj = {
                        'ProjectName': projectData.ProjectName,
                        'TaskName': task.TaskName,
                        'textSimple': textSimple,
                        'previousDiscriptionText': previousDiscriptionText
                    }
                    if (previousDiscriptionText === undefined) {
                        historyObj.message = `Description of <b>${task.TaskName
                            }</b> is added as <b title="${textSimple}" class="inline-text-ellipsis">"${textSimple.length > 20 ? textSimple.slice(0, 20) + "..." : textSimple
                            }"</b>.`;
                        historyObj.key = "Task_Description_Added";
                        notificationObject.message = taskDescriptionAdd(Descobj);
                    } else {
                        historyObj.message = `Description of <b>${task.TaskName
                            }</b> is changed from <b title="${previousDiscriptionText}" class="inline-text-ellipsis">"${previousDiscriptionText.length > 20
                                ? previousDiscriptionText.slice(0, 20) + "..."
                                : previousDiscriptionText
                            }"</b> to <b title="${textSimple}" class="inline-text-ellipsis">"${textSimple.length > 20 ? textSimple.slice(0, 20) + "..." : textSimple
                            }"</b>.`;
                        historyObj.key = "Task_Description_Changed";
                        notificationObject.message = taskDescriptionChange(Descobj);
                    }
                    historyObj.sprintId = task.sprintId;

                    HandleHistory('task', companyId, projectData.id, task._id, historyObj, userData).catch((error) => {
                        logger.error("ERROR in update Description handle history: "+ JSON.stringify(error));
                    })
                    if (notificationObject !== null && Object.keys(notificationObject).length > 0 && previousDiscriptionText !== textSimple) {
                        HandleBothNotification({ 
                            type: 'tasks',
                            companyId, 
                            projectId: projectData.id, 
                            taskId: task._id, 
                            folderId: task.folderObjId || "", 
                            sprintId: task.sprintId, 
                            object: notificationObject,
                            userData: userData,
                            changeType:'description',
                            changeData: Descobj
                        }).catch(async (error) => {logger.error(`ERROR in notification: ${error.message}`); });
                    }
                })
            } catch (error) {
                logger.error(`Update Discription Error:${error.message}`)
                reject(error);
            }
        })
    }

    updateArchiveDelete({companyId, projectData, sprintId, task, userData, deletedStatusKey = 0}) {
        return new Promise((resolve, reject) => {
            try {
                const query = {
                    type: dbCollections.TASKS,
                    data: [
                        {
                            _id: new mongoose.Types.ObjectId(task._id)
                        }, {
                            $set: {
                                deletedStatusKey
                            },
                        }
                    ]
                }
                MongoDbCrudOpration(companyId, query, "updateOne")
                .then(() => {
                    try {
                        if(task?.ParentTaskId) {
                            if(!deletedStatusKey || (!task?.deletedStatusKey && deletedStatusKey) ) {
                                this.updateParentCount(
                                    companyId,
                                    task.ParentTaskId,
                                    !deletedStatusKey ? 1 : -1
                                );
                            }
                        }
                        if(task?.isParentTask) {
                            let filterBy = {ParentTaskId: task._id};
                            let taskDeleteStatusKey = 0;
                            if(!deletedStatusKey) {
                                filterBy = {...filterBy, deletedStatusKey :{$eq: 3}};
                                taskDeleteStatusKey = 0;
                            } else {
                                filterBy = {...filterBy, deletedStatusKey :{$eq: 0}};
                                if(deletedStatusKey === 2) {
                                    taskDeleteStatusKey = 3
                                } else if(deletedStatusKey === 1) {
                                    taskDeleteStatusKey = 1
                                }
                            }

                            const batchQyery = {
                                type: dbCollections.TASKS,
                                data: [
                                    {
                                        ...filterBy
                                    }, {
                                        $set: {
                                            deletedStatusKey: taskDeleteStatusKey
                                        },
                                    }
                                ]
                            }
                            MongoDbCrudOpration(companyId, batchQyery, "updateMany")
                            .catch((error) => {
                                logger.error(`ERORR in update parent count: ${error.message}`);
                            })
                        }
                    } catch (error) {
                        logger.error(`ERORR in update parent count: ${error.message}`);
                    }
                    resolve({status: true, statusText: "deleteStatus updated successfully"});
                    let updateObject = {};

                    if(deletedStatusKey === 2) {
                        updateObject = { $inc: { archiveTaskCount : task.isParentTask ? (task.subTasks || 0) + 1 : 1, tasks : task.isParentTask ? -1 * ((task.subTasks || 0) + 1) : -1} }
                    } else if (deletedStatusKey === 0) {
                        updateObject= { $inc: { archiveTaskCount: task.isParentTask ? -1 * ((task.subTasks || 0) + 1) : -1, tasks : task.isParentTask ? (task.subTasks || 0) + 1 : 1}
                        }
                    } else if (deletedStatusKey === 1) {
                        if(task.deletedStatusKey === 2){
                            updateObject= { $inc: { archiveTaskCount: task.isParentTask ? -1 * ((task.subTasks || 0) + 1) : -1} }
                        }else{
                            updateObject= { $inc: { tasks : task.isParentTask ? -1 * ((task.subTasks || 0) + 1) : -1} }
                        }
                    }
                    const countObj = {
                        body: {
                            companyId: companyId,
                            projectId: projectData._id,
                            updateObject :updateObject
                        },
                        params : {
                            id : sprintId
                        }
                    }
                    if(task.folderObjId){
                        countObj.body.folder = {
                            folderId: task.folderObjId,
                            folderName: task.sprintArray.folderName || ""
                        }
                    }

                    updateSprintFun(countObj).catch((error) => {
                        logger.error(`error in update task count : ${error}`)
                    });
                    removeCommentCount(companyId,task.ProjectID,task.sprintId,task._id,task.ParentTaskId).catch((error) => {
                        logger.error(`${error} ERROR IN REMOVE COMMENT COUNT`);
                    })

                    if(task?.subTasks > 0){
                        let data = [
                            {
                                isParentTask: false,
                                ParentTaskId: task._id
                            }
                        ]
                        MongoDbCrudOpration(companyId, {type: dbCollections.TASKS,data: data}, "find").then(async(result) => {
                            result.forEach((subTask) => {
                                removeCommentCount(companyId,subTask.ProjectID,subTask.sprintId,subTask._id).catch((error) => {
                                    logger.error(`${error} ERROR IN REMOVE COMMENT COUNT`);
                                })
                            })
                        })
                    }

                    try {
                        let historyObj = {
                            message: `<b>${userData.Employee_Name}</b> has ${deletedStatusKey === 0 ? 'restored' : deletedStatusKey === 1 ? 'deleted' : 'archieved'} <b>${task.TaskName}</b> task in <b>${projectData.ProjectName}</b> project.`,
                            key: "task_delete",
                            sprintId: task.sprintId,
                        }

                        let notificationObject = {
                            'type': 'task',
                            'key': 'task_delete',
                            'message': `<strong>${userData.Employee_Name}</strong> has ${deletedStatusKey === 0 ? 'restored' : deletedStatusKey === 1 ? 'deleted' : 'archieved'} <strong>${task.TaskName}</strong> task in <strong>${projectData.ProjectName}</strong> project.`,
                        }

                        if(historyObj && Object.keys(historyObj).length) {
                            HandleHistory('task', companyId, projectData._id, task._id, historyObj, userData)
                            .catch((error) => {
                                logger.error(`ERROR in history: ${error.message}`);
                            });
                            HandleHistory('project', companyId, projectData._id, null, historyObj, userData)
                            .catch((error) => {
                                logger.error(`ERROR in history: ${error.message}`);
                            });
                        }
                        if(notificationObject && Object.keys(notificationObject).length) {
                            HandleBothNotification({type: 'tasks', companyId, projectId: projectData._id, taskId: task._id, folderId: task?.folderObjId || '', sprintId: task?.sprintId || '',  object: notificationObject, userData})
                            .catch((error) => {
                                logger.error(`ERROR in add notification: ${error.message}`);
                            })
                        }
                    } catch(error) {
                        logger.error(`ERROR: ${error.message}`);
                    }
                })
                .catch((error) => {
                    logger.error(`Archive Delete Error:${error.message}`)
                    reject(error);
                })
            } catch (error) {
                logger.error(`Archive Delete Error:${error.message}`)
                reject(error);
            }
        })
    }

    convertToSubTask({companyId, projectData, sprintId,selectedTaskId, taskId,oldProject,isSubTask,userData}) {
        return new Promise(async(resolve, reject) => {
            let convertTaskArray = [];
            let isMainSubTask = false;
            let object = {
                type: dbCollections.TASKS,
                data: [{ _id : new mongoose.Types.ObjectId(selectedTaskId)}]
            }
            await MongoDbCrudOpration(companyId,object, "findOne").then(async(tasData) => {
                if(tasData.isParentTask === false) {
                    isMainSubTask = true;
                }
                convertTaskArray.push(tasData);
                let subTasks = []
                if(isSubTask === true){
                    let data = [
                        {
                            ProjectID : new mongoose.Types.ObjectId(oldProject.id),
                            sprintId: new mongoose.Types.ObjectId(tasData.sprintId),
                            isParentTask: false,
                            ParentTaskId: selectedTaskId
                        }
                    ]
                    await MongoDbCrudOpration(companyId, {type: dbCollections.TASKS,data: data}, "find").then((result) => {
                        subTasks = result;
                    })
                }
                convertTaskArray = convertTaskArray.concat(subTasks);
                let object = {
                    type: dbCollections.TASKS,
                    data: [{ _id : taskId}]
                }
                await MongoDbCrudOpration(companyId,object, "findOne").then((task) => {
                    let promisesArr = [];
                    convertTaskArray.forEach((ctask) => {
                        promisesArr.push(
                            new Promise(async(resolve1, reject1) => {
                                try {
                                    convertToSubTaskFunction(companyId, projectData, sprintId, ctask,task,oldProject,isMainSubTask,isSubTask,userData).then((response) => {
                                        resolve1();
                                    }).catch((error) => {
                                        logger.error(`ERROR IN CONVERT TO SUBTASK FUNCTION ${error}`)
                                        reject1(error);
                                    })
                                } catch (error) {
                                    reject1(error)
                                }
                            })
                        )
                    })
                    Promise.allSettled(promisesArr).then(() => {
                        resolve({status: true, statusText: "Convert to task successfully"});
                    }).catch((error) => {
                        reject(error);
                    })
                })
            })
        }) 
    }

    moveTask({companyId, projectData, sprintObj,moveTaskId ,oldSprintObj,oldProject,isSubTask,assignee,watcher,userData}) {
        try {
            return new Promise((resolve, reject) => {
                let moveTaskArray = [];
                let object = {
                    type: dbCollections.TASKS,
                    data: [
                        {
                            _id : moveTaskId
                        }
                    ]
                }
                MongoDbCrudOpration(companyId,object, "findOne").then(async(move) => {
                    moveTaskArray.push(move);
                    let subMove = [];
                    if(isSubTask === true){
                        let data = [
                            {
                                ProjectID : new mongoose.Types.ObjectId(oldProject.id),
                                sprintId: new mongoose.Types.ObjectId(move.sprintId),
                                isParentTask:false,
                                ParentTaskId:moveTaskId
                            }
                        ]
                        await MongoDbCrudOpration(companyId, {type: dbCollections.TASKS,data: data}, "find").then((result) => {
                            result.filter((x)=>{
                                subMove.push(x);
                            })
                        })
                    }
                    moveTaskArray = moveTaskArray.concat(subMove);
                    let promisesArr = [];
                    moveTaskArray.forEach((moveTask) => {
                        promisesArr.push(
                            new Promise(async(resolve1, reject1) => {
                                try {
                                    moveTaskFunction(companyId, projectData, sprintObj, moveTask,oldSprintObj,oldProject,assignee,watcher,userData,isSubTask).then(() => {
                                        if(JSON.parse(JSON.stringify(moveTask))?.ProjectID !== projectData.id){
                                            let indexObj = {
                                                indexName : "groupByStatusIndex",
                                                searchKey : "statusKey",
                                                searchValue : "1"
                                            }
                                            this.updateTaskKey({
                                                companyId: companyId,
                                                projectCode: projectData.ProjectCode,
                                                projectId: projectData.id,
                                                taskId: moveTask._id,
                                                taskTypeKey: moveTask.TaskTypeKey,
                                                sprintId: sprintObj.id,
                                                isParentTask:true,
                                                indexObj:indexObj
                                            })
                                        }
                                        resolve1();
                                    }).catch((error) => {
                                        logger.error(`ERROR IN MOVE FUNCTION ${error}`)
                                        reject1(error);
                                    })
                                } catch (error) {
                                    reject1(error)
                                }
                            })
                        )
                    })
                    Promise.allSettled(promisesArr).then(() => {
                        resolve({status: true, statusText: "move Task successfully"});
                    }).catch((error) => {
                        reject(error);
                    })
                })
            }) 
        } catch (error) {
            logger.error(`${error} Error in move task.`)
        }
    }

    convertToList({companyId, projectData, taskId, userData, folderData, sprintObj, isSubTask}) {
        return new Promise((resolve, reject) => {
            try {
                const schema = SCHEMA_TYPE.TASKS
                let obj = {
                    type: schema,
                    data: [
                        {
                            _id: new mongoose.Types.ObjectId(taskId)
                        }
                    ]
                }

                MongoDbCrudOpration(companyId, obj, "findOne").then((task) => {

                    let updateObj = {
                        type: schema,
                        data: [
                            { _id: new mongoose.Types.ObjectId(taskId) },
                            { $set: { deletedStatusKey: 1 } },
                            { upsert: true }
                        ]
                    }

                    MongoDbCrudOpration(companyId, updateObj, "updateOne");

                    const addObj = {
                        body: {
                            companyId: companyId,
                            projectId: projectData.id,
                            sprintName: task.TaskName,
                            userData: userData,
                            projectName: projectData.ProjectName,
                            from: "task",
                            taskSprintObj : {
                                taskSprintName : task.sprintArray.name,
                                taskFodlerName : task.sprintArray.folderName
                            }
                        }
                    }
                    if(folderData && Object.keys(folderData).length > 0){
                        addObj.body.folder = {
                            folderId: folderData.folderId,
                            folderName: folderData.name
                        }
                    }

                    addSprintFun(addObj).then((res) => {
                        resolve({status: true, statusText: "Sprint added successfully", data: res.data});

                        const decObj = {
                            body: {
                                companyId: companyId,
                                projectId: projectData.id,
                                folderId: task?.folderObjId || null,
                                updateObject :{$inc: { tasks: -1}},
                                folderId: sprintObj?.folderId || null,
                            },
                            params : {
                                id : task.sprintId
                            }
                        }
                        updateSprintFun(decObj).catch((error) => {
                            logger.error(`error in update task count : ${error}`)
                        });
                        removeCommentCount(companyId,task.ProjectID,task.sprintId,task._id,task.ParentTaskId).catch((error) => {
                            logger.error(`${error} ERROR IN REMOVE COMMENT COUNT`);
                        })

                        if(task.isParentTask === false) {
                            let updateObj1 = {
                                type: schema,
                                data: [
                                    { _id: new mongoose.Types.ObjectId(task.ParentTaskId) },
                                    { $inc: { subTasks: -1 } },
                                    { upsert: true }
                                ]
                            }
                            MongoDbCrudOpration(companyId, updateObj1, "updateOne");
                        }

                        let delObj = {
                            type: schema,
                            data: [
                                {
                                    _id: new mongoose.Types.ObjectId(task._id)
                                }
                            ]
                        }
                        MongoDbCrudOpration(companyId, delObj, "deleteOne");

                        if(isSubTask === true) {
                            let getdataObj = {
                                type: schema,
                                data: [
                                    {
                                        ParentTaskId: task._id
                                    }
                                ]
                            }
                            MongoDbCrudOpration(companyId, getdataObj, "find").then((result) => {

                                let promisesArr = [];
                                result.forEach((subTask) => {
                                    promisesArr.push(
                                        new Promise(async(resolve1, reject1) => {
                                            try {
                                                convertToListSubTask(companyId, projectData, subTask, res.data, sprintObj).then(() => {
                                                    resolve1();
                                                }).catch((error) => {
                                                    logger.error(`ERROR IN CONVERT TO LIST FUNCTION ${error}`)
                                                    reject1(error);
                                                })
                                            } catch (error) {
                                                reject1(error)
                                            }
                                        })
                                    )
                                })
                                Promise.allSettled(promisesArr).then(() => {
                                    resolve({status: true, statusText: "Convert to list updated successfully"});
                                }).catch((error) => {
                                    reject(error);
                                })
                            });
                        }
                    })
                });
            } catch (error) {
                reject(error);
            }
        })
    }

    mergeTask({companyId, projectData, taskId, mergeTaskId,oldProject,isSubTask,userData}) {
        return new Promise((resolve, reject) => {
            try {
                let object = {
                    type: dbCollections.TASKS,
                    data: [{ _id : new mongoose.Types.ObjectId(taskId)}]
                }
                MongoDbCrudOpration(companyId,object,"findOne")
                .then(async(task) => {
                    let query = {
                        type: dbCollections.TASKS,
                        data: [{ _id : new mongoose.Types.ObjectId(mergeTaskId)}]
                    }
                    await MongoDbCrudOpration(companyId,query,"findOne")
                    .then((mergeTask) => {
                        /* Soft delete task */
                        let deletedObj = {
                            type: SCHEMA_TYPE.TASKS,
                            data: [
                                {
                                    _id: new mongoose.Types.ObjectId(task._id)
                                },
                                {
                                    $set: {deletedStatusKey : 1}
                                },
                            ]
                        }
                        MongoDbCrudOpration(companyId,deletedObj,"updateOne")

                        let finalAttach = mergeTask.attachments ? mergeTask.attachments : [];
                        finalAttach = finalAttach.concat(task.attachments || []);
                        let firstDEs = mergeTask.description !== undefined ? `${mergeTask.TaskName} :  ${mergeTask.description}` : '';
                        let secondDes = task.description !== undefined ? `${task.TaskName} :  ${task.description}` : '';
                        let firstRawDes = mergeTask.rawDescription !== undefined ? `${mergeTask.TaskName} :  ${mergeTask.rawDescription}` : '';
                        let secondRawDes = task.rawDescription !== undefined ? `${task.TaskName} :  ${task.rawDescription}` : '';
                        let finalCheckList = mergeTask.checklistArray ? mergeTask.checklistArray : [];
                        finalCheckList = finalCheckList.concat(task.checklistArray || []);
                        let mergeObj = {
                            attachments: finalAttach,
                            checklistArray:finalCheckList,
                        }
                        if(firstDEs !== '' || secondDes !== ''){
                            let finalDescription = `${firstDEs !== '' ? `${firstDEs} <br>` : ''} ${secondDes}`
                            mergeObj.description = finalDescription
                        }
                        if(firstRawDes !== '' || secondRawDes !== ''){
                            let finalRowDescription = `${firstRawDes !== '' ? `${firstRawDes} <br>` : ''} ${secondRawDes}`
                            mergeObj.rawDescription = finalRowDescription
                        }
                        let updateObj = {
                            type: SCHEMA_TYPE.TASKS,
                            data: [
                                {
                                    _id: new mongoose.Types.ObjectId(mergeTask._id)
                                },
                                {
                                    $set: {...mergeObj}
                                },
                            ]
                        }
                        MongoDbCrudOpration(companyId,updateObj,'updateOne').then(() => {
                            // resolve();
                        }).catch((err)=>{
                            logger.error(`${err}:"Error in Updating Doc Merge Task"`)
                        })
                        removeCommentCount(companyId,task.ProjectID,task.sprintId,task._id,task.ParentTaskId).catch((error) => {
                            logger.error(`${error} ERROR IN REMOVE COMMENT COUNT`);
                        })
                        if(task.isParentTask === false){
                            /*When a subtask is merged with another task, at that moment, the parent task of the subtask decreases by one.*/
                            let object = {
                                type:SCHEMA_TYPE.TASKS,
                                data: [
                                    { _id: new mongoose.Types.ObjectId(task.ParentTaskId)},
                                    {$inc: {"subTasks": -1}}
                                ]
                            }
                            MongoDbCrudOpration(companyId, object, "updateOne")
                        }
                        if(mergeTask.sprintId !== task.sprintId || JSON.parse(JSON.stringify(mergeTask)).ProjectID !== JSON.parse(JSON.stringify(task)).ProjectID){
                            const decObj = {
                                body: {
                                    companyId: companyId,
                                    projectId: oldProject.id,
                                    folderId: task?.folderObjId || null,
                                    updateObject :{$inc: { tasks: -1}},
                                },
                                params : {
                                    id : task.sprintId
                                }
                            }
                            updateSprintFun(decObj).catch((error) => {
                                logger.error(`error in update task count : ${error}`)
                            });
                        }
                        // When Task has child task //
                        if(isSubTask === true){
                            let subTaskArray = [];
                            let subObj = {
                                type: SCHEMA_TYPE.TASKS,
                                data: [
                                    {
                                        ProjectID: new mongoose.Types.ObjectId(oldProject.id),
                                        sprintId: new mongoose.Types.ObjectId(task.sprintId),
                                        isParentTask : false,
                                        ParentTaskId:task._id
                                    }
                                ]
                            }
                            MongoDbCrudOpration(companyId,subObj,'find')
                            .then(async(result) => {
                                subTaskArray = result;
                                let promisesArr = [];
                                subTaskArray.forEach((stask) => {
                                    promisesArr.push(
                                        new Promise(async(resolve1, reject1) => {
                                            try {
                                                mergeSubTask(companyId, stask, mergeTask,projectData,oldProject).then(() => {
                                                    resolve1();
                                                }).catch((error) => {
                                                    logger.error(`ERROR IN MOVE FUNCTION ${error}`)
                                                    reject1(error);
                                                })
                                            } catch (error) {
                                                reject1(error)
                                            }
                                        })
                                    )
                                })
                                Promise.allSettled(promisesArr).then(() => {
                                    resolve({status: true, statusText: "merge Task successfully"});
                                }).catch((error) => {
                                    reject(error);
                                })
                            })
                        }else{
                            resolve({status: true, statusText: "merge Task successfully"});
                            const historyObj = {
                                key: "Task_Merge",
                                sprintId: mergeTask.sprintId,
                                mainChat: false
                            }
                            if(task.sprintId === mergeTask.sprintId){
                                historyObj.message = `<b>${userData.Employee_Name}</b> has merged the <b>${task.TaskName}</b> task in to <b>${mergeTask.TaskName}</b> task ${isSubTask === true ? '<b>with all its sub tasks</b>' : ''}.`
                            }else if(task.sprintId !== mergeTask.sprintId && JSON.parse(JSON.stringify(task))?.ProjectID === JSON.parse(JSON.stringify(mergeTask))?.ProjectID){
                                historyObj.message = `<b>${userData.Employee_Name}</b> has merged the <b>${task.TaskName}</b> task of <b>(${task.folderObjId ?  task.sprintArray.folderName + '/' : ''}${task.sprintArray.name})</b> sprint in to <b>${mergeTask.TaskName}</b> task <b>(${mergeTask.folderObjId ? mergeTask.sprintArray.folderName + '/'  : ''}${mergeTask.sprintArray.name})</b>${isSubTask === true ? '<b>with all its sub tasks</b>' : ''}.`
                            }else{
                                historyObj.message = `<b>${userData.Employee_Name}</b> has merged the <b>${task.TaskName}</b> task of <b>(${oldProject.ProjectName}${task.folderObjId ? '/' + task.sprintArray.folderName : ''}/${task.sprintArray.name})</b> sprint in to <b>${mergeTask.TaskName}</b> task <b>(${projectData.ProjectName}${mergeTask.folderObjId ? '/' + mergeTask.sprintArray.folderName : ''}/${mergeTask.sprintArray.name})</b> ${isSubTask === true ? '<b>with all its sub tasks</b>' : ''}.`
                            }
                            HandleHistory('task', companyId, projectData.id, mergeTask._id, historyObj, userData);
                        }
                    })
                })

            } catch (error) {
                reject(error)
            }
        })
    }

    async duplicateTask({companyId, projectData, sprintObj, selectedTaskId, oldProject,userData,isSubTask,duplicateData,assignee,watcher,taskName,oldSprintObj}){
        return new Promise((resolve, reject) => {
            try {
                let object = {
                    type: dbCollections.TASKS,
                    data: [{ _id : new mongoose.Types.ObjectId(selectedTaskId)}]
                }
                MongoDbCrudOpration(companyId,object,"findOne").then((selectedTask) => {
                    selectedTask.AssigneeUserId = duplicateData.includes('Copy Assignees') ? assignee : [];
                    selectedTask.watchers = duplicateData.includes('Copy Watchers') ? watcher : [];
                    let obj = {};
                    let parsedMap = JSON.parse(JSON.stringify(selectedTask))
                    if(JSON.parse(JSON.stringify(selectedTask))?.ProjectID !== projectData.id) {
                        let Ind = oldProject.taskStatusData.findIndex((x) => {return x.key === selectedTask.statusKey});
                        let typeInd = oldProject.taskTypeCounts.findIndex((x) => {return x.value === selectedTask.TaskType});
                        let statusData = oldProject.taskStatusData[Ind];
                        let typeData = oldProject.taskTypeCounts[typeInd];
                        obj = {
                            ...parsedMap,
                            TaskName: taskName!== '' ? taskName : selectedTask._doc.TaskName,
                            ProjectID: projectData.id,
                            sprintId: sprintObj.id,
                            sprintArray : sprintObj,
                            status:{
                                key:statusData.convertStatus.key,
                                value:'',
                                text: statusData.convertStatus.name,
                                type: statusData.convertStatus.type
                            },
                            statusType: statusData.convertStatus.type,
                            statusKey: statusData.convertStatus.key,
                            TaskType: typeData.convertType.value,
                            TaskTypeKey: typeData.convertType.key,
                            isParentTask : true,
                            ParentTaskId : '',
                            attachments: duplicateData.includes('Attachments') ? selectedTask.attachments || [] : [],
                            DueDate: duplicateData.includes('Due Date') && selectedTask.DueDate !== null && selectedTask.DueDate !== undefined && selectedTask.DueDate !== 0 ? new Date(selectedTask.DueDate) || null: null,
                            dueDateDeadLine: duplicateData.includes('Due Date') && selectedTask.dueDateDeadLine && selectedTask.dueDateDeadLine.length ? selectedTask.dueDateDeadLine.map((x) => ({date: x && x.date? new Date(x.date) : ''})) : [],
                            checklistArray : duplicateData.includes('Checklists') && selectedTask.checklistArray ? selectedTask.checklistArray : []
                        }
                    }
                    else{
                        obj = {
                            ...parsedMap,
                            TaskName: taskName!== '' ? taskName : selectedTask._doc.TaskName,
                            ProjectID: selectedTask.ProjectID,
                            sprintId: sprintObj.id,
                            sprintArray : sprintObj,
                            isParentTask : true,
                            ParentTaskId : '',
                            attachments:duplicateData.includes('Attachments') ? selectedTask.attachments || [] : [],
                            DueDate: duplicateData.includes('Due Date') && selectedTask.DueDate !== undefined && selectedTask.DueDate !== null ? new Date(selectedTask.DueDate) || null: null,
                            dueDateDeadLine: duplicateData.includes('Due Date') && selectedTask.dueDateDeadLine && selectedTask.dueDateDeadLine.length ? selectedTask.dueDateDeadLine.map((x) => ({date: x && x.date ? new Date(x.date) : ''})) : [],
                            checklistArray : duplicateData.includes('Checklists') && selectedTask.checklistArray ? selectedTask.checklistArray : []
                        }
                    }
                    if(sprintObj.folderId){
                        obj.folderObjId = sprintObj.folderId;
                    }else{
                        delete obj.folderObjId;
                    }
                    delete obj._id;
                    let indexObj = {
                        indexName : "groupByStatusIndex",
                        searchKey : "statusKey",
                        searchValue : "1"
                    }
                    let projectObj = {
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
                    MongoDbCrudOpration(companyId, projectObj, "findOneAndUpdate").then((response) => {
                        obj.TaskKey = projectData.ProjectCode + '-' +  response.lastTaskId;
                        HandleTask(companyId, obj, false, null, userData,indexObj)
                        .then((taskResult) => {
                            resolve({status: true, statusText: "Duplicate Task Added",taskId :taskResult.id });
                            // UPDATE TASK COUNT IN SPRINT 
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
                            const historyObj = {
                                key: "Task_Duplicated",
                                sprintId: sprintObj.id,
                                mainChat: false
                            }
                            if(JSON.parse(JSON.stringify(selectedTask))?.ProjectID !== projectData.id){
                                historyObj.message = `<b>${userData.Employee_Name}</b> has duplicated <b>${obj.TaskName}</b> task from <b>(${oldProject.ProjectName}${oldSprintObj.folderId ? '/' + oldSprintObj.folderName : ''}/${oldSprintObj.name})</b> to <b>(${projectData.ProjectName}${sprintObj.folderId ? '/' + sprintObj.folderName : ''}/${sprintObj.name})</b> project ${isSubTask === true ? '<b>with all its sub tasks</b>' : ''}.`
                            }else{
                                historyObj.message = `<b>${userData.Employee_Name}</b> has duplicated <b>${obj.TaskName}</b> task from <b>(${oldSprintObj.folderId ?  oldSprintObj.folderName + '/' : ''}${oldSprintObj.name})</b> to <b>(${sprintObj.folderId ? sprintObj.folderName + '/'  : ''}${sprintObj.name})</b> sprint ${isSubTask === true ? '<b>with all its sub tasks</b>' : ''}.`
                            }
                            HandleHistory('task', companyId, projectData.id,taskResult.id, historyObj, userData);
                            try {
                                if(duplicateData.includes('Activity')){
                                    addHistoryCollection(companyId, projectData,selectedTask,taskResult,sprintObj).catch((err) => {
                                        logger.error(`ERROR IN ADD HISTORY:${err}`)
                                    })
                                }
                                if(duplicateData.includes('Comments')){
                                    addCommentCollection(companyId, projectData,selectedTask,taskResult,sprintObj)
                                    .catch((error) => {
                                        logger.error(`ERROR IN ADD COMMENTS:${error}`)
                                    })
                                }
                            } catch (error) {
                                logger.error(`${error}ERROR in create task in typesense collection: `);
                            }
                            let subTaskArray = [];
                            if(isSubTask  === true){
                                let object = {
                                    type: dbCollections.TASKS,
                                    data: [{
                                        ProjectID: new mongoose.Types.ObjectId(oldProject.id),
                                        sprintId: new mongoose.Types.ObjectId(selectedTask.sprintId),
                                        isParentTask: false,
                                        ParentTaskId: selectedTask._id
                                    }]
                                }
                                MongoDbCrudOpration(companyId,object,"find").then((subTasks) => {
                                    subTaskArray = subTasks;
                                    let arrayOfObjects = []
                                    const objectCount = Math.ceil(subTaskArray.length / 7);
                                    for (let i = 0; i < objectCount; i++) {
                                        const startIndex = i * 7;
                                        const endIndex = startIndex + 7;
                                        const documentsSlice = subTaskArray.slice(startIndex, endIndex);
                                  
                                        arrayOfObjects.push(documentsSlice);
                                    }
                                    let count = 0;
                                    let countFunction = async(row) => {
                                        try {
                                            if(count >= Object.keys(arrayOfObjects).length) {
                                                resolve({status: true, statusText: "subtask merged successfully"});
                                                return;
                                            }else{
                                                let promise = [];
                                                row.forEach((stask)=>{
                                                    promise.push(duplicateSubTaskFunction(companyId, projectData, sprintObj, stask, taskResult.id,userData, oldProject,duplicateData));
                                                })
                                                Promise.allSettled(promise).then((res)=>{
                                                    count++;
                                                    countFunction(arrayOfObjects[Object.keys(arrayOfObjects)[count]]);
                                                }).catch((error)=>{
                                                    logger.error(error);
                                                    count++;
                                                    countFunction(arrayOfObjects[Object.keys(arrayOfObjects)[count]]);
                                                })
                                            }
                                        } catch (error) {
                                            logger.error(`${error}ERROR in count function`);
                                        }
                                    }
                                    countFunction(arrayOfObjects[Object.keys(arrayOfObjects)[count]]);
                                })
                            }
                        }).catch((error) => {
                            reject(error);
                            logger.error(`${error}ERROR IN CRETE TASK `)
                        })
                    })
                })
            } catch (error) {
                logger.error(`${error}ERROR IN DUPLICATE TASK FUNCTIONALITY.`);
                reject(error);
            }
        })
    }

    convertToTask({companyId,projectData,taskId,sprintObj,parentTaskId,oldSprintObj,oldProject}) {
        return new Promise((resolve, reject) => {
            try {
                let deleteObj = {
                    type: SCHEMA_TYPE.TASKS,
                    data: [
                        {
                            _id: new mongoose.Types.ObjectId(taskId)
                        },
                        {
                            $set: {deletedStatusKey : 1}
                        },
                    ]
                }
                MongoDbCrudOpration(companyId, deleteObj, "updateOne").then(() => {
                    let object = {
                        type: dbCollections.TASKS,
                        data: [
                            {
                                _id : new mongoose.Types.ObjectId(taskId)
                            }
                        ]
                    }
                    MongoDbCrudOpration(companyId,object, "findOne").then((task) => {
                        let obj = {};
                        let unsetObj = {};
                        if(projectData.id !== oldProject.id) {
                            let Ind = oldProject.taskStatusData.findIndex((x) => {return x.key === task.statusKey});
                            let typeInd = oldProject.taskTypeCounts.findIndex((x) => {return x.value === task.TaskType});
                            let statusData = oldProject.taskStatusData[Ind];
                            let typeData = oldProject.taskTypeCounts[typeInd];
                            obj = {
                                isParentTask : true,
                                ParentTaskId : '',
                                sprintId : sprintObj.id,
                                sprintArray : sprintObj,
                                status:{
                                    key:statusData.convertStatus.key,
                                    value:'',
                                    text: statusData.convertStatus.name,
                                    type: statusData.convertStatus.type
                                },
                                statusType: statusData.convertStatus.type,
                                statusKey: statusData.convertStatus.key,
                                TaskType: typeData.convertType.value,
                                TaskTypeKey: typeData.convertType.key,
                                ProjectID : projectData.id,
                                deletedStatusKey : 0,
                            }
                            if(sprintObj.folderId){
                                obj.folderObjId = sprintObj.folderId;
                            }else{
                                if(task.folderObjId){
                                    unsetObj = {
                                        folderObjId:''
                                    }
                                    delete task.folderObjId;
                                }
                            }
                        }else{
                            obj = {
                                isParentTask : true,
                                ParentTaskId : '',
                                sprintId : sprintObj.id,
                                sprintArray : sprintObj,
                                deletedStatusKey : 0,
                            }
                            if(sprintObj.folderId){
                                obj.folderObjId = sprintObj.folderId;
                            }else{
                                if(task.folderObjId){
                                    unsetObj = {
                                        folderObjId:''
                                    }
                                    delete task.folderObjId;
                                }
                            }
                        }
                        let queryObj = {
                            type: SCHEMA_TYPE.TASKS,
                            data: [
                                {
                                    _id: new mongoose.Types.ObjectId(taskId)
                                },
                                {
                                    $set: {...obj},
                                    $unset: unsetObj
                                },
                            ]
                        }
                        MongoDbCrudOpration(companyId, queryObj, "updateOne").then(() => {
                            let object = {
                                type:SCHEMA_TYPE.TASKS,
                                data: [
                                    { _id: new mongoose.Types.ObjectId(parentTaskId) },
                                    {$inc: {"subTasks": -1}}
                                ]
                            }
                            MongoDbCrudOpration(companyId, object, "updateOne").then(() => {
                                resolve({status: true, statusText: "Convert TO Task"});
                                if(oldSprintObj.id !== sprintObj.id || JSON.parse(JSON.stringify(oldProject)).id !== JSON.parse(JSON.stringify(projectData)).id){
                                    const decObj = {
                                        body: {
                                            companyId: companyId,
                                            projectId: oldProject.id,
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
                                            id : sprintObj.id
                                        }
                                    }
                                    updateSprintFun(incObj).catch((error) => {
                                        logger.error(`error in update task count : ${error}`)
                                    });
                                }
                                removeCommentCount(companyId,task.ProjectID,task.sprintId,task._id,task.ParentTaskId).catch((error) => {
                                    logger.error(`${error} ERROR IN REMOVE COMMENT COUNT`);
                                })
                            })
                        }).catch((error) => {
                            logger.error(`ERROR IN CONVERT TO TASK ${error}`)
                        })
                    })
                })
            } catch (error) {
                reject(error);
            }
        })
    }

    updateParentCount(companyId, taskId, value) {
        const query = {
            type: dbCollections.TASKS,
            data: [
                {
                    _id: new mongoose.Types.ObjectId(taskId)
                }, {
                    $inc: {
                        subTasks: value
                    },
                }
            ]
        }

        MongoDbCrudOpration(companyId, query, "updateOne")
        .catch((error) => {
            logger.error(`ERROR in update parent subtask count: ${error.message}`);
        })
    }

     // ADD TASK INDEX WHEN TASK IS CREATE

    /**
     * Create a taskIndex when new task is created
     * @param {String} CompanyId - CompanyId in which task is created
     * @param {String} ProjectId - ProjectId in which task is created
     * @param {String} TaskId - TaskId of new Created task
     * @param {Object} IndexObj - Index Object Which Indicate Which Type of index is need to create
     * @param {String} TaskKey - TaskKey of new Created task.
     * @param {String} SprintId - SprintId in which task is created
     * @returns {Promise<String>} A Promise that resolves with the TaskIndex in number
     *                            Rejects with an error message if any issues occur during the Find TaskIndex.
     */
    updateTaskIndex (companyId,projectId,taskId,indexObj,taskKey,sprintId)  {
        return new Promise((resolve, reject) => {
            try {
                    if (indexObj.searchKey === "AssigneeUserId" && indexObj.searchValue == "[]") {
                        let taskObj = [
                            {
                              $match: {
                                ProjectID: projectId,
                                TaskKey: {$ne: taskKey},
                                [indexObj.indexName]: { $exists: true },
                                // sprintId: sprintId,
                                AssigneeUserId: { $size: 0 }
                              }
                            },
                            { $sort: { [indexObj.indexName]: 1 } },
                            {
                              $group: {
                                _id: "$AssigneeUserId",
                                count: { $sum: 1 },
                                results: { $push: "$$ROOT" }
                              }
                            },
                            { $limit: 1 }
                        ]
                        let objSh = {
                            type: SCHEMA_TYPE.TASKS,
                            data: [taskObj]
                        }
                        MongoDbCrudOpration(companyId, objSh, 'aggregate').then((resp)=>{
                            if (resp && resp[0].results && resp[0].results.length) {
                                resolve(resp[0].results[0][indexObj.indexName] - 65536)
                            } else {
                                resolve(0)
                            }
                        }).catch((error)=>{
                            reject(error)
                        })
                    } else {
                        let taskObj = [
                            {
                              $match: {
                                $and: [
                                  {[indexObj.indexName]: {$exists: true}},
                                  { ProjectID: new mongoose.Types.ObjectId(projectId) },
                                //   { sprintId: sprintId },
                                  { [indexObj.searchKey]: Number(indexObj.searchValue) },
                                  {[indexObj.indexName]: {$ne: -999999999999999 }}
                                ]
                              }
                            },
                            { $sort: { [indexObj.indexName]: 1 } },
                            { $limit: 1 }
                          ]
                        let objSh = {
                            type: SCHEMA_TYPE.TASKS,
                            data: [taskObj]
                        }
                        MongoDbCrudOpration(companyId, objSh, 'aggregate').then((resp)=>{
                            if (resp && resp.length) {
                                resolve(resp[0][indexObj.indexName] - 65536)
                            } else {
                                resolve(0)
                            }
                        }).catch((error)=>{
                            reject(error)
                        })
                    }
            } catch (error) {
                logger.error(`Error While Prepare Task Index of task ${taskId} Error: ${error}`);
                reject(error);
            }
        })
    }

    // UPDATE TASK FOR QUEUE LIST
    updateQueueList({CompanyId, projectId, sprintId, taskId,userId,actionType,taskName,userData}) {
        return new Promise((resolve,reject) => {
            try {
                const query = {
                    type: dbCollections.TASKS,
                    data: [
                        {
                            _id: new mongoose.Types.ObjectId(taskId)
                        }, {
                            [actionType ==='add' ? "$addToSet" : "$pull"]: {
                                queueListArray: userId
                            }
                        }
                    ]
                }
                MongoDbCrudOpration(CompanyId, query, "updateOne")
                .then(() => {
                    resolve({status: true, statusText: "updateQueueList updated successfully"});
                    let historyObj = {};
                    historyObj.key = "Task_Queue";
                    if(actionType === "add"){
                        historyObj.message = `<b>${userData.Employee_Name}</b> has added this <b>${taskName}</b> task to Queuelist.`;
                    }else{
                        historyObj.message = `<b>${userData.Employee_Name}</b> has removed this <b>${taskName}</b> task from Queuelist.`;
                    }
                    historyObj.sprintId = sprintId;
                    if (historyObj !== null && Object.keys(historyObj).length > 0) {
                        HandleHistory('task',CompanyId, projectId,taskId,historyObj, userData).then(async () => {})
                        .catch((error) => {
                            logger.error(`ERROR in task status update history : ${error.message}`);
                        })
                    }
                })
                .catch((error) => {
                    reject(error)
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    updateStartDateAndDueDate({commonDateFormatString, userData, notificationObj, firebaseObj,task,project}) {
        return new Promise((resolve,reject)=> {
            firebaseObj.dueDateDeadLine = firebaseObj.dueDateDeadLine.map((x) => ({date: new Date(x.date)}));
            firebaseObj.DueDate = new Date(firebaseObj.DueDate);
            firebaseObj.startDate = new Date(firebaseObj.startDate);

            const query = {
                type: dbCollections.TASKS,
                data: [
                    {
                        _id: new mongoose.Types.ObjectId(task._id)
                    }, {
                        $set: {
                            ...firebaseObj
                        },
                        $unset: {
                            groupByDueDateIndex: 1
                        }
                    }
                ]
            }
            MongoDbCrudOpration(project.CompanyId, query, "updateOne")
            .then(() => {
                resolve({status: true, statusText: "Start Date And Due Date updated successfully"});
                if (notificationObj && Object.keys(notificationObj).length > 0) {
                    HandleBothNotification({
                        type:'tasks',
                        userData,
                        companyId: project.CompanyId,
                        projectId: project._id,
                        taskId: task._id,
                        folderId: task.folderObjId || "",
                        sprintId: task.sprintId,
                        object: notificationObj
                    })
                    .catch((error) => {
                        logger.error(`ERROR in update Start Date : ${error.message}`);
                    })
                }
                var historyObj = {};
                historyObj.key = "Project_StartDate_DueDate";
                if (firebaseObj.dueDateDeadLine.length === 1) {
                    historyObj.message = `<b>${userData.Employee_Name}</b> has added <b> Start Date</b> as <b>${changeDateFormat(firebaseObj.startDate, commonDateFormatString)}</b> and <b> Due Date</b> as <b>${changeDateFormat(firebaseObj.DueDate, commonDateFormatString)} </b>.`;
                } else {
                    historyObj.message = `<b>${userData.Employee_Name}</b> has Changed <b> Start Date</b> as <b>${changeDateFormat(firebaseObj.startDate, commonDateFormatString)}</b> and <b> Due Date</b> as <b>${changeDateFormat(firebaseObj.DueDate, commonDateFormatString)} </b>.`;
                }
                historyObj.sprintId = task.sprintId;
                HandleHistory('task',project.CompanyId, project._id,task._id,historyObj, userData).
                catch((error) => {
                    logger.error(`ERROR in update Start Date And Due Date update hostory : ${error.message}`);
                });
            }).catch((error) => {
                reject(error);
            })
        });
    }

    updateSupportTicket({companyId,updateObj,taskId}) {
        return new Promise((resolve,reject) => {
            try {
                const query = {
                    type: dbCollections.TASKS,
                    data: [
                        {
                            _id: new mongoose.Types.ObjectId(taskId)
                        }, 
                        {
                            $set: {
                                ...updateObj,
                            },
                        }
                    ]
                }

                MongoDbCrudOpration(companyId, query, "updateOne")
                .then(() => {
                    resolve({status: true, statusText: "Ticket Update Successfully"});
                })
                .catch((error) => {
                    logger.error(`ERROR in task status: ${error.message}`);
                    reject(error)
                })
            } catch (error) {
                logger.error(`ERROR in task status : ${error.message}`);
                reject(error)
            }
        })
    }

    createSubTaskWithAi({companyId,userId,subTitles,sprintObj,projectData,userData,parentTask,type}) {
        return new Promise((resolve,reject) => {
            try {
                let tasksArray = []
                subTitles.map((sub) => {
                    let obj = {
                        'TaskName': sub.title,
                        'TaskKey': '-',
                        'AssigneeUserId': [],
                        'watchers': [],
                        'DueDate': '',
                        'dueDateDeadLine': [],
                        'TaskType': 'task',
                        'TaskTypeKey': 1,
                        'ParentTaskId': type === 'subTask' ? parentTask.id : '',
                        'ProjectID': parentTask.ProjectID,
                        'CompanyId': companyId,
                        'status': {
                            "text": 'To Do',
                            "key": 1,
                            'type': 'default_active'
                        },
                        'isParentTask': type === 'subTask' ? false : true,
                        'Task_Leader': userId,
                        'sprintArray': sprintObj,
                        'Task_Priority': 'MEDIUM',
                        'deletedStatusKey': 0,
                        'sprintId': sprintObj.id,
                        'statusType': 'default_active',
                        'statusKey': 1,
                        '_id': new mongoose.Types.ObjectId(),
                    }
                    if (sprintObj.folderId) {
                        obj.folderObjId = new mongoose.Types.ObjectId(sprintObj.folderId);
                    }
                    tasksArray.push(obj);
                });
                resolve(tasksArray);
                let count = 0;
                const countFun = (obj) => {
                    if(count >= tasksArray.length) {
                        return;
                    } else {
                        let indexObj;
                        indexObj = {
                            indexName : "groupByStatusIndex",
                            searchKey : "statusKey",
                            searchValue : "1"
                        }
                        this.create({data: obj, user: userData, projectData, indexObj})
                        .then(() => {
                            count++;
                            countFun(tasksArray[count]);
                        })
                        .catch((error) => {
                            console.error("ERROR in create task: ", error);
                            count++;
                            countFun(tasksArray[count]);
                        })
                    }
                }
                countFun(tasksArray[count]);
            } catch (error) {
                logger.error(`ERROR in create sub task : ${error.message}`);
                reject(error);
            }
        })
    }
}


exports.taskMongo = new Task();