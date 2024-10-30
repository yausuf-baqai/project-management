const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();
const { dbCollections } = require('../../../Config/firebaseCollections');
const logger = require("../../../Config/loggerConfig")
exports.fetchDetailsOfCompanies = async (companies = []) => {
  return new Promise(async (resolve, reject) => {
    try {
      var ref = db.collection(dbCollections.COMPANIES)
      if (companies.length > 0) {
        ref = ref.where('id', 'in', companies)
      }
      ref.get().then((nuData) => {
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
        resolve([])
      });
    } catch (error) {
      logger.error(`Email Notification Fetch Company Catch error: ${error}`);
      resolve([])
    }

  })
}

exports.fetchProjectDetailsSingle = (companyID, id) => {
  return new Promise((resolve, reject) => {
    try {
      db.collection(companyID).doc(companyID).collection(dbCollections.PROJECTS).doc(id).get().then((nuData) => {
        if (nuData != null) {
          resolve([{ ...nuData.data(), id }])
        } else {
          resolve([])
        }
      }).catch(error => {
        logger.error(`Fetch Project Details For single Notification: ${error.message}`)
        resolve([])
      })
    } catch (error) {
      logger.error(`Fetch Project Details For single Notification: ${error.message}`)
      resolve([])
    }
  })


}


