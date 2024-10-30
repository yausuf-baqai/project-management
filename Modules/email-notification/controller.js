const logger = require("../../Config/loggerConfig");
const { dbCollections } = require('../../Config/firebaseCollections');
const { admin } = require("../../Config/firebaseConfig");
const db = admin.firestore();
// const client = require("../../Config/typesense");
const config = require("../../Config/config");
const sendMail = require("../service.js");
const sendEmailNotification = require("../Template/sendEmailNotification.js")
/************* Email Notification function Process Step 1 start **************/
/**
 * Send Email Notification Process Step-1 
 * fetch company Details and after that 
 * fetch notification details from sub-collection from company collection
 */
exports.emailNotificationStepOne = async () => {
    try {

        // Fetch Company Details from companies collection
        fetchCompanyDetails().then(response => {
            if (response.length) {
                var companyID = response.map(item => item.id)
                // Fetch Notification Details from company collection
                notificationDetails(companyID)
            }
        }).catch(error => {
            logger.error(`emailNotificationStepOne fetchCompanyDetails Catch error: ${error}`);
        })
    } catch (error) {
        logger.error(`Email Notification Step One Catch error: ${error}`);
        return;
    }
};

/**
 * fetch Multiple Companies Details using firestore
 * @returns company data
 */
function fetchCompanyDetails() {
    return new Promise((resolve, reject) => {
        db.collection(dbCollections.COMPANIES).get().then((nuData) => {
            if (nuData.empty) {
                resolve([])
            }
            var notiUserData = []
            nuData.forEach(doc => {
                notiUserData.push(doc.data());
            });
            resolve(notiUserData)
        }).catch((error) => {
            logger.error(`Email Notification Fetch Company Catch error: ${error}`);
            reject(error)
        });
    })

}
/**
 * Fetch Multiple Companies Details using firestore
 * @param {Array} companyID 
 */
function notificationDetails(companyID) {
    Promise.allSettled(companyID.map(itm => fetchNotificationDetails(itm))).then((results) => {

    }).catch(error => {
        logger.error(`notificationDetails Catch Error:${error}`)
    })
}
/**
 * fetch Notification Details by company ID from company collection
 * Update isEmailSent field in notification
 * Add Details in collection of EMAIL NOTIFICATION QUEUE using rendom key
 * @param {string} companyID 
 * @returns Notification Details
 */
function fetchNotificationDetails(companyID) {
    return new Promise((resolve, reject) => {
        db.collection(companyID).doc(companyID).collection(dbCollections.NOTIFICATIONS).where("isEmailSent", "==", false).get().then((nuData) => {
            if (nuData.empty) {
                resolve({ companyID: companyID, data: [] })
            }
            var notiData = []
            var refColl = db.collection(dbCollections.EMAIL_NOTIFICATION_QUEUE).doc()
            nuData.forEach(doc => {
                if ("Type" in doc.data()) {
                    notiData.push(doc.data());
                    doc.ref.update({ isEmailSent: true, })
                }
            });
            if (notiData.length > 0) {
                refColl.set({
                    id: refColl.id,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    companyID: companyID,
                    data: notiData,
                    status: 'Pending'

                }).then(response => {
                    updateStatusEmailNotification({ companyID, id: refColl.id, data: notiData })
                })
            }
            resolve({ companyID: companyID, data: notiData })
        }).catch((error) => {
            logger.error(`fetchNotificationDetails Catch Error:${error}`)
            reject(error)
        });
    })

}

function updateStatusEmailNotification({ companyID = '', id = '', data = [] }) {
    var refColl = db.collection(dbCollections.EMAIL_NOTIFICATION_QUEUE).doc(id)
    refColl.update({ status: 'In Progress', startTime: admin.firestore.FieldValue.serverTimestamp(), endTime: '',updatedAt: admin.firestore.FieldValue.serverTimestamp(), })
    setTimeout(() => {
        var itemData = []
        data.map((item) => {
            item.assigneeUsers.map(itm => {
                itemData.push({ userId: itm, notificationId: item.id, data: item, })
            })
        })
        var userIds = [...new Set(itemData.map(itm => itm.userId))]
        var userFinalArray = userIds.map(item => {
            var details = itemData.filter(itm => itm.userId == item)
            var types = [...new Set(details.map(itm => itm.data.Type))]
            var finalObject = { userId: item }
            types.map(items => {
                //   console.log(details.filter(itm=>itm.data.Type==items))
                finalObject[items] = details.filter(itm => itm.data.Type == items).map(itm => itm.data)
                //   console.log("finalObject",finalObject)
            })
            return (finalObject)
        })

        refColl.update({ status: 'Ready for email', updatedAt: admin.firestore.FieldValue.serverTimestamp(),endTime: admin.firestore.FieldValue.serverTimestamp(), emailData: userFinalArray })
        var allDetails = {}
        emailFormateReady(userFinalArray, companyID).then(async response => {
            allDetails = response
            var finalEmailData=[]
            userFinalArray.map((item, index) => {
                if ("task" in item) {
                    item.task.map((itm, inx) => {
                        userFinalArray[index].task[inx]["taskDetails"] = allDetails.tasks.find(items => items.id == itm.TaskId)
                        userFinalArray[index].task[inx]["projectDetails"] = allDetails.projects.find(items => items.id == itm.ProjectId)
                
                    })
                    finalEmailData.push({user:allDetails.users.find(items => items.id == item.userId),emailData:userFinalArray[index].task,Type:'Task IDs'})
                }
                if ("project" in item) {
                    item.project.map((itm, inx) => {

                        userFinalArray[index].project[inx]["projectDetails"] = allDetails.projects.find(items => items.id == itm.ProjectId)
                       
                    })
                    finalEmailData.push({user:allDetails.users.find(items => items.id == item.userId),emailData:userFinalArray[index].project,Type:'Project IDs'})
                }
                userFinalArray[index].userDetails = allDetails.users.find(items => items.id == item.userId)

            })

            // console.log("/*************** userFinalArray *******************/")
            // console.log(JSON.stringify(userFinalArray))
            // console.log("/*************** userFinalArray *******************/")
            // Promise.allSettled(finalEmailData.map(itm => sendEmailHandler(itm))).then((results) => {
            //     console.log(`Results:`, results);
            //     refColl.update({ status: 'Success', updatedAt: admin.firestore.FieldValue.serverTimestamp(), endTime:admin.firestore.FieldValue.serverTimestamp()})
            // }).catch(error => {
            //     refColl.update({ status: 'Error', updatedAt: admin.firestore.FieldValue.serverTimestamp(), endTime:admin.firestore.FieldValue.serverTimestamp(),error:error})
            // })
        }).catch(error => {
            logger.error("emailFormateReady ERROR", error)
        })
    }, 8000)
}

