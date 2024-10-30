const { dbCollections, } = require('../../Config/firebaseCollections');
const logger = require("../../Config/loggerConfig")
const { App, Credentials } = require("realm-web");
var USR_REF = null;
var DB_REF = null
var GLOBAL_DB_REF = null;
exports.authenticate = ({ auth = { email:process.env.ADMIN_USER_EMAIL_REALM, password: process.env.ADMIN_USER_PASSWORD_REALM }, database }) => {
    return new Promise(async(resolve, reject) => {
        try {
            const app = new App({ id: process.env.MONGO_APP_ID });
  
            if (app.currentUser) {
                USR_REF = app.currentUser;
                await this.mongoGLOBALConnection({ database });
                resolve(app.currentUser);
                // app.currentUser.logOut()
                // this.authenticate()
            } else {
                const credentials = Credentials.emailPassword(auth.email, auth.password);
                app.logIn(credentials).then(async user => {
                    USR_REF = user;
                    await this.mongoGLOBALConnection({ database });
                    resolve(user);
                }).catch((error) => {
                    reject(error);
                    logger.error(`authenticate error: ${error.message}`)
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}
exports.mongoConnection = ({ database, user = USR_REF }) => {
    return new Promise((resolve, reject) => {
        try {
            const mongodb = user.mongoClient("mongodb-atlas");
            DB_REF = mongodb.db(database)
            resolve(DB_REF);
        } catch (e) {
            logger.error(`mongoConnection error: ${e.message}`)
            reject(e);
        }
    })
}
exports.mongoGLOBALConnection = () => {
    return new Promise((resolve, reject) => {
        try {
            const mongodb = USR_REF.mongoClient("mongodb-atlas");
            GLOBAL_DB_REF = mongodb.db(dbCollections.GLOBAL)
            resolve(GLOBAL_DB_REF);
        } catch (e) {
            logger.error(`mongoGLOBALConnection Catch error: ${e.message}`)
            reject(e);
        }
    })
}

exports.mongodbSnapshot = async (options, cb) => {
    try {
        const { subCollection, watchFilter = {}, global = false } = options;

        if (subCollection === undefined) {
            cb({ error: new Error("subCollection is required") })
            return;
        }
        let collection = null;
        if (global) {
            collection = GLOBAL_DB_REF.collection(subCollection).watch(watchFilter)
        } else {
            collection = await DB_REF.collection(subCollection).watch(watchFilter)
        }

        cb({ error: null, snap: collection, data: null, type: 'inital' });
        for await (const change of collection) {
            switch (change.operationType) {
                case "insert": {
                    change.fullDocument = JSON.parse(JSON.stringify(change.fullDocument))
                    cb({ error: null, snap: collection, data: change, type: 'insert' });
                    break;
                }
                case "replace": {
                    change.fullDocument = JSON.parse(JSON.stringify(change.fullDocument))
                    cb({ error: null, snap: collection, data: change, type: 'replace' });
                    break;
                }
                case "delete": {
                    change.documentKey = JSON.parse(JSON.stringify(change.documentKey))
                    cb({ error: null, snap: collection, data: change, type: 'delete' });
                    break;
                }
                case "update": {
                    change.fullDocument = JSON.parse(JSON.stringify(change.fullDocument))
                    cb({ error: null, snap: collection, data: change, type: 'update' });
                    break;
                }
            }
        }
    } catch (error) {
        logger.error(`mongodbSnapshot Catch error: ${error.message}, ${JSON.stringify(options)}`)
        cb({error: new Error(error.message)})
    }
}