const axios = require('axios');
const config = require('../../../Config/config');
const serviceCtr = require('../../service');
const logger = require('../../../Config/loggerConfig');


/**
 * Get Authentication Token
 * @returns 
 */
exports.getAuthenticationToken = () => {
    return new Promise((resolve, reject) => {
        try {
            let tokenErrorCount = 0;
            const generateToken = () => {
                if (tokenErrorCount >= 3) {
                    reject("Get Authentication Token");
                    return;
                }
                const data = {
                    username: config.MONGODB_PROJECT_PUBLIC_API_KEY,
                    apiKey: config.MONGODB_PROJECT_PRIVATE_API_KEY
                };
                axios.post(`${config.REALM_API_URL}/api/admin/v3.0/auth/providers/mongodb-cloud/login`, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
                })
                .then(response => {
                    // exports.authenticateToken = response.data.access_token;
                    if (response?.data?.access_token) {
                        resolve(response.data.access_token);
                        return;
                    }
                    tokenErrorCount += 1;
                    generateToken();
                })
                .catch(error => {
                    tokenErrorCount += 1;
                    if(tokenErrorCount >= 3) {
                        logger.error(`ERROR in generate access token SNAP: ${error?.message}`);
                    }
                    generateToken();
                });
            };
            generateToken();
        } catch (error) {
            reject(error);
        }
    });
};



/**
 * Get Realm Services
 * @param {String} authToken 
 * @returns 
 */
exports.getRealmServices = (authToken) => {
    return new Promise((resolve, reject) => {
        try {
            let serviceErrorCount = 0;
            const getServiceId = () => {
                if (serviceErrorCount >= 3) {
                    reject("Get Authentication Token");
                    return;
                }
                let reqObj = {
                    method: "get",
                    url: `${config.REALM_API_URL}/api/admin/v3.0/groups/${config.MONGODB_PROJECT_ID}/apps/${config.MONGODB_APP_ID}/services`,
                    headers: {
                        "Authorization": `Bearer ${authToken}`
                    }
                }
                axios.request(reqObj)
                .then((response) => {
                    if (response?.data) {
                        resolve(response.data);
                        return;
                    }
                    serviceErrorCount += 1;
                    getServiceId();
                })
                .catch((error) => {
                    serviceErrorCount += 1;
                    if(serviceErrorCount >= 3) {
                        logger.error(`ERROR in get serviceId SNAP: ${error?.message}`);
                    }
                    getServiceId();
                });
            };
            getServiceId();
        } catch (error) {
            reject(error);
        }
    })
};


/**
 * Get Rules
 * @param {String} authToken 
 * @param {String} serviceId 
 * @returns 
 */
