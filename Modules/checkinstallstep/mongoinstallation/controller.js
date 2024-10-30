const fs = require('fs');
const axios = require('axios');
const { emitListener } = require("../eventController.js");
const mainCtr = require("../controller.js");
const installStepsFilePath = __dirname + "/../../../installationSteps.json";
const serviceFun = require("../../serviceFunction.js");
const logger = require('../../../Config/loggerConfig.js');
const mongoclusterCtr = require("./mongocluster.js");
const mongonetworkCtr = require("./mongonetwork.js");
const mongouserCtr = require("./mongouser.js");


exports.envVar = mainCtr.envVar;
setTimeout(() => {
    exports.installSteps = mainCtr.installSteps;
}, 5000)



/**
 * Check Mongo Auth Connection
 * @param {Object} cb 
 */
exports.checkMongoAuthConnection = (req, cb) => {
    try {
        if (!req.body.publicKey) {
            cb({
                status: false,
                statusText: "PublicKey is Required",
                error: "PublicKey is Required"
            });
            return;
        }
        if (!req.body.privateKey) {
            cb({
                status: false,
                statusText: "PrivateKey is Required",
                error: "PrivateKey is Required"
            });
            return;
        }
        if (!req.body.projectId) {
            cb({
                status: false,
                statusText: "ProjectId is Required",
                error: "ProjectId is Required"
            });
            return;
        }

        let data = JSON.stringify({
            "username": req.body.publicKey,
            "apiKey": req.body.privateKey
        });

        let config1 = {
            method: 'post',
            url: process.env.REALM_API_URL+'/api/admin/v3.0/auth/providers/mongodb-cloud/login',
            headers: { 
                'Content-Type': 'application/json'
            },
            data : data
        };
        
        axios.request(config1)
        .then((response) => {
            logger.info(`Check Mongo Auth Connection Res ${JSON.stringify(response?.data)}`);
            exports.envVar.MONGODB_PROJECT_PUBLIC_API_KEY = req.body.publicKey;
            exports.envVar.MONGODB_PROJECT_PRIVATE_API_KEY = req.body.privateKey;
            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                if (response.data.access_token) {
                    exports.envVar.MONGODB_ACCESS_TOKEN = response.data.access_token;
                    let config2 = {
                        method: 'get',
                        url: process.env.REALM_API_URL+`/api/admin/v3.0/groups/${req.body.projectId}/apps`,
                        headers: { 
                            'Authorization': 'Bearer '+ response.data.access_token
                        }
                    };
                        
                    axios.request(config2)
                    .then(() => {
                        exports.envVar.MONGODB_PROJECT_ID = req.body.projectId;
                        serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                            cb({
                                status: true,
                                statusText: "MongoDB Connected",
                                step: 1
                            });
                        });
                    })
                    .catch((error) => {
                        logger.error(`Please check your mongodb project id ${JSON.stringify(error)}`);
                        cb({
                            status: false,
                            error: "Please check your mongodb project id",
                            step: 1
                        });
                    });
                    return;
                }
                logger.error(`Please check your mongodb project public and private key`);
                cb({
                    status: false,
                    error: "Please check your mongodb project public and private key",
                    step: 1
                });
            });
        })
        .catch((error) => {
            logger.error(`Please check your mongodb project public and private key ${JSON.stringify(error)}`);
            cb({
                status: false,
                error: "Please check your mongodb project public and private key",
                step: 1
            });
        });
    } catch (error) {
        console.error('Check Mongo Auth Connection Error 2: ', error.message);
        logger.error(`checkMongoAuthConnection Function Error 3 ${JSON.stringify(error)}`);
        cb({
            status: false,
            error: error.message,
            step: 1
        });
    }
};


/**
 * Set MongoDB URL String
 * @param {Object} req 
 * @param {Object} cb 
 * @returns 
 */
