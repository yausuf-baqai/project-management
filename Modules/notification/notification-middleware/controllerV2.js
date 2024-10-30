const { MongoDbCrudOpration, tableType, checkType } = require("../../../utils/mongo-handler/mongoQueries");
const { SCHEMA_TYPE } = require("../../../Config/schemaType")
const logger = require("../../../Config/loggerConfig")
const { dbCollections, } = require('../../../Config/firebaseCollections');
const { authenticate, mongodbSnapshot } = require('../../../utils/mongo-handler/realmConnector')
const pushController = require('./push-controllerV2')
const emailController = require('./email-controllerV2')

exports.fetchCompanies = () => {
  return new Promise((resolve, reject) => {
    try {
      let obj = {
        type: SCHEMA_TYPE.COMPANIES,
        data: []
      }
      MongoDbCrudOpration(dbCollections.GLOBAL, obj, "find")
        .then(usersDetails => {
          resolve(usersDetails)
        })
        .catch(error => {
          reject({ message: error.message })
        })
    } catch (error) {
      reject({ message: error.message })
    }
  })
}

exports.fetchNotsifications = () => {
  let options = {
    subCollection: dbCollections.NOTIFICATIONS,
    watchFilter: {
    },
    global:true
  }
  mongodbSnapshot(options, (value) => {
    if (value.error === null) {
      if (value.type === "insert") {
        const insert = value.data.fullDocument;
        this.manageTypeNotification(insert)
      } else if (value.type === "update") {
        const update = value.data.fullDocument;
        this.manageTypeNotification(update)
      }
    }
  });
}
exports.manageTypeNotification=(notificationData)=>{
  if(notificationData.notificationType == 'push'){
    pushController.sendNotificationHandler([{...notificationData, path:""}])
  }
  if(notificationData.notificationType == 'email'){
    emailController.emailNotificationManage([{...notificationData, path:""}])
  }
}

exports.connectionCall = async () => {
  await authenticate({ auth:{email:process.env.ADMIN_USER_EMAIL_REALM, password: process.env.ADMIN_USER_PASSWORD_REALM}, database: dbCollections.GLOBAL })
  setTimeout(() => {
    this.fetchNotsifications()
  }, 5000)
}

this.connectionCall()

