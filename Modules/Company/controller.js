// IMPORTANT NOTE: 

// IF YOU HAVE CHANGES IN THIS FILE, PLEASE VERIFY THE CHANGES BECAUSE THIS FILE IS CONNECTED TO THE PAYMENT MODULE.
// AND YOUR CHANGES ARE REQUIRED. ALSO ADD YOUR CHANGES TO THE 'CHARGEBEE-SETUP' AND 'PADDLE-SETUP' FOLDER.

// const AWS = require('aws-sdk');
const wasabiRef = require("../wasabi/controller.js");
const { SCHEMA_TYPE } = require("../../Config/schemaType.js");
const { MongoDbCrudOpration } = require("../../utils/mongo-handler/mongoQueries.js");
const iCtr = require('../import_settings/controller.js');
const helperCtr = require('../auth/controller/helper.js');
// 
const { addAndRemoveUserInMongodbNotificationCount } = require("../auth/controller.js");
const logger = require('../../Config/loggerConfig.js');
const { default: mongoose } = require("mongoose");
const { emitListener } = require("./eventController.js");
const serviceCtr = require("../service.js");
const serviceFunctionCtr = require("../serviceFunction.js");
const config =  require('../../Config/config.js');
const { dbCollections } = require("../../Config/firebaseCollections.js");
const defaultSubscriptionDataRef = require("./defaultSubscriptionData.js")
 

/**
 * createCompanyDataWasabiFun
 * @param {Object} bodyData 
 * @param {String} companyId 
 * @returns 
 */
exports.createCompanyDataWasabiFun = (bodyData, companyId) => {
    return new Promise((resolve, reject) => {
        try {
            if (bodyData && bodyData.file && bodyData.fileName) {
                wasabiRef.createCompanyDataWasabi(companyId, bodyData.fileName ,bodyData.file).then(()=>{
                    logger.info(`${companyId} >> WASABI CREATED`);
                    resolve({
                        status: true,
                        statusText: `${companyId} >> WASABI CREATED`
                    });
                }).catch((error)=>{
                    reject({
                        status: false,
                        error: error
                    });
                })
            } else {
                wasabiRef.createCompanyDataWasabi(companyId,{},"").then(()=>{
                    logger.info(`${companyId} >> WASABI CREATED`);
                    resolve({
                        status: true,
                        statusText: `${companyId} >> WASABI CREATED`
                    });
                }).catch((error)=> {
                    reject({
                        status: false,
                        error: error
                    });
                })
            }
        } catch (error) {
            reject({
                status: false,
                error: error
            });
        }
    })
};

// 


/**
 * addAndRemoveUserInMongodbNotificationCountFun
 * @param {String} companyId 
 * @param {String} userId 
 * @returns 
 */
exports.addAndRemoveUserInMongodbNotificationCountFun = (companyId, userId) => {
    return new Promise((resolve, reject) => {
        try {
            addAndRemoveUserInMongodbNotificationCount(companyId,userId,"Add")
            .then(() => {
                logger.info(`${companyId} >> USER ADDED FOR COUNTING DOC`);
                resolve({
                    status: true,
                    statusText: `${companyId} >> USER ADDED FOR COUNTING DOC`
                });
            })
            .catch((error)=>{
                logger.error(`ERROR in create user count doc In mongodb: ${error}`)
                reject({
                    status: false,
                    error: error,
                    statusText: `ERROR in create user count doc In mongodb: ${error}`
                });
            })
        } catch (error) {
            reject({
                status: false,
                error: error
            });
        }
    })
};


/**
 * createCompanyGlobalFun
 * @param {Object} dataObj 
 * @returns 
 */
