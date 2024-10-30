// IMPORTANT NOTE: 

// IF YOU HAVE CHANGES IN THIS FILE, PLEASE VERIFY THE CHANGES BECAUSE THIS FILE IS CONNECTED TO THE PAYMENT MODULE.
// AND YOUR CHANGES ARE REQUIRED. ALSO ADD YOUR CHANGES TO THE 'CHARGEBEE-SETUP' AND 'PADDLE-SETUP' FOLDER.

const helperRef = require('./helper')
const config = require("../../../Config/config");
const logger = require("../../../Config/loggerConfig");
const axios = require('axios');
const mongoRef = require('../../../utils/mongo-handler/mongoQueries');
const sendMailRef = require("./sendVerificationMail")
const {generateJWTToken} = require('../../../Config/jwt');
const { dbCollections } = require('../../../Config/firebaseCollections');
// 
exports.authenticateToken = "";
/**
 * Create A new User In Realm
 * @param {String} Email - CompanyId in which file is need to upload
 * @param {String} Password - Path where file is uploaded in Wasabi
 * @returns {Promise<String>} A Promise that resolves with the data of new user.
 *                            Rejects with an error message if any issues occur during the process.
 */
exports.createUserRealm = (email,password , token = exports.authenticateToken) => {
    return new Promise((resolve, reject) => {
        try {
            const data = {
                email: email,
                password: password
            };
            axios.post(`${config.REALM_API_URL}/api/admin/v3.0/groups/${config.MONGODB_PROJECT_ID}/apps/${config.MONGODB_APP_ID}/users`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + token
            }
            })
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    })
}

exports.removeAllAuthUsers = () => {
    return new Promise((resolve, reject) => {
        try {
            helperRef.getAuthenticationToken().then((token)=> {
                axios.get(`${config.REALM_API_URL}/api/admin/v3.0/groups/${config.MONGODB_PROJECT_ID}/apps/${config.MONGODB_APP_ID}/users`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': 'Bearer ' + token
                    }
                })
                .then(response => {
                    const users = response?.data?.map((x) => x._id);
                    console.log("users: ", users.length);
                    if(users.length && users.length >= 50) {
                        exports.removeAllAuthUsers();
                    }
                    users.forEach((id) => {
                        axios.delete(`${config.REALM_API_URL}/api/admin/v3.0/groups/${config.MONGODB_PROJECT_ID}/apps/${config.MONGODB_APP_ID}/users/${id}`, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'Authorization': 'Bearer ' + token
                            }
                        })
                        .then(response => {
                            resolve(response);
                        })
                        .catch(error => {
                            reject(error);
                        });
                    })
                    resolve(response);
                })
                .catch(error => {
                    console.log("ERRR1: ", error);
                    reject(error);
                });
            })
            .catch(error => {
                console.log("ERRR2: ", error);
                reject(error);
            });
        } catch (error) {
            console.log("ERRR: ", error);
            reject(error);
        }
    })
}

/**
 * Create A new User In Realm
 * @param {Object} Req - Req object of user create
 * @param {Object} Response - Response object of user create from realm
 * @returns {Promise<String>} A Promise that resolves with object in which status true meanse process complete.
 *                            Rejects with an error message if any issues occur during the process.
 */
exports.addUserMongodb = (req,relamD) => {
    return new Promise((resolve, reject) => {
        try {
            let obj = {
                _id: relamD.data._id,
                AssignCompany: req.assignCompany ? [req.assignCompany] : [],
                Employee_FName:  req.firstName,
                Employee_LName:  req.lastName,
                Employee_Email: req.email,
                Employee_Name:  req.firstName +' '+ req.lastName,
                Time_Format: "12",
                isDeleted: false,
                isActive: true,
                isOnline: false,
                isEmailVerified: req.isInvitation,
            }
            if (req.isProductOwner) {
                obj.isProductOwner = req.isProductOwner;
            }
            let object = {
                type: 'users',
                data: obj
            }
            try {
                mongoRef.MongoDbCrudOpration('global',object,'save').then((res)=>{
                    resolve({status: true, statusText: res})
                }).catch((error)=>{
                    reject(error)
                })
            } catch (error) {
                reject(error)
            }
        } catch (error) {
            reject(error);
        }
    })
}

