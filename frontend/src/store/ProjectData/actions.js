import { dbCollections } from "@/utils/FirebaseCollections"
import * as mongoSnap from "@/utils/MongoQueries/crudOperationsWithSanpshot/crudOperationsWithSanpshot"
import * as mongoQuery from "@/utils/MongoQueries/crudOperations/crudOperations"
import { BSON } from "realm-web";

/**
 * This function is used to get all the projects from MongoDB and add into the Vuex project store.
 * @param {*} state 
 * @returns 
 */
export const setProjects = (state, payload) => {
    return new Promise((resolve, reject) => {
        try {
            state.state.allProjects = [];

            let privateSnap = {
                "fullDocument.isPrivateSpace": true,
                "fullDocument.deletedStatusKey": { $nin: [1] },
                ...((payload.roleType !== 1 && payload.roleType !== 2) && {"fullDocument.AssigneeUserId": { $in: [payload.uid] }})
            };
            let publicSnap = {
                "fullDocument.deletedStatusKey": { $nin: [1] },
                "fullDocument.isPrivateSpace": false
            };


            if (payload?.privateQuery && Object.keys(payload.privateQuery)?.length) {
                if((payload.roleType !== 1 && payload.roleType !== 2) && payload.privateQuery.AssigneeUserId) {
                    privateSnap["fullDocument.AssigneeUserId"] = payload.privateQuery.AssigneeUserId
                }
            }
            if (payload?.publicQuery && Object.keys(payload.publicQuery)?.length) {
                if((payload.roleType !== 1 && payload.roleType !== 2) && payload.publicQuery.AssigneeUserId) {
                    publicSnap["fullDocument.AssigneeUserId"] = payload.publicQuery.AssigneeUserId
                }
            }

            // Handle real time snapshot
            mongoSnap.mongodbSnapshot({
                subCollection: dbCollections.PROJECTS,
                watchFilter: {
                    filter: {
                        $or: [
                            {
                                'operationType': 'delete'
                            },
                            {
                                "operationType": { $in: ["insert", "update", "replace"] },
                                ...privateSnap
                            },
                            {
                                "operationType": { $in: ["insert", "update", "replace"] },
                                ...publicSnap
                            }
                        ]
                    }
                }
            }, ({ error, data, snap, type }) => {
                if(error) {
                    console.error('Mongo error in the get project data', error);
                }

                switch (type) {
                    case "inital": {
                        let privateQurey = {
                            isPrivateSpace: true,
                            deletedStatusKey: { $nin: [1] },
                            ...((payload.roleType !== 1 && payload.roleType !== 2) && {AssigneeUserId: { $in: [payload.uid] }})
                        };
                        let publicQuery = {
                            deletedStatusKey: { $nin: [1] },
                            isPrivateSpace: false
                        };
                        if (payload?.privateQuery && Object.keys(payload.privateQuery)?.length) {
                            if((payload.roleType !== 1 && payload.roleType !== 2) && payload.privateQuery.AssigneeUserId) {
                                privateQurey["AssigneeUserId"] = payload.privateQuery.AssigneeUserId
                            }
                        }
                        if (payload?.publicQuery && Object.keys(payload.publicQuery)?.length) {
                            if((payload.roleType !== 1 && payload.roleType !== 2) && payload.publicQuery.AssigneeUserId) {
                                publicQuery["AssigneeUserId"] = payload.publicQuery.AssigneeUserId
                            }
                        }

                        const query = [
                            {
                                $match: {
                                    $or: [
                                        privateQurey,
                                        publicQuery
                                    ]
                                }
                            },
                            {
                                $project: {
                                    TemplateTaskCloseKey: 0,
                                    markAsStar: 0,
                                    TemplateTaskDoneKey: 0,
                                    TemplateTaskActiveKey: 0,
                                    TemplateName: 0,
                                    CompanyName: 0,
                                    commentCounts: 0,
                                    id: 0
                                }
                            }
                        ];

                        const queryRef = mongoQuery.mongodbCrudOperations({
                            type: "aggregate",
                            collection: dbCollections.PROJECTS,
                            data: [query]
                        });

                        queryRef.then((responseData) => {
                            let result = [];
                            responseData.map(x => {
                                const obj = { roleType: payload.roleType, snap: null, isPrivateSpace: x.isPrivateSpace, op: "added", data: {...x, isExpanded: false}}
                                result.push(obj);
                            })
                            resolve(result);
                            state.commit('mutateProjects', result);
                        })
                        break;
                    }
                    case "insert": {
                        const { fullDocument } = data;
                        state.commit('mutateProjects', [{ roleType: payload.roleType, userId: payload.uid, snap: snap, privateSnap: fullDocument.isPrivateSpace, op: "added", data: {...fullDocument, isExpanded: false }}]);
                        break;
                    }
                    case "update": {
                        const { fullDocument } = data;
                        state.commit('mutateProjects', [{ roleType: payload.roleType, userId: payload.uid, snap: snap, privateSnap: fullDocument.isPrivateSpace, op: "modified", data: {...fullDocument, isExpanded: false }}]);
                        break;
                    }
                    case "replace": {
                        const { fullDocument } = data;
                        state.commit('mutateProjects', [{ roleType: payload.roleType, userId: payload.uid, snap: snap, privateSnap: fullDocument.isPrivateSpace, op: "modified", data: {...fullDocument, isExpanded: false }}]);
                        break;
                    }
                    case "delete": {
                        const { documentKey } = data;
                        state.commit('mutateProjects', [{ roleType: payload.roleType, userId: payload.uid, snap: null, privateSnap: null, op: "removed", data: {id: documentKey._id}}]);
                        break;
                    }
                }
            })

        } catch (error) {
            reject(error);
        }
    });
};

