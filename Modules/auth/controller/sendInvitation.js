const config = require("../../../Config/config");
const sendMail = require("../../service.js");
const mongoRef = require('../../../utils/mongo-handler/mongoQueries');
const btoa = require('btoa');
const { SCHEMA_TYPE } = require("../../../Config/schemaType.js");
const mongoose = require("mongoose");
/**
 * Send Verification Mail
 * @param {Objcet} req
 * @param {Object} res
 * @returns
 */
exports.sendInvitationEmail = (req,res) => {
    try {
        let keys = ["email", "companyId", "companyName", "role", "designation"];
        let valid = "";

        keys.forEach((key) => {
            if(req.body[key] === undefined || req.body[key] === null) {
                valid += `${key}, `
            }
        })

        // VALIDATE REQUEST BODY
        if(valid.length) {
            valid += "fields are required.";
            res.send({status: false, statusText: new Error(valid)});
            return
        }

        let {email, companyId, companyName, role, designation,isResend} = req.body;

        email = email.toLowerCase();

        if(!isResend){
            let updateObj = {
                type:SCHEMA_TYPE.COMPANIES,
                data: [
                    { _id : new mongoose.Types.ObjectId(companyId)},
                    {$inc: {
                        'companyData.$[elementIndex].users': 1,
                    }},
                    {
                        arrayFilters: [{ 'elementIndex.users': { $exists: true } }],
                        upsert: true
                    }
                ]
            }
            mongoRef.MongoDbCrudOpration('global', updateObj, "findOneAndUpdate").catch((error) => {
                console.error(error,"ERROR:")
            })
        }

        /**
         * Send Check Request Function
         * @param {String} mail - Mail Template which is need to send for email
         * @returns
        */
        const sendMailFunction = (mailObj) => {
            sendMail.SendEmail(mailObj.subject, mailObj.mail, email, true, (result) => {
                if(result.status) {
                    res.send({
                        status: true,
                        statusText: 'Invitation mail sent sucessfully.'
                    });
                } else {
                    res.send({
                        status: false,
                        statusText: result.error
                    });
                    exports.decreaseUserCount(companyId);
                }
            });
        };

        /**
         * Send Check Request Function
         * @param {String} UserId - Id of user For which We need to send invittation to company
         * @param {String} Email - Email of user For which We need to send invittation to company
         * @param {String} token - Token Which is used to verification
         * @returns
        */
        const sendCheckRequest = (email, userId, token) => {
            let obj = {
                type: 'company_users',
                data: [
                    {
                        userEmail: email,
                    },
                ]
            }
            mongoRef.MongoDbCrudOpration(companyId, obj, "findOne").then((resp)=>{
                if (resp == null) {
                    let companyUserData = {
                        companyId: companyId,
                        userId: userId,
                        isDelete: false,
                        roleType: role,
                        status: 1,
                        userEmail: email,
                        designation: designation,
                        linkId: token,
                        sendInvitationTime: new Date(),
                    }
                    let objSchema = {
                        type: "company_users",
                        data: companyUserData
                    }
                    mongoRef.MongoDbCrudOpration(companyId, objSchema, "save")
                    .then((re) => {
                        if(userId === "") {
                            let link = `${config.WEBURL}/#/signup?companyId=${companyId}-${re._id}`;
                            sendMailFunction(require("../../Template/sendEmailInvitation")(link, companyName));
                        } else {
                            let link = `${config.WEBURL}/#/verify-invitation?id=${btoa(`userId=${userId}&companyId=${companyId}&docId=${re._id}&linkId=${token}`)})}`;
                            sendMailFunction(require("../../Template/sendEmailInvitation")(link, companyName));
                        }
                    }).catch((error) => {
                        res.send({status: false, statusText: error});
                    })
                } else {
                    // let alreadyIn = querySnapshot.docs.filter((userDoc) => userDoc.data().status === 2 && userDoc.data().userId === userId && !userDoc.data().isDelete);
                    if (resp.status === 2 && !resp.isDelete) {
                        res.send({
                            status: false,
                            statusText: 'User is already in the company.'
                        })
                        return;
                    }
                    let obj = {
                        type: 'company_users',
                        data: [
                            {
                                userEmail: email,
                            },
                            {
                                $set: {
                                    status: 1,
                                    linkId: token,
                                    roleType: role,
                                    designation: designation,
                                    isDelete: false,
                                    sendInvitationTime: new Date(),
                                }
                            }
                        ]
                    }
                    mongoRef.MongoDbCrudOpration(companyId, obj, "findOneAndUpdate").then((resp)=>{
                        if(userId === "") {
                            let link = `${config.WEBURL}/#/signup?companyId=${companyId}-${resp._id}`;
                            sendMailFunction(require("../../Template/sendEmailInvitation")(link, companyName));
                        } else {
                            let link = `${config.WEBURL}/#/verify-invitation?id=${btoa(`userId=${userId}&companyId=${companyId}&docId=${resp._id}&linkId=${token}`)})}`;
                            sendMailFunction(require("../../Template/sendEmailInvitation")(link, companyName));
                        }
                    }).catch((error)=>{
                        res.send({status: false, statusText: error});
                    })
                }
            }).catch((error)=>{
                res.send({
                    status: false,
                    statusText: error
                })
            })
        }


        let obj = {
            type: SCHEMA_TYPE.USERS,
            data: [
                {
                    Employee_Email: email,
                    isActive: true,
                },
            ]
        }
        mongoRef.MongoDbCrudOpration('global', obj, "findOne").then((response)=>{
            if (response !== null) {
                let temp = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                let token = '';
                for ( let i = 0; i < 8; i++ ) {
                    token += temp.charAt(Math.floor(Math.random() * temp.length));
                }

                let userId = response._id;
                sendCheckRequest(email, userId, token)
            } else {
                sendCheckRequest(email, "", "")
            }
        }).catch((error)=>{
            res.send({
                status: false,
                statusText: error
            })
        })
    } catch (error) {
        res.send({
            status: false,
            statusText: error
        })
        exports.decreaseUserCount(req.body.companyId);
    }
}

