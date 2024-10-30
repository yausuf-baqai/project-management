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
exports.getUsersDetails = async (UserIDs) => {
    var usersDetails=[]
   return new Promise(async(resolve, reject) => {
    try {
        const querySnapshot = await db.collection('users').where('id', 'in', UserIDs).where('isActive', "==", true).where('isDeleted', "==", false)
        querySnapshot.get()
        .then(snapshot => {
          snapshot.docChanges().forEach(change => {
            upsert(usersDetails, { ...change.doc.data()}, change.type)
          });
          resolve(usersDetails)
        })
        .catch(error => {
          reject({message:error.message})
        })
      } catch (error) {
        reject({message:error.message})
      }
    })

};
