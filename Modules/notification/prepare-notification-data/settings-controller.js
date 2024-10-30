const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const db = getFirestore();
const logger = require("../../../Config/loggerConfig")
function upsert(array, item, type) {
  const i = array.findIndex(_item => _item.id === item.id);
  if (i > -1 && type == 'removed') {
    array.splice(i, 1);
  } else if (i > -1) {
    array[i] = { ...array[i], ...item };
  } else {
    array.push(item);
  }
  return array;
}
exports.getNotificationSetttings = async (UserIDs) => {
    var notificationSetting=[]
   return new Promise(async(resolve, reject) => {
    try {
        const querySnapshot = await db.collectionGroup('notifications_settings').where('id', 'in', UserIDs).where('updatedAt', "<=", new Date())
        querySnapshot.get()
        .then(snapshot => {
          snapshot.docChanges().forEach(change => {
            upsert(notificationSetting, { ...change.doc.data()}, change.type)
          });
          resolve(notificationSetting)
        })
        .catch(error => {
          reject({message:"Notification Settings Details not found"})
        })
      } catch (error) {
        reject({message:"Notification Settings Catch Error"})
      }
    })
};