exports.setMongoDBURLString = (req, cb) => {
    try {
        const bodyData = req.body;
        if (bodyData.status) {
            let standardSrv = "mongodb+srv://cluster0.rdkrvuv.mongodb.net";
            if (bodyData?.clusterData?.connectionStrings?.standardSrv) {
                standardSrv = bodyData?.clusterData?.connectionStrings?.standardSrv;
                const standardSrvArray = standardSrv.split("//");

                if (standardSrvArray.length === 2) {
                    exports.envVar.MONGOSTRFIRST = standardSrvArray[0] + "//";
                    exports.envVar.MONGOSTRSECOND = standardSrvArray[1]
                } else {
                    exports.envVar.MONGOSTRFIRST = standardSrvArray[0] + "//";
                    delete standardSrvArray[0];
                    exports.envVar.MONGOSTRSECOND = standardSrvArray.join("");
                }
            }
            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                cb(bodyData);
            });
            return;
        }
        cb(bodyData);
    } catch (error) {
        console.error('Set MongoDB URL String Error 2: ', error.message);
        logger.error(`Set MongoDB URL String  Function Error 3 ${JSON.stringify(error)}`);
        cb({
            status: false,
            error: error.message,
            step: 2
        });
    }
};


/**
 * Add New Cluster
 * @param {Object} req 
 * @param {Object} cb 
 */
exports.addNewCluster = (req, cb) => {
    try {
        const bodyData = req.body;
        const passObject = {
            ...bodyData,
            publicKey: exports.envVar.MONGODB_PROJECT_PUBLIC_API_KEY,
            privateKey: exports.envVar.MONGODB_PROJECT_PRIVATE_API_KEY,
            projectId: exports.envVar.MONGODB_PROJECT_ID
        };
        mongoclusterCtr.addnewcluster(passObject, (clusterRes) => {
            logger.info(`Add New Cluster Res ${JSON.stringify(clusterRes)}`);
            if (!clusterRes.status) {
                cb(clusterRes)
                return;
            }
            const strObj = {
                body: {
                    status: true,
                    clusterData: clusterRes.data
                }
            }
            exports.setMongoDBURLString(strObj, (strRes) => {
                cb(strRes);
            })
        })
    } catch (error) {
        console.error('Add New Cluster Error 2: ', error.message);
        logger.error(`Add New Cluster Function Error 3 ${JSON.stringify(error)}`);
        cb({
            status: false,
            error: error.message,
            step: 2
        });
    }
};


/**
 * Mongo Login
 * @param {Object} cb 
 */
exports.mongoLogin = (cb) => {
    let data = JSON.stringify({
        "username": exports.envVar.MONGODB_PROJECT_PUBLIC_API_KEY,
        "apiKey": exports.envVar.MONGODB_PROJECT_PRIVATE_API_KEY
    });

    let config1 = {
        method: 'post',
        url: process.env.REALM_API_URL+'/api/admin/v3.0/auth/providers/mongodb-cloud/login',
        headers: { 
            'Content-Type': 'application/json'
        },
        data : data
    };
    
    axios.request(config1)
    .then((response) => {
        logger.info(`Mongo Login Res ${JSON.stringify(response?.data)}`);
        if (response.data.access_token) {
            exports.envVar.MONGODB_ACCESS_TOKEN = response.data.access_token;
            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                cb({
                    status: true,
                    statusText: "MongoDB Connected",
                    step: 1
                });
            });
            return;
        }
        logger.error(`Please check your mongodb project public and private key`);
        cb({
            status: false,
            error: "Please check your mongodb project public and private key",
            step: 1
        });
    })
    .catch((error) => {
        logger.error(`Please check your mongodb project public and private key ${JSON.stringify(error)}`);
        cb({
            status: false,
            error: "Please check your mongodb project public and private key",
            step: 1
        });
    });
};


/**
 * Create App Service
 * @param {Object} req 
 * @param {Object} cb 
 */
