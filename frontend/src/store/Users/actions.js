import { dbCollections } from "@/utils/FirebaseCollections";
import { mongodbCrudOperations } from "@/utils/MongoQueries/crudOperations/crudOperations";
import { mongodbSnapshot } from "@/utils/MongoQueries/crudOperationsWithSanpshot/crudOperationsWithSanpshot";

export const setUsers = ({ commit }, payload) => {
    return new Promise((resolve, reject) => {
        try {
            const snapQuery = {
                subCollection: dbCollections.USERS,
                global: true,
                watchFilter: {
                    filter: {
                        $or: [
                            {
                                "operationType": "delete"
                            },
                            {
                                "operationType": { $in: ['insert', 'update', 'replace'] },
                                "fullDocument.isActive": true,
                                "fullDocument.AssignCompany" : { $in: [payload.cid] }
                            },
                        ]
                    }
                }
            }

            const obj = {};

            mongodbSnapshot(snapQuery, ({error, snap, type, data}) => {
                if (error) {
                    reject(error);
                } else {
                    obj.snap = snap;
                    if(type === "inital") {
                        // REQUEST INITAL

                        const query = {
                            isActive: true,
                            AssignCompany: { $in: [payload.cid] }
                        };

                        const getQuery = {
                            collection: dbCollections.USERS,
                            type: "find",
                            global: true,
                            data: [query]
                        }
                        mongodbCrudOperations(getQuery)
                        .then((res) => {
                            res.forEach((x) => {
                                commit("mutateUsers", {
                                    data: {...x, _id: x._id},
                                    op: "added",
                                })
                            })
                            resolve(res);
                        })
                        .catch((error) => {
                            reject(error);
                        })

                    } else if(type === "insert") {
                        commit("mutateUsers", {data:data.fullDocument,op:"added"})
                    } else if(type === "update" || type === "replace") {
                        commit("mutateUsers", {data:data.fullDocument,op:"modified"})
                    } else if(type === "delete") {
                        commit("mutateUsers", {data: {_id: data.documentKey._id},op: "removed"})
                    }
                }
            })

        } catch (error) {
            reject(error);
        }
    })
};

export const myCounts = ({commit}, payload) => {
    return new Promise((resolve, reject) => {
        try {
            const {uid} = payload;

            const snapQuery = {
                subCollection: dbCollections.USER_ID,
                watchFilter: {
                    filter: {
                        $or: [
                            {
                                "operationType": "delete"
                            },
                            {
                                "operationType": { $in: ['insert', 'update', 'replace'] },
                                "fullDocument.userId": uid
                            },
                        ]
                    }
                }
            }


            const obj = {};
            mongodbSnapshot(snapQuery, ({error, snap, type, data}) => {
                if (error) {
                    reject(error);
                } else {
                    obj.snap = snap;
                    if(type === "inital") {
                        // REQUEST INITAL
                        obj.type = "add";

                        const getQuery = {
                            collection: dbCollections.USER_ID,
                            type: "findOne",
                            data: [
                                {
                                    "userId": uid
                                }
                            ]
                        }
                        mongodbCrudOperations(getQuery)
                        .then((res) => {
                            obj.data = res;

                            commit("mutateCounts", {...obj})
                            resolve(res);
                        })
                        .catch((error) => {
                            reject(error);
                        })

                    } else if(type === "insert") {
                        obj.type = "add";
                        obj.data = data.fullDocument;

                        commit("mutateCounts", {...obj})
                    } else if(type === "update" || type === "replace") {
                        obj.type = "update";
                        obj.data = data.fullDocument;

                        commit("mutateCounts", {...obj})
                    } else if(type === "delete") {
                        obj.type = "delete";
                        obj.data = {_id: data.documentKey._id};

                        commit("mutateCounts", {...obj})
                    }
                }
            })
        } catch (error) {
            reject(error);
        }
    })
}