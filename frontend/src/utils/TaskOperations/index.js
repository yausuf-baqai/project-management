import { dbCollections } from "@/utils/FirebaseCollections"
import * as mongoQuery from "@/utils/MongoQueries/crudOperations/crudOperations"
import * as env from '@/config/env';
import { BSON } from "realm-web";
import { apiRequest } from "../../services";

class Task {
    create({ data, user, projectData ,indexObj = {}}) {
        return new Promise((resolve,reject) => {
            try {
                apiRequest("post", env.V2_TASKS, {
                    data,
                    user: {
                        "Employee_Name": user.Employee_Name,
                        "id": user.id,
                        "companyOwnerId": user.companyOwnerId
                    },
                    projectData,
                    indexObj
                })
                .then((response) => {
                    if (response.data.status) {
                        resolve({status: true, statusText: "Task created successfully", id: response.data.id});
                    } else {
                        reject({status: false, error: response.data.error})
                    }
                })
                .catch((error) => {
                    reject({status: false, error: error})
                })
            } catch (error) {
                reject({status: false, error: error})
            }
        });
    }

    /* -------------- UPDATE KANBAN INDEX FUNCTION FOR TASK -----------------*/

    updateIndex({ indexType, indexValue, project, taskId}) {
        return new Promise((resolve,reject) => {
            try {
                apiRequest("patch", "/api/v2/tasks", {action: "updateIndex", indexType, indexValue, project, taskId})
                .then((response) => {
                    if (response.data.status) {
                        resolve({status: true, statusText: "Task index updated successfully"});
                    } else {
                        reject({status: false, error: response.data.error})
                    }
                })
                .catch((error) => {
                    reject({status: false, error: error})
                })
            } catch (error) {
                reject({status: false, error: error})
            }
        })
    }

    /* -------------- UPDATE DUE DATE FUNCTION FOR TASK -----------------*/

    updateDueDate({firebaseObj, project, task, obj,userData, commonDateFormatString,isUpdateTask}) {
        return new Promise((resolve,reject) => {
            try {
                apiRequest("patch", env.V2_TASKS, {
                    action: "updateDueDate",
                    commonDateFormatString,
                    firebaseObj,
                    project,
                    task,
                    obj,
                    userData: {
                        "Employee_Name": userData.Employee_Name,
                        "id": userData.id,
                        "companyOwnerId": userData.companyOwnerId
                    },
                    isUpdateTask
                })
                .then((response) => {
                    if (response.data.status) {
                        resolve({status: true, statusText: "Task due date updated successfully"});
                    } else {
                        reject({status: false, error: response.data.error})
                    }
                })
                .catch((error) => {
                    reject({status: false, error: error})
                })
            } catch (error) {
                reject({status: false, error: error})
            }
        })
    }

    /* -------------- UPDATE START DATE FUNCTION FOR TASK -----------------*/

    updateStartDate({firebaseObj, project, task, obj,userData, commonDateFormatString,isUpdateTask = true}) {
        return new Promise((resolve,reject) => {
            try {
                apiRequest("patch", env.V2_TASKS, {
                    action: "updateStartDate",
                    commonDateFormatString,
                    firebaseObj,
                    project,
                    task,
                    obj,
                    userData: {
                        "Employee_Name": userData.Employee_Name,
                        "id": userData.id,
                        "companyOwnerId": userData.companyOwnerId
                    },
                    isUpdateTask
                })
                .then((response) => {
                    if (response.data.status) {
                        resolve({status: true, statusText: "Task due date updated successfully"});
                    } else {
                        reject({status: false, error: response.data.error})
                    }
                })
                .catch((error) => {
                    reject({status: false, error: error})
                })
            } catch (error) {
                reject({status: false, error: error})
            }
        })
    }

    /* -------------- UPDATE STATUS FUNCTION FOR TASK -----------------*/

    updateStatus({ newStatus, prevStatus, projectData, task, userData , isUpdateTask = true}) {
        return new Promise((resolve,reject) => {
            try {
                apiRequest("patch", env.V2_TASKS, {
                    action: "updateStatus",
                    newStatus,
                    prevStatus,
                    projectData,
                    task,
                    isUpdateTask,
                    userData: {
                        "Employee_Name": userData.Employee_Name,
                        "id": userData.id,
                        "companyOwnerId": userData.companyOwnerId
                    }
                })
                .then((response) => {
                    if (response.data.status) {
                        resolve({status: true, statusText: "Task status updated successfully"});
                    } else {
                        reject({status: false, error: response.data.error})
                    }
                })
                .catch((error) => {
                    reject({status: false, error: error})
                })
            } catch (error) {
                reject({status: false, error: error})
            }
        })
    }

    /* -------------- UPDATE PRIORITY FUNCTION FOR TASK -----------------*/