exports.createCompanyGlobalFun = (dataObj) => {
    return new Promise((resolve, reject) => {
        try {
            MongoDbCrudOpration('global', dataObj, "save")
            .then(() => {
                logger.info(`${JSON.stringify(dataObj.data._id)} >> COMPANY ADDED FOR GLOBAL DATABASE`);
                resolve({
                    status: true,
                    statusText: `${JSON.stringify(dataObj.data._id)} >> COMPANY ADDED FOR GLOBAL DATABASE`
                });
            })
            .catch((error)=>{
                logger.error(`ERROR in COMPANY ADDED FOR GLOBAL DATABASE: ${error}`)
                reject({
                    status: false,
                    error: error,
                    statusText: `ERROR in COMPANY ADDED FOR GLOBAL DATABASE: ${error}`
                });
            })
        } catch (error) {
            reject({
                status: false,
                error: error
            });
        }
    })
};


/**
 * importSettingsFun
 * @param {Object} axiosData 
 * @returns 
 */
exports.importSettingsFun = (axiosData) => {
    return new Promise((resolve, reject) => {
        try {
            axiosData.isFromBackend = true;
            iCtr.importSettingsFunction({body: axiosData}, (result) => {
                if(result.status) {
                    logger.info(`${axiosData.companyId} >> ADD SETTINGS SUCCESS`);
                    resolve({
                        status: true,
                        statusText: `${axiosData.companyId} >> ADD SETTINGS SUCCESS`
                    });
                } else {
                    logger.info(`${axiosData.companyId} >> ADD SETTINGS FAILED`);
                    reject({
                        status: false,
                        error: error,
                        statusText: `${axiosData.companyId} >> ADD SETTINGS FAILED`
                    });
                }
            });
        } catch (error) {
            reject({
                status: false,
                error: error
            });
        }
    })
};


/**
 * importSettingsFun V2
 * @param {Object} axiosData 
 * @returns 
 */
exports.importSettingsV2Fun = (axiosData) => {
    return new Promise((resolve, reject) => {
        try {
            iCtr.importSettingsV2Function({body: axiosData}, (result) => {
                if(result.status) {
                    logger.info(`${axiosData.companyId} >> ADD SETTINGS SUCCESS`);
                    resolve({
                        status: true,
                        statusText: `${axiosData.companyId} >> ADD SETTINGS SUCCESS`
                    });
                } else {
                    logger.info(`${axiosData.companyId} >> ADD SETTINGS FAILED`);
                    reject({
                        status: false,
                        error: result?.statusText || "ERROR in add settings",
                        statusText: `${axiosData.companyId} >> ADD SETTINGS FAILED`
                    });
                }
            });
        } catch (error) {
            reject({
                status: false,
                error: error
            });
        }
    })
};


/**
 * updateCompnayIdInUserFun
 * @param {Object} userUpdateObj 
 * @param {String} companyId 
 * @returns 
 */
exports.updateCompnayIdInUserFun = (userUpdateObj, companyId) => {
    return new Promise((resolve, reject) => {
        try {
            MongoDbCrudOpration(SCHEMA_TYPE.GOLBAL,userUpdateObj,'findOneAndUpdate').then(() => {
                logger.info(`${companyId} >> UPDATE COMAPNY ID IN USER SUCCESS`);
                resolve({
                    status: true,
                    statusText: `${companyId} >> UPDATE COMAPNY ID IN USER SUCCESS`
                });
            }).catch((error)=>{
                logger.info(`${companyId} >> UPDATE COMAPNY ID IN USER FAILED`);
                reject({
                    status: false,
                    error: error,
                    statusText: `${companyId} >> UPDATE COMAPNY ID IN USER FAILED`
                });
            })
        } catch (error) {
            reject({
                status: false,
                error: error
            });
        }
    })
};


/**
 * Create a new Company and Create Wasabi bucket, policy and user for that company.
 * @param {Objcet} req
 * @param {Object} res
 * @returns
 */
