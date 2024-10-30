import { dbCollections } from "@/utils/FirebaseCollections";
import taskClass from '@/utils/TaskOperations'
import { mongodbCrudOperations } from "@/utils/MongoQueries/crudOperations/crudOperations";
import { BSON } from "realm-web";

export const createTag  = (ids,payload) => {
    let queryObj = [
        { _id: BSON.ObjectID(ids.projectId) },
        { $push: { tagsArray: payload } },
        { upsert: true }
    ]

    const query = {
        type: "updateOne",
        collection: dbCollections.PROJECTS,
        data: queryObj
    };

    mongodbCrudOperations(query)
    .catch((error)=>{
        console.error("ERROR in add project tags: ", error);
    })
}

export const addTaskTag  = (ids, payload) => {
     return new Promise((resolve, reject) => {
        try {
            taskClass.updateTags({
                companyId: ids.companyId,
                projectId: ids.projectId,
                sprintId: ids.sprintId,
                taskId: ids.taskId,
                tagId: payload,
                operation: 'add'})
            .then(() => {
                resolve()
            }).catch((err)=>{console.error("ERROR",err);})
        } 
        catch(error) {
            reject(true)
        }  
    })
}

export const updateTag  = (ids, oldValue, newValue) => {

    let queryObj = [
        { _id: BSON.ObjectID(ids.projectId) },
        { $pull: { tagsArray: { uid: oldValue.uid } } },
        { upsert: true }
    ]

    const query = {
        type: "updateOne",
        collection: dbCollections.PROJECTS,
        data: queryObj
    };

    mongodbCrudOperations(query)
    .then(() => {
        let dataObj = [
            { _id: BSON.ObjectID(ids.projectId) },
            { $push: { tagsArray: newValue } },
            { upsert: true }
        ]

        const query1 = {
            type: "updateOne",
            collection: dbCollections.PROJECTS,
            data: dataObj
        };

        mongodbCrudOperations(query1)
    })
    .catch((error)=>{
        console.error("ERROR in add project tags: ", error);
    })
}

export const deleteTag = (ids, value) => {
    let queryObj = [
        { _id: BSON.ObjectID(ids.projectId) },
        { $pull: { tagsArray: { uid: value.uid } } },
        { upsert: true }
    ]

    const query = {
        type: "updateOne",
        collection: dbCollections.PROJECTS,
        data: queryObj
    };

    mongodbCrudOperations(query)
    .catch((error)=>{
        console.error("ERROR in add project tags: ", error);
    })
}

export const removeTaskTag  = (ids, payload) => {
    return new Promise((resolve, reject) => {
        try {
            taskClass.updateTags({ 
                companyId: ids.companyId,
                projectId: ids.projectId,
                sprintId: ids.sprintId,
                taskId: ids.taskId,
                tagId: payload,
                operation: 'remove'
            }).then(() =>{
                resolve()
            })
            .catch((err)=>{
                console.error("ERROR",err);
                reject()
            })
        } 
        catch(error) {
            reject(true)
        }  
    })

    
}