import { dbCollections } from '@/utils/FirebaseCollections';
import { mongodbCrudOperations } from '@/utils/MongoQueries/crudOperations/crudOperations';
import { BSON } from 'realm-web';

export const getTimeSheetData = (companyId,userArray,sdate,edate,projectId,taskId) => {
    return new Promise((resolve, reject) => {
        try {
            let search_parameters = [{
                Loggeduser: { 
                    $in: userArray 
                },
                LogStartTime: {
                    $gte: sdate,
                    $lte: edate
                }
            }]
            if (userArray.length !== 0) {        
                if (projectId && projectId !== '' && taskId == '') {
                    search_parameters = [{
                        Loggeduser: { 
                            $in: userArray 
                        },
                        LogStartTime: {
                            $gte: sdate,
                            $lte: edate
                        },
                        ProjectId: projectId
                    }]
                }
                if (taskId && taskId !== '') {
                    search_parameters = [{
                        Loggeduser: { 
                            $in: userArray 
                        },
                        LogStartTime: {
                            $gte: sdate,
                            $lte: edate
                        },
                        ProjectId: projectId,
                        TicketID: taskId
                    }]
                }
            }
            if (userArray.length === 0) {
                if (projectId && projectId !== '' && taskId == '') {
                    search_parameters = [{
                        LogStartTime: {
                            $gte: sdate,
                            $lte: edate
                        },
                        ProjectId: projectId
                    }]
                }
                if (taskId && taskId !== '') {
                    search_parameters = [{
                        LogStartTime: {
                            $gte: sdate,
                            $lte: edate
                        },
                        ProjectId: projectId,
                        TicketID: taskId
                    }]
                }
            }
                const getQuery = {
                    collection: dbCollections.TIMESHEETS,
                    type: "find",
                    data: search_parameters
                }
                mongodbCrudOperations(getQuery)
                .then((result) => {
                let tempTypesSenseDocs = [];
                result.map((vals) => {
                    let docTemp = vals;
                    tempTypesSenseDocs.push({...docTemp,'logAddType':docTemp.logAddType ? docTemp.logAddType : 0});
                })
                resolve(tempTypesSenseDocs)
            })
            .catch((error)=>{
                console.error(error)
                reject([])
            })
        } catch (error) {
            reject(error);
        }
    })
}


export const getTaskName = (companyId,array) => {
    return new Promise((resolve, reject) => {
        try {
            let uniquerTaskId = [...new Set(array.map((x)=>{return x.TicketID}))]
                let finalUniquArray = uniquerTaskId.map((x)=> {
                    return BSON.ObjectID(x)
                })
                const getQuery = {
                    collection: dbCollections.TASKS,
                    type: "find",
                    data: [{_id: {$in: finalUniquArray}}]
                }
                mongodbCrudOperations(getQuery)
                .then((task) => {
                let Array = [];
                task.forEach((ele)=>{
                    Array.push({id: ele._id, name: ele.TaskName , key: ele.TaskKey, isFolderSprint: ele.folderObjId ? true : false, sprintName: ele.sprintArray.name, folderName: ele.sprintArray.folderName ? ele.sprintArray.folderName : "" })
                })
                resolve(Array);
            })
        } catch (error) {
            reject(error);
        }
    })
}