exports.createCompany = (req,res) => {
    try {
        if (!(req.body && req.body.userId)) {
            res.send({
                status: false,
                statusText: "userId is required"
            })
            return;
        }
        if (!(req.body && req.body.email)) {
            res.send({
                status: false,
                statusText: "user email is required"
            })
            return;
        }
        if (!(req.body && req.body.companyName)) {
            res.send({
                status: false,
                statusText: "companyName is required"
            })
            return;
        }
        if (!(req.body && req.body.phoneNumber)) {
            res.send({
                status: false,
                statusText: "phoneNumber is required"
            })
            return;
        }
        if (!(req.body && req.body.country)) {
            res.send({
                status: false,
                statusText: "country is required"
            })
            return;
        }
        if (!(req.body && req.body.city)) {
            res.send({
                status: false,
                statusText: "city is required"
            })
            return;
        }
        if (!(req.body && req.body.state)) {
            res.send({
                status: false,
                statusText: "state is required"
            })
            return;
        }
        if (!(req.body && req.body.countryCodeObj)) {
            res.send({
                status: false,
                statusText: "countryCodeObj is required"
            })
            return;
        }
        if (!(req.body && req.body.logtimeDays)) {
            res.send({
                status: false,
                statusText: "logtimeDays is required"
            })
            return;
        }
        if (!req.body && req.body.totalProjects !== undefined) {
            res.send({
                status: false,
                statusText: "totalProjects is required"
            })
            return;
        }
        if (!req.body || req.body.isInactive === undefined) {
            res.send({
                status: false,
                statusText: "isInactive is required"
            })
            return;
        }
        if (!req.body || req.body.isFree === undefined) {
            res.send({
                status: false,
                statusText: "isFree is required"
            })
            return;
        }
        if (!(req.body && req.body.subscriptionData)) {
            res.send({
                status: false,
                statusText: "subscriptionData is required"
            })
            return;
        }
        if (!(req.body && req.body.totalData)) {
            res.send({
                status: false,
                statusText: "totalData is required"
            })
            return;
        }

        if (req.body && req.body.file) {
            if (!(req.body && req.body.fileName)) {
                res.send({
                    status: false,
                    statusText: "fileName is required"
                })
                return;
            }
        }
        emitListener(req.body?.eventId, {step: 1});
        const companyMongoId = new mongoose.Types.ObjectId();
        const companyId = JSON.parse(JSON.stringify(companyMongoId));
        let obj = {
            userId: req.body.userId,
            Cst_CompanyName:  req.body.companyName,
            Cst_Phone:  req.body.phoneNumber,
            Cst_Country: req.body.country,
            Cst_City: req.body.city,
            Cst_State: req.body.state,
            Cst_DialCode: req.body.countryCodeObj,
            Cst_LogTimeDays: req.body.logtimeDays,
            totalProjects: req.body.totalProjects,
            isInactive: req.body.isInactive,
            isFree: req.body.isFree,
            subscriptionData: req.body.subscriptionData,
            totalData :req.body.totalData,
            _id: companyMongoId
        }

        const dataObj = {
            type : SCHEMA_TYPE.COMPANIES,
            data: obj
        }
        const axiosData = {
            "companyId": companyId,
            "uid": req.body.userId,
            "email": req.body.email,
        };
        let userUpdateObj = {
            type: SCHEMA_TYPE.USERS,
            data: [
                { _id: req.body.userId },
                { $push: { AssignCompany: companyId } },
                false, // Upsert
            ]
        }
        const allProcess = [
            exports.createCompanyDataWasabiFun(req.body, companyId), // Create a new Bucket from Company Id
            // 
            exports.addAndRemoveUserInMongodbNotificationCountFun(companyId, req.body.userId), // addAndRemoveUserInMongodbNotificationCount
            exports.createCompanyGlobalFun(dataObj), // Create Company in Global Database
            exports.importSettingsFun(axiosData), // Import Settings
        ];

        Promise.allSettled(allProcess).then(async() => {
            await exports.updateCompnayIdInUserFun(userUpdateObj, companyId) // ADD COMPANY ID IN USER DOCUMENT AFTER THE PROCESS COMPLETE
            res.send({
                status: true,
                statusText: "Company created successfully",
                companyId: companyId
            });

            emitListener(req.body?.eventId, {step: 2});
            // Final Process
            setTimeout(() => {
                console.log("ADDING SNAPS");
                helperCtr.addSnapShotPermissionInCollecation(companyId)
                .then(() => {
                    emitListener(req.body?.eventId, {step: "STOP"});
                    setTimeout(() => {
                        helperCtr.addSnapShotPermissionInCollecation(companyId, "after")
                        .then(() => {
                            logger.info(`${companyId} >> ADD After Snap PERMISSIONS`);
                        })
                        .catch((error) => {
                            logger.error(`ERROR in add after snapshot: ${error.message}`);
                        });
                    }, 5000)
                    logger.info(`${companyId} >> ADD SNAP PERMISSIONS`);
                }).catch((error) => {
                    logger.info(`${companyId} >> ADD SNAP ERROR ${error?.message || error}`);
                    emitListener(req.body?.eventId, {step: "STOP", error: error?.message || error});
                })
            });
            // res.json({
            //     status: true,
            //     statusText: "Company created successfully",
            //     companyId: companyId
            // });
        }).catch((error) => {
            console.log("error", error);
            emitListener(req.body?.eventId, {step: "STOP", error: error?.message || error});
            res.json({
                status: false,
                statusText: "Error" + error?.message
            });
        });
    } catch (error) {
        emitListener(req.body?.eventId, {step: "STOP", error: error?.message || error});
        res.send({
            status: false,
            statusText: `Error: ${error}`
        })
    }
}


