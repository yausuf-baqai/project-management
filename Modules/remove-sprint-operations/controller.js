const logger = require("../../Config/loggerConfig");
const { dbCollections } = require("../../Config/firebaseCollections");
const { admin } = require("../../Config/firebaseConfig");
// const client = require("../../Config/typesense");
const db = admin.firestore(); 
/**
 * Main API function
 * @param {Objcet} req
 * @param {Object} res
 * @returns
 */

exports.insertHistoryAndNotification = async (notificationObject, historyObject, companyId, projectId, cb, ) => {
    try {
        return new Promise(async (resolve1, reject1) => {

            historyObject.createdAt = admin.firestore.FieldValue.serverTimestamp();
            // historyObject.updatedAt = admin.firestore.FieldValue.serverTimestamp();
            notificationObject.CreatedAt = admin.firestore.FieldValue.serverTimestamp();
            // notificationObject.updatedAt = admin.firestore.FieldValue.serverTimestamp();

            let promises = [];
            promises.push(
                new Promise(async (resolve, reject) => {
                    const projectsRef = db.collection(companyId).doc(companyId).collection(dbCollections.PROJECTS).doc(projectId).collection(dbCollections.HISTORY)
                    const ref = projectsRef.doc()
                    await projectsRef
                        .doc(ref.id)
                        .set(historyObject)
                        .then(() => {
                            console.log('Project History Document written with ID: ', ref.id)
                            resolve();
                        })
                        .catch((error) => {
                            logger.error('Error adding Project History document: ', error)
                            reject(error);
                        })
                })
            )
            promises.push(
                new Promise(async (resolve, reject) => {
                    const notificationRef = db.collection(companyId).doc(companyId).collection(dbCollections.NOTIFICATIONS)
                    let nRef = notificationRef.doc()
                    await notificationRef
                        .doc(nRef.id)
                        .set(notificationObject)
                        .then(() => {
                            console.log('Notification Document written with ID: ', nRef.id)
                            resolve();
                        })
                        .catch((error) => {
                            logger.error('Error adding Notification document: ', error)
                            reject(error);
                        })
                })
            )
            Promise.allSettled(promises)
                .then(() => {
                    cb({
                        status: true,
                        statusText: `Notification and History Documents Created Successfully`
                    });
                    resolve1();
                })
                .catch((error) => {
                    logger.error(`Something went Wrong!: ${error.message}`);
                    cb({
                        status: false,
                        statusText: `Error adding document ${error}`
                    });
                    reject1(error);
                })
        })
    } catch (error) {
        logger.error(`Add Project History Catch error of ${error}`)
        cb({
            status: false,
            statusText: `Error adding document ${error}`
        });
        reject1(error);
    }
}

// exports.removeSprintOperations = async (req, res) => {
//     try {
//         //REQUEST VARIABLES
//         const {
//             companyId,
//             projectId,
//             isFolder,
//             sprintId,
//             folderId,
//             mainSprint,
//             historyObject,
//             notificationObject,
//             updateObject,
//             taskId,
//             isTask,
//             // taskSubTaskIdArr
//         } = req.body;

//         // VALIDATIONS
//         if (!(req.body && companyId)) {
//             res.json({
//                 status: false,
//                 statusText: "Company id is required."
//             });
//             return;
//         }
//         if (!(req.body && projectId)) {
//             res.json({
//                 status: false,
//                 statusText: "Project Id is required."
//             });
//             return;
//         }
//         if (!(req.body && historyObject)) {
//             res.json({
//                 status: false,
//                 statusText: "History Object is required."
//             });
//             return;
//         }
//         if (!(req.body && notificationObject)) {
//             res.json({
//                 status: false,
//                 statusText: "Notification Object is required."
//             });
//             return;
//         }
//         if (!(req.body && typeof isFolder == 'boolean')) {
//             res.json({
//                 status: false,
//                 statusText: "isFolder is required."
//             });
//             return;
//         }
//         if (!(req.body && typeof mainSprint == 'boolean')) {
//             res.json({
//                 status: false,
//                 statusText: "mainSprint is required."
//             });
//             return;
//         }
//         if (!(req.body && updateObject)) {
//             res.json({
//                 status: false,
//                 statusText: "update Object is required."
//             });
//             return;
//         }
//         if (req.body && isTask!== undefined && isTask == true && !taskId) {
//             res.json({
//                 status: false,
//                 statusText: "Task Id is required."
//             });
//             return;
//         }
//         let flag = 0;
//         // REMOVING SPRINTS OF PROJECT AND ITS TASKS FROM MAINSPRINT BASED ON SPRINT ID

