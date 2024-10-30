const settingctrl = require("./settings-controller");
const userctrl = require("./user-controller");
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const db = getFirestore();
const { getCollectionData, addUpdateDocument } = require("../../../utils/firebase_queries");
const firebaseRef = require('../../../utils/firebase_queries');
const { dbCollections, settingsCollectionDocs } = require('../../../Config/firebaseCollections');
const logger = require("../../../Config/loggerConfig")
exports.handleNotification = async (req, res) => {
  try {
    if (!(req.body && req.body.key)) {
      res.send({
        status: false,
        message: "key is required."
      });
      return;
    }
    if (!(req.body && req.body.companyId)) {
      res.send({
        status: false,
        message: "companyId is required."
      });
      return;
    }
    if (!(req.body && req.body.projectId)) {
      res.send({
        status: false,
        message: "projectId is required."
      });
      return;
    }
    if (!(req.body && req.body.message)) {
      res.send({
        status: false,
        message: "message is required."
      });
      return;
    }
    if (!(req.body && req.body.userId)) {
      res.send({
        status: false,
        message: "userId is required."
      });
      return;
    }
    if (req.body.key === 'tasks') {
      if (!(req.body && req.body.taskId)) {
        res.send({
          status: false,
          message: "taskId is required."
        });
        return;
      }
    }
    res.send({ status: true, message: 'create notification data' })

    // return this.getCompanyOwener(req.body).then(settingRes => {
    //   var dataOwner = settingRes
    //   if (req.body.task_leader_ID != "") {
    //     dataOwner.push(req.body.task_leader_ID)
    //   }
    //   var body = { ...req.body, assigneeUsers: [...new Set(req.body.assigneeUsers.concat([...dataOwner]))] }
    //   return this.handleSingleNotification(body).then(res => {
    //     return
    //   }).catch(error => {
    //     logger.error("Setting Response Checked ERROR", error)
    //     return
    //   })

    // }).catch(error => {
    //   logger.error("Setting Response Checked ERROR", error)
    //   return
    // })
    var dataOwner =[]
    if ("task_leader_ID" in req.body&&req.body.task_leader_ID != "") {
      dataOwner.push(req.body.task_leader_ID)
    }
    var body = { ...req.body, assigneeUsers: [...new Set(req.body.assigneeUsers.concat([...dataOwner]))] }
    return this.handleSingleNotification(body).then(res => {
      return
    }).catch(error => {
      logger.error(`Prepare Notification Handler of single notification Catch error: ${error.message}`)
      return
    })

  } catch (error) {
    logger.error(`Prepare Notification Handler Catch error: ${error}`);
    res.send({ status: false, message: 'Something went wrong!' })
    return;
  }
};

exports.getCompanyOwener = async (notificationBody) => {
  return new Promise(async (resolve, reject) => {
    try {
      var queryPath = `${notificationBody.companyId}/${notificationBody.companyId}/${dbCollections.COMPANY_USERS}`
      var whereConditions = [{ field: "roleType", operation: "==", value: 1 }, { field: "isDelete", operation: "==", value: false }, { field: "companyId", operation: "==", value: notificationBody.companyId }]
      getCollectionData(queryPath, whereConditions).then(snapshot => {
        if (snapshot.empty) {
          resolve([])
          return;
        }
        var ids = []
        snapshot.forEach(doc => {
          ids.push(doc.data().userId)
        });
        resolve(ids)
      }).catch((error) => {
        reject({message:error.message})
      })


    } catch (error) {
      reject({message:error.message})
    }
  })

}

exports.handleSingleNotification = async (notificationBody) => {
  return new Promise(async (resolve, reject) => {
    try {
      var assigneeUsers = notificationBody.assigneeUsers?.filter(item => item != notificationBody.userId) || []
      settingctrl.getNotificationSetttings(assigneeUsers).then(response => {
        this.manageNotificationSettings(notificationBody, response).then(responseSetting => {
          resolve(responseSetting)
        }).catch(error => {
          reject({message:error.message})
        })
      }).catch(error => {
        reject({message:error.message})
      })
    } catch (error) {
      reject({message:error.message})
    }
  })
};


