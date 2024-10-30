const { dbCollections } = require("../../Config/firebaseCollections");
const logger = require("../../Config/loggerConfig");
const { admin } = require("../../Config/firebaseConfig");
const db = admin.firestore();


/**
 * Function For Update Field In project Collection
 * @param {Objcet} companyId
 * @param {Objcet} projectId
 * @param {Object} isOnlyTimestampUpdate
 * @param {Object} timestamp
 * @param {Object} userId
 * @param {Object} taskId
 * @param {Object} timesheetId
 * @returns
 */
exports.updateProjectForTimelog = (companyId, projectId, isOnlyTimestampUpdate, timestamp, userId, taskId, timesheetId, isAdd) => {
    try {
        const flag = true;
        if(flag) return;
      let obj = {
        Updated_At: admin.firestore.FieldValue.serverTimestamp(),
        lastProjectActivity: timestamp
      };

      let userObj = {
        taskId: taskId,
        timesheetId: timesheetId,
        timestamp: timestamp 
      };
  
      if (!isOnlyTimestampUpdate) {
        if (isAdd) {
          obj[`userActivity.${userId}`] = userObj
        } else {
          obj[`userActivity.${userId}`] = admin.firestore.FieldValue.delete();
        }
      }
  
      db.collection(companyId)
        .doc(companyId)
        .collection(dbCollections.PROJECTS)
        .doc(projectId)
        .update(obj)
        .catch((error) => {
          logger.error(`Error updating project activity timestamp: ${error}`);
        });
        db.collection(dbCollections.USERS).doc(userId)
        .update({updatedAt: admin.firestore.FieldValue.serverTimestamp(),lastActive: admin.firestore.FieldValue.serverTimestamp()})
        .catch((error)=>{
            logger.error(`Error updating user activity timestamp: ${error}`);
        })
    } catch (error) {
      logger.error(`Try Catch Error while update Project: ${error}`);
    }
  };
  