exports.getRules = (authToken, serviceId) => {
    return new Promise((resolve, reject) => {
        try {
            const url = `${config.REALM_API_URL}/api/admin/v3.0/groups/${config.MONGODB_PROJECT_ID}/apps/${config.MONGODB_APP_ID}/services/${serviceId}/default_rule`;
            let reqObj = {
                method: "get",
                url: url,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                },
            }
            axios.request(reqObj)
            .then((response) => {
                if (response?.data?._id) {
                    resolve(response.data);
                } else {
                    reject({});
                }
            })
            .catch((error) => {
                if (error?.response?.data?.error === "default rule already exists") {
                    reject({});
                    return;   
                }
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    })
}


/**
 * Update Rules
 * @param {String} authToken 
 * @param {String} serviceId 
 * @returns 
 */
exports.updateRules = (authToken, serviceId) => {
    return new Promise((resolve, reject) => {
        try {
            exports.getRules(authToken, serviceId).then((getRulesData) => {
                let data = {
                    "roles": [
                      {
                        "name": "readAndWriteAll",
                        "apply_when": {},
                        "document_filters": {
                          "write": true,
                          "read": true
                        },
                        "read": true,
                        "write": true,
                        "insert": true,
                        "delete": true,
                        "search": true
                      }
                    ],
                    _id: getRulesData._id
                };
                const url = `${config.REALM_API_URL}/api/admin/v3.0/groups/${config.MONGODB_PROJECT_ID}/apps/${config.MONGODB_APP_ID}/services/${serviceId}/default_rule`;
                let reqObj = {
                    method: "put",
                    url: url,
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${authToken}`
                    },
                    data: JSON.stringify(data)
                }
                axios.request(reqObj)
                .then((response) => {
                  resolve(response.data);
                })
                .catch((error) => {
                    if (error?.response?.data?.error === "default rule already exists") {
                        reject({});
                        return;   
                    }
                    reject(error);
                });
            }).catch((error) => {
                reject(error);
            })
        } catch (error) {
            reject(error);
        }
    });
}


/**
 * Set Realm Rules
 * @param {String} authToken 
 * @param {String} serviceId 
 * @param {String} databaseName 
 * @param {String} collectionName 
 * @returns 
 */
exports.setRealmRules = (authToken, serviceId, databaseName, collectionName) => {
    return new Promise((resolve, reject) => {
        try {
            let data = {
                "database": databaseName,
                "collection": collectionName,
                "roles": [
                  {
                    "name": "readAndWriteAll",
                    "apply_when": {},
                    "document_filters": {
                      "write": true,
                      "read": true
                    },
                    "read": true,
                    "write": true,
                    "insert": true,
                    "delete": true,
                    "search": true
                  }
                ]
            };
            let url = `${config.REALM_API_URL}/api/admin/v3.0/groups/${config.MONGODB_PROJECT_ID}/apps/${config.MONGODB_APP_ID}/services/${serviceId}/rules`;
            if (collectionName === "mongo_default") {
                delete data.database;
                delete data.collection;
                url = `${config.REALM_API_URL}/api/admin/v3.0/groups/${config.MONGODB_PROJECT_ID}/apps/${config.MONGODB_APP_ID}/services/${serviceId}/default_rule`
            }
            let reqObj = {
                method: "post",
                url: url,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                },
                data: JSON.stringify(data)
            }
            axios.request(reqObj)
            .then((response) => {
              resolve(response.data);
            })
            .catch((error) => {
                if (collectionName === "mongo_default" && error?.response?.data?.error === "default rule already exists") {
                    exports.updateRules(authToken, serviceId).then((fData) => {
                        resolve(fData);
                    }).catch(() => {
                        reject(error);
                    })
                    // resolve({});
                    return;   
                }
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    })
};

async function batchUpdate(arr, token, serviceId, databaseName) {
    return new Promise((resolve, reject) => {
        try {
            // tasks BATCH FUNCTION
            let count = 0;
            let batch = 1;
            const perBatch = 1;
            const next = () => {
                batch++;
                loopFun();
            }

            let results = []
            const loopFun = () => {
                console.log("TOTAL: ", count, "/", arr.length, "==", ((count * 100) / arr.length).toFixed(2));
                if(count >= arr.length) {
                    resolve(results)
                    console.log("END");
                    return;
                } else {
                    try {
                        let promises = [];
                        const startIndex = count;
                        const endIndex = count + perBatch;
                        count = endIndex;

                        for (let i = startIndex; i < endIndex; i++) {
                            const data = arr[i]

                            if(data) {
                                promises.push(new Promise((resolve2, reject2) => {
                                    try {
                                        exports.setRealmRules(token, serviceId, databaseName, data).then((res) => {
                                            console.log("RULE SET: ", res);
                                            setTimeout(() => {
                                                resolve2({
                                                    status: true,
                                                    dbName: data,
                                                    data: res
                                                })
                                            }, 1000);
                                        }).catch((error) => {
                                            console.log("RULE SET ERROR: ", data, error.message);
                                            reject2({
                                                status: false,
                                                dbName: data,
                                                error: error
                                            })
                                        })
                                    } catch (error) {
                                        reject2({
                                            status: false,
                                            dbName: data,
                                            error: error
                                        })
                                    }
                                }))
                            }
                        }

                        Promise.allSettled(promises)
                        .then((result) => {
                            result.filter((x) => x.status === "rejected").forEach((x) => {
                                console.log(`UPDATE failed for: ${x.value}`)
                            })
                            results = [...results, ...result]
                            setTimeout(() => {
                                next();
                            }, 200);
                        })
                        .catch((error) => {
                            console.log(`UPDATE failed batch: ${batch} > ${error.message}`);
                            next();
                        })
                    } catch (e) {
                        console.error(`UPDATE failed batch: ${batch}`)
                    }
                }
            }
            loopFun()
        } catch (error) {
            reject(error)
        }
    })
}


/**
 * Add SnapShot Permission In Collecation
 * @param {String} databaseName 
 * @returns 
 */
exports.addSnapShotPermissionInCollecation = (databaseName, key, rulesArray = []) => {
    return new Promise((resolve, reject) => {
        try {
            if (!databaseName) {
                reject({error: "database is required"})
                return;
            }
            exports.getAuthenticationToken()
            .then((token) => {
                exports.getRealmServices(token).then((data) => {
                    if (data && data.length) {
                        let collectionArray = [];
                        if (key === "after") {
                            collectionArray = [
                                // ADD AFTERWARDS
                                "main_chats",
                                "comments",
                                "project_tab_components",
                                "projectRules",
                                "company_users",
                                "teams_management",
                                "milestone",
                                "estimated_time",
                                "notifications"
                            ];
                        } else if (key === 'all') {
                            collectionArray = [
                                // ADD AFTERWARDS
                                "main_chats",
                                "comments",
                                "project_tab_components",
                                "projectRules",
                                "company_users",
                                "teams_management",
                                "milestone",
                                "estimated_time",
                                "notifications",
                                "settings",
                                "projects",
                                "rules",
                                "tasks",
                                "userId",
                                "folders",
                                "sprints"
                            ];
                        } else if (key === 'custom') {
                            collectionArray = rulesArray
                        } else {
                            collectionArray = [
                                // INITIALLY REQUIRED
                                "settings",
                                "projects",
                                "rules",
                                "tasks",
                                "userId",
                                "folders",
                                "sprints"
                            ];
                        }

                        let retries = 0;
                        const retriesLimit = 3;

                        const retry = () => {
                            if(retries >= retriesLimit) {
                                logger.error(`${databaseName} >> ERROR faced in add roles RETRIED: ${retries}`);
                                return reject({status: false, statusText: "FAILED to add rules", data: failed})
                            } else {
                                retries++;
                                console.log("FAILED: ", failed);
                                console.log(`${databaseName} >> ERROR faced in add roles > RETRYING: ${retries}`);
                                logger.info(`${databaseName} >> ERROR faced in add roles > RETRYING: ${retries}`);
                                batchUpdate(failed, token, getService._id, databaseName)
                                .then((res) => {
                                    failed = res.filter((x) => x.status === "rejected")?.map((x) => x.reason?.dbName);
                                    if(failed.length) {
                                        retry();
                                    } else {
                                        console.log("COMPLETE");
                                        resolve(res);
                                    }
                                })
                                .catch((error) => {
                                    console.error("ERROR", error);
                                })
                            }
                        }

                        let failed = [];
                        const getService = data.find((a) => a.name === config.MONGODB_PROJECT_SERVICENAME);
                        batchUpdate(collectionArray, token, getService._id, databaseName)
                        .then((res) => {
                            failed = res.filter((x) => x.status === "rejected")?.map((x) => x.reason?.dbName);
                            if(failed.length) {
                                retry();
                            } else {
                                resolve(res);
                            }
                        })
                        .catch((error) => {
                            reject(error);
                            console.error("ERROR", error);
                        })
                        return;
                    }
                    reject(data);
                }).catch((error) => {
                    console.log("GET SERVICE ERROR", error);
                    reject(error)
                })
            }).catch((error) => {
                console.log("GET AUTH ERROR", error.message);
                reject(error)
            });
        } catch (error) {
            reject(error);
        } 
    })
};
