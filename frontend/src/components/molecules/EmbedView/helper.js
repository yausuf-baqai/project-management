import {dbCollections} from '@/utils/FirebaseCollections'
import * as mongoQuery from '@/utils/MongoQueries/crudOperations/crudOperations';
import { BSON } from 'realm-web';

/**
 * This function is used to add new view
 * @param {Object} ids 
 * @param {Object} data 
 * @returns 
 */
export const addView = (ids, data) => {
    return new Promise((resolve, reject) => {
        try {
            let queryObj = [
                { _id: BSON.ObjectID(ids.pid) },
                { $addToSet: { ProjectRequiredComponent: { ...data, id: data._id ? data._id : data.id, _id: data._id ? data._id : data.id, createdAt: new Date()} } },
                { usert: true }
            ];

            const query = {
                type: "updateOne",
                collection: dbCollections.PROJECTS,
                data: queryObj
            };

            mongoQuery.mongodbCrudOperations(query)
            .then(() => {
                resolve({ statusText: 'View added successfully', status: true })
            })
        } catch (error) {
            reject({ statusText: error, status: false })
        }
    })
}

/**
 * This function is used to update view
 * @param {*} ids 
 * @param {*} data 
 * @param {*} value 
 * @param {*} field 
 * @returns 
 */
export const editView = (ids, data, value, field) => {
    return new Promise((resolve, reject) => {
        try {
            let queryObj = [
                { _id : BSON.ObjectID(ids.pid) },
                {$set: {[`ProjectRequiredComponent.$[elementIndex].${field}`]: value }},
                {arrayFilters: [{ "elementIndex._id": data._id }]}
            ];
            const queryUpdate = {
                type: "updateOne",
                collection: dbCollections.PROJECTS,
                data: queryObj
            };
            mongoQuery.mongodbCrudOperations(queryUpdate).then(() => {
                resolve({ statusText:'View updated successfully', status: true })
            })
        } catch (error) {
            reject({ statusText: error, status: false })
        }
    })
}

/**
 * This function is used to remove view
 * @param {*} ids 
 * @param {*} data 
 * @returns 
 */
export const deleteView = (ids, data) => {
    return new Promise((resolve, reject) => {
        try {
            let queryObj = [
                { _id: BSON.ObjectID(ids.pid) },
                { $pull: { ProjectRequiredComponent: { _id: data._id } } },
                { upsert: true }
            ];

            const query = {
                type: "updateOne",
                collection: dbCollections.PROJECTS,
                data: queryObj
            };

            mongoQuery.mongodbCrudOperations(query).then(() => {
                resolve({ statusText:'View deleted successfully', status: true })
            })
        } catch (error) {
            reject({ statusText: error, status: false })
        }
    })
}