/**
 * Company Validation
 * @param {Object} bodyData 
 * @param {Object} cb 
 * @returns 
 */
exports.companyValidation = (bodyData, cb) => {
    try {
        if (!(bodyData && bodyData.userId)) {
            cb({
                status: false,
                statusText: "userId is required"
            })
            return;
        }
        if (!(bodyData && bodyData.email)) {
            cb({
                status: false,
                statusText: "user email is required"
            })
            return;
        }
        if (!(bodyData && bodyData.companyName)) {
            cb({
                status: false,
                statusText: "companyName is required"
            })
            return;
        }
        if (!(bodyData && bodyData.phoneNumber)) {
            cb({
                status: false,
                statusText: "phoneNumber is required"
            })
            return;
        }
        if (!(bodyData && bodyData.country)) {
            cb({
                status: false,
                statusText: "country is required"
            })
            return;
        }
        if (!(bodyData && bodyData.city)) {
            cb({
                status: false,
                statusText: "city is required"
            })
            return;
        }
        if (!(bodyData && bodyData.state)) {
            cb({
                status: false,
                statusText: "state is required"
            })
            return;
        }
        if (!(bodyData && bodyData.countryCodeObj)) {
            cb({
                status: false,
                statusText: "countryCodeObj is required"
            })
            return;
        }
        if (!(bodyData && bodyData.logtimeDays)) {
            cb({
                status: false,
                statusText: "logtimeDays is required"
            })
            return;
        }
        if (!bodyData && bodyData.totalProjects !== undefined) {
            cb({
                status: false,
                statusText: "totalProjects is required"
            })
            return;
        }
        if (!bodyData || bodyData.isInactive === undefined) {
            cb({
                status: false,
                statusText: "isInactive is required"
            })
            return;
        }
        if (!bodyData || bodyData.isFree === undefined) {
            cb({
                status: false,
                statusText: "isFree is required"
            })
            return;
        }
        if (!(bodyData && bodyData.subscriptionData)) {
            cb({
                status: false,
                statusText: "subscriptionData is required"
            })
            return;
        }
        if (!(bodyData && bodyData.totalData)) {
            cb({
                status: false,
                statusText: "totalData is required"
            })
            return;
        }
        if (bodyData && bodyData.file) {
            if (!(bodyData && bodyData.fileName)) {
                cb({
                    status: false,
                    statusText: "fileName is required"
                })
                return;
            }
        }
        cb({
            status: true
        });
    } catch (error) {
        cb({
            status: false,
            statusText: "Something went to wrong."
        });
    }
};

