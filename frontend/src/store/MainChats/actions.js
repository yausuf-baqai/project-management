import { dbCollections } from "@/utils/FirebaseCollections";
import { mongodbSnapshot } from "@/utils/MongoQueries/crudOperationsWithSanpshot/crudOperationsWithSanpshot";
import { mongodbCrudOperations } from "@/utils/MongoQueries/crudOperations/crudOperations";
import { BSON } from "realm-web";

export const setChats = ({commit}, payload) => {
    return new Promise((resolve, reject) => {
        try {
            const getQuery = {
                collection: dbCollections.TASKS,
                data: [
                    {
                        mainChat: true,
                        ProjectID: BSON.ObjectID(payload.projectId),
                        AssigneeUserId: payload.userId
                    }
                ],
                type: "find"
            }
            const snapQuery = {
                subCollection: dbCollections.TASKS,
                watchFilter: {
                    filter: {
                        $or: [
                            {
                                operationType: "delete"
                            }, {
                                operationType: {$in: ["insert", "update", "replace"]},
                                "fullDocument.mainChat": true,
                                "fullDocument.ProjectID": BSON.ObjectID(payload.projectId),
                                "fullDocument.AssigneeUserId": payload.userId
                            }
                        ]
                    }
                }
            }
            mongodbSnapshot(snapQuery, ({data, type, snap, error}) => {
                if(error) {
                    console.error("ERROR in main chat snap: ", error);
                    reject(error)
                } else {
                    if(type === "inital") {
                        mongodbCrudOperations(getQuery)
                        .then((res) => {
                            commit('mutateChats', res.map((x) => ({snap: null, op: "added", data: {...x}})));
                            resolve(res);
                        })
                        .catch((error) => {
                            reject(error);
                        })
                    } else {
                        let result = [];
                        if(type === "insert") {
                            const docData = data.fullDocument;
                            result.push({snap, op: "added", data: {...docData}});
                        } else if(type === "update") {
                            const docData = data.fullDocument;
                            result.push({snap, op: "modified", data: {...docData}});
                        } else if(type === "replace") {
                            const docData = data.fullDocument;
                            result.push({snap, op: "modified", data: {...docData}});
                        } else if(type === "delete") {
                            const docData = data.documentKey._id;
                            result.push({snap, op: "removed", data: {...docData}});
                        }

                        commit('mutateChats', result);
                    }
                }
            })
        } catch (e) {
            reject(e);
        }
    })
}

export const setChatProjects = ({commit}) => {
    return new Promise((resolve, reject) => {
        try {
            const snapQuery = {
                subCollection: dbCollections.MAIN_CHATS,
                watchFilter: {}
            }
            const getQuery = {
                type: "find",
                collection: dbCollections.MAIN_CHATS,
                data: []
            }
            mongodbSnapshot(snapQuery, ({error, snap, type, data}) => {
                if(error) {
                    reject(error)
                } else {
                    if(type === "inital") {
                        mongodbCrudOperations(getQuery)
                        .then((chats) => {
                            resolve(chats);
                            chats.forEach((ch) => {
                                commit("mutateChatProjects", [{snap, op: "added", data: {...ch, _id: ch._id, sprintsObj: {}, sprintsfolders: {}}}]);
                            })
                        })
                        .catch((error) => {
                            reject(error)
                        })
                    } else if(type === "insert") {
                        const docData = data.fullDocument;
                        commit("mutateChatProjects", [{snap, op: "added", data: {...docData, _id: docData._id, sprintsObj: {}, sprintsfolders: {}}}]);
                    } else if(type === "update" || type === "replace") {
                        const docData = data.fullDocument;
                        commit("mutateChatProjects", [{snap, op: "modified", data: {...docData, _id: docData._id, sprintsObj: {}, sprintsfolders: {}}}]);
                    } else if(type === "delete") {
                        const docId = data.documentKey._id;
                        commit("mutateChatProjects", [{snap, op: "removed", data: {_id: docId}}]);
                    }
                }
            })
        } catch (error) {
            reject(error);
        }
    })
}