export const getTasksFromMongoDB = ({ state, commit }, payload) => {
    return new Promise((resolve, reject) => {
        try {
            const {pid, sprintId, userId, showAllTasks,groupBy,currentView = 'tasks'} = payload;

            const projectFound = Object.keys(state[currentView]).includes(pid);
            let sprintFound = false;
            if(projectFound) {
                sprintFound = state[currentView][pid].sprints.includes(sprintId);
            }

            Object.values(state[currentView] || {}).forEach((data) => {
                if(data.projectId !== pid) {
                    let sprints = data.sprints;

                    sprints.forEach((sprint) => {
                        if(data[sprint].snapshot !== null) {
                            data[sprint].snapshot.return();
                        }
                    })
                    commit("removeProjectTaskSnap", data.projectId)
                }
            })

            if(projectFound && groupBy?.type !== state[currentView]?.[pid]?.groupBy?.type) {
                state[currentView][pid].groupBy = groupBy;
            }

            if(sprintFound && state[currentView][pid][sprintId].snapshot && state[currentView][pid][sprintId].snapshot !== null) {
                resolve();
                return;
            }

            if(state[currentView][pid] === undefined || state[currentView][pid][sprintId] === undefined) {
                return;
            }

            const queryParams = {
                filter: {
                    $or: [
                        {
                            "operationType": {$in: ["delete"]},
                        },
                        {
                            "operationType": {$in: ["insert", "update", "replace"]},
                            "fullDocument.ProjectID": BSON.ObjectID(pid),
                            "fullDocument.sprintId": BSON.ObjectID(sprintId),
                            ...((showAllTasks === undefined || showAllTasks === true || showAllTasks === 2) ? {} : {"fullDocument.AssigneeUserId": userId})
                        }
                    ]
                }
            }
            const query = {
                subCollection: dbCollections.TASKS,
                watchFilter: queryParams
            }

            mongoSnap.mongodbSnapshot(query, ({error, snap, data, type}) => {
                if(error) {
                    reject(error)
                } else {
                    if(type === "inital") {
                        commit('mutateUpdateFirebaseTasks', {snap, op: "inital", pid, sprintId, data: null, groupBy})
                        // commit('mutateMongoUpdatedTask', {snap, op: "inital", pid, sprintId, data: null})
                    } else if(type === "insert") {
                        const docData = data.fullDocument;
                        commit('mutateUpdateFirebaseTasks', {snap, op: "added", pid, sprintId, data: {...docData}, updatedFields:{...docData}})
                        commit('mutateTypesenseTableTasks', {snap,op: "added", pid, sprintId, data: {...docData}})
                        // commit('mutateMongoUpdatedTask', {snap, op: "added", pid, sprintId, data: {...docData}})
                    } else if(type === "update") {
                        const docData = data.fullDocument;
                        commit('mutateUpdateFirebaseTasks', {snap, op: "modified", pid, sprintId, data: {...docData},updatedFields:{...data?.updateDescription.updatedFields},showAllTasks})
                        commit('mutateMongoUpdatedTask', {snap, op: "modified", pid, sprintId, data: {...docData}})
                        commit('mutateTypesenseTableTasks', {snap,op: "modified", pid, sprintId, data: {...docData}})
                    } else if(type === "replace") {
                        const docData = data.fullDocument;
                        commit('mutateUpdateFirebaseTasks', {snap, op: "modified", pid, sprintId, data: {...docData}})
                        commit('mutateMongoUpdatedTask', {snap, op: "modified", pid, sprintId, data: {...docData}})
                        commit('mutateTypesenseTableTasks', {snap, op: "modified", pid, sprintId, data: {...docData}})
                    } else if(type === "delete") {
                        const docData = data.documentKey;
                        commit('mutateUpdateFirebaseTasks', {snap, op: "removed", pid, sprintId, data: {...docData}})
                        commit('mutateMongoUpdatedTask', {snap, op: "removed", pid, sprintId, data: {...docData}})
                        commit('mutateTypesenseTableTasks', {snap, op: "removed", pid, sprintId, data: {...docData}})
                    }
                }
            })
        } catch (error) {
            reject(error);
        }
    })
}