exports.companyValidationFromAdmin = (bodyData, cb) => {
    try {
        if (!(bodyData && bodyData.email)) {
            cb({
                status: false,
                statusText: "user email is required"
            })
            return;
        }
        if (!(bodyData && bodyData.companyName)) {
            cb({
                status: false,
                statusText: "companyName is required"
            })
            return;
        }
        if (!(bodyData && bodyData.phoneNumber)) {
            cb({
                status: false,
                statusText: "phoneNumber is required"
            })
            return;
        }
        if (!(bodyData && bodyData.country)) {
            cb({
                status: false,
                statusText: "country is required"
            })
            return;
        }
        if (!(bodyData && bodyData.city)) {
            cb({
                status: false,
                statusText: "city is required"
            })
            return;
        }
        if (!(bodyData && bodyData.state)) {
            cb({
                status: false,
                statusText: "state is required"
            })
            return;
        }
        if (!(bodyData && bodyData.countryCodeObj)) {
            cb({
                status: false,
                statusText: "countryCodeObj is required"
            })
            return;
        }
        if (!(bodyData && bodyData.logtimeDays)) {
            cb({
                status: false,
                statusText: "logtimeDays is required"
            })
            return;
        }
        if (!bodyData && bodyData.totalProjects !== undefined) {
            cb({
                status: false,
                statusText: "totalProjects is required"
            })
            return;
        }
        if (!bodyData || bodyData.isInactive === undefined) {
            cb({
                status: false,
                statusText: "isInactive is required"
            })
            return;
        }
        if (!bodyData || bodyData.isFree === undefined) {
            cb({
                status: false,
                statusText: "isFree is required"
            })
            return;
        }
        if (!(bodyData && bodyData.subscriptionData)) {
            cb({
                status: false,
                statusText: "subscriptionData is required"
            })
            return;
        }
        if (!(bodyData && bodyData.totalData)) {
            cb({
                status: false,
                statusText: "totalData is required"
            })
            return;
        }
        if (bodyData && bodyData.file) {
            if (!(bodyData && bodyData.fileName)) {
                cb({
                    status: false,
                    statusText: "fileName is required"
                })
                return;
            }
        }
        cb({
            status: true
        });
    } catch (error) {
        cb({
            status: false,
            statusText: "Something went to wrong."
        });
    }
};


/**
 * Create Company V2
 * @param {Object} req 
 * @param {Object} res 
 */
