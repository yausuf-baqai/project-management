const {admin} = require("../Config/firebaseConfig");
const db = admin.firestore();


/******* QUERY FOR INSERT TO ANY COLLECTION OR UPDATE ANY DOC  *******************/
exports.addUpdateDocument = (path = "", data = {}) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!path)  {
              reject(new Error("Path is required"));
              return;
            }

            let splitPath = path.split("/");

            let isCollection = splitPath.length % 2 !== 0;

            let query = db;
            if(splitPath.length) {
                splitPath.forEach((value, index) => {
                    if(index % 2 !== 0) {
                        query = query.doc(value);
                    } else {
                        query = query.collection(value);
                    }
                })
            }

            let setData;

            if(isCollection) {
                const docId = await query.doc().id;

                query = query.doc(docId);

                setData = {
                    id: docId,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    ...data
                }
            } else {
                setData = {
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    ...data
                }
            }

            query.set(setData, { merge: true })
            .then(() => {
                resolve(setData);
            })
            .catch((error) => {
                reject(error);
            })
        } catch (error) {
            reject(error);
        }
    })
}

exports.updateDoc = (path = "", data = {}) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!path)  {
              reject(new Error("Path is required"));
              return;
            }

            let splitPath = path.split("/");

            let isCollection = splitPath.length % 2 !== 0;

            let query = db;
            if(splitPath.length) {
                splitPath.forEach((value, index) => {
                    if(index % 2 !== 0) {
                        query = query.doc(value);
                    } else {
                        query = query.collection(value);
                    }
                })
            }

            let setData;

            if(isCollection) {
                const docId = await query.doc().id;

                query = query.doc(docId);

                setData = {
                    id: docId,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    ...data
                }
            } else {
                setData = {
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    ...data
                }
            }

            query.update(setData)
            .then(() => {
                resolve(setData);
            })
            .catch((error) => {
                reject(error);
            })
        } catch (error) {
            reject(error);
        }
    })
}

/******* QUERY FOR GET DATA FROM ANY COLLECTION  *******************/
exports.getCollectionData = (path, whereConditions=[], orderBy={}, limit=0, startAt='', endAt='', startAfter='', endBefore='') => {
    return new Promise((resolve, reject) => {
        try {
            if(!path)  {
                reject(new Error("Path is required"));
                return;
            }

            let splitPath = path.split("/");

            let isCollection = splitPath.length % 2 !== 0;

            let query = db;
            if(splitPath.length) {
                splitPath.forEach((value, index) => {
                    if(index % 2 !== 0) {
                        query = query.doc(value);
                    } else {
                        query = query.collection(value);
                    }
                })
            }

            if(isCollection) {

                if(Object.keys(orderBy).length) {
                    query = query.orderBy(orderBy.field, orderBy.value === 0 ? "asc" : "desc");
                }
                if(startAt) {
                    query = query.startAfter(startAt);
                }
                if(endAt) {
                    query = query.startAfter(endAt);
                }
                if(endBefore) {
                    query = query.startAfter(endBefore);
                }
                if(startAfter) {
                    query = query.startAfter(startAfter);
                }
                if(limit !== 0) {
                    query = query.limit(limit);
                }

                if(whereConditions.length) {
                    whereConditions.forEach((obj) => {
                        query = query.where(obj.field, obj.operation, obj.value);
                    })
                }
            }

            query
            .get()
            .then((snapshot) => {
                resolve(snapshot);
            },
            (error) => {
                reject(error);
            })
        } catch (error) {
            reject(error);
        }
    })
}

/******* QUERY FOR DELETE ANY DOC  *******************/
exports.deleteDocument = (path = "") => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!path)  {
              reject(new Error("Path is required"));
              return;
            }
            let splitPath = path.split("/");
  
            if(splitPath.length % 2 !== 0) {
              reject(new Error("Incorrect path to document"));
              return;
            }
  
            let query = db;
            if(splitPath.length) {
                splitPath.forEach((value, index) => {
                    if(index % 2 !== 0) {
                        query = query.doc(value);
                    } else {
                        query = query.collection(value);
                    }
                })
            }
  
            query.delete()
            .then(() => {
                resolve(true);
            })
            .catch((error) => {
                reject(error);
            })
        } catch (error) {
            reject(error);
        }
    })
}