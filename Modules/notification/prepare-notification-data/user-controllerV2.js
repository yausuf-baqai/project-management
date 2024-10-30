const { MongoDbCrudOpration } = require("../../../utils/mongo-handler/mongoQueries");
const { SCHEMA_TYPE } = require("../../../Config/schemaType")
const { dbCollections, } = require('../../../Config/firebaseCollections');
const logger = require("../../../Config/loggerConfig")
exports.getUsersDetails = (UserIDs) => {
    // var usersDetails=[]
   return new Promise((resolve, reject) => {
    try {
        // const querySnapshot = await db.collection('users').where('id', 'in', UserIDs).where('isActive', "==", true).where('isDeleted', "==", false)
        // querySnapshot.get()
        let obj = {
            type: SCHEMA_TYPE.USERS,
            data: [{
              _id: {
                $in: UserIDs
              },
            }]
          }
          MongoDbCrudOpration(dbCollections.GLOBAL, obj, "find")
        .then(usersDetails => {
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