exports.createCompanyV2 = (req, res) => {
    try {
        exports.companyValidation(req.body, (validation) => {
            if (!validation.status) {
                res.json(validation);
                return
            }
            const bodyData = req.body;
            let obj = {
                type: SCHEMA_TYPE.PRECOMPANIES,
                data: [{
                    isAvailable: true,
                    pickupCount: 0
                },
                {
                    isAvailable: false,
                    $inc: {
                        pickupCount: 1
                    }
                }]
            }
            MongoDbCrudOpration(SCHEMA_TYPE.GOLBAL, obj, 'findOneAndUpdate')
            .then((compnayData) => {
                if (!(compnayData && compnayData._id)) {
                    logger.error(`Predefine comapny not found.`);
                    res.json({
                        status: false,
                        statusText: "Predefine comapny not found."
                    })
                    return;
                }
    
                emitListener(bodyData?.eventId, {step: 1});
                const companyMongoId = compnayData._id;
                const companyId = JSON.parse(JSON.stringify(compnayData._id));
        
                const companyObj = {
                    type : SCHEMA_TYPE.COMPANIES,
                    data: {
                        userId: bodyData.userId,
                        Cst_CompanyName:  bodyData.companyName,
                        Cst_Phone:  bodyData.phoneNumber,
                        Cst_Country: bodyData.country,
                        Cst_City: bodyData.city,
                        Cst_State: bodyData.state,
                        Cst_DialCode: bodyData.countryCodeObj,
                        Cst_LogTimeDays: bodyData.logtimeDays,
                        totalProjects: bodyData.totalProjects,
                        isInactive: bodyData.isInactive,
                        isFree: bodyData.isFree,
                        subscriptionData: bodyData.subscriptionData,
                        totalData :bodyData.totalData,
                        _id: companyMongoId,
                        companyData: [{users:1}]
                    }
                }
                if (config.CANYONLICENSETYPE === "Regular License") {
                    companyObj.data.planFeature = defaultSubscriptionDataRef.planObj;
                }
                const importSettingsData = {
                    "companyId": companyId,
                    "uid": bodyData.userId,
                    "email": bodyData.email,
                };
                let userUpdateObj = {
                    type: SCHEMA_TYPE.USERS,
                    data: [
                        { _id: bodyData.userId },
                        { $push: { AssignCompany: companyId } },
                        false, // Upsert
                    ]
                }
                const allProcess = [                    
                    // exports.createCompanyDataWasabiFun(req.body, companyId), // Create a new Bucket from Company Id
                    // 
                    () => exports.addAndRemoveUserInMongodbNotificationCountFun(companyId, bodyData.userId), // addAndRemoveUserInMongodbNotificationCount
                    () => exports.createCompanyGlobalFun(companyObj), // Create Company in Global Database
                    () => exports.importSettingsV2Fun(importSettingsData), // Import Settings
                    () => exports.updateCompnayIdInUserFun(userUpdateObj, companyId) // ADD COMPANY ID IN USER DOCUMENT AFTER THE PROCESS COMPLETE
                ];
                serviceFunctionCtr.allSettledWithRetry(3, allProcess)
                .then((allSettledRes) => {
                    emitListener(bodyData?.eventId, {step: "STOP"});
                    
                    res.send({
                        status: true,
                        statusText: "Company created successfully",
                        companyId: companyId
                    });
                    
                    const rejectedPromise = allSettledRes.filter((x) => x.status === "rejected") || [];
                    logger.info(`${companyId} Company Creation rejectedPromise: ${rejectedPromise}`);
                    // Send Error Mail
                    if (rejectedPromise && rejectedPromise.length) {
                        const subject = "AlianHub - Company Creation - Error Report";
                        const toMail = config.ERRORRECIVEREMAIL;
                        let html = "<p>Dear Developer,</p>";
                        html += "<h3>Error Details:</h3>";
                        html += "<ul>";
                        html += `<li><strong>Date/Time:</strong> ${new Date()}</li>`;
                        html += `<li><strong>Company Id:</strong> ${companyId}</li>`;
                        html += `<li><strong>Error Message/Code:</strong> ${JSON.stringify(rejectedPromise, null, 4)}</li>`;
                        html += `<li><strong>Environment:</strong> ${config.NODE_ENV}</li>`;
                        html += `<li><strong>Browser/Device Information:</strong> ${req?.headers["user-agent"] || "Unknown"}</li>`;
                        html += `</ul>`
                        serviceCtr.sendAttachMail(subject, html, toMail, null, () => {
                            logger.info(`Company Creation Error Email Send Successfully (${companyId}).`);
                        });
                    };
                }).catch((error) => {
                    logger.error(`Company Creation Error All allSettledWithRetry (${companyId}) Error: ${error}.`);
                    emitListener(bodyData?.eventId, {step: "STOP", error: error?.message || error});
                    res.json({
                        status: false,
                        statusText: "Error" + error?.message
                    });
                });
                // res.json({
                //     bodyData: bodyData,
                //     compnayData: compnayData
                // });
            }).catch((error) => {
                logger.error(`ERROR in get tmp company data: ${error?.message || error}`);
                emitListener(bodyData?.eventId, {step: "STOP", error: error?.message || error});
                res.json({
                    status: false,
                    statusText: "Something went to wrong. Please contact to Admin.",
                    error: error?.message || error
                });
            })
        });
    } catch (error) {
        logger.error(`ERROR in create compnay v2 function: ${error?.message || error}`);
        res.json({
            status: false,
            statusText: "Something went to wrong. Please contact to Admin.",
            error: error?.message || error
        });
    }
};