//         if (isFolder === false && mainSprint === true && sprintId) {
//             // REMOVING SPRINT FROM PROJECT
//             let promiseArray = [];
//             promiseArray.push(
//                 new Promise(async (resolve, reject) => {
//                     const projectsRef = db.collection(companyId).doc(companyId).collection(dbCollections.PROJECTS).doc(projectId);
//                     projectsRef.get().then(projectDoc => {
//                         if (projectDoc.empty) {
//                             res.send({
//                                 status: false,
//                                 statusText: "No Project Document Found!",
//                             })
//                             resolve()
//                         }
//                         const sprintsArray = projectDoc.data().sprintsArray;
//                         const sprintIndex = sprintsArray.findIndex(sprint => sprint.id === sprintId);
//                         if (sprintIndex !== -1) {
//                                 if(taskId){
//                                     sprintsArray[sprintIndex] = {
//                                         ...sprintsArray[sprintIndex],
//                                     }
//                                     if(updateObject.deletedStatusKey === 2) {
//                                         sprintsArray[sprintIndex].archiveTaskCount = (sprintsArray[sprintIndex].archiveTaskCount || 0) + 1;
//                                     } else if(updateObject.isArchieve) {
//                                         sprintsArray[sprintIndex].archiveTaskCount = (sprintsArray[sprintIndex].archiveTaskCount || 0) - 1;
//                                     }
//                                 }else{
//                                     sprintsArray[sprintIndex] = {
//                                         ...sprintsArray[sprintIndex],
//                                         ...updateObject
//                                     }
//                                 }
//                                 projectsRef.update({
//                                     sprintsArray: sprintsArray
//                                 }).then(()=>{
//                                     console.log("Removed Sprint from Project Successfully");
//                                     flag = 1;
//                                     resolve();
//                                 }).
//                                 catch((error) => {
//                                     logger.error(`Something went Wrong!: ${error.message}`);
//                                     if (!res.headersSent) {
//                                         res.json({
//                                             status: true,
//                                             statusText: `Removing Sprint from Project Catch Error!:${error.message}`,
//                                         });
//                                         reject(error);
//                                     }
//                                 })
//                         } else {
//                             res.send({
//                                 status: false,
//                                 statusText: `No sprint found on given Id!`,
//                             })
//                             return;
//                         }
//                     }).catch((error) => {
//                         logger.error(`Error getting project docs ${projectId}: ${error}`);
//                             res.send({
//                                 status: false,
//                                 statusText: `Error getting project docs: ${error}`,
//                             })                        
//                         reject(error);
//                     })
//                 })
//             )
//             Promise.allSettled(promiseArray)
//                 .then(() => {
//                     if(taskId){
//                         try {
//                             admin.firestore().collection(companyId).doc(companyId).collection(dbCollections.PROJECTS).doc(projectId).collection(sprintId).doc(taskId)
//                             .update({
//                                 deletedStatusKey: updateObject.deletedStatusKey
//                             })
//                             .then(() => {
//                                 client.collections(`${companyId}_tasks`).documents(taskId).update({deletedStatusKey: updateObject.deletedStatusKey});
//                                 res.send({
//                                     status: true,
//                                     statusText: `Updated task ${taskId}`,
//                                 })
//                             })
//                             .catch((error) => {
//                                 logger.error(`Something went Wrong!: ${error.message}`);
//                                 res.send({
//                                     status: false,
//                                     statusText: `Error removing main sprint : ${error}`,
//                                 })
//                                 return;
//                             })
//                         } catch (error) {
//                             console.log("Error in updating Task",error);
//                         }
//                     }else{
//                         exports.insertHistoryAndNotification(
//                             notificationObject, historyObject,
//                             companyId, projectId,
//                             () => {
//                             },
//                         )
//                         res.send({
//                             status: true,
//                             statusText: "Updated Succesfully",
//                         })
//                     }
//                 })
//                 .catch((error) => {
//                     logger.error(`Something went Wrong!: ${error.message}`);
//                     res.send({
//                         status: false,
//                         statusText: `Error removing main sprint : ${error}`,
//                     })
//                     return;
//                 })