exports.createAppService = (req, cb) => {
    try {
        let data = JSON.stringify({
            "name": req.body.appservicename,
            "template_id": "react-native.todo.flex",
            "data_source": {
                "name": "mongodb-atlas",
                "type": "mongodb-atlas",
                "config": {
                    "clusterName": exports.envVar.MONGODB_CLUSTER_NAME
                }
            }
        });

        let config = {
            method: 'post',
            url: `${process.env.REALM_API_URL}/api/admin/v3.0/groups/${exports.envVar.MONGODB_PROJECT_ID}/apps`,
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${exports.envVar.MONGODB_ACCESS_TOKEN}`
            },
            data : data
        };

        axios.request(config).then((response) => {
            logger.info(`Create App Service Res ${JSON.stringify(response?.data)}`);
            exports.envVar.MONGODB_APP_ID = response?.data?._id || "";
            if (response?.data?.client_app_id) {
                exports.envVar.MONGO_APP_ID = response.data.client_app_id;
                exports.envVar.MONGODB_PROJECT_SERVICENAME = "mongodb-atlas";
                serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                    cb({
                        status: true,
                        statusText: "App Service Created",
                        step: 5
                    });
                });
                return;
            }
            cb({
                status: false,
                error: "App Service is not create. Please try again"
            })
        }).catch((error) => {
            if (error?.response?.data?.error === "unauthorized" || error?.response?.data?.error_code === "InvalidSession") {
                exports.mongoLogin((mongoLRes) => {
                    if (mongoLRes.status) {
                        exports.createAppService(req, (resData) => {
                            cb(resData);
                        });
                        return;
                    }
                    cb({
                        status: false,
                        error: error?.response?.data?.error || "Something went to wrong"
                    });
                });
                return;
            }
            logger.error(`Create App Service Function Error 1 ${JSON.stringify(error?.response?.data)}`);
            cb({
                status: false,
                error: error?.response?.data?.error || "Something went to wrong"
            });
        });
    } catch (error) {
        console.error('Create App Service Error: ', error.message);
        logger.error(`Create App Service Function Error 2 ${JSON.stringify(error)}`);
        cb({
            status: false,
            error: error.message,
            step: 5
        });
    }
};


/**
 * Update Auth Provider
 * @param {Object} cb 
 */
exports.updateAuthProvider = (cb) => {
    try {
        let data = JSON.stringify({
            "name": "local-userpass",
            "type": "local-userpass",
            "disabled": false,
            "config": {
              "autoConfirm": true,
              "resetFunctionId": exports.envVar.MONGODB_FUNCTION_ID,
              "resetFunctionName": exports.envVar.MONGODB_FUNCTION_NAME,
              "runConfirmationFunction": false,
              "runResetFunction": true
            }
        });
        let config = {
            method: 'patch',
            url: `${process.env.REALM_API_URL}/api/admin/v3.0/groups/${exports.envVar.MONGODB_PROJECT_ID}/apps/${exports.envVar.MONGODB_APP_ID}/auth_providers/${exports.envVar.MONGODB_AUTH_PROVIDER_EMAI_PASS_ID}`,
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${exports.envVar.MONGODB_ACCESS_TOKEN}`
            },
            data : data
        };

        axios.request(config).then((response) => {
            console.log("Update Auth Provider Res", response?.status)
            logger.info(`Update Auth Provider Res ${JSON.stringify(response?.data)}, == ${response?.status}`);
            if (response.status === 204) {
                cb({
                    status: true,
                    statusText: "Mongo Function Created",
                    data: JSON.parse(data),
                    step: 6
                });
                return;
            }
            exports.updateAuthProvider((resData) => {
                cb(resData);
            });
        }).catch((error) => {
            if (error?.response?.data?.error === "unauthorized" || error?.response?.data?.error_code === "InvalidSession") {
                exports.mongoLogin((mongoLRes) => {
                    if (mongoLRes.status) {
                        exports.updateAuthProvider((resData) => {
                            cb(resData);
                        });
                        return;
                    }
                    cb({
                        status: false,
                        error: error?.response?.data?.error || "Something went to wrong"
                    });
                });
                return;
            }
            logger.error(`Update Auth Provider error?.response?.data ${error?.response?.data}`);
            cb({
                status: false,
                error: error?.response?.data?.error || "Something went to wrong"
            });
        });
    } catch (error) {
        console.error('Update Auth Provider Error: ', error.message);
        logger.error(`Update Auth Provider Function Error ${JSON.stringify(error)}`);
        cb({
            status: false,
            error: error.message,
            step: 6
        });
    }
};