/**
 * Create User API
 * @param {Objcet} req
 * @param {Object} res
 * @returns
 */
exports.createUser = (req,res) => {
    try {
        if (!(req.body && req.body.firstName)) {
            res.send({
                status: false,
                statusText: `First Name is required`
            })
        }
        if (!(req.body && req.body.lastName)) {
            res.send({
                status: false,
                statusText: `Last Name is required`
            })
        }
        if (!(req.body && req.body.email)) {
            res.send({
                status: false,
                statusText: `Email is required`
            })
        }
        if (!(req.body && req.body.password)) {
            res.send({
                status: false,
                statusText: `Password is required`
            })
        }
        // CALL VALIDATE LICENCE FUNCTION HERE...............
        exports.createUserRealm(req.body.email, req.body.password).then((response)=>{
            exports.addUserMongodb(req.body,response).then((respo)=>{
                if (!req.body.isInvitation) {
                    sendMailRef.sendVerificationEmailPromise(respo.statusText._id,respo.statusText.Employee_Email).catch((error)=>{
                        logger.error(error.statusText);
                    })
                }
                // 
                res.send(respo);
            }).catch((error)=>{
                res.send({
                    status: false,
                    statusText: error
                })
            })
        }).catch((error)=>{
            if (error.response.status == 401) {
                helperRef.getAuthenticationToken().then((token)=> {
                    exports.authenticateToken = token;
                    exports.createUserRealm(req.body.email, req.body.password).then((response)=>{
                        exports.addUserMongodb(req.body,response).then((respo)=>{
                            if (!req.body.isInvitation) {
                                sendMailRef.sendVerificationEmailPromise(respo.statusText._id,respo.statusText.Employee_Email).catch((error)=>{
                                    logger.error(error.statusText);
                                })
                            }
                            // 
                            res.send(respo);
                        }).catch((error)=>{
                            res.send({
                                status: false,
                                statusText: error
                            })
                        })
                    }).catch((error)=>{
                        res.send({
                            status: false,
                            statusText: error
                        })
                    })
                }).catch((error)=>{
                    res.send({
                        status: false,
                        statusText: error
                    })    
                })
            } else {
                res.send({
                    status: false,
                    statusText: error
                })
            }
        })
    } catch (error) {
        res.send({
            status: false,
            statusText: `Error: ${error}`
        })
    }
}

/**
 * Generate JWT Token Function
 * @param {Object} req 
 * @param {Object} res 
 */
exports.generateToken = async (req, res) => {
    try {

        if (!(req.body && req.body.uid)) {
            res.status(400).json({
                status: false,
                statusText: "The user id is required."
            });
            return;
        }

        const {uid} = req.body;
        let object = {
            type: 'users',
            data: [
                {
                    _id: uid
                }
            ]
        }
        mongoRef.MongoDbCrudOpration('global', object, "findOne").then(async (response) => {
            const companyIds = response.AssignCompany && response.AssignCompany.length ? response.AssignCompany : [];
            const token = await generateJWTToken({uid: uid, companyIds: companyIds});
            res.json({
                status: true,
                statusText: "Jwt token generate successfully.",
                token: token
            });
        }).catch((error) => {
            logger.error(`Generate Jwt Token Error: ${error}`);
            res.status(400).json({
                status: false, 
                error,
                statusText: 'User not found.',
            });
        })
    } catch (error) {
        logger.error(`Generate Jwt Token Error: ${error}`);
        res.status(400).json({
            status: false,
            statusText: "Authentication failed!"
        });
    }
};
// exports.generateJWTToken()


exports.verifyToken = (req, res) => {
    res.json({
        status: true,
        key: 1
    });
};