export const getPaginatedTasks = ({state, commit}, payload) => {
    return new Promise((resolve, reject) => {
        try {
            const {pid, sprintId, item, fetchNew, parentId = "", indexName = "", showAllTasks} = payload;

            const indName = indexName || item.indexName

            const projectFound = Object.keys(state.tasks).includes(pid);
            let sprintFound = false;
            if(projectFound) {
                sprintFound = state.tasks[pid].sprints.includes(sprintId);
            }

            if(sprintFound && !fetchNew) {
                resolve();
                return;
            }

            let cursor = null;
            let foundKey = `${item.searchKey}_${item.searchValue}`;

            const indexKey = `${parentId && parentId.length ? `${parentId}_` : ''}${item.searchKey}_${item.searchValue}`;

            if(sprintFound) {
                cursor = state.tasks[pid][sprintId].index[indexKey] || null;
            }

            const queryParams = [
                {
                    $match: {
                        ProjectID: BSON.ObjectID(pid),
                        sprintId: BSON.ObjectID(sprintId),
                        deletedStatusKey: 0,
                        ...((showAllTasks === undefined || showAllTasks === true || showAllTasks === 2) ? {} : {AssigneeUserId: {$in: [payload.userId]}}),
                        ...( parentId && parentId.length ? 
                            { ParentTaskId: parentId }
                        :
                            {
                                isParentTask: true,
                                ...( item.mongoConditions?.length ? 
                                    { ...item.mongoConditions[0] }
                                :
                                    item?.conditions?.length ?
                                        { ...item.conditions[0] }
                                    :
                                        {}
                                )
                            }
                        ),
                    }
                },
                { $sort: {[indName]: 1, "createdAt": 1, _id: 1}},
            ]

            const query = {
                type: "aggregate",
                collection: dbCollections.TASKS,
                data: [
                    [
                        ...queryParams,
                        {
                            $facet: {
                                result:[
                                    { $skip: cursor || 0},
                                    { $limit: 35}
                                ],
                                count:[
                                    {$count: "count" }
                                ]
                            }
                        }
                    ]
                ]
            }

            mongoQuery.mongodbCrudOperations(query)
            .then((response) => response?.[0])
            .then((response) => {
                const responseData = response.result;

                let resCount = {}
                if(sprintFound && state.tasks[pid][sprintId].found?.[foundKey]) {
                    resCount = {[foundKey]:state.tasks?.[pid]?.[sprintId]?.found?.[foundKey] || 0};
                } else {
                    resCount = {[foundKey]:response.count?.[0]?.count || 0};
                }

                // SET CURSOR
                if(responseData && responseData.length) {
                    responseData.forEach(async (task) => {
                        const doc = task;

                        if(doc.favouriteTasks && doc.favouriteTasks.length && typeof doc.favouriteTasks[0] === "string") {
                            doc.favouriteTasks = doc.favouriteTasks.map((x) => ({...x}))
                        }
                        if(doc.startDate && doc.startDate > 0) {
                            doc.startDate = new Date(doc.startDate * 1000);
                        }

                        if(doc.DueDate && doc.DueDate > 0) {
                            doc.DueDate = new Date(doc.DueDate * 1000);
                            // doc.dueDateDeadLine = doc.dueDateDeadLine.map((x) => JSON.parse(x)).map((x) => ({date: new Date(x.date * 1000)}));
                        }

                        commit('mutateTypesenseTasks', {found: resCount, nextPage: {[indexKey]: (cursor || 0) + responseData?.length || 0}, pid: pid, sprintId: sprintId, data: {...doc}})
                    })
                } else {
                    commit('mutateTypesenseTasks', {found: resCount, nextPage: {[indexKey]: (cursor || 0) + responseData?.length || 0}, pid: pid, sprintId: sprintId, data: null})
                }

                resolve({responseData});
            })
            .catch((error) => {
                reject(error);
            })

        } catch (error) {
            reject(error);
        }
    })
}