//             // REMOVING SPRINTS AND ITS TASKS FROM FOLDER  
//         } else if (isFolder === true && mainSprint === false && sprintId && folderId) {
//             let promiseArray = [];
//             promiseArray.push(  
//                 new Promise(async(resolve, reject) => {
//                     const projectsRef = db.collection(companyId).doc(companyId).collection(dbCollections.PROJECTS).doc(projectId);
//                     projectsRef.get().then(projectDoc => {
//                         if (projectDoc.empty) {
//                             res.send({
//                                 status: false,
//                                 statusText: "No Project Document Found!",
//                             })
//                             resolve();
//                         }
//                         let sprintsfolder = projectDoc.data().sprintsfolders;
//                         let count = 0;
//                         const updateFun = (folder) => {
//                             if ( Object.keys(sprintsfolder).length <= count) {
//                                 // res.send({
//                                 //     status: false,
//                                 //     statusText: "Updatee",
//                                 // })
//                                 resolve();
//                             }  
//                             let element = sprintsfolder[folder];
//                             if (element.folderId === folderId) {
//                                 let sprintArray = element.sprintsArray;
//                                 let sprintIndex = sprintArray.findIndex(sprint => {
//                                     return sprint.id === sprintId;
//                                 });
//                                 if (sprintIndex !== -1) {
//                                     if(taskId){
//                                         sprintArray[sprintIndex] = {...sprintArray[sprintIndex]}
//                                         if(updateObject.deletedStatusKey === 2) {
//                                             sprintArray[sprintIndex].archiveTaskCount = (sprintArray[sprintIndex].archiveTaskCount || 0) + 1;
//                                         } else if(updateObject.isArchieve) {
//                                             sprintArray[sprintIndex].archiveTaskCount = (sprintArray[sprintIndex].archiveTaskCount || 0) - 1;
//                                         }
//                                     }else{
//                                         sprintArray[sprintIndex] = {...sprintArray[sprintIndex], ...updateObject}
//                                     }
//                                     projectsRef.update({
//                                         [`sprintsfolders.${folder}.sprintsArray`]: sprintArray
//                                     }).then(()=>{
//                                         console.log("sub sprint update");
//                                         flag = 1;
//                                         count++
//                                         updateFun(Object.keys(sprintsfolder)[count])
//                                     }).catch((err)=>{
//                                         console.log(err,"err");
//                                         res.send({
//                                             status: false,
//                                             statusText: `Error in archive sprint: ${err}`,
//                                         })
//                                     })
//                                 } else {
//                                     count++
//                                     updateFun(Object.keys(sprintsfolder)[count])
//                                 }
//                             }  else {
//                                 count++
//                                 updateFun(Object.keys(sprintsfolder)[count])
//                             }
//                         }
//                         updateFun(Object.keys(sprintsfolder)[count])