/**
 * Get Auth Provider
 * @param {Object} cb 
 */
exports.getAuthProvider = (cb) => {
    try {
        let config = {
            method: 'get',
            url: `${process.env.REALM_API_URL}/api/admin/v3.0/groups/${exports.envVar.MONGODB_PROJECT_ID}/apps/${exports.envVar.MONGODB_APP_ID}/auth_providers`,
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${exports.envVar.MONGODB_ACCESS_TOKEN}`
            }
        };

        axios.request(config).then((response) => {
            logger.info(`Get Auth Provider Res ${JSON.stringify(response?.data)}`);
            if (response?.data?.length) {
                const emailPassAuth = response.data.find((x) => x.type === "local-userpass");
                if (emailPassAuth?._id) {
                    exports.envVar.MONGODB_AUTH_PROVIDER_EMAI_PASS_ID = emailPassAuth._id;
                    serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                        cb({
                            status: true,
                            statusText: "Mongo Function Created",
                            data: emailPassAuth,
                            step: 6
                        });
                    });
                    return;
                }
                cb({
                    status: false,
                    error: "Reset Password function is not add. Please contact to administrator"
                });
                return;
            }
            cb({
                status: false,
                error: "Reset Password function is not add. Please contact to administrator"
            });
        }).catch((error) => {
            if (error?.response?.data?.error === "unauthorized" || error?.response?.data?.error_code === "InvalidSession") {
                exports.mongoLogin((mongoLRes) => {
                    if (mongoLRes.status) {
                        exports.getAuthProvider((resData) => {
                            cb(resData);
                        });
                        return;
                    }
                    cb({
                        status: false,
                        error: error?.response?.data?.error || "Something went to wrong"
                    });
                });
                return;
            }
            logger.error(`Get Auth Provider error?.response?.data ${error?.response?.data}`);
            cb({
                status: false,
                error: error?.response?.data?.error || "Something went to wrong"
            });
        });
    } catch (error) {
        console.error('Get Auth Provider Error: ', error.message);
        logger.error(`Get Auth Provider Function Error ${JSON.stringify(error)}`);
        cb({
            status: false,
            error: error.message,
            step: 6
        });
    }
};


/**
 * Add Mongo Function
 * @param {Object} req 
 * @param {Object} cb 
 */
exports.addMongoFunction = (req, cb) => {
    try {
        const funName = "alianresetpassword"+new Date().getTime();
        let data = JSON.stringify({
            "name": funName,
            "source": `exports = async ({ token, tokenId, username, password, currentPasswordValid }) => {\n    try {\n        let obj = {\n            token: token,\n            tokenId: tokenId,\n            email: username\n        };\n        await context.http.post({\n            url: \"${process.env.APIURL}api/v2/sendForgotPasswordEmail\",\n            body: obj,\n            encodeBodyAsJSON: true\n        })\n        return { status: 'pending' };\n    } catch(error) {\n        console.log(error);\n        return error;\n    }\n}`
        });

        let config = {
            method: 'post',
            url: `${process.env.REALM_API_URL}/api/admin/v3.0/groups/${exports.envVar.MONGODB_PROJECT_ID}/apps/${exports.envVar.MONGODB_APP_ID}/functions`,
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${exports.envVar.MONGODB_ACCESS_TOKEN}`
            },
            data : data
        };

        axios.request(config).then((response) => {
            logger.info(`Add Mongo Function Res ${JSON.stringify(response?.data)}`);
            if (response?.data?._id) {
                exports.envVar.MONGODB_FUNCTION_NAME = funName;
                exports.envVar.MONGODB_FUNCTION_ID = response?.data?._id || "";
                serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                    exports.getAuthProvider((gapRes) => {
                        if (gapRes.status) {
                            exports.updateAuthProvider((uapRes) => {
                                cb(uapRes);
                            });
                            return;
                        }
                        cb(gapRes);
                    });
                });
                return;
            }
            cb({
                status: true,
                statusText: "Mongo Function Created",
                data: response.data,
                step: 6
            });
        }).catch((error) => {
            if (error?.response?.data?.error === "unauthorized" || error?.response?.data?.error_code === "InvalidSession") {
                exports.mongoLogin((mongoLRes) => {
                    if (mongoLRes.status) {
                        exports.addMongoFunction(req, (resData) => {
                            cb(resData);
                        });
                        return;
                    }
                    cb({
                        status: false,
                        error: error?.response?.data?.error || "Something went to wrong"
                    });
                });
                return;
            }
            if (error?.response?.data?.error_code === "FunctionDuplicateName") {
                cb({
                    status: true,
                    data: JSON.parse(data)
                });
                return;
            }
            logger.error(`Add Mongo Function Error 1 ${error?.response?.data}`);
            cb({
                status: false,
                error: error?.response?.data?.error || "Something went to wrong"
            });
        });
    } catch (error) {
        console.error('Add Mongo Function Error: 2', error.message);
        logger.error(`Add Mongo Function Function Error 2 ${JSON.stringify(error)}`);
        cb({
            status: false,
            error: error.message,
            step: 5
        });
    }
};


/**
 * Add Default User Mongo
 * @param {Object} req 
 * @param {Object} cb 
 */
exports.addDefaultUserMongo = (req, cb) => {
    try {
        let data = JSON.stringify({
            "email": req.body.useremail,
            "password": req.body.userpassword
        });

        let config = {
            method: 'post',
            url: `${process.env.REALM_API_URL}/api/admin/v3.0/groups/${exports.envVar.MONGODB_PROJECT_ID}/apps/${exports.envVar.MONGODB_APP_ID}/users`,
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${exports.envVar.MONGODB_ACCESS_TOKEN}`
            },
            data : data
        };

        axios.request(config).then((response) => {
            logger.info(`Add Defult User In Mongo Res ${JSON.stringify(response?.data)}`);
            if (response?.data?._id) {
                exports.envVar.ADMIN_USER_EMAIL_REALM = req.body.useremail;
                exports.envVar.ADMIN_USER_PASSWORD_REALM = req.body.userpassword;
                serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                    cb({
                        status: true,
                        statusText: "Default User Mongo Added",
                        data: response.data,
                        step: 7
                    });
                });
                return;
            }
            cb({
                status: true,
                statusText: "Default User Mongo Added",
                data: response.data,
                step: 7
            });
        }).catch((error) => {
            if (error?.response?.data?.error === "unauthorized" || error?.response?.data?.error_code === "InvalidSession") {
                exports.mongoLogin((mongoLRes) => {
                    if (mongoLRes.status) {
                        exports.addDefaultUserMongo(req, (resData) => {
                            cb(resData);
                        });
                        return;
                    }
                    cb({
                        status: false,
                        error: error?.response?.data?.error || "Something went to wrong"
                    });
                });
                return;
            }
            logger.error(`Add Default User Error 1 ${error?.response?.data}`);
            cb({
                status: false,
                error: error?.response?.data?.error || "Something went to wrong"
            });
        });
    } catch (error) {
        console.error('Add Default User Error: ', error.message);
        logger.error(`Add Default User Function Error 2 ${JSON.stringify(error)}`);
        cb({
            status: false,
            error: error.message,
            step: 7
        });
    }
};


