const emailCtrl = require('../sendEmail/controller')

exports.sendEmailHandler = async (allDetails) => {
    return new Promise(async (resolve,reject) => {
        try {
            var emailDetails = { ...allDetails }
            emailCtrl.sendEmailHandlerSingle(emailDetails)
        } catch (error) {
            reject({message:error.message})
        }

    })

}
