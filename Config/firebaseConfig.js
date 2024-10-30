const admin = require("firebase-admin");
const firebase = require("firebase");
const config =  require('./config');

//COLLECTION -DEVELOPMENT
const firebaseConfig = {
    apiKey:config.FIREBASE_APIKEY,
    authDomain: config.FIREBASE_AUTODOMAIN,
    projectId: config.FIREBASE_PROJECTID,
    storageBucket: config.FIREBASE_STORAGEBUCKET,
    messagingSenderId: config.FIREBASE_MESSAGINGSENDERID,
    appId: config.FIREBASE_APPID,
    measurementId: config.FIREBASE_MEASUREMENTID
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

//Initialize Admin
var serviceAccount = require(config.SERVICE_FILE);
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} catch(error) {
    console.log("Firebase Error:", error);
}
const fcm = admin.messaging();

module.exports = {
    firebase,
    admin,
    fcm
};