/**
 * Send Step Res
 * @param {Object} res 
 * @param {Number} number 
 * @param {String} eventId 
 * @param {Object} data 
 * @param {String} key 
 */
exports.sendStepRes = (res, number, eventId, data, key, isLastStepMongo) => {
    if (key === "done") {
        exports.installSteps[1].subStep[number].status = "done";
        if (isLastStepMongo) {
            exports.installSteps[1].status = "done";
            delete exports.envVar.MONGODB_ACCESS_TOKEN;
            delete exports.envVar.MONGODB_CLUSTER_NAME;
            delete exports.envVar.MONGODB_FUNCTION_NAME;
            delete exports.envVar.MONGODB_FUNCTION_ID;
            delete exports.envVar.MONGODB_AUTH_PROVIDER_EMAI_PASS_ID;
        }
        serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
            setTimeout(() => {
                emitListener(eventId, {step: 1});
            }, 3000);
            setTimeout(() => {
                emitListener(eventId, {step: "STOP"});
                res.json({...data, envVar: exports.envVar});
            }, 5000);
        });
    }

    if (key === "error") {
        exports.installSteps[1].subStep[number].status = "error";
        serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
            setTimeout(() => {
                emitListener(eventId, {step: "STOP", error: data.error || "Something went wrong; please contact the administrator"});
                res.json({...data});
            }, 3000)
        });
    }
};