    updatePriority({ firebaseObj ,projectData ,taskData ,priorityObj, userData,isUpdateTask = true}) {
        return new Promise((resolve,reject) => {
            try {
                apiRequest("patch", env.V2_TASKS, {
                    action: "updatePriority",
                    firebaseObj,
                    projectData,
                    taskData,
                    priorityObj,
                    isUpdateTask,
                    userData: {
                        "Employee_Name": userData.Employee_Name,
                        "id": userData.id,
                        "companyOwnerId": userData.companyOwnerId
                    }
                })
                .then((response) => {
                    if (response.data.status) {
                        resolve({status: true, statusText: "Task priority updated successfully"});
                    } else {
                        reject({status: false, error: response.data.error})
                    }
                })
                .catch((error) => {
                    reject({status: false, error: error})
                })
            } catch (error) {
                reject({status: false, error: error})
            }
        })
    }

    /* -------------- UPDATE TASK NAME FUNCTION -----------------*/

    updateTaskName({ firebaseObj,projectData ,taskData ,obj, userData}) {
        return new Promise((resolve,reject) => {
            try {
                apiRequest("patch", env.V2_TASKS, {
                    action: "updateTaskName",
                    firebaseObj,
                    projectData,
                    taskData,
                    obj,
                    userData: {
                        "Employee_Name": userData.Employee_Name,
                        "id": userData.id,
                        "companyOwnerId": userData.companyOwnerId
                    }
                })
                .then((response) => {
                    if (response.data.status) {
                        resolve({status: true, statusText: "Task name updated successfully"});
                    } else {
                        reject({status: false, error: response.data.error})
                    }
                })
                .catch((error) => {
                    reject({status: false, error: error})
                })
            } catch (error) {
                reject({status: false, error: error})
            }
        })
    } 

    /* -------------- UPDATE ASSIGNEE ADD OR ASSIGNEE REMOVE FUNCTION FOR TASK -----------------*/

    updateAssignee({ firebaseObj,projectData ,taskData,employeeName,type,userData,isUpdateTask = true}) {
        return new Promise((resolve,reject) => {
            try {
                apiRequest("patch", env.V2_TASKS, {
                    action: "updateAssignee",
                    firebaseObj,
                    projectData,
                    taskData,
                    employeeName,
                    type,
                    isUpdateTask,
                    userData: {
                        "Employee_Name": userData.Employee_Name,
                        "id": userData.id,
                        "companyOwnerId": userData.companyOwnerId
                    }
                })
                .then((response) => {
                    if (response.data.status) {
                        resolve({status: true, statusText: "Task assignee updated successfully"});
                    } else {
                        reject({status: false, error: response.data.error})
                    }
                })
                .catch((error) => {
                    reject({status: false, error: error})
                })
            } catch (error) {
                reject({status: false, error: error})
            }
        })
    }

    /* -------------- UPDATE TASK WATCHER -----------------*/
    updateWatcher({companyId, projectId, sprintId, taskId, userId, add,userData,employeeName}) {
        return new Promise((resolve,reject) => {
            try {
                apiRequest("patch", env.V2_TASKS, {action: "updateWatcher", companyId, projectId, sprintId, taskId, userId, add,userData,employeeName})
                .then((response) => {
                    if (response.data.status) {
                        resolve({status: true, statusText: "Task watcher updated successfully"});
                    } else {
                        reject({status: false, error: response.data.error})
                    }
                })
                .catch((error) => {
                    reject({status: false, error: error})
                })
            } catch (error) {
                reject({status: false, error: error})
            }
        })
    }

    /* -------------- UPDATE TAGS -----------------*/
    updateTags({companyId, projectId, sprintId, taskId, tagId, operation}) {
        return new Promise((resolve,reject) => {
            try {
                apiRequest("patch", env.V2_TASKS, {action: "updateTags", companyId, projectId, sprintId, taskId, tagId, operation})
                .then((response) => {
                    if (response.data.status) {
                        resolve({status: true, statusText: "Task tags updated successfully"});
                    } else {
                        reject({status: false, error: response.data.error})
                    }
                })
                .catch((error) => {
                    reject({status: false, error: error})
                })
            } catch (error) {
                reject({status: false, error: error})
            }
        })
    }

    /* -------------- UPDATE CHECKLISTS -----------------*/
    updateChecklists({companyId, projectId, sprintId, taskId, id = "", operation, data = {}}) {
        return new Promise((resolve,reject) => {
            try {
                apiRequest("patch", "/api/v2/tasks", {action: "updateChecklists", companyId, projectId, sprintId, taskId, id, operation, data})
                .then((response) => {
                    if (response.data.status) {
                        resolve({status: true, statusText: "Task checklists updated successfully"});
                    } else {
                        reject({status: false, error: response.data.error})
                    }
                })
                .catch((error) => {
                    reject({status: false, error: error})
                })
            } catch (error) {
                reject({status: false, error: error})
            }
        })
    }

