const { dbCollections } = require('../../../Config/firebaseCollections');
const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();
const emailController = require('./email-controller')
const pushController = require('./push-controller')
const logger = require("../../../Config/loggerConfig")
exports.pushNotificationHandler = async () => {
  try {
    const querySnapshot = await db.collectionGroup(dbCollections.NOTIFICATIONS).where('notificationStatus', '==', 'in-process').where('createdAt', ">=", new Date())
    querySnapshot.onSnapshot((snapshot) => {
      if (snapshot.docChanges()?.length > 0) {
        snapshot.docChanges().forEach(change => {
          if (change.type != 'removed' && change.doc.data().notificationType == 'push') {
            pushController.sendNotificationHandler([{ ...change.doc.data(), path: change.doc.ref.path }])
          }
          else if (change.type != 'removed' && change.doc.data().notificationType == 'email') {
            emailController.emailNotificationManage([{ ...change.doc.data(), path: change.doc.ref.path }])
          }
        });
      }

    }, (error) => {
      logger.error(`Push Notification Handler Middleware: ${error.message}`);
    });
  } catch (error) {
    logger.error(`Push Notification Handler Middleware Catch: ${error.message}`);

  }
};
exports.pushNotificationHandler()





