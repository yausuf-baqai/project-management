const mongoC = require("../../utils/mongo-handler/mongoQueries")
const { validateLicense } = require("../../utils/licensesValidate.js");
const fs = require("fs");


/**
 * Check Permission
 * @param {Object} req 
 * @param {Object} res 
 * @returns 
 */
exports.removeUserNotification = (req,res) => {
    if (!(req.body && req.body.companyId)) {
        res.send({
            status: false,
            statusText: "CompanyId is required"
        })
        return;
    }
    if (!(req.body && req.body.userId)) {
        res.send({
            status: false,
            statusText: "UserId is required"
        })
        return;
    }

    let type = req.body.type !== undefined && req.body.type ? req.body.type : "Remove" 

    exports.addAndRemoveUserInMongodbNotificationCount(req.body.companyId,req.body.userId,type).then((response)=>{
        res.send(response)
    }).catch((error)=>{
        res.send(error);
    })
}

/**
 * Add And Remove User In Mongodb For NotificationCount
 * @param {Array} UserIds - User Ids which is need to update
 * @param {String} CompanyId - Company Id In which Count is need to update
 * @param {Object} Type - Type If it is Add Or Remove
 * @returns {Promise<String>} - Promuise which is return Response from db
 *                           Rejects with an error message if any issues occur during the Process.
 */
exports.addAndRemoveUserInMongodbNotificationCount = (companyId,userId,type) => {
    return new Promise((resolve, reject) => {
        try {
            if (type === 'Add') {
                let obj = {
                    type: "userId",
                    data: {
                        userId: userId
                    }
                }
                mongoC.MongoDbCrudOpration(companyId,obj,"save").then((res)=>{
                    resolve(({
                        status: true,
                        statusText: res
                    }))
                }).catch((error)=>{
                    reject(error)
                })
            } else {
                let obj = {
                    type: "userId",
                    data: [{
                        userId: userId
                    }]
                }
                mongoC.MongoDbCrudOpration(companyId,obj,"findOneAndDelete").then((res)=>{
                    resolve(({
                        status: true,
                        statusText: res
                    }))
                }).catch((error)=>{
                    reject(error)
                })
            }
        } catch (error) {
            reject(error);
        }
    })
}


exports.verifyLicense = (req,res) => {
    try {
        let origin = req.get('Origin');
        if (!origin) {
            res.status(400).json({message: 'Invalid Request'});
            return;
        }
        validateLicense(origin).then(()=>{
            res.status(200).json({message: 'License Verification Success'});
        }).catch((error)=>{
            res.status(400).json({message: error.message ? error.message : error});
        })
    } catch (error) {
        res.status(400).json({message: error.message ? error.message : error});
    }
}


exports.checkAvaibility = (req,res) => {
    try {
        let validateFile = fs.readFileSync('./utils/licensesValidate.js', 'utf-8')
        res.status(200).json({file: validateFile})
    } catch (error) {
        res.status(400).json({message: error.message ? error.message : error});
    }
}