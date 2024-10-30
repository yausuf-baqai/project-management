// import { useFirebase } from "@/composable";
import { dbCollections, settingsCollectionDocs } from "@/utils/FirebaseCollections";
import * as mongoQuery from "@/utils/MongoQueries/crudOperations/crudOperations";
import { mongodbSnapshot } from "@/utils/MongoQueries/crudOperationsWithSanpshot/crudOperationsWithSanpshot";
import { BSON } from "realm-web";

// const { generateQuery } = useFirebase();

export const setRules = ({commit,state}) => {
    return new Promise((resolve, reject) => {
        try {

            let options = {
                subCollection : dbCollections.RULES,
                watchFilter: {}
            }

            let getQuery = {
                type : "find",
                collection : dbCollections.RULES,
                data: []
            }

            mongodbSnapshot(options,({error, data, type}) => {
                if(error) {
                    reject(error)
                } else {
                    if(type === "inital") {
                        mongoQuery.mongodbCrudOperations(getQuery)
                        .then((res) => {
                            resolve(res)
                            commit("mutateArrangedRules", res);
                            res.forEach((x) => {
                                commit("mutateRules", {
                                    data: {...x, _id: x._id},
                                    op: "added",
                                })
                            })
                        })
                        .catch((error) => {
                            reject(error)
                        })
                    } else if(type === "insert") {
                        const docData = data.fullDocument;
                        commit("mutateRules", {
                            data: {...docData, _id: docData._id},
                            op: "added",
                        })
                        commit("mutateArrangedRules", state.rawRules);
                    } else if(type === "update" || type === "replace") {
                        const docData = data.fullDocument;
                        commit("mutateRules", {
                            data: {...docData, _id: docData._id},
                            op: "modified",
                        })
                        commit("mutateArrangedRules", state.rawRules);
                    } else if(type === "delete") {
                        const docId = data.documentKey._id;
                        commit("mutateRules", {
                            data: {_id: docId},
                            op: "removed",
                        })
                        commit("mutateArrangedRules", state.rawRules);
                    }
                }
            })
        } catch (error) {
            reject(error);
        }
    });
}

export const setProjectRules = ({commit,state},payload) => {
    return new Promise((resolve, reject) => {
        try {
            if(state.projectRawRules){
                state.projectRawRules.forEach((data) => {
                    if(data.projectId == payload.pid) {
                        resolve();
                        return;
                    }else{
                        state.projectRawRules = [];
                        state.projectRules = [];
                    }
                })
            }
            let options = {
                subCollection : dbCollections.PROJECT_RULES,
                watchFilter: {
                    filter: {
                        $or: [
                            {
                                'operationType': 'delete'
                            },
                            {
                                'operationType': { $in: ['insert', 'update', 'replace'] },
                                'fullDocument.projectId': payload?.pid
                            }
                        ]
                    }
                }
            }

            let getQuery = {
                type : "find",
                collection : dbCollections.PROJECT_RULES,
                data: [
                    {
                        "projectId": payload.pid
                    }
                ]
            }

            mongodbSnapshot(options,({error, data, type}) => {
                if(error) {
                    reject(error)
                } else {
                    if(type === "inital") {
                        mongoQuery.mongodbCrudOperations(getQuery)
                        .then((res) => {
                            resolve(res)
                            commit("mutateArrangeProjectRules", {op:"added", data : res,projectId : payload.pid});
                            res.forEach((x) => {
                                commit("mutateProjectRules", {
                                    projectId : payload.pid,
                                    data: {...x, _id: x._id},
                                    op: "added",
                                })
                            })
                        })
                        .catch((error) => {
                            reject(error)
                        })
                    } else if(type === "insert") {
                        const docData = data.fullDocument;
                        commit("mutateProjectRules", {
                            projectId : payload.pid,
                            data: {...docData, _id: docData._id},
                            op: "added",
                        })
                        commit("mutateArrangeProjectRules", {op:"added",data : state.projectRawRules,projectId : payload.pid});
                    } else if(type === "update" || type === "replace") {
                        const docData = data.fullDocument;
                        commit("mutateProjectRules", {
                            projectId : payload.pid,
                            data: {...docData, _id: docData._id},
                            op: "modified",
                        })
                        commit("mutateArrangeProjectRules", {op:"modified",data : state.projectRawRules,projectId : payload.pid});
                    } else if(type === "delete") {
                        const docId = data.documentKey._id;
                        commit("mutateProjectRules", {
                            projectId : payload.pid,
                            data: {_id: docId},
                            op: "removed",
                        })
                        commit("mutateArrangeProjectRules", {op:"removed",data : state.projectRawRules,projectId : payload.pid});
                    }
                }
            })
        } catch (error) {
            reject(error);
        }
    });
}

export const setRoles = ({commit}) => {
    return new Promise((resolve, reject) => {
        try {

            let options = {
                subCollection : dbCollections.SETTINGS,
                watchFilter: {
                    filter: {
                        $or: [
                            {
                                'operationType': 'delete'
                            },
                            {
                                'operationType': { $in: ['insert', 'update', 'replace'] },
                                'fullDocument.name':settingsCollectionDocs.ROLES
                            }
                        ]
                    }
                }
            }

            let getQuery = {
                type : "findOne",
                collection : dbCollections.SETTINGS,
                data:[
                    {
                        "name":settingsCollectionDocs.ROLES
                    }
                ]
            }

            mongodbSnapshot(options,({error, data, type}) => {
                if(error) {
                    reject(error)
                } else {
                    if(type === "inital") {
                        mongoQuery.mongodbCrudOperations(getQuery)
                        .then((res) => {
                            commit("mutateRoles",{
                                data : res?.settings,
                                op : "added"
                            })
                            resolve(res)
                        })
                        .catch((error) => {
                            console.error("ERROR in get roles: ", error);
                            reject(error);
                        })
                    } else if(type === "insert") {
                        const docData = data.fullDocument?.settings;
                        commit("mutateRoles", {
                            data: docData,
                            op: "added",
                        })
                    } else if(type === "update" || type === "replace") {
                        const docData = data.fullDocument?.settings;
                        commit("mutateRoles", {
                            data: docData,
                            op: "modified",
                        })
                    } else if(type === "delete") {
                        commit("mutateRoles", {
                            op: "removed",
                        })
                    }
                }
            })

        } catch (error) {
            reject(error);
        }
    });
}

export const setCompanyUsers = ({commit},payload) => {
    return new Promise((resolve, reject) => {
        try {

            const snapQuery = {
                subCollection: dbCollections.COMPANY_USERS,
                watchFilter: {}
            }
            const getQuery = {
                type: "find",
                collection: dbCollections.COMPANY_USERS,
                data: [{}]
            }

            mongodbSnapshot(snapQuery, ({error, data, type}) => {
                if(error) {
                    reject(error)
                } else {
                    if(type === "inital") {
                        mongoQuery.mongodbCrudOperations(getQuery)
                        .then((res) => {
                            resolve(res)
                            res.forEach((x) => {
                                commit("mutateCompanyUsers", {
                                    data: {...x, _id: x._id,isCurrentUser: x.userId === payload.userId,requestId: x._id},
                                    op: "added",
                                })
                            })
                        })
                        .catch((error) => {
                            reject(error)
                        })
                    } else if(type === "insert") {
                        const docData = data.fullDocument;
                        commit("mutateCompanyUsers", {
                            data: {...docData, _id: docData._id,isCurrentUser: docData.userId === payload.userId,requestId: docData._id},
                            op: "added",
                        })
                    } else if(type === "update" || type === "replace") {
                        const docData = data.fullDocument;
                        commit("mutateCompanyUsers", {
                            data: {...docData, _id: docData._id,isCurrentUser: docData.userId === payload.userId,requestId: docData._id},
                            op: "modified",
                        })
                    } else if(type === "delete") {
                        const docId = data.documentKey._id;
                        commit("mutateCompanyUsers", {
                            data: {_id: docId},
                            op: "removed",
                        })
                    }
                }
            })
        } catch (error) {
            reject(error);
        }
    });
}

export const setCompanyUserStatus = ({commit}) => {
    return new Promise((resolve, reject) => {
        try {
            let options = {
                subCollection : dbCollections.SETTINGS,
                watchFilter: {
                    filter: {
                        $or: [
                            {
                                'operationType': 'delete'
                            },
                            {
                                'operationType': { $in: ['insert', 'update', 'replace'] },
                                'fullDocument.name':settingsCollectionDocs.COMPANY_USER_STATUS
                            }
                        ]
                    }
                }
            }

            let getQuery = {
                type : "findOne",
                collection : dbCollections.SETTINGS,
                data:[
                    {
                        "name":settingsCollectionDocs.COMPANY_USER_STATUS
                    }
                ]
            }

            mongodbSnapshot(options,({error, data, type}) => {
                if(error) {
                    reject(error)
                } else {
                    if(type === "inital") {
                        mongoQuery.mongodbCrudOperations(getQuery)
                        .then((res) => {
                            commit("mutateCompanyUserStatus",{
                                data: res?.settings,
                                op: "added"
                            })
                            resolve(res)
                        })
                        .catch((error) => {
                            console.error("ERROR in get company user status: ", error);
                            reject(error);
                        })
                    } else if(type === "insert") {
                        const docData = data.fullDocument?.settings;
                        commit("mutateCompanyUserStatus", {
                            data: docData,
                            op: "added",
                        })
                    } else if(type === "update" || type === "replace") {
                        const docData = data.fullDocument?.settings;
                        commit("mutateCompanyUserStatus", {
                            data: docData,
                            op: "modified",
                        })
                    } else if(type === "delete") {
                        commit("mutateCompanyUserStatus", {
                            op: "removed",
                        })
                    }
                }
            })
        } catch (error) {
            reject(error);
        }
    });
}

export const setDesignations = ({commit}) => {
    return new Promise((resolve, reject) => {
        try {
            let object = {
                type:"find",
                collection:dbCollections.SETTINGS,
                data:[
                    {
                        "name":settingsCollectionDocs.DESIGNATIONS
                    }
                ]
            }
            let options = {
                subCollection:dbCollections.SETTINGS, 
                watchFilter: {
                    filter: {
                        $or: [
                            {
                                'operationType': 'delete'
                            },
                            {
                                'operationType': { $in: ['insert', 'update', 'replace'] },
                                'fullDocument.name':settingsCollectionDocs.DESIGNATIONS
                            }
                        ]
                    }
                }
            }
            mongodbSnapshot(options,({error, data, type}) => {
                if(error) {
                    reject(error)
                } else {
                    if(type === "inital") {
                        mongoQuery.mongodbCrudOperations(object)
                        .then((res) => {
                            commit("mutateDesignations",{
                                data: res[0]?.settings,
                                op: "added"
                            })
                            resolve(res[0])
                        })
                        .catch((error) => {
                            console.error("ERROR in get designations: ", error);
                            reject(error);
                        })
                    } else if(type === "insert") {
                        const docData = data.fullDocument?.settings;
                        commit("mutateDesignations", {
                            data: docData,
                            op: "added",
                        })
                    } else if(type === "update" || type === "replace") {
                        const docData = data.fullDocument?.settings;
                        commit("mutateDesignations", {
                            data: docData,
                            op: "modified",
                        })
                    } else if(type === "delete") {
                        commit("mutateDesignations", {
                            op: "removed",
                        })
                    }
                }
            })
        } catch (error) {
            reject(error);
        }
    });
}