    /* -------------- UPDATE ATTACHMENTS -----------------*/
    updateAttachments({companyId, sprintId, taskId, taskData, id = "", operation, data = {}, userData,projectData }) {
        return new Promise((resolve,reject) => {
            try {
                apiRequest("patch", env.V2_TASKS, {action: "updateAttachments", companyId, sprintId, taskId, taskData, id, operation, data, userData,projectData})
                .then((response) => {
                    if (response.data.status) {
                        resolve({status: true, statusText: "Task attachments updated successfully"});
                    } else {
                        reject({status: false, error: response.data.error})
                    }
                })
                .catch((error) => {
                    reject({status: false, error: error})
                })
            } catch (error) {
                reject({status: false, error: error})
            }
        })
    }

    /* -------------- UPDATE DESCRIPTION -----------------*/
    updateDescription({companyId, projectData, sprintId, task = {}, userData, text = ""}) {
        return new Promise((resolve,reject) => {
            try {
                apiRequest("patch", env.V2_TASKS, {action: "updateDescription", companyId, projectData, sprintId, task, userData, text})
                .then((response) => {
                    if (response.data.status) {
                        resolve({status: true, statusText: "Task description updated successfully"});
                    } else {
                        reject({status: false, error: response.data.error})
                    }
                })
                .catch((error) => {
                    reject({status: false, error: error})
                })
            } catch (error) {
                reject({status: false, error: error})
            }
        })
    }

    /* -------------- MARK AS FAVOURITE -----------------*/
    markAsFavourite({taskData, userId}) {
        return new Promise((resolve, reject) => {
            try {
                let updateObj = {};

                const index = taskData && taskData.favouriteTasks ? taskData.favouriteTasks.findIndex((item) => item === userId) : -1;
                let type = "";

                if(index === -1) {
                    type = "add";
                    updateObj = {
                        $push: { favouriteTasks: userId},
                    }
                } else {
                    type = "remove";
                    updateObj = {
                        $pull: { favouriteTasks: taskData.favouriteTasks[index] },
                    }
                }

                const query = {
                    type: "updateOne",
                    collection: dbCollections.TASKS,
                    data: [
                        { _id: BSON.ObjectID(taskData._id) },
                        { ...updateObj },
                        { upsert: true }
                    ]
                };

                mongoQuery.mongodbCrudOperations(query).then(() => {
                    resolve({status: true, statusText: `${type === "add" ? "Added to" : "Removed from"} favorite`});
                })
                .catch((error) => {
                    reject(error)
                    console.error("ERROR in update task watcher: ", error.message);
                })
            } catch (error) {
                reject(error)
            }
        });
    }

    /* -------------- UPDATE ARV+CHIEVE/DELETE/RESTORE -----------------*/
    updateArchiveDelete({companyId, projectData, sprintId, task = {}, userData, deletedStatusKey = 0}) {
        return new Promise((resolve,reject) => {
            try {
                apiRequest("patch", env.V2_TASKS, {action: "updateArchiveDelete", companyId, projectData, sprintId, task, userData, deletedStatusKey})
                .then((response) => {
                    if (response.data.status) {
                        resolve({status: true, statusText: "Task description updated successfully"});
                    } else {
                        reject({status: false, error: response.data.error})
                    }
                })
                .catch((error) => {
                    reject({status: false, error: error})
                })
            } catch (error) {
                reject({status: false, error: error})
            }
        })
    }

    convertToSubTask({companyId, projectData, sprintId, selectedTaskId,taskId,oldProject,isSubTask,userData}) {
        return new Promise((resolve,reject) => {
            try {
                apiRequest("patch", "/api/v2/tasks", {action: "convertToSubTask", companyId, projectData, sprintId, selectedTaskId,taskId,oldProject,isSubTask,userData})
                .then((response) => {
                    if (response.data.status) {
                        resolve({status: true, statusText: "converted"});
                    } else {
                        reject({status: false, error: response.data.error})
                    }
                })
                .catch((error) => {
                    reject({status: false, error: error})
                })
            } catch (error) {
                reject({status: false, error: error})
            }
        })
    }

    moveTask({companyId, projectData, sprintObj, moveTaskId,oldSprintObj,oldProject,isSubTask,assignee,watcher,userData}) {
        return new Promise((resolve,reject) => {
            try {
                apiRequest("patch", "/api/v2/tasks", {action: "moveTask", companyId, projectData, sprintObj, moveTaskId, oldSprintObj,oldProject,isSubTask,assignee,watcher,userData})
                .then((response) => {
                    if (response.data.status) {
                        resolve({status: true, statusText: "moved"});
                    } else {
                        reject({status: false, error: response.data.error})
                    }
                })
                .catch((error) => {
                    reject({status: false, error: error})
                })
            } catch (error) {
                reject({status: false, error: error})
            }
        })
    }