export const setTableTasksFromTypesense = ({ state, commit }, payload) => {
    return new Promise((resolve, reject) => {
        try {
            const {pid, sprintId, item, fetchNew, parentId = "",sortKey = '',isFirst=false} = payload;
            const projectFound = Object.keys(state.tableTasks).includes(pid);
            let sprintFound = false;
            if(projectFound) {
                sprintFound = state.tableTasks[pid].sprints.includes(sprintId);
            }

            if(sprintFound && !fetchNew) {
                resolve();
                return;
            }
            let page = 0;
            let skip = 0;
            let batchSize = 20;

            const indexKey = `${parentId && parentId.length ? `${parentId}_` : ''}${item.searchKey}_${item.searchValue}`;
            if(sprintFound) {
                page = state.tableTasks[pid][sprintId].index[indexKey] || 1;
                skip = state.tableTasks[pid][sprintId].index[indexKey] ? state.tableTasks[pid][sprintId].index[indexKey] * 20 : 20;
            }
            if(sortKey && sortKey.length && isFirst){
                state.tableTasks = {};
                page = 0;
                skip = 0;
                batchSize = 20;
            }
            let queryDetail = [
                {
                    $match: {
                        $and: [
                            {
                                $and:[
                                    {ProjectID: {$in : [BSON.ObjectID(pid)]}},
                                    {sprintId: {$eq:BSON.ObjectID(sprintId)}},
                                    {deletedStatusKey: { $in: [0] }},
                                ]
                            },
                            {
                                ...( item.mongoConditions?.length ? 
                                    { ...item.mongoConditions[0] }
                                :
                                    item?.conditions?.length ?
                                        { ...item.conditions[0] }
                                    :
                                        {}
                                )
                            },
                            {
                                ...(payload?.showAllTasks !== undefined && !payload?.showAllTasks && {
                                    $and: [
                                        {AssigneeUserId: {$in : [payload.userId]}}
                                    ],
                                }),
                            },
                            {
                                ...(pid !== "6571e7195470e64b1203295c" ? {} : {AssigneeUserId: {$in: [payload.userId]}}),
                            }
                        ],
                    },
                },
                {
                    $sort: sortKey ? { [sortKey.split(':')[0]]: Number(sortKey.split(':')[1]),_id:1 } : {createdAt:1}, // Sort all records
                },
                {
                    $skip: skip,
                },
                {
                    $limit: batchSize,
                },
            ]
            const query = {
                collection: dbCollections.TASKS,
                type: "aggregate",
                data: [queryDetail]
            }
            
            mongoQuery.mongodbCrudOperations(query)
            .then((result) => {
                if(result && result.length){
                    result.forEach((task) => {
                        const doc = task;
                        if(doc.startDate && doc.startDate > 0) {
                            doc.startDate = (new Date(doc.startDate));
                        }
                        if(doc.DueDate && doc.DueDate > 0) {
                            doc.DueDate = (new Date(doc.DueDate));
                            doc.dueDateDeadLine = doc.dueDateDeadLine.map((x) => JSON.parse(x)).map((x) => ({date: (new Date(x.date))}));
                        }
                        commit('mutateTypesenseTableTasks', {nextPage: {[indexKey]: page+1}, pid, sprintId, data: {...doc}, total: result.found})
                    })
                } else {
                    commit('mutateTypesenseTableTasks', {nextPage: {[indexKey]: page}, pid, sprintId, data: null})
                }
                resolve({result, page});
            })
            .catch((error) => {
                reject(error);
            })
        } catch (error) {
            reject(error);
        }
    })
}