/**
 * Check Invitation
 * @param {Objcet} req
 * @param {Object} res
 * @returns
 */
exports.checkSendInviatation = (req,res) => {
    try {
        if (!(req.body && req.body.email)) {
            res.send({ status: false, statusText: 'email is required' });
            return;
        }
        if (!(req.body && req.body.companyId)) {
            res.send({ status: false, statusText: 'companyId is required' });
            return;
        } 
        let obj = {
            type: 'company_users',
            data: [
                {
                    userEmail: req.body.email,
                },
            ]
        }
        mongoRef.MongoDbCrudOpration(req.body.companyId, obj, "findOne").then((resp)=>{
            if (resp === null) {
                res.send({
                    status: true,
                    statusText: 'All Okay',
                    furtherProceed: true
                })
            } else {
                if (resp.status === 2 && !resp.isDelete) {
                    res.send({
                        status: true,
                        statusText: 'User is already in the company.',
                        furtherProceed: false
                    })
                    return;
                } else {
                    res.send({
                        status: true,
                        statusText: 'You have already sent an invitation. Please resend invitation from members list.',
                        furtherProceed: false
                    })
                    return;
                }
            }
        }).catch((error)=>{
            res.send({
                status: false,
                statusText: error
            });
        })       
    } catch (error) {
        res.send({
            status: false,
            statusText: error
        });
    }
}

exports.decreaseUserCount = (companyId) => {
    try {
        let updateObj = {
            type:SCHEMA_TYPE.COMPANIES,
            data: [
                { _id : new mongoose.Types.ObjectId(companyId)},
                {$inc: {
                    'companyData.$[elementIndex].users': -1,
                }},
                {
                    arrayFilters: [{ 'elementIndex.users': { $exists: true } }],
                    upsert: true
                }
            ]
        }
        mongoRef.MongoDbCrudOpration('global', updateObj, "updateOne").catch((error) => {
            console.error(error,"error in USER COUNT DECREMENT:");
        })
    } catch (error) {
        console.error(error,"ERROR IN DECREASE COUNT FUNCTION:");
    }
}