//                     }).catch((error)=>{
//                         logger.error(`Error getting project docs ${projectId}: ${error}`);
//                         reject(error);
//                     })
//                 })
//             )
//             console.log(promiseArray,"promiseArray");
//             Promise.allSettled(promiseArray)
//             .then(() => {   
//                 if(taskId){
//                     try {
//                         admin.firestore().collection(companyId).doc(companyId).collection(dbCollections.PROJECTS).doc(projectId).collection(sprintId).doc(taskId)
//                         .update({
//                             deletedStatusKey: updateObject.deletedStatusKey
//                         })
//                         .then(() => {
//                             client.collections(`${companyId}_tasks`).documents(taskId).update({deletedStatusKey: updateObject.deletedStatusKey});
//                             res.send({
//                                 status: true,
//                                 statusText: `Updated task ${taskId}`,
//                             })
//                         })
//                         .catch((error) => {
//                             logger.error(`Something went Wrong!: ${error.message}`);
//                             res.send({
//                                 status: false,
//                                 statusText: `Error removing main sprint : ${error}`,
//                             })
//                             return;
//                         })
//                     } catch (error) {
//                         console.log("Error in updating Task",error);
//                     }
//                 }else{
//                     exports.insertHistoryAndNotification(
//                         notificationObject, historyObject,
//                         companyId, projectId,
//                         () => {
//                         },
//                     )
//                     res.send({
//                         status: true,
//                         statusText: "Updated Succesfully",
//                     })
//                 }
//             }).catch((error) => {
//                 logger.error(`Something went Wrong!: ${error.message}`);
//                 res.send({
//                     status: false,
//                     statusText: `Error removing main sprint : ${error}`,
//                 })
//                 return;
//             })
//         // REMOVING FOLDER WITH ITS SPRINTS AND TASKS

//         } else if (isFolder === true && mainSprint === false && folderId) {
//             let promiseArray = [];
//             promiseArray.push(  
//                 new Promise(async(resolve, reject) => {
//                     const projectsRef = db.collection(companyId).doc(companyId).collection(dbCollections.PROJECTS).doc(projectId);
//                     projectsRef.get().then(projectDoc => {
//                         if (projectDoc.empty) {
//                             res.send({
//                                 status: false,
//                                 statusText: "No Project Document Found!",
//                             })
//                             resolve();
//                         }
//                         const sprintfolder = projectDoc.data().sprintsfolders;

//                         for (let index = 0; index < Object.keys(sprintfolder).length; index++) {
//                             const element = sprintfolder[Object.keys(sprintfolder)[index]];
//                             if (element.folderId === folderId) {
//                                 const elementIndex = Object.keys(sprintfolder)[index];
//                                 sprintfolder[elementIndex]  = {...sprintfolder[elementIndex], ...updateObject}
//                                 projectsRef.update({
//                                     sprintsfolders: sprintfolder
//                                 })
//                                 .then(() => {
//                                    logger.info(`Sprint folder with folderId ${folderId} removed from project ${projectId}.`)
//                                     flag = 1;
//                                     resolve();
//                                 })
//                                 .catch(error => logger.error(`Error removing sprint folder with folderId ${folderId} from project ${projectId}: ${error}`));
//                             }  
//                         }
//                     }).catch(error => {
//                         logger.error(`Error getting project docs ${projectId}: ${error}`);
//                         reject(error);
//                     })
//                 })
//             )
//             Promise.allSettled(promiseArray)
//             .then(() => { 
//                 exports.insertHistoryAndNotification(
//                     notificationObject, historyObject,
//                     companyId, projectId,
//                     () => {
//                     },
//                 )
//                 res.send({
//                     status: true,
//                     statusText: "Updated Succesfully",
//                 })
//             }).catch((error) => {
//                 logger.error(`Something went Wrong!: ${error.message}`);
//                 res.send({
//                     status: false,
//                     statusText: `Error removing main folder : ${error}`,
//                 })
//                 return;
//             })

//         }
//           else {
//             res.send({
//                 status: false,
//                 statusText: "Something went Wrong! Check Inputed Parameters"
//             });
//             return;
//         }
//     } catch (error) {
//         logger.error(`Remove Sprint And Folder Catch Error: ${error}`);
//         res.send({
//             status: false,
//             statusText: error.message
//         });
//         return;
//     }
// };