/**
 * Check Install Step
 * @param {Object} req 
 * @param {Object} res 
 */
exports.checkinstallmongostep = (req, res) => {
    const bodyData = req.body;
    console.log("bodyData", bodyData);
    try {
        if (bodyData.step === 1) {
            exports.installSteps[1].subStep[0].status = "inprogress";
            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                exports.checkMongoAuthConnection(req, (tokenRes) => {
                    if (tokenRes.status) {
                        exports.sendStepRes(res, 0, bodyData?.eventId, tokenRes, "done");
                        return;
                    }
                    exports.sendStepRes(res, 0, bodyData?.eventId, tokenRes, "error");
                });
            });
        }

        if (bodyData.step === 2) {
            exports.installSteps[1].subStep[1].status = "inprogress";
            exports.envVar.MONGODB_CLUSTER_NAME = bodyData.clusterName;
            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                if (bodyData.key === "old") {
                    exports.setMongoDBURLString(req, (setStringRes) => {
                        if (setStringRes.status) {
                            exports.sendStepRes(res, 1, bodyData?.eventId, bodyData, "done");
                            return;
                        }
                        exports.sendStepRes(res, 1, bodyData?.eventId, bodyData, "error");
                    });
                }
                if (bodyData.key === "new") {
                    exports.addNewCluster(req, (setStringRes) => {
                        if (setStringRes.status) {
                            exports.sendStepRes(res, 1, bodyData?.eventId, setStringRes, "done");
                            return;
                        }
                        exports.sendStepRes(res, 1, bodyData?.eventId, setStringRes, "error");
                    });
                }
            });
        }

        if (bodyData.step === 3) {
            exports.installSteps[1].subStep[2].status = "inprogress";
            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                if (!bodyData.status) {
                    exports.sendStepRes(res, 2, bodyData?.eventId, {...bodyData, error: "MongoDb Network Access Error; please contact the administrator"}, "error");
                    return;    
                }
                exports.sendStepRes(res, 2, bodyData?.eventId, bodyData, "done");
            });
        }

        if (bodyData.step === 4) {
            exports.installSteps[1].subStep[3].status = "inprogress";
            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                const passObject = {
                    ...req.body,
                    publicKey: exports.envVar.MONGODB_PROJECT_PUBLIC_API_KEY,
                    privateKey: exports.envVar.MONGODB_PROJECT_PRIVATE_API_KEY,
                    projectId: exports.envVar.MONGODB_PROJECT_ID
                };
                mongouserCtr.useradd(passObject, (useraddRes) => {
                    if (useraddRes.status) {
                        exports.envVar.MONGODB_URL = `${exports.envVar.MONGOSTRFIRST}${passObject.username}:${passObject.userpassword}@${exports.envVar.MONGOSTRSECOND}`
                        delete exports.envVar.MONGOSTRFIRST;
                        delete exports.envVar.MONGOSTRSECOND;
                        exports.sendStepRes(res, 3, bodyData?.eventId, useraddRes, "done");
                        return;
                    }
                    exports.sendStepRes(res, 3, bodyData?.eventId, useraddRes, "error");
                });
            });
        }
        if (bodyData.step === 5) {
            exports.installSteps[1].subStep[4].status = "inprogress";
            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                exports.createAppService(req, (appServiceRes) => {
                    if (appServiceRes.status) {
                        exports.sendStepRes(res, 4, bodyData?.eventId, appServiceRes, "done");
                        return;
                    }
                    exports.sendStepRes(res, 4, bodyData?.eventId, appServiceRes, "error");
                });
            });
        }

        if (bodyData.step === 6) {
            exports.installSteps[1].subStep[5].status = "inprogress";
            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                exports.addMongoFunction(req, (addFunRes) => {
                    if (addFunRes.status) {
                        exports.sendStepRes(res, 5, bodyData?.eventId, addFunRes, "done");
                        return;
                    }
                    exports.sendStepRes(res, 5, bodyData?.eventId, addFunRes, "error");
                });
            });
        }

        if (bodyData.step === 7) {
            exports.installSteps[1].subStep[6].status = "inprogress";
            serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
                exports.addDefaultUserMongo(req, (addFunRes) => {
                    if (addFunRes.status) {
                        exports.sendStepRes(res, 6, bodyData?.eventId, addFunRes, "done", true);
                        return;
                    }
                    exports.sendStepRes(res, 6, bodyData?.eventId, addFunRes, "error");
                });
            });
        }
    } catch (error) {
        logger.error(`installation step Function Error ${JSON.stringify(error)}`);
        exports.installSteps[1].subStep[bodyData.step-1].status = "error";
        serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
            res.json({
                status: false,
                error: error
            });
        });
    }
};