exports.manageNotificationSettings = async (notificationBody, settingRes) => {
  return new Promise(async (resolve, reject) => {
    try {
      var notificationSetting = []
      var finalNotificationData = []
      var assigneeUsers = notificationBody.assigneeUsers?.filter(item => item != notificationBody.userId) || []
      notificationSetting = settingRes
      if (settingRes.length > 0) {
        var data = [...settingRes.map(item => ({ ...item[notificationBody.type], userId: item.id })).filter(itm => ({ ...itm.items })).map(items => items.items.map(itemm => ({ ...itemm, userId: items.userId })))].flat(1).filter(item => item.key == notificationBody.key)||[]
        if (assigneeUsers.length > 0) {
          assigneeUsers.map(item => {
            var settings = data.find(itm => itm.userId == item) || {}
            if (Object.keys(settings).length > 0) {
              if (settings.browser || settings.mobile) {
                finalNotificationData.push({ ...notificationBody, receiverID: item, notificationType: 'push', isSchedule: false })
              }
              if (settings.email) {
                if(notificationBody.key!="message_create"){
                  finalNotificationData.push({ ...notificationBody, receiverID: item, notificationType: 'email', isSchedule: false })
                }
              }
            }
          })
          var receiverIDs = [...new Set(finalNotificationData?.map(item => item.receiverID))]
          var senderIDs = [...new Set(finalNotificationData?.map(item => item.userId))]
          userctrl.getUsersDetails([...new Set(receiverIDs.concat(senderIDs))]).then(response => {
            finalNotificationData.map((item, index) => {
              if (response.length > 0) {
                var userDetails = response.find(itm => itm.id == item.receiverID)
                var senderDetails = response.find(itm => itm.id == item.userId)
                if (receiverIDs.includes(item.receiverID)) {
                  finalNotificationData[index]["Employee_Email"] = userDetails?.Employee_Email || ''
                  finalNotificationData[index]["Employee_Name"] = userDetails?.Employee_Name || ''
                  finalNotificationData[index]["Employee_profileImage"] = userDetails?.Employee_profileImage || ''
                }
                if (senderIDs.includes(item.userId)) {
                  finalNotificationData[index]["User_Employee_Email"] = senderDetails?.Employee_Email || ''
                  finalNotificationData[index]["User_Employee_Name"] = senderDetails?.Employee_Name || ''
                  finalNotificationData[index]["User_Employee_profileImage"] = senderDetails?.Employee_profileImage || ''
                }

                finalNotificationData[index]["isSeen"] = false
                finalNotificationData[index]["notificationStatus"] = 'in-process'

                if (item.notificationType == 'push') {
                  finalNotificationData[index]["webTokens"] = userDetails?.webTokens || []
                }
                else {
                  finalNotificationData[index]["webTokens"] = []
                }
              }else{
                resolve([])
              }
            })
            this.createNotificationsData(finalNotificationData).then(res=>{
              resolve(finalNotificationData)
            }).catch(error => {
            reject({message:error.message})
          })
         
          }).catch(error => {
            reject({message:error.message})
          })

        }
        else {
          resolve([])
        }
      }
      else {
        resolve([])
      }
    } catch (error) {
      reject({message:error.message})
      resolve([])
    }
  })
};


exports.createNotificationsData = async (notificationBody) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (notificationBody.length > 0) {
        Promise.allSettled(notificationBody.map(item => this.createNotificationsBody(item))).then((values) => {
          resolve(values)
        }).catch(error => {
          reject({message:error.message})
        })

      }
      else {
        resolve({})
      }
    } catch (error) {
      reject({message:error.message})
    }
  })
};

exports.createNotificationsBody = async (notificationBody) => {
  return new Promise(async (resolve, reject) => {
    try {
      var objects = notificationBody
      var ref = db.collection(objects.companyId).doc(objects.companyId).collection(dbCollections.NOTIFICATIONS).doc()
      var bodyObject = {
        id: ref.id,
        ...objects,
        updatedAt: new Date(),
        createdAt: new Date()
      }
      ref.set(bodyObject)
      resolve(bodyObject)
    } catch (error) {
      reject({message:error.message})
    }
  })
};