// 

exports.deleteCompany = (req, res) => {
    try {
        if (!(req.body && req.body.companyId)) {
            res.send({
                status: false,
                statusText: "CompanyId is required"
            })
            return;
        }
        mongoose.connect(process.env.MONGODB_URL+"/"+req.body.companyId);
        const connection = mongoose.connection;
        connection.once('open', () => {
            console.log("MongoDB database connection established successfully "+ req.body.companyId);
        });
        mongoose.connection.dropDatabase().then(() => {
            try {
                mongoose.connection.close();
                let delObj = {
                    type: SCHEMA_TYPE.COMPANIES,
                    data: [
                        {
                            _id: new mongoose.Types.ObjectId(req.body.companyId)
                        }
                    ]
                }
                MongoDbCrudOpration('global', delObj, "deleteOne").then(() => {
                    let findObj = {
                        type: dbCollections.USERS,
                        data: [
                            {'AssignCompany': { $in: [req.body.companyId]}},
                            {
                                $pull: { 'AssignCompany': req.body.companyId }
                            }
                        ]
                    };

                    MongoDbCrudOpration('global', findObj, "updateMany").then(() => {
                        res.send({ status: true, statusText: "Done"});
                    }).catch((error) => {
                        res.send({ status: false, statusText: error});
                        console.error(error,"errorerror");
                    });
                })
            } catch (err) {
                res.send({ status: false, statusText: error});
                console.error(err,"ERROR IN CLOSE CONNECTION");
            }
        }).catch((error) => {
            res.send({ status: false, statusText: error});
            console.error(error,"ERROR IN DROP DATABASE");
        });
    } catch (error) {
        res.send({ status: false, statusText: error});
        console.error(error,"ERROR IN DELETE COMPANY:");
    }
}

