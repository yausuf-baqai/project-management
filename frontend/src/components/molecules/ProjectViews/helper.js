import {dbCollections} from '@/utils/FirebaseCollections'
import * as mongoQuery from '@/utils/MongoQueries/crudOperations/crudOperations';
import { BSON } from 'realm-web';

/**
 * This function is used to add new private view
 * @param {Object} ids 
 * @param {Object} data 
 * @returns 
 */
export const addPrivateView = (ids, data) => {
    return new Promise((resolve, reject) => {
        try {
            let queryObj = [
                { _id: BSON.ObjectID(ids.uid) },
                { $push: { ProjectRequiredComponent: { ...data, createdAt: new Date()} } },
                { upsert: true }
            ];

            const query = {
                type: "updateOne",
                collection: dbCollections.COMPANY_USERS,
                data: queryObj
            };

            mongoQuery.mongodbCrudOperations(query).then(() => {
                resolve({statusText:'View added successfully', status: true})
            })

        } catch (error) {
            reject({ statusText: error, status: false })
        }
    })
}

/**
 * This function is used to remove or delete existing private view
 * @param {Object} ids 
 * @returns 
 */
export const deletePrivateView = (ids) => {
    return new Promise((resolve, reject) => {
        try {
            let queryObj = [
                { _id: BSON.ObjectID(ids.uid) },
                { $pull: { ProjectRequiredComponent: {id: ids.uniqueId} } },
                { upsert: true }
            ];

            const query = {
                type: "updateOne",
                collection: dbCollections.COMPANY_USERS,
                data: queryObj
            };

            mongoQuery.mongodbCrudOperations(query).then(() => {
                resolve({statusText:'View deleted successfully', status: true})
            })

        } catch (error) {
            reject({ statusText: error, status: false })
        }
    })
}

/**
 * This function is used to update private view name
 * @param {Object} ids 
 * @param {Object} data 
 * @param {String} name 
 * @returns 
 */
export const editPrivateName = (ids, data, name) => {
    return new Promise((resolve, reject) => {
        try {
            const identifier = data.id;
            let queryObj = [
                { 
                    _id: BSON.ObjectID(ids.uid),
                    "ProjectRequiredComponent.id": identifier  // Matches the specific object in the array
                },
                {
                    $set: { "ProjectRequiredComponent.$.name": name }  // Only updates 'name' of the matched object
                },
                { upsert: true }  // Options in an object
            ];

            const query = {
                type: "updateOne",
                collection: dbCollections.COMPANY_USERS,
                data: queryObj
            };

            mongoQuery.mongodbCrudOperations(query).then(() => {
                resolve({ statusText: 'View updated successfully', status: true })
            })

        } catch (error) {
            reject({ statusText: error, status: false })
        }
    })
}