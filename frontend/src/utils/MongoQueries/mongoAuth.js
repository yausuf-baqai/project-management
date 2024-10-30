import { App } from "realm-web";
import { dbCollections } from "../FirebaseCollections";

export const USR_REF = {value: null};
export const DB_REF = {value: null};
export const GLOBAL_DB_REF = {value: null};
export const SUBSCRITION_DB_REF = {value: null};
const app = new App({ id: process.env.VUE_APP_MONGO_APP_ID });
// export function authenticate(auth = {email:"brijesh.makadia@aliansoftware.com", password:"Abc@223133"}) {
//     return new Promise((resolve, reject) => {
//         try {
//             const app = new App({ id: process.env.VUE_APP_MONGO_APP_ID });
//             const credentials = Credentials.emailPassword(auth.email,auth.password);
//             app.logIn(credentials).then(async user => {
//                 USR_REF.value = user;
//                 mongoGLOBALConnection();
//                 resolve(user);
//             }).catch((error)=>{
//                 reject(error);
//                 console.log("ERROR",error)
//             })
//         } catch (e) {
//             reject(e);
//         }
//     })
// }
export function mongoConnection({database, user = app.currentUser}) {
    return new Promise((resolve, reject) => {
        try {
            const mongodb = user.mongoClient("mongodb-atlas");
            DB_REF.value = mongodb.db(database)
            resolve(DB_REF.value);
        } catch (e) {
            reject(e);
        }
    })
}
export function mongoGLOBALConnection() {
    return new Promise((resolve, reject) => {
        try {
            const app = new App({ id: process.env.VUE_APP_MONGO_APP_ID });
            const mongodb = app.currentUser.mongoClient("mongodb-atlas");
            GLOBAL_DB_REF.value = mongodb.db(dbCollections.GLOBAL)
            resolve(GLOBAL_DB_REF.value);
        } catch (e) {
            reject(e);
        }
    })
}
export function mongoSUBSCRIPTIONConnection() {
    return new Promise((resolve, reject) => {
        try {
            const app = new App({ id: process.env.VUE_APP_MONGO_APP_ID });
            const mongodb = app.currentUser.mongoClient("mongodb-atlas");
            SUBSCRITION_DB_REF.value = mongodb.db(dbCollections.SUBSCRIPTIONDATA)
            resolve(SUBSCRITION_DB_REF.value);
        } catch (e) {
            reject(e);
        }
    })
}

// export const USR_REF = userRef;
// export const DB_REF = dbRef;

// module.exports = {
//     USR_REF: userRef,
//     DB_REF: dbRef
// }