const { fcm } = require("../Config/firebaseConfig");

exports.bulkPush = (tokens = [], notification = null) => {
    return new Promise((resolve, reject) => {
        try {
            if(!tokens.length || !notification) return resolve("Nothing to send");
            fcm.sendEachForMulticast({data: notification, tokens: tokens})
            // fcm.sendToDevice(tokens, {data: notification})
            .then(() => {
                resolve("success")
            })
            .catch((error) => {
                reject(error);
            })
        } catch (error) {
            reject(error);
        }
    })
}