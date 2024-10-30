// import { MONGO_OPRATION } from "@/config/env";
// import { apiRequestWithoutCompnay } from "@/services";
import { DB_REF, GLOBAL_DB_REF, SUBSCRITION_DB_REF } from "@/utils/MongoQueries/mongoAuth";

/**
 * 
 * @param {Object} data
 *  - type: "operation type" eg: find, findOne, update, etc
 *  - collection: "collection_name"
 *  - data: Array of data to be passed such as [{age: {$gt: 25}, {status: "mature"}, {options}}]
 * @returns 
 */
export const mongodbCrudOperations = (data) => {
    return new Promise((resolve, reject) => {
        try {
            if(data.data === undefined || data.type === undefined || data.collection === undefined)  {
				reject(new Error("Data, Type and collection is required"));
				return;
            }
            let collection = null;
            if(data.global) {
                collection = GLOBAL_DB_REF.value.collection(data.collection);
            } else if (data.subscription) {
                collection = SUBSCRITION_DB_REF.value.collection(data.collection);
            } else {
                collection = DB_REF.value.collection(data.collection);
            }

            // const axiosObj = {
            //     dataObj: data.data,
            //     dbName: collection.databaseName,
            //     collection: data.collection,
            //     methodName: data.type
            // }

            // if(["tasks", "projects"].includes(data.collection)) {
            //     /**
            //      * NOTE
            //      * if object id is directly used with a key like (projectId : ObjectId(pid)) then update it as below
            //      *  objId: {projectId: pid}
            //      * 
            //      * And if object id is in an array like (projectId : {$in: [pid1, pid2, pid3]}) then update it as below
            //      * projectId: {objId: {$in: [pid1, pid2, pid3]}}
            //     */
            //     apiRequestWithoutCompnay("post", MONGO_OPRATION, axiosObj)
            //     .then((response) => {
            //         if(response.data?.status){
            //             let convertRes = JSON.parse(JSON.stringify(response.data?.statusText));
            //             resolve(convertRes);
            //         }else{
            //             reject(response.data?.statusText);
            //         }
            //     }).catch((error)=>{
            //         reject(error);
            //         console.error(error);
            //     })
            // } else {
                collection[data.type].apply(collection, data.data).then((response) => {
                    if(response){
                        let convertRes = JSON.parse(JSON.stringify(response));
                        resolve(convertRes);
                    }else{
                        resolve(response);
                    }
                }).catch((error)=>{
                    reject(error);
                    console.error(error);
                })
            // }
        } catch (error) {
            reject(error);
        }
    })
};