exports.createCompanyFromAdmin = (req, res) => {
    try {
        exports.companyValidationFromAdmin(req.body.bodyData, (validation) => {
            if (!validation.status) {
                res.json(validation);
                return
            }
            const { bodyData, isUserExist } = req.body;
            let obj = {
                type: SCHEMA_TYPE.PRECOMPANIES,
                data: [{
                    isAvailable: true,
                    pickupCount: 0
                },
                {
                    isAvailable: false,
                    $inc: {
                        pickupCount: 1
                    }
                }]
            }
            MongoDbCrudOpration(SCHEMA_TYPE.GOLBAL, obj, 'findOneAndUpdate')
            .then((compnayData) => {
                if (!(compnayData && compnayData._id)) {
                    logger.error(`Predefine comapny not found.`);
                    res.json({
                        status: false,
                        statusText: "Predefine comapny not found."
                    })
                    return;
                }
    
                emitListener(bodyData?.eventId, {step: 1});
                const companyMongoId = compnayData._id;
                const companyId = JSON.parse(JSON.stringify(compnayData._id));
        
                const companyObj = {
                    type : SCHEMA_TYPE.COMPANIES,
                    data: {
                        userId: bodyData.userId,
                        Cst_CompanyName:  bodyData.companyName,
                        Cst_Phone:  bodyData.phoneNumber,
                        Cst_Country: bodyData.country,
                        Cst_City: bodyData.city,
                        Cst_State: bodyData.state,
                        Cst_DialCode: bodyData.countryCodeObj,
                        Cst_LogTimeDays: bodyData.logtimeDays,
                        totalProjects: bodyData.totalProjects,
                        isInactive: bodyData.isInactive,
                        isFree: bodyData.isFree,
                        subscriptionData: bodyData.subscriptionData,
                        totalData :bodyData.totalData,
                        _id: companyMongoId,
                    }
                }
                if(isUserExist){
                    companyObj.data.companyData = [{users:1}]
                }
                if (config.CANYONLICENSETYPE === "Regular License") {
                    companyObj.data.planFeature = defaultSubscriptionDataRef.planObj;
                }
                const importSettingsData = {
                    "companyId": companyId,
                    "uid": bodyData.userId,
                    "email": bodyData.email,
                };
                let userUpdateObj = {
                    type: SCHEMA_TYPE.USERS,
                    data: [
                        { _id: bodyData.userId },
                        { $push: { AssignCompany: companyId } },
                        false, // Upsert
                    ]
                }
                let allProcess = [
                    // exports.createCompanyDataWasabiFun(req.body, companyId), // Create a new Bucket from Company Id
                    // 
                    () => exports.createCompanyGlobalFun(companyObj), // Create Company in Global Database
                    () => exports.updateCompnayIdInUserFun(userUpdateObj, companyId) // ADD COMPANY ID IN USER DOCUMENT AFTER THE PROCESS COMPLETE
                ];
                if(isUserExist){
                    let array = [
                        () => exports.importSettingsV2Fun(importSettingsData), // Import Settings
                        // 
                        () => exports.addAndRemoveUserInMongodbNotificationCountFun(companyId, bodyData.userId)
                    ]
                    allProcess = [...allProcess, ...array]
                }
                serviceFunctionCtr.allSettledWithRetry(3, allProcess)
                .then((allSettledRes) => {
                    emitListener(bodyData?.eventId, {step: "STOP"});
                    
                    res.send({
                        status: true,
                        statusText: "Company created successfully",
                        companyId: companyId
                    });
                    
                    const rejectedPromise = allSettledRes.filter((x) => x.status === "rejected") || [];
                    logger.info(`${companyId} Company Creation rejectedPromise: ${rejectedPromise}`);
                    // Send Error Mail
                    if (rejectedPromise && rejectedPromise.length) {
                        const subject = "AlianHub - Company Creation - Error Report";
                        const toMail = config.ERRORRECIVEREMAIL;
                        let html = "<p>Dear Developer,</p>";
                        html += "<h3>Error Details:</h3>";
                        html += "<ul>";
                        html += `<li><strong>Date/Time:</strong> ${new Date()}</li>`;
                        html += `<li><strong>Company Id:</strong> ${companyId}</li>`;
                        html += `<li><strong>Error Message/Code:</strong> ${JSON.stringify(rejectedPromise, null, 4)}</li>`;
                        html += `<li><strong>Environment:</strong> ${config.NODE_ENV}</li>`;
                        html += `<li><strong>Browser/Device Information:</strong> ${req?.headers["user-agent"] || "Unknown"}</li>`;
                        html += `</ul>`
                        serviceCtr.sendAttachMail(subject, html, toMail, null, () => {
                            logger.info(`Company Creation Error Email Send Successfully (${companyId}).`);
                        });
                    };
                }).catch((error) => {
                    logger.error(`Company Creation Error All allSettledWithRetry (${companyId}) Error: ${error}.`);
                    emitListener(bodyData?.eventId, {step: "STOP", error: error?.message || error});
                    res.json({
                        status: false,
                        statusText: "Error" + error?.message
                    });
                });
                // res.json({
                //     bodyData: bodyData,
                //     compnayData: compnayData
                // });
            }).catch((error) => {
                logger.error(`ERROR in get tmp company data: ${error?.message || error}`);
                emitListener(bodyData?.eventId, {step: "STOP", error: error?.message || error});
                res.json({
                    status: false,
                    statusText: "Something went to wrong. Please contact to Admin.",
                    error: error?.message || error
                });
            })
        });
    } catch (error) {
        logger.error(`ERROR in create compnay v2 function: ${error?.message || error}`);
        res.json({
            status: false,
            statusText: "Something went to wrong. Please contact to Admin.",
            error: error?.message || error
        });
    }
};
