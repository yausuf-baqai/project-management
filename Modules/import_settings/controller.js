const logger = require("../../Config/loggerConfig");
const importData = require('../../utils/data');
const { SCHEMA_TYPE } = require("../../Config/schemaType");

async function batchUpdate(arr) {
    return new Promise((resolve, reject) => {
        try {
            // tasks BATCH FUNCTION
            let count = 0;
            let batch = 1;
            const perBatch = 8;
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
                                promises.push(importData[data.name].apply(null, data.params))
                                console.log("DATA FOR: ", data.name);
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

exports.importSettingsFunction = (req, cb) => {
    try {

        //Request variables
        const { companyId, uid, email, rules, isFromBackend } = req.body;

        //Validations
        if(!companyId || companyId === '') {
            cb({
                status: false,
                statusText: "Company id is required."
            });
            return;
        }

        if (!isFromBackend) {
            if((rules === undefined || rules.includes("importCompanyUserOwner")) && (!email || email === '')) {
                cb({
                    status: false,
                    statusText: "Email id is required."
                });
                return;
            }
    
            if((rules === undefined || rules.includes("importUserNotifications") || rules.includes("importCompanyUserOwner")) &&  (!uid || uid === '')) {
                cb({
                    status: false,
                    statusText: "User id is required."
                });
                return;
            }
        }

        let allRules = [
            "importProjectCategories",
            "importHourlyMilestoneRange",
            "importHourlyMilestoneWeeklyRange",
            "importProjectPriorities",
            "importProjectMilestone",
            "importCommonDateFormat",
            "importCommonExtension",
            "importCompanyUserStatus",
            "importCompanyRules",
            "importCompanyRoles",
            "importCurrency",
            "importProjectTabComponents",
            "importProjectApps",
            // "importUserNotifications",
            "importTaskStatusTemplate",
            "importTaskTypeTemplate",
            "createDefaultMainChats",
            "importProjectStatusTemplate",
            // "importCompanyUserOwner",
            "importTaskDefaultStatus",
            "importProjectStatus",
            "importStatusType"
        ]

        if (!isFromBackend) {
            allRules = allRules.concat(['importUserNotifications','importCompanyUserOwner'])
        }
        const rulesToBeApplied = allRules.filter((x) => rules === undefined || rules.includes(x))?.map((rule) => {
            let obj = {
                name: rule
            };

            switch(rule) {
                case "importUserNotifications":
                    obj.params = [companyId, uid]
                    break;

                case "importCompanyUserOwner":
                    const dataObj = {
                        companyId: companyId,
                        userId: uid,
                        isDelete: false,
                        roleType: 1,
                        status: 2,
                        userEmail: email,
                        designation : 0
                    }
                    const queryObj = {
                        type : SCHEMA_TYPE.COMPANY_USERS,
                        data: [
                            {userId : uid},
                            {$set: { ...dataObj }},
                            { upsert: true }
                        ]
                    }
                    obj.params = [companyId, queryObj]
                    break;

                default:
                    obj.params = [companyId]
                    break;
            }

            return obj;
        });

        batchUpdate(rulesToBeApplied)
        .then(() => {
            cb({
                status: true,
                statusText: "Settings has been imported successfully"
            })
        })
        .catch((error) => {
            console.error(`ERROR in import company settings: ${error.messge}`);
            logger.error(`ERROR in import company settings: ${error.messge}`);
            cb({
                status: false,
                statusText: error.messge
            });
        });

    } catch (error) {
        logger.error(`Import Default Settings Catch Error: ${error.messge}`);
        cb({
            status: false,
            statusText: error.messge
        });
    }
};


exports.importSettingsV2Function = (req, cb) => {
    try {

        //Request variables
        const { companyId, uid, email, rules } = req.body;

        //Validations
        if(!companyId || companyId === '') {
            cb({
                status: false,
                statusText: "Company id is required."
            });
            return;
        }

        if((rules === undefined || rules.includes("importCompanyUserOwner")) && (!email || email === '')) {
            cb({
                status: false,
                statusText: "Email id is required."
            });
            return;
        }

        if((rules === undefined || rules.includes("importUserNotifications") || rules.includes("importCompanyUserOwner")) &&  (!uid || uid === '')) {
            cb({
                status: false,
                statusText: "User id is required."
            });
            return;
        }

        const allRules = [
            "importCompanyUserOwner",
            "importUserNotifications"
        ]

        const rulesToBeApplied = allRules.filter((x) => rules === undefined || rules.includes(x))?.map((rule) => {
            let obj = {
                name: rule
            };

            switch(rule) {
                case "importUserNotifications":
                    obj.params = [companyId, uid]
                    break;

                case "importCompanyUserOwner":
                    const dataObj = {
                        companyId: companyId,
                        userId: uid,
                        isDelete: false,
                        roleType: 1,
                        status: 2,
                        userEmail: email,
                        designation : 0
                    }
                    const queryObj = {
                        type : SCHEMA_TYPE.COMPANY_USERS,
                        data: [
                            {userId : uid},
                            {$set: { ...dataObj }},
                            { upsert: true }
                        ]
                    }
                    obj.params = [companyId, queryObj]
                    break;

                default:
                    obj.params = [companyId]
                    break;
            }

            return obj;
        });

        batchUpdate(rulesToBeApplied)
        .then(() => {
            cb({
                status: true,
                statusText: "Settings has been imported successfully"
            })
        })
        .catch((error) => {
            console.error(`ERROR in import company settings: ${error.messge}`);
            logger.error(`ERROR in import company settings: ${error.messge}`);
            cb({
                status: false,
                statusText: error.messge
            });
        });

    } catch (error) {
        logger.error(`Import Default Settings Catch Error: ${error.messge}`);
        cb({
            status: false,
            statusText: error.messge
        });
    }
};

exports.importSettingsProjectFunction = (req, res) => {
    try {

        //Request variables
        const { companyId, type, projectId } = req.body;

        //Validations
        if(!companyId || companyId === '') {
            res.send({
                status: false,
                statusText: "Company id is required."
            });
            return;
        }
        importData.importCompanyRules(companyId,type,projectId).then(() => {
            res.send({
                status: true,
                statusText: "Settings has been imported successfully"
            });
        }).catch((err) => {
            logger.error(`Error in import project rules: ${err.messge}`);
        })
    } catch (error) {
        logger.error(`Import Default Settings Catch Error: ${error.messge}`);
        res.send({
            status: false,
            statusText: "Settings has been imported successfully"
        });
    }
};

/**
 * Import default comapny settings when new conmpany created
 * @param {Objcet} req
 * @param {Object} res
 * @returns
 */
exports.importSettings = (req, res) => {
    exports.importSettingsFunction(req, (cData) => {
        res.send(cData);
    });
};

exports.importTemplate = (req, res) => {
    if (!(req.body && req.body.templates && req.body.templates.length)) {
        res.json({
            status: false,
            statusText: "template is required."
        })
        return;
    }
    try {
        importData.importSettingTemplate(req.body.templates, (data) => {
            res.json(data)
        });
    } catch (error) {
        res.json({
            status: false,
            error: error
        });
    }

}

exports.importSettingsNotification = (req, res) => {
    try {

        //Request variables
        const { companyId, userId} = req.body;

        //Validations
        if(!companyId || companyId === '') {
            res.send({
                status: false,
                statusText: "Company id is required."
            });
            return;
        }
        if(!userId || userId === '') {
            res.send({
                status: false,
                statusText: "User id is required."
            });
            return;
        }
        importData.importUserNotifications(companyId,userId).then(() => {
            res.send({
                status: true,
                statusText: "Notification Settings has been imported successfully"
            });
        }).catch((err) => {
            logger.error(`Error in import Notification Settings rules: ${err}`);
            res.send({
                status: false,
                statusText: err
            });
        })
    } catch (error) {
        logger.error(`Import Default Settings Catch Error: ${error}`);
        res.send({
            status: false,
            statusText: error
        });
    }
};