/**
 * Mongo cluster get
 * @param {Object} req 
 * @param {Object} res 
 */
exports.mongoclusterget = (req, res) => {
    try {
        const data = {
            publicKey: exports.envVar.MONGODB_PROJECT_PUBLIC_API_KEY,
            privateKey: exports.envVar.MONGODB_PROJECT_PRIVATE_API_KEY,
            projectId: exports.envVar.MONGODB_PROJECT_ID
        }
        mongoclusterCtr.mongoclusterget(data, (resData) => {
            res.json(resData);
        })
    } catch (error) {
        logger.error(`Get mongo cluster Function Error ${JSON.stringify(error)}`);
        exports.installSteps[1].subStep[1].status = "error";
        serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
            res.json({
                status: false,
                error: error
            });
        });
    }
};


/**
 * Mongo cluster regions get
 * @param {Object} req 
 * @param {Object} res 
 */
exports.mongoclusterregionsget = (req, res) => {
    try {
        const data = {
            publicKey: exports.envVar.MONGODB_PROJECT_PUBLIC_API_KEY,
            privateKey: exports.envVar.MONGODB_PROJECT_PRIVATE_API_KEY,
            projectId: exports.envVar.MONGODB_PROJECT_ID
        }
        mongoclusterCtr.mongoclusterregionsget(data, (resData) => {
            res.json(resData);
        })
    } catch (error) {
        logger.error(`Get mongo cluster Regions Function Error ${JSON.stringify(error)}`);
        exports.installSteps[1].subStep[1].status = "error";
        serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
            res.json({
                status: false,
                error: error
            });
        });
    }
};


/**
 * Mongo network get and add
 * @param {Object} req 
 * @param {Object} res 
 */
exports.mongonetworkgetandadd = (req, res) => {
    try {
        const data = {
            publicKey: exports.envVar.MONGODB_PROJECT_PUBLIC_API_KEY,
            privateKey: exports.envVar.MONGODB_PROJECT_PRIVATE_API_KEY,
            projectId: exports.envVar.MONGODB_PROJECT_ID
        }
        mongonetworkCtr.mongonetworkgetandadd(data, (resData) => {
            res.json(resData);
        })
    } catch (error) {
        logger.error(`Get And Add mongo network Function Error ${JSON.stringify(error)}`);
        exports.installSteps[1].subStep[2].status = "error";
        serviceFun.writeFile(installStepsFilePath, JSON.stringify({installSteps: exports.installSteps, envVar: exports.envVar}, null, 4), () => {
            res.json({
                status: false,
                error: error
            });
        });
    }
};
