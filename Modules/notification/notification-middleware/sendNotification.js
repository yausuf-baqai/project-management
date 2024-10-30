const config = require('../../../Config/config');
const { fcm } = require('../../../Config/firebaseConfig');

const logger = require("../../../Config/loggerConfig")
exports.sendFCMNotification = ({notification, tokens, msgData}) => {
    return new Promise(async (resolve, reject) => {
        try {
            fcm.sendEachForMulticast({data: notification, tokens: tokens})
            // fcm.sendToDevice(tokens, {data: notification})
            .catch((error) => {
                console.error(error,'ERORR:');
            })
            resolve({status:true})
        } catch (error) {
            resolve({status:true})
        }
    })
}