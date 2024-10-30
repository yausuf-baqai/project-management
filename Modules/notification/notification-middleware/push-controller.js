const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();
const axios = require('axios');
const { convert } = require('html-to-text');
const config = require('../../../Config/config');
const logger = require("../../../Config/loggerConfig")
const { dbCollections, settingsCollectionDocs } = require('../../../Config/firebaseCollections');
const { fcm } = require('../../../Config/firebaseConfig');
const fs = require('fs');
const path = require('path');
var brandSettings = null; 
const filePath = path.join(__dirname, '../../../brandSettings.json');

exports.sendNotificationHandler = async (notitificationData) => {
    return new Promise(async (resolve,reject) => {
      try {
        if (notitificationData.length > 0) {
          Promise.all(notitificationData.map(item => this.sendNotificationBody(item))).then((values) => {
            resolve(values)
          }).catch(error => {
            logger.error(`notitificationData Step One Catch error: ${error.message}`);
            reject(error)
          })
  
        }
        else {
          resolve([])
        }
      } catch (error) {
        logger.error(`Email Notification Step One Catch error: ${error.message}`);
        reject(error)
      }
    })
  };
  
  exports.sendNotificationBody = async (body) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          brandSettings = fileContent ? JSON.parse(fileContent) : null;
        }
        const options = {
          selectors: [
            { selector: 'img', format: 'skip' },
          ]
        };
        const text = convert(body.message, options);
        const topicName = "fcmNotification"
        let actionUrl = "";
        var { folderId = "", sprintId = "", projectId = "", companyId = '', taskId = "" } = body
        if (body.type.toLowerCase() === "project") {
          if (folderId !== undefined && folderId !== null && folderId !== '') {
            if (sprintId !== undefined && sprintId !== null && sprintId !== '') {
              actionUrl = `${body.companyId}/project/${projectId}/fs/${folderId}/${sprintId}`
            } else {
              actionUrl = `${body.companyId}/project/${projectId}/f/${folderId}`
            }
          } else if (sprintId !== undefined && sprintId !== null && sprintId !== '') {
            actionUrl = `${body.companyId}/project/${projectId}/s/${sprintId}`
          } else {
            actionUrl = `${body.companyId}/project/${projectId}/p?tab=ProjectDetail`
          }
        } else {
          if (folderId !== undefined && folderId !== null && folderId !== '') {
            actionUrl = `${body.companyId}/project/${projectId}/fs/${folderId}/${sprintId}/${taskId}${body.key === "logged_hours_notification" ? '?tab=ProjectListView&taskTab=TimeLog' : ''}`
          } else {
            actionUrl = `${body.companyId}/project/${projectId}/s/${sprintId}/${taskId}${body.key === "logged_hours_notification" ? '?tab=ProjectListView&taskTab=TimeLog' : ''}`
          }
        }
    
         var payload={}
         if(body.key=="message_create"&& type=="chat"){
          var Image=body.User_Employee_profileImage!=""?body.User_Employee_profileImage:"https://firebasestorage.googleapis.com/v0/b/alian-hub-beta.appspot.com/o/default_images%2Fdefault_user.png?alt=media&token=26ed33f8-562e-4bba-a1d3-28f56cfe51a6"
          payload = {
            notification: {
              title: body.User_Employee_Name || "Alian-Hub",
              body: changeText(text),
              click_action: `${config.WEBURL}/#/${actionUrl}`,
              icon:Image
            },
          }
         }else{
          var notificationTitle = body.type === 'project' ? 'Project Notification' : 'Task Notification'
            payload = {
            notification: {
              title: `${brandSettings && brandSettings.productName ? brandSettings.productName :'Alian Hub'} - ${notificationTitle}`,
              body: changeText(text),
              click_action: `${config.WEBURL}/#/${actionUrl}`
            }
         }
        }

  
        await Promise.all(body.webTokens.map(item => this.sendFcmNotification({ ...payload, to: item }))).then((response) => {
          db.collection(body.companyId).doc(body.companyId).collection(dbCollections.NOTIFICATIONS).doc(body.id).update({ notificationStatus: 'completed' })
          resolve(true)
        }).catch((error) => {
          db.collection(body.companyId).doc(body.companyId).collection(dbCollections.NOTIFICATIONS).doc(body.id).update({ notificationStatus: 'completed' })
          reject(error)
        });
      } catch (error) {
        reject(error)
  
      }
    })
  };
  function changeText(msg) {
    const mentionRegex = /@\[[\w ]+?\]\(\w{4,30}\)/gi;
    let mentions = msg.match(mentionRegex);

    if(mentions !== null) {
        mentions.forEach((mention) => {
            msg = msg.replace(mention, `@${mention.split("]")[0].replace("@[", "")}`)
        })
    }
    return msg;
}
exports.sendFcmNotification = async (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
		let message = {
			registration_ids: payload.to,
			data: payload.notification,
			metaData: payload.msgData || {},
		}
		fcm.sendToDevice(message, function(err, response){
			if (err) {
				logger.info(`Send Push Notification Error ${err?.message?err.message:err}`)
				reject({message:err.message})

			} else {
				logger.info("Send Push Notification Success")
				resolve(true)
			}
		})
	} catch (error) {
		reject({message:error.message})
    }

  })
}