function sendEmailHandler(EmailDetails) {

    return new Promise(async (resolve, reject) => {
        let email = [EmailDetails.user.Employee_Email]
        let mail = sendEmailNotification({bodyData:EmailDetails.emailData.map(item=>item.Type=="project"?item?.ProjectId:item?.TaskId),type:EmailDetails.Type});
        await sendMail.SendNotificationEmail(`${config.APP_NAME}- ${"Email Notification"}`, mail, email, true, (result) => {
            if (!result.status) {
                reject({ error: "Email Not send" })
            } else {

                resolve(true)
            }
        })
    })

}
function emailFormateReady(arrayData, companyID) {
    return new Promise((resolved, rejected) => {

        var IdsDetails = arrayData.map(item => {
            var projectIds = []
            var taskIds = []
            if ("task" in item && item.task.length > 0) {
                taskIds = item.task.map(itm => itm.TaskId)
                projectIds = item.task.map(itm => itm.ProjectId)
            }

            if ("project" in item && item.project.length > 0) {
                projectIds = [...projectIds, ...item.project.map(itm => itm.ProjectId)]
            }
            var detail = { userId: item.userId, projectIds: [...new Set(projectIds)], taskIds: [...new Set(taskIds)] }
            return detail
        })

        var usersDetails = IdsDetails.map(itm => itm.userId)
        var projectIdlist = [...new Set(IdsDetails.map(itm => itm.projectIds).flat(1))]
        var taskIdlist = [...new Set(IdsDetails.map(itm => itm.taskIds).flat(1))]
        var users = []
        var projects = []
        var tasks = []
        var promise1 = new Promise((resolve, reject) => {
            db.collection(dbCollections.USERS).get().then((nuData) => {
                if (nuData.empty) {
                    resolve([])
                } else {

                    var tempUsers = []
                    nuData.forEach(doc => {
                        tempUsers.push(doc.data());
                    });
                    users = tempUsers.filter(item => usersDetails.includes(item.id))
                    resolve(users)

                }
            })
                .catch(error => {
                    logger.error(`Catch Error:${error}`)
                    resolve([])
                })
        })
        var promise2 = new Promise((resolve, reject) => {
            Promise.allSettled(projectIdlist.map(itm => fetchProjectDetails(companyID, itm, taskIdlist))).then((results) => {
                results.map(item => {
                    projects.push(item.value)
                })
                resolve(projects)
            }).catch(error => {
                logger.error(`notificationDetails Catch Error:${error}`)
                resolve([])
            })
        })
        var promise3 = new Promise((resolve, reject) => {
            resolve([]);

            // Remove Code
            // fetchTaskDetails(companyID, taskIdlist).then(resp => {
            //     tasks = resp
            //     resolve(tasks)
            // }).catch(error => {
            //     resolve([])
            // })
        })

        Promise.allSettled([promise1, promise2, promise3]).then((values) => {
            resolved({ users, projects, tasks })
        }).catch(error => {
            resolved({ users, projects, tasks })
            logger.error("errorerrorerrorerror", error)
        })

    })


}
// function fetchTaskDetails(companyID, taskIdlist) {
//     return new Promise((resolve, reject) => {
//         let searchParameters = {
//             q: "*",
//             query_by: 'AssigneeUserId',
//             filter_by: `id:${taskIdlist}`,
//         };

//         client.collections(`${companyID}_${dbCollections.TASKS}`).documents().search(searchParameters).then((result) => {
//             var taskDetails = []
//             if (!result.hits.length) {
//                 taskDetails = []
//                 resolve(taskDetails)
//             }
//             if (result && result.hits && result.hits.length > 0) {
//                 result.hits.map((x) => {
//                     taskDetails.push(x.document)
//                 })
//                 resolve(taskDetails)
//             } else {
//                 resolve(taskDetails)
//             }
//         }).catch(error => {
//             reject(error)
//         })
//     })


// }

function fetchProjectDetails(companyID, id, taskIdlist) {
    return new Promise((resolve, reject) => {
        db.collection(companyID).doc(companyID).collection(dbCollections.PROJECTS).doc(id).get().then((nuData) => {
            if (nuData != null) {
                resolve({ ...nuData.data(), id })
            } else {
                resolve({})
            }
        }).catch(error => {
            reject(error)
        })
    })


}