export const searchTask = ({commit}, payload) => {
    return new Promise((resolve, reject) => {
        try {
            const query = {
                collection: dbCollections.TASKS,
                type: "aggregate",
                data: [payload.query]
            }

            mongoQuery.mongodbCrudOperations(query)
            .then((results) => {
                const requiredParents = results.filter((x) => !x.isParentTask).map(x => x.ParentTaskId);
                const availableParents = results.filter((x) => x.isParentTask).map((x) => x._id)
                const parentIds = requiredParents.filter((x) => !availableParents.includes(x));
                if(parentIds?.length) {
                    query.data = [
                        [
                            {   
                                $match: {
                                    $and : [
                                        {
                                            $and:[
                                            {
                                                _id: {$in: parentIds.map(id => BSON.ObjectId(id))}
                                            },
                                            {deletedStatusKey: { $in: payload.showArchived === true ? [0,2] : [0] }}
                                        ]
                                        }
                                    ]
                                }
                            }
                        ]
                    ];

                    mongoQuery.mongodbCrudOperations(query)
                    .then((results2) => {
                        resolve([...results, ...results2]);
                        commit("mutateSearchTask", [...results, ...results2]);
                    })
                    .catch((error) => {
                        reject(error);
                    })
                } else {
                    resolve(results);
                    commit("mutateSearchTask", results);
                }
            })
            .catch((error) => {
                reject(error);
            })
        } catch (error) {
            reject(error);
        }
    })
}

export const setprojectTemplate = ({state,commit}) => {
    return new Promise((resolve, reject) => {
        try {
            state.projectTemplate = {};
            mongoQuery.mongodbCrudOperations({
                type:"find",
                collection:"project_templates",
                data:[],
                global:false
            }).then((res)=>{
                let result = [];
                res.forEach((change)=>{
                    result.push({op:'add',data: {...change, id: change._id}});
                })
                commit("mutateprojectTemplate", result);
                resolve();
            }).catch((error)=>{
                reject(error);
                console.error(error);
            })
        }
        catch(error){
            reject(error);
        }
    })
}

export const setdefaultTemplate = ({state,commit}) => {
    return new Promise((resolve, reject) => {
        try {
            state.defaultTemplate = {};
            mongoQuery.mongodbCrudOperations({
                type:"find",
                collection:"ProjectTemplate",
                data:[],
                global:true
            }).then((res)=>{
                commit("mutatedefaultTemplate",res)
                resolve();
            }).catch((error)=>{
                reject(error);
                console.error(error);
            })
        }
        catch(error){
            reject(error);
        }
    })
}

export const setSprints = ({commit }, payload) => {
    return new Promise((resolve,reject) => {
        try {
            const defaultPrivate = {
                private: true,
                projectId : BSON.ObjectID(payload?.projectId),
                deletedStatusKey: { $nin: [1] },
                AssigneeUserId: {
                    $in: [payload?.uid]
                }
            };
            const defaultPublic = {
                projectId : BSON.ObjectID(payload?.projectId),
                deletedStatusKey: { $nin: [1] },
                private: false
            };
            const defaultSanpPrivate = {
                "fullDocument.projectId" : BSON.ObjectID(payload?.projectId),
                "fullDocument.deletedStatusKey" : { $nin: [1] },
                "fullDocument.private" : true,
                "fullDocument.AssigneeUserId": {
                    $in: [payload?.uid]
                }
            };
            const defaultSanpPublic = {
                "fullDocument.projectId" : BSON.ObjectID(payload?.projectId),
                "fullDocument.deletedStatusKey" : { $nin: [1] },
                "fullDocument.private" : false
            };

            const privateQurey = payload?.privateQuery && Object.keys(payload.privateQuery)?.length ? payload?.privateQuery : defaultPrivate;
            const publicQuery = payload?.publicQuery && Object.keys(payload.publicQuery)?.length ? payload?.publicQuery : defaultPublic;
            const snapPrivateQurey = payload?.snapPrivateQuery && Object.keys(payload.snapPrivateQuery)?.length ? payload?.snapPrivateQuery : defaultSanpPrivate;
            const snapPublicQuery = payload?.snapPublicQuery && Object.keys(payload.snapPublicQuery)?.length ? payload?.snapPublicQuery : defaultSanpPublic;
            const query = [
                {
                    $match: {
                        $or: [
                            privateQurey,
                            publicQuery
                        ]
                    }
                }
            ];
            let getQuery = {
                type : "aggregate",
                collection:dbCollections.SPRINTS,
                data: [query]
            }
            let options = {
                subCollection :dbCollections.SPRINTS,
                watchFilter: {
                    filter: {
                        $or: [
                            {
                                'operationType': { $in: ['delete','update']}
                            },
                            {
                                'operationType': { $in: ['insert','replace'] },
                                ...snapPrivateQurey
                            },
                            {
                                'operationType': { $in: ['insert','replace'] },
                                ...snapPublicQuery
                            }
                        ]
                    }
                }
            }

            mongoSnap.mongodbSnapshot(options,({error, data, type}) => {
                if(error) {
                    reject(error)
                } else {
                    if(type === "inital") {
                        mongoQuery.mongodbCrudOperations(getQuery)
                        .then((res) => {
                            let result = [];
                            res.map(x => {
                                const obj = {op: "added", data: {...x}}
                                commit('mutateSprints', obj);
                                result.push(obj);
                            })
                            resolve(res);
                        })
                        .catch((error) => {
                            reject(error)
                        })
                    } else if(type === "insert") {
                        const docData = data.fullDocument;
                        commit('mutateSprints', {op: "added", data: docData});
                    } else if(type === "update" || type === "replace") {
                        const docData = data.fullDocument;
                        commit('mutateSprints', {roleType: payload.roleType, userId: payload?.uid ,op: "modified", data: {...docData },updatedFields:{...data?.updateDescription.updatedFields}});
                    } else if(type === "delete") {
                        const { documentKey } = data;
                        commit('mutateSprints', {op: "removed", data: {id: documentKey._id,projectId:payload?.projectId}});
                    }
                }
            })
        } catch (error) {
            reject(error)
        }
    })
}