export const setChatSprints = ({commit}, payload) => {
    return new Promise((resolve,reject) => {
        try {
            const {projectId, uid, privateQuery, roleType, publicQuery: payload_publicQuery, snapPrivateQuery, snapPublicQuery: payload_snapPublicQuery} = payload;
            const defaultPrivate = {
                private: true,
                projectId : BSON.ObjectID(projectId),
                deletedStatusKey: { $nin: [1] },
                AssigneeUserId: {
                    $in: [uid]
                }
            };
            const defaultPublic = {
                projectId : BSON.ObjectID(projectId),
                deletedStatusKey: { $nin: [1] },
                private: false
            };
            const defaultSanpPrivate = {
                "fullDocument.projectId" : BSON.ObjectID(projectId),
                "fullDocument.deletedStatusKey" : { $nin: [1] },
                "fullDocument.private" : true,
                "fullDocument.AssigneeUserId": {
                    $in: [uid]
                }
            };
            const defaultSanpPublic = {
                "fullDocument.projectId" : BSON.ObjectID(projectId),
                "fullDocument.deletedStatusKey" : { $nin: [1] },
                "fullDocument.private" : false
            };

            const privateQurey = privateQuery && Object.keys(privateQuery)?.length ? privateQuery : defaultPrivate;
            const publicQuery = payload_publicQuery && Object.keys(payload_publicQuery)?.length ? payload_publicQuery : defaultPublic;
            const snapPrivateQurey = snapPrivateQuery && Object.keys(snapPrivateQuery)?.length ? snapPrivateQuery : defaultSanpPrivate;
            const snapPublicQuery = payload_snapPublicQuery && Object.keys(payload_snapPublicQuery)?.length ? payload_snapPublicQuery : defaultSanpPublic;
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

            mongodbSnapshot(options,({error, data, type}) => {
                if(error) {
                    reject(error)
                } else {
                    if(type === "inital") {
                        mongodbCrudOperations(getQuery)
                        .then((res) => {
                            let result = [];
                            res.map(x => {
                                const obj = {op: "added", data: {...x}}
                                commit('mutateChatSprints', obj);
                                result.push(obj);
                            })
                            resolve(res);
                        })
                        .catch((error) => {
                            reject(error)
                        })
                    } else if(type === "insert") {
                        const docData = data.fullDocument;
                        commit('mutateChatSprints', {op: "added", data: docData});
                    } else if(type === "update" || type === "replace") {
                        const docData = data.fullDocument;
                        commit('mutateChatSprints', {roleType: roleType, userId: uid ,op: "modified", data: {...docData },updatedFields:{...data?.updateDescription.updatedFields}});
                    } else if(type === "delete") {
                        const { documentKey } = data;
                        commit('mutateChatSprints', {op: "removed", data: {id: documentKey._id,projectId:projectId}});
                    }
                }
            })
        } catch (error) {
            reject(error)
        }
    })
}

export const setChatFolders = ({commit}, payload) => {
    return new Promise((resolve,reject) => {
        try {
            const {projectId, uid, privateQuery, publicQuery: payload_publicQuery, snapPrivateQuery, snapPublicQuery: payload_snapPublicQuery, roleType} = payload;

            const defaultPrivate = {
                projectId : BSON.ObjectID(projectId),
                deletedStatusKey: { $nin: [1] },
            };
            const defaultPublic = {
                projectId : BSON.ObjectID(projectId),
                deletedStatusKey: { $nin: [1] },
            };
            const defaultSanpPrivate = {
                "fullDocument.projectId" : BSON.ObjectID(projectId),
                "fullDocument.deletedStatusKey" : { $nin: [1] },
            };
            const defaultSanpPublic = {
                "fullDocument.projectId" : BSON.ObjectID(projectId),
                "fullDocument.deletedStatusKey" : { $nin: [1] },
            };

            const privateQurey = privateQuery && Object.keys(privateQuery)?.length ? privateQuery : defaultPrivate;
            const publicQuery = payload_publicQuery && Object.keys(payload_publicQuery)?.length ? payload_publicQuery : defaultPublic;
            const snapPrivateQurey = snapPrivateQuery && Object.keys(snapPrivateQuery)?.length ? snapPrivateQuery : defaultSanpPrivate;
            const snapPublicQuery = payload_snapPublicQuery && Object.keys(payload_snapPublicQuery)?.length ? payload_snapPublicQuery : defaultSanpPublic;
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

            mongodbSnapshot(options,({error, data, type}) => {
                if(error) {
                    reject(error)
                } else {
                    if(type === "inital") {
                        mongodbCrudOperations(getQuery)
                        .then((res) => {
                            let result = [];
                            res.map(x => {
                                const obj = {op: "added", data: {...x}}
                                commit('mutateChatFolders', obj);
                                result.push(obj);
                            })
                            resolve(res);
                        })
                        .catch((error) => {
                            reject(error)
                        })
                    } else if(type === "insert") {
                        const docData = data.fullDocument;
                        commit('mutateChatFolders', {op: "added", data: docData});
                    } else if(type === "update" || type === "replace") {
                        const docData = data.fullDocument;
                        commit('mutateChatFolders', {roleType: roleType, userId: uid ,op: "modified", data: {...docData },updatedFields:{...data?.updateDescription.updatedFields}});
                    } else if(type === "delete") {
                        const { documentKey } = data;
                        commit('mutateChatFolders', {op: "removed", data: {id: documentKey._id,projectId:projectId}});
                    }
                }
            })
        } catch (error) {
            reject(error)
        }
    })
}