    convertToList({companyId, projectData, taskId, userData, folderData, sprintObj,isSubTask}) {
        return new Promise((resolve,reject) => {
            try {
                apiRequest("patch", "/api/v2/tasks", {action: "convertToList", companyId, projectData, taskId, userData, folderData, sprintObj,isSubTask})
                .then((response) => {
                    if (response.data.status) {
                        resolve({status: true, statusText: "convert To List",data:response.data.data});
                    } else {
                        reject({status: false, error: response.data.error});
                    }
                })
                .catch((error) => {
                    reject({status: false, error: error});
                })
            } catch (error) {
                reject({status: false, error: error});
            }
        });
    }

    mergeTask({companyId, projectData, taskId, mergeTaskId,oldProject,isSubTask,userData}) {
        return new Promise((resolve,reject) => {
            try {
                apiRequest("patch", "/api/v2/tasks", {action: "mergeTask", companyId, projectData, taskId, mergeTaskId,oldProject,isSubTask,userData})
                .then((response) => {
                    if (response.data.status) {
                        resolve({status: true, statusText: "merge"});
                    } else {
                        reject({status: false, error: response.data.error})
                    }
                })
                .catch((error) => {
                    reject({status: false, error: error})
                }) 
            } catch (error) {
                reject({status: false, error: error})
            }
        })
    }

    duplicateTask({companyId, projectData, sprintObj, selectedTaskId,oldProject,userData,isSubTask,duplicateData,assignee,watcher,taskName,oldSprintObj}) {
        return new Promise((resolve,reject) => {
            try {
                apiRequest("patch", "/api/v2/tasks", {action: "duplicateTask", companyId, projectData, sprintObj, selectedTaskId,oldProject,userData,isSubTask,duplicateData,assignee,watcher,taskName,oldSprintObj})
                .then((response) => {
                    if (response.data.status) {
                        resolve({status: true, statusText: "duplicateTask",taskId: response.data.data.taskId});
                    } else {
                        reject({status: false, error: response.data.error})
                    }
                })
                .catch((error) => {
                    reject({status: false, error: error})
                }) 
            } catch (error) {
                reject({status: false, error: error})
            }
        })
    }
    updateQueueList({CompanyId, projectId, sprintId, taskId,userId,actionType,taskName,userData}) {

        return new Promise((resolve,reject) => {
            try {
                let axiosData = {
                    CompanyId : CompanyId,
                    projectId : projectId,
                    action: "updateQueueList",
                    sprintId:sprintId,
                    taskId:taskId,
                    userId:userId,
                    actionType:actionType,
                    taskName:taskName,
                    userData:userData
                }
                apiRequest("patch", env.V2_TASKS, axiosData)
                .then((response) => {
                    if (response.data.status) {
                        resolve({status: true, statusText: "updateQueueList",taskId: response.data.data.taskId});
                    } else {
                        reject({status: false, error: response.data.error})
                    }
                })
                .catch((error) => {
                    reject({status: false, error: error})
                }) 
            } catch (error) {
                reject({status: false, error: error})
            }
        })
    }

    convertToTask({companyId, projectData, taskId, sprintObj,parentTaskId,oldSprintObj,oldProject}) {
        return new Promise((resolve,reject) => {
            try {
                apiRequest("patch", "/api/v2/tasks", {action: "convertToTask", companyId, projectData, taskId, sprintObj,parentTaskId,oldSprintObj,oldProject})
                .then((response) => {
                    if (response.data.status) {
                        resolve({status: true, statusText: "convertToTask"});
                    } else {
                        reject({status: false, error: response.data.error})
                    }
                })
                .catch((error) => {
                    reject({status: false, error: error})
                }) 
            } catch (error) {
                reject({status: false, error: error})
            }
        })
    }

    createSubTaskWithAi({companyId,userId,subTitles,sprintObj,projectData,userData,parentTask,type}){
        return new Promise((resolve,reject) => {
            try {
                apiRequest("patch", "/api/v2/tasks", {action: "createSubTaskWithAi", companyId,userId,subTitles,sprintObj,projectData,userData,parentTask,type})
                .then((response) => {
                    if (response.data.status) {
                        resolve({status: true, statusText: "Created",data : response.data.data});
                    } else {
                        reject({status: false, error: response.data.error})
                    }
                })
                .catch((error) => {
                    reject({status: false, error: error})
                }) 
            } catch (error) {
                reject({status: false, error: error})
            }
        })
    }
}

export default new Task();