export const setFolders = ({ commit }, payload) => {
    return new Promise((resolve,reject) => {
        try {
            const defaultPrivate = {
                projectId : BSON.ObjectID(payload?.projectId),
                deletedStatusKey: { $nin: [1] },
            };
            const defaultPublic = {
                projectId : BSON.ObjectID(payload?.projectId),
                deletedStatusKey: { $nin: [1] },
            };
            const defaultSanpPrivate = {
                "fullDocument.projectId" : BSON.ObjectID(payload?.projectId),
                "fullDocument.deletedStatusKey" : { $nin: [1] },
            };
            const defaultSanpPublic = {
                "fullDocument.projectId" : BSON.ObjectID(payload?.projectId),
                "fullDocument.deletedStatusKey" : { $nin: [1] },
            };

            const privateQurey = payload?.privateQuery && Object.keys(payload.privateQuery)?.length ? payload?.privateQuery : defaultPrivate;
            const publicQuery = payload?.publicQuery && Object.keys(payload.publicQuery)?.length ? payload?.publicQuery : defaultPublic;
            const snapPrivateQurey = payload?.snapPrivateQuery && Object.keys(payload.snapPrivateQuery)?.length ? payload?.snapPrivateQuery : defaultSanpPrivate;
            const snapPublicQuery = payload?.snapPublicQuery && Object.keys(payload.snapPublicQuery)?.length ? payload?.snapPublicQuery : defaultSanpPublic;
            const query = [
                {
                    $match: {
                        $or: [
                            privateQurey,
                            publicQuery
                        ]
                    }
                }
            ];
            let getQuery = {
                type : "aggregate",
                collection:dbCollections.FOLDERS,
                data: [query]
            }
            let options = {
                subCollection :dbCollections.FOLDERS,
                watchFilter: {
                    filter: {
                        $or: [
                            {
                                'operationType': { $in: ['delete','update']}
                            },
                            {
                                'operationType': { $in: ['insert','replace'] },
                                ...snapPrivateQurey
                            },
                            {
                                'operationType': { $in: ['insert','replace'] },
                                ...snapPublicQuery
                            }
                        ]
                    }
                }
            }

            mongoSnap.mongodbSnapshot(options,({error, data, type}) => {
                if(error) {
                    reject(error)
                } else {
                    if(type === "inital") {
                        mongoQuery.mongodbCrudOperations(getQuery)
                        .then((res) => {
                            let result = [];
                            res.map(x => {
                                const obj = {op: "added", data: {...x}}
                                commit('mutateFolders', obj);
                                result.push(obj);
                            })
                            resolve(res);
                        })
                        .catch((error) => {
                            reject(error)
                        })
                    } else if(type === "insert") {
                        const docData = data.fullDocument;
                        commit('mutateFolders', {op: "added", data: docData});
                    } else if(type === "update" || type === "replace") {
                        const docData = data.fullDocument;
                        commit('mutateFolders', {roleType: payload.roleType, userId: payload?.uid ,op: "modified", data: {...docData },updatedFields:{...data?.updateDescription.updatedFields}});
                    } else if(type === "delete") {
                        const { documentKey } = data;
                        commit('mutateFolders', {op: "removed", data: {id: documentKey._id,projectId:payload?.projectId}});
                    }
                }
            })
        } catch (error) {
            reject(error)
        }
    })
}