export const setMileStoneStatus = ({commit}) => {
    return new Promise((resolve, reject) => {
        try {
            let object = {
                type:"find",
                collection:dbCollections.SETTINGS,
                data:[
                    {
                        "name":settingsCollectionDocs.PROJECT_MILESTONE_STATUS
                    }
                ]
            }
            let options = {
                subCollection:dbCollections.SETTINGS, 
                watchFilter: {
                    filter: {
                        $or: [
                            {
                                'operationType': 'delete'
                            },
                            {
                                'operationType': { $in: ['insert', 'update', 'replace'] },
                                'fullDocument.name':settingsCollectionDocs.PROJECT_MILESTONE_STATUS
                            }
                        ]
                    }
                }
            }
            mongoQuery.mongodbCrudOperations(object).then((res)=>{
                commit("mutateProjectMilestoneStatus", res[0].settings)
                resolve(res[0]);
            }).catch((error)=>{
                console.error("ERROR in get ProjectMilestoneStatus: ", error);
                reject(error);
            });
            mongodbSnapshot(options,(value)=>{
                if(value.error === null){
                    if(value.type === "insert"){
                        const insert = value.data.fullDocument;
                        commit("mutateProjectMilestoneStatus", insert.settings);
                        resolve(insert);
                    } else if(value.type === "update"){
                        const update = value.data.fullDocument;
                        commit("mutateProjectMilestoneStatus", update.settings);
                        resolve(update);
                    }
                }else{
                    reject(value.error);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

export const setCompanies = ({commit},companyIds) => {
    return new Promise((resolve, reject) => {
        try {
            let options = {
                subCollection : dbCollections.COMPANIES,
                global: true,
                watchFilter: {
                    filter: {
                        "fullDocument._id": {$in: [...companyIds.map(x => BSON.ObjectID(x))]}
                    }
                }
            }

            let getQuery = {
                type : "find",
                collection : dbCollections.COMPANIES,
                global: true,
                data: [
                    {
                        _id: {$in: [...companyIds.map(x => BSON.ObjectID(x))]}
                    }
                ]
            }

            mongodbSnapshot(options,({error, data, type}) => {
                if(error) {
                    reject(error)
                } else {
                    if(type === "inital") {
                        mongoQuery.mongodbCrudOperations(getQuery)
                        .then((res) => {
                            resolve(res)
                            res.forEach((x) => {
                                commit("mutateCompanies", {
                                    data: {...x, _id: x._id},
                                    op: "added",
                                })
                            })
                        })
                        .catch((error) => {
                            reject(error)
                        })
                    } else if(type === "insert") {
                        const docData = data.fullDocument;
                        commit("mutateCompanies", {
                            data: {...docData, _id: docData._id},
                            op: "added",
                        })
                    } else if(type === "update" || type === "replace") {
                        const docData = data.fullDocument;
                        commit("mutateCompanies", {
                            data: {...docData, _id: docData._id},
                            op: "modified",
                        })
                    } else if(type === "delete") {
                        const docId = data.documentKey._id;
                        commit("mutateCompanies", {
                            data: {_id: docId},
                            op: "removed",
                        })
                    }
                }
            })
        } catch (error) {
            reject(error);
        }
    });
}

export const setFileExtentions = ({commit}) => {
    return new Promise((resolve, reject) => {
        try {
            let object = {
                type:"find",
                collection:dbCollections.SETTINGS,
                data:[
                    {
                        "name":settingsCollectionDocs.ALLOWED_FILE_EXTENSION
                    }
                ]
            }
            let options = {
                subCollection:dbCollections.SETTINGS, 
                watchFilter: {
                    filter: {
                        $or: [
                            {
                                'operationType': 'delete'
                            },
                            {
                                'operationType': { $in: ['insert', 'update', 'replace'] },
                                'fullDocument.name':settingsCollectionDocs.ALLOWED_FILE_EXTENSION
                            }
                        ]
                    }
                }
            }
            mongodbSnapshot(options,({error, data, type}) => {
                if(error) {
                    reject(error)
                } else {
                    if(type === "inital") {
                        mongoQuery.mongodbCrudOperations(object)
                        .then((res) => {
                            commit("mutateFileExtentions",{
                                data: res[0]?.settings,
                                op: "added"
                            })
                            resolve(res[0])
                        })
                        .catch((error) => {
                            console.error("ERROR in get extensions: ", error);
                            reject(error);
                        })
                    } else if(type === "insert") {
                        const docData = data.fullDocument?.settings;
                        commit("mutateFileExtentions", {
                            data: docData,
                            op: "added",
                        })
                    } else if(type === "update" || type === "replace") {
                        const docData = data.fullDocument?.settings;
                        commit("mutateFileExtentions", {
                            data: docData,
                            op: "modified",
                        })
                    } else if(type === "delete") {
                        commit("mutateFileExtentions", {
                            op: "removed",
                        })
                    }
                }
            })
        } catch (error) {
            reject(error);
        }
    });
}

export const setProjectTabComponents = ({commit}) => {
    return new Promise((resolve, reject) => {
        try {
            let options = {
                subCollection : dbCollections.PROJECT_TAB_COMPONENTS,
                watchFilter: {}
            }

            let getQuery = {
                type : "find",
                collection : dbCollections.PROJECT_TAB_COMPONENTS,
                data: []
            }

            mongodbSnapshot(options,({error, data, type}) => {
                if(error) {
                    reject(error)
                } else {
                    if(type === "inital") {
                        mongoQuery.mongodbCrudOperations(getQuery)
                        .then((res) => {
                            resolve(res)
                            res.forEach((x) => {
                                commit("mutateProjectTabComponents", {
                                    data: {...x},
                                    op: "added",
                                })
                            })
                        })
                        .catch((error) => {
                            reject(error)
                        })
                    } else if(type === "insert") {
                        const docData = data.fullDocument;
                        commit("mutateProjectTabComponents", {
                            data: {...docData},
                            op: "added",
                        })
                    } else if(type === "update" || type === "replace") {
                        const docData = data.fullDocument;
                        commit("mutateProjectTabComponents", {
                            data: {...docData},
                            op: "modified",
                        })
                    } else if(type === "delete") {
                        const docId = data.documentKey._id;
                        commit("mutateProjectTabComponents", {
                            data: {_id: docId},
                            op: "removed",
                        })
                    }
                }
            })
        } catch (error) {
            reject(error);
        }
    });
}

export const setCompanyPriority = ({ commit }) => {
    return new Promise((resolve, reject) => {
        try {
            let object = {
                type:"find",
                collection:dbCollections.SETTINGS,
                data:[
                    {
                        "name":settingsCollectionDocs.TASK_PRIORITIES
                    }
                ]
            }
            let options = {
                subCollection:dbCollections.SETTINGS, 
                watchFilter: {
                    filter: {
                        $or: [
                            {
                                'operationType': 'delete'
                            },
                            {
                                'operationType': { $in: ['insert', 'update', 'replace'] },
                                'fullDocument.name':settingsCollectionDocs.TASK_PRIORITIES
                            }
                        ]
                    }
                }
            }
            mongodbSnapshot(options,({error, data, type}) => {
                if(error) {
                    reject(error)
                } else {
                    if(type === "inital") {
                        mongoQuery.mongodbCrudOperations(object)
                        .then((res) => {
                            commit("mutateCompanyPriority",{
                                data: res[0].settings,
                                op: "added"
                            })
                            resolve(res[0].settings)
                        })
                        .catch((error) => {
                            console.error("ERROR in getting company priorities settings: ", error);
                            reject(error);
                        })
                    } else if(type === "insert") {
                        const docData = data.fullDocument;
                        commit("mutateCompanyPriority", {
                            data: docData.settings,
                            op: "added",
                        })
                    } else if(type === "update" || type === "replace") {
                        const docData = data.fullDocument;
                        commit("mutateCompanyPriority", {
                            data: docData.settings,
                            op: "modified",
                        })
                    } else if(type === "delete") {
                        commit("mutateCompanyPriority", {
                            op: "removed",
                        })
                    }
                }
            })
        } catch (error) {
            reject(error);
        }
    });
}

export const setCompayDateFormat = ({commit}) => {
    return new Promise((resolve, reject) => {
        try {
            let object = {
                type:"find",
                collection:dbCollections.SETTINGS,
                data:[
                    {
                        "name":settingsCollectionDocs.COMMON_DATE_FORMAT
                    }
                ]
            }
            let options = {
                subCollection:dbCollections.SETTINGS, 
                watchFilter: {
                    filter: {
                        $or: [
                            {
                                'operationType': 'delete'
                            },
                            {
                                'operationType': { $in: ['insert', 'update', 'replace'] },
                                'fullDocument.name':settingsCollectionDocs.COMMON_DATE_FORMAT
                            }
                        ]
                    }
                }
            }
            mongodbSnapshot(options,({error, data, type}) => {
                if(error) {
                    reject(error)
                } else {
                    if(type === "inital") {
                        mongoQuery.mongodbCrudOperations(object)
                        .then((res) => {
                            commit("mutateCompanyDateFormat",{
                                data: res[0]?.settings,
                                op: "added"
                            })
                            resolve(res[0])
                        })
                        .catch((error) => {
                            console.error("ERROR in get date format: ", error);
                            reject(error);
                        })
                    } else if(type === "insert") {
                        const docData = data.fullDocument?.settings;
                        commit("mutateCompanyDateFormat", {
                            data: docData,
                            op: "added",
                        })
                    } else if(type === "update" || type === "replace") {
                        const docData = data.fullDocument?.settings;
                        commit("mutateCompanyDateFormat", {
                            data: docData,
                            op: "modified",
                        })
                    } else if(type === "delete") {
                        commit("mutateCompanyDateFormat", {
                            op: "removed",
                        })
                    }
                }
            })
        } catch (error) {
            reject(error);
        }
    });
}

export const setNotificationRules = ({commit}, payload) => {
    return new Promise((resolve, reject) => {
        try {
            let object = {
                type:"find",
                collection:dbCollections.NOTIFICATIONS_SETTINGS,
                data:[
                    {
                        "userId":payload.userId
                    }
                ]
            }
            mongoQuery.mongodbCrudOperations(object)
            .then((res) => {
                commit("mutateNotificationSettings",{
                    data: res[0],
                    op: "added"
                })
                resolve(res[0])
            })
            .catch((error) => {
                console.error("ERROR in get notification settings: ", error);
                reject(error);
            })
        } catch (error) {
            reject(error);
        }

    })
}

export const setTaskType = ({commit}) => {
    return new Promise((resolve, reject) => {
        try {
            let getQuery = {
                type : "find",
                collection : dbCollections.TASK_TYPE_TEMPLATES,
                data: []
            }
            mongoQuery.mongodbCrudOperations(getQuery)
            .then((res) => {
                resolve(res)
                res.forEach((x) => {
                    commit("mutateTaskType", {
                        data: {...x, _id: x._id},
                        op: "added",
                    })
                })
            })
            .catch((error) => {
                reject(error)
            })
        } catch (error) {
            reject(error);
        }
    });
}
export const setTaskStatus = ({commit}) => {
    return new Promise((resolve, reject) => {
        try {
            let getQuery = {
                type : "find",
                collection : dbCollections.TASK_STATUS_TEMPLATES,
                data: []
            }

            mongoQuery.mongodbCrudOperations(getQuery)
            .then((res) => {
                resolve(res)
                res.forEach((x) => {
                    commit("mutateTaskStatus", {
                        data: {...x, _id: x._id},
                        op: "added",
                    })
                })
            })
            .catch((error) => {
                reject(error)
            })
        }
        catch(error){
            reject(error);
        }
    })
}
export const setCategory = ({commit}) => {
    return new Promise((resolve, reject) => {
        try {
            let object = {
                type:"find",
                collection:dbCollections.SETTINGS,
                data:[
                    {
                        "name":settingsCollectionDocs.PROJECT_CATEGORY
                    }
                ]
            }
            mongoQuery.mongodbCrudOperations(object).then((res)=>{
                commit("mutateCategory", res[0].settings)
                resolve(res[0]);
            }).catch((error)=>{
                console.error("ERROR in get mutateCategory: ", error);
                reject(error);
            });
        } catch (error) {
            reject(error);
            console.error("ERROR mutateCategory",error)
        }
    });
}

export const setMileStoneWeeklyRange = ({commit}) => {
    return new Promise((resolve, reject) => {
        try {
            let object = {
                type:"find",
                collection:dbCollections.SETTINGS,
                data:[
                    {
                        "name":settingsCollectionDocs.HOURLY_MILESTONE_WEEKLY_RANGE
                    }
                ]
            }
            let options = {
                subCollection:dbCollections.SETTINGS, 
                watchFilter: {
                    filter: {
                        $or: [
                            {
                                'operationType': 'delete'
                            },
                            {
                                'operationType': { $in: ['insert', 'update', 'replace'] },
                                'fullDocument.name':settingsCollectionDocs.HOURLY_MILESTONE_WEEKLY_RANGE
                            }
                        ]
                    }
                }
            }
            mongodbSnapshot(options,({error, data, type}) => {
                if(error) {
                    reject(error)
                } else {
                    if(type === "inital") {
                        mongoQuery.mongodbCrudOperations(object)
                        .then((res) => {
                            commit("mutateProjectMilestoneWeeklyRange",{
                                data: res[0].settings[0],
                                op: "added"
                            })
                            resolve(res[0].settings[0])
                        })
                        .catch((error) => {
                            console.error("ERROR in get project milestone weekly range settings: ", error);
                            reject(error);
                        })
                    } else if(type === "insert") {
                        const docData = data.fullDocument;
                        commit("mutateProjectMilestoneWeeklyRange", {
                            data: docData.settings[0],
                            op: "added",
                        })
                    } else if(type === "update" || type === "replace") {
                        const docData = data.fullDocument;
                        commit("mutateProjectMilestoneWeeklyRange", {
                            data: docData.settings[0],
                            op: "modified",
                        })
                    } else if(type === "delete") {
                        commit("mutateProjectMilestoneWeeklyRange", {
                            op: "removed",
                        })
                    }
                }
            })
            }          catch (error) {
                    reject(error);
                }
    });
}

export const setTeams = ({commit}) => {
    return new Promise((resolve, reject) => {
        try {
            let options = {
                subCollection : dbCollections.TEAMS_MANAGEMENT,
                watchFilter: {}
            }

            let getQuery = {
                type : "find",
                collection : dbCollections.TEAMS_MANAGEMENT,
                data: []
            }
            
            mongodbSnapshot(options, ({ error, data, type }) => {
                if(error) {
                    reject(error)
                } else {
                    if(type === "inital") {
                        mongoQuery.mongodbCrudOperations(getQuery)
                            .then((res) => {
                                var data = res
                                if(data.length > 0){
                                    data.filter((item)=>{
                                         item['isEdit'] = false;
                                         item['isPopupOpen'] = false;
                                    })
                                }
                                data.map(item => {
                                    commit("mutateTeams",{
                                        data: item,
                                        op: "added"
                                    })
                                })
                          
                            resolve(data)
                        })
                        .catch((error) => {
                            console.error("ERROR in getting team settings: ", error);
                            reject(error);
                        })
                    } else if(type === "insert") {
                        const docData = data.fullDocument;
                        var ins = Object.assign(docData, {'isEdit': false, 'isPopupOpen': false});
                        commit("mutateTeams", {
                            data: ins,
                            op: "added",
                        })
                    } else if(type === "update" || type === "replace") {
                        const docData = data.fullDocument;
                        var upd = Object.assign(docData, {'isEdit': false, 'isPopupOpen': false});
                        commit("mutateTeams", {
                            data: upd,
                            op: "modified",
                        })
                    } else if (type === "delete") {
                        const docData = data.documentKey;
                        commit("mutateTeams", {
                            data:docData,
                            op: "removed",
                        })
                    }
                }
            })
        } catch (error) {
            reject(error);
        }
    });
}
export const setCustomFields = ({commit}) => {
    return new Promise((resolve, reject) => {
        try {
            let getQuery = {
                type : "find",
                collection : dbCollections.CUSTOM_FIELDS,
                data: [],
                global: true
            }
            mongoQuery.mongodbCrudOperations(getQuery)
                .then((res) => {
                    if (!(res && res.length)) {
                        resolve();
                        return;
                    }
                    commit("mutateCustomFields", res)
                    resolve(res);
            })
            .catch((error) => {
                reject(error);
                console.error("ERROR in get Customfields: ", error);
            })
        } catch (error) {
            reject(error);
        }

    })}


export const  setRestrictedExtensions = ({commit}) => {
    return new Promise((resolve, reject) => {
        try{
            let options = {
                subCollection : dbCollections.RESTRICTED_EXTENSIONS,
                global: true,
                watchFilter: {}
            }

            let getQuery = {
                type : "findOne",
                global: true,
                collection : dbCollections.RESTRICTED_EXTENSIONS,
                data: []
            }
            mongodbSnapshot(options,({error, data, type}) => {
                if(error) {
                    reject(error)
                } else {
                    if(type === "inital") {
                        mongoQuery.mongodbCrudOperations(getQuery)
                        .then((res) => {
                            commit("mutateRestrictedExtensions", {
                                data: res?.extensions || [],
                                op: "added",
                            })
                            resolve(res)
                        })
                        .catch((error) => {
                            reject(error)
                        })
                    } else if(type === "insert") {
                        const docData = data.fullDocument?.extensions;
                        commit("mutateRestrictedExtensions", {
                            data: docData,
                            op: "added",
                        })
                    } else if(type === "update" || type === "replace") {
                        const docData = data.fullDocument?.extensions;
                        commit("mutateRestrictedExtensions", {
                            data: docData,
                            op: "modified",
                        })
                    } else if(type === "delete") {
                        commit("mutateRestrictedExtensions", {
                            op: "removed",
                        })
                    }
                }
            })
        }
        catch(error){
            reject(error);
        }
    })
}



export const setfinalCustomFields = ({commit}) => {
    return new Promise((resolve, reject) => {
        try {
            const getQuery = {
                type: "find",
                collection: dbCollections.CUSTOM_FIELDS,
                data: []
            }
            mongoQuery.mongodbCrudOperations(getQuery)
            .then((res) => {
                commit("mutateFinalCustomFields", {
                    data: res || [],
                    op: "inital",
                });
                resolve(res)
            })
            .catch((error) => {
                reject(error)
            })
        } catch (error) {
            reject(error);
        }

    })}

    export const  setTimeTrackerDownload = ({commit}) => {
        return new Promise((resolve, reject) => {
            try{
                mongoQuery.mongodbCrudOperations({
                    type:"find",
                    collection:"timeTrackerDownload",
                    data:[{},{sort:{type: -1}}],
                    global:true
                }).then((res)=>{
                    commit("mutateTimeTrackerDownload",res)
                    resolve(res);
                }).catch((error)=>{
                    console.error("ERROR in get Time Tracker Download: ", error);
                    reject(error);
                })
            }
            catch(error){
                reject(error);
            }
        })
    }

    export const setTaskStatusArray =({commit}) => {
        return new Promise ((resolve,reject) =>{
            try{
                let options = {
                    subCollection : dbCollections.SETTINGS,
                    watchFilter: {
                        filter: {
                            $or: [
                                {
                                    'operationType': 'delete'
                                },
                                {
                                    'operationType': { $in: ['insert', 'update', 'replace'] },
                                    'fullDocument.name':settingsCollectionDocs.TASK_STATUS
                                }
                            ]
                        }
                    }
                }
    
                let getQuery = {
                    type : "find",
                    collection : dbCollections.SETTINGS,
                    data: [{
                        name:settingsCollectionDocs.TASK_STATUS
                    }]
                }
    
                mongodbSnapshot(options,({error, data, type}) => {
                    if(error) {
                        reject(error)
                    } else {
                        if(type === "inital") {
                            mongoQuery.mongodbCrudOperations(getQuery)
                            .then((res) => {
                                resolve(res[0])
                                res.forEach((x) => {
                                    commit("mutateTaskStatusArray",{
                                        data: {...x},
                                        op: "added",
                                    })
                                })
                            })
                            .catch((error) => {
                                reject(error)
                            })
                        } else if(type === "insert") {
                            const docData = data.fullDocument;
                            commit("mutateTaskStatusArray", {
                                data: {...docData, _id: docData._id},
                                op: "added",
                            })
                        } else if(type === "update" || type === "replace") {
                            const docData = data.fullDocument;
                            commit("mutateTaskStatusArray", {
                                data: {...docData, _id: docData._id},
                                op: "modified",
                            })
                        } else if(type === "delete") {
                            const docId = data.documentKey._id;
                            commit("mutateTaskStatusArray", {
                                data: {_id: docId},
                                op: "removed",
                            })
                        }
                    }
                })
            } catch(error) {
                reject(error)
            }
        })  
    }

    export const setProjectStatusArray =({commit}) => {
        return new Promise ((resolve,reject) =>{
            try{
                let options = {
                    subCollection : dbCollections.SETTINGS,
                    watchFilter: {
                        filter: {
                            $or: [
                                {
                                    'operationType': 'delete'
                                },
                                {
                                    'operationType': { $in: ['insert', 'update', 'replace'] },
                                    'fullDocument.name':settingsCollectionDocs.PROJECT_STATUS
                                }
                            ]
                        }
                    }
                }
    
                let getQuery = {
                    type : "find",
                    collection : dbCollections.SETTINGS,
                    data: [{
                        name:settingsCollectionDocs.PROJECT_STATUS
                    }]
                }
    
                mongodbSnapshot(options,({error, data, type}) => {
                    if(error) {
                        reject(error)
                    } else {
                        if(type === "inital") {
                            mongoQuery.mongodbCrudOperations(getQuery)
                            .then((res) => {
                                resolve(res[0])
                                res.forEach((x) => {
                                    commit("setProjectStatusArray",{
                                        data: {...x},
                                        op: "added",
                                    })
                                })
                            })
                            .catch((error) => {
                                reject(error)
                            })
                        } else if(type === "insert") {
                            const docData = data.fullDocument;
                            commit("setProjectStatusArray", {
                                data: {...docData, _id: docData._id},
                                op: "added",
                            })
                        } else if(type === "update" || type === "replace") {
                            const docData = data.fullDocument;
                            commit("setProjectStatusArray", {
                                data: {...docData, _id: docData._id},
                                op: "modified",
                            })
                        } else if(type === "delete") {
                            const docId = data.documentKey._id;
                            commit("setProjectStatusArray", {
                                data: {_id: docId},
                                op: "removed",
                            })
                        }
                    }
                })
            } catch(error) {
                reject(error)
            }
        })  
    }
    export const setCurrencyArray =({commit}) => {
        return new Promise ((resolve,reject) =>{
            try{
                let currencyArray = [];
                let object = {
                    type:"find",
                    collection:dbCollections.CURRENCY_LIST,
                    data:[]
                }
                mongoQuery.mongodbCrudOperations(object).then((res)=>{
                    currencyArray = res;
                    commit("setCurrencyArray", currencyArray);
                    resolve(currencyArray);
                }).catch((error)=>{
                    console.error("ERROR in get setting currency: ", error);
                    reject(error);
                });
            } catch(error) {
                reject(error)
            }
        })  
    }

    export const setProjectStatus = ({commit}) => {
        return new Promise((resolve, reject) => {
            try {
                let getQuery = {
                    type : "find",
                    collection : dbCollections.PROJECT_STATUS_TEMPLATES,
                    data: []
                }
                mongoQuery.mongodbCrudOperations(getQuery)
                .then((res) => {
                    resolve(res)
                    res.forEach((x) => {
                        commit("mutateProjectStatus", {
                            data: {...x, _id: x._id},
                            op: "added",
                        })
                    })
                })
                .catch((error) => {
                    reject(error)
                })
            }
            catch(error){
                reject(error);
            }
        })
    }

    export const setTaskTypeArray =({commit}) => {
        return new Promise ((resolve,reject) =>{
            try{
                let options = {
                    subCollection : dbCollections.SETTINGS,
                    watchFilter: {
                        filter: {
                            $or: [
                                {
                                    'operationType': 'delete'
                                },
                                {
                                    'operationType': { $in: ['insert', 'update', 'replace'] },
                                    'fullDocument.name':settingsCollectionDocs.TASK_TYPE
                                }
                            ]
                        }
                    }
                }
    
                let getQuery = {
                    type : "find",
                    collection : dbCollections.SETTINGS,
                    data: [{
                        name:settingsCollectionDocs.TASK_TYPE
                    }]
                }
    
                mongodbSnapshot(options,({error, data, type}) => {
                    if(error) {
                        reject(error)
                    } else {
                        if(type === "inital") {
                            mongoQuery.mongodbCrudOperations(getQuery)
                            .then((res) => {
                                resolve(res[0])
                                res.forEach((x) => {
                                    commit("setTaskTypeArray",{
                                        data: {...x},
                                        op: "added",
                                    })
                                })
                            })
                            .catch((error) => {
                                reject(error)
                            })
                        } else if(type === "insert") {
                            const docData = data.fullDocument;
                            commit("setTaskTypeArray", {
                                data: {...docData, _id: docData._id},
                                op: "added",
                            })
                        } else if(type === "update" || type === "replace") {
                            const docData = data.fullDocument;
                            commit("setTaskTypeArray", {
                                data: {...docData, _id: docData._id},
                                op: "modified",
                            })
                        } else if(type === "delete") {
                            const docId = data.documentKey._id;
                            commit("setTaskTypeArray", {
                                data: {_id: docId},
                                op: "removed",
                            })
                        }
                    }
                })
            } catch(error) {
                reject(error)
            }
        })  
    }


    export const setChargeBeePrice =({commit}) => {
        return new Promise ((resolve,reject) =>{
            try{
                let obj = {
                    type: "find",
                    collection: dbCollections.SUBSCRIPTIONPLAN,
                    data:[{},{sort:{sortIndex: 1}}],
                    global: true
                }
                mongoQuery.mongodbCrudOperations(obj).then((res)=>{
                    commit("setChargeBeePrice",res);
                    resolve(res);
                }).catch((error)=>{
                    console.error("Error GET SUBSCRIPRION PLAN",error)
                    reject(error)
                })
            } catch(error) {
                reject(error)
            }
        })  
    }


    export const setplanFeatureDisplay =({commit}) => {
        return new Promise ((resolve,reject) =>{
            try{
                let obj = {
                    type: "find",
                    collection: dbCollections.PLANFEATUREDISPLAY,
                    data:[{}],
                    global: true
                }
                mongoQuery.mongodbCrudOperations(obj).then((res)=>{
                    commit("setplanFeatureDisplay",res);
                    resolve(res);
                }).catch((error)=>{
                    console.error("Error GET SUBSCRIPRION PLAN",error)
                    reject(error)
                })
            } catch(error) {
                reject(error)
            }
        })  
    }