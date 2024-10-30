const mongoCm = require('../../utils/mongo-handler/mongoQueries');
const logger = require("../../Config/loggerConfig");

// Key 1 is Project Comments
// Key 2 is update sprint count and task count
// Key 3 is update chat count
// Key 4 is update mention count
// Key 5 is update notification count


/**
 * Update Sprint And Task Count
 * @param {Object} Data - Object Which is get Frin Db
 * @param {String} CompanyId - Company Id In which Count is need to update
 * @param {String} TaskFieldName - Name of the field which is being updated
 * @param {String} SprintFieldName - Name of the field which is being updated
 * @returns {function} - Function which is return with object which contain status true or false
*                          If status is false then error is returned
 */
exports.updateSprintCount = (companyId,data, taskFieldName, sprintFieldName, parentTaskField = null, prevCount = 0, cb) => {
    try {
        let count = 0;
        const countFun = (row) => {
            if (count >= data.length) {
                cb({
                    status: true
                });
                return;
            }
            if (!row[taskFieldName]) {
                count += 1;
                countFun(data[count]);
                return;
            }
            let obj = {
                type: "userId",
                data: [{
                    _id: row._id
                }, {
                    $inc: {
                        // [sprintFieldName]: -Math.abs(prevCount),
                        // ...(parentTaskField ? {[parentTaskField]: -Math.abs(prevCount)} : {})
                        [sprintFieldName]: prevCount,
                        ...(parentTaskField ? {[parentTaskField]: prevCount} : {})
                    }
                }]
            }
            mongoCm.MongoDbCrudOpration(companyId,obj,"updateOne").then(()=>{
                // UNSET SPRINT FIELD
                let obj = {
                    type: "userId",
                    data: [{
                        _id: row._id,
                        [sprintFieldName]: {
                            $lte: 0
                        }
                    }, {
                        $unset: {
                            [sprintFieldName]: ""
                        }
                    }]
                }
                mongoCm.MongoDbCrudOpration(companyId,obj,"updateOne").then((sdata)=>{
                    count += 1;
                    countFun(data[count]);
                }).catch((err) => {
                    count += 1;
                    countFun(data[count]);
                });

                if(parentTaskField) {
                    // UNSET PARENT TASK FIELD
                    obj = {
                        type: "userId",
                        data: [{
                            _id: row._id,
                            [parentTaskField]: {
                                $lte: 0
                            }
                        }, {
                            $unset: {
                                [parentTaskField]: ""
                            }
                        }]
                    }
                    mongoCm.MongoDbCrudOpration(companyId,obj,"updateOne").then(()=>{
                        count += 1;
                        countFun(data[count]);
                    }).catch((err) => {
                        count += 1;
                        countFun(data[count]);
                    });
                }
            }).catch(() => {
                count += 1;
                countFun(data[count]);
            })
        }
        countFun(data[count]);
    } catch (error) {
        cb({
            status: false,
            err: error
        });
    }
}


/**
 * Update Count Function
 * @param {Array} UserIds - User Ids which is need to update
 * @param {String} CompanyId - Company Id In which Count is need to update
 * @param {Object} ManageQuery - Qury Object For Update In db
 * @returns {function} - Function which is return with object which contain status true or false
*                          If status is false then error is returned
 */
exports.updateCount = (companyId,userIds, manageQuery, cb) => {
    try {
        let obj = {
            type: "userId",
            data: [{
                    userId: {
                        $in: userIds
                    }
                },
                manageQuery
            ]
        }

        mongoCm.MongoDbCrudOpration(companyId,obj,"updateMany").then((data)=>{
            cb({
                status: true,
                data: data
            });
        }).catch((err) => {
            cb({
                status: false,
                err: err
            });
        });
    } catch (error) {
        cb({
            status: false,
            err: error
        });
    }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */

exports.updateUnReadCommentsCount = (req, res) => {
    exports.updateUnReadCommentsCountFun(req).then((cData) => {
        res.send(cData);
    })
    .catch((error) => {
        res.send(error.message);
    });
};
exports.updateUnReadCommentsCountFun = (req) => {
    try {
        return new Promise((resolve, reject) => {
            if (!(req.body && req.body.companyId)) {
                reject({
                    status: false,
                    statusText: "companyId is required"  
                });
                return;
            }

            if (!(req.body && req.body.key)) {
                reject({
                    status: false,
                    statusText: "key is required"  
                });
                return;
            }

            if (req.body.key === 1 || req.body.key === 2) {
                if (!(req.body && req.body.projectId)) {
                    reject({
                        status: false,
                        statusText: "Project id is required"
                    });
                    return;
                }

                if (!(req.body && req.body.userIds && req.body.userIds.length)) {
                    reject({
                        status: false,
                        statusText: "User ids are required"
                    });
                    return;
                }
            }

            if (req.body.key === 2) {
                if (!(req.body && req.body.sprintId)) {
                    reject({
                        status: false,
                        statusText: "Sprint id is required"
                    });
                    return;
                }
                if (!(req.body && req.body.taskId)) {
                    reject({
                        status: false,
                        statusText: "Task id is required"
                    });
                    return;
                }
            }

            if (req.body.key === 3) {
                if (!(req.body && req.body.messageId)) {
                    reject({
                        status: false,
                        statusText: "Message id is required"
                    });
                    return;
                }
            }

            if (req.body.key === 4) {
                if (req.body.readAll === undefined) {
                    reject({
                        status: false,
                        statusText: "readAll id is required"
                    });
                    return;
                }
            }

            let messageCount = req.body.messageCount !== undefined ? req.body.messageCount : 1;
            let prevCount = req.body.prevCount || 0;

            if (req.body.key === 1) {
                const fieldName = `project_${req.body.projectId}_comments`;
                let manageQuery = {};
                if (req.body.read) {
                    manageQuery = {
                        $unset: {
                            [fieldName]: ""
                        }
                    }
                } else if (req.body.set) {
                    manageQuery = {
                        $set: {
                            [fieldName]: messageCount
                        }
                    }
                } else {
                    manageQuery = {
                        $inc: {
                            [fieldName]: messageCount
                        },
                    }
                }
                exports.updateCount(req.body.companyId,req.body.userIds, manageQuery, (tData) => {
                    resolve(tData);
                });
            } 
            else if (req.body.key === 2) {
                const sprintFieldName = `sprint_${req.body.projectId}_${req.body.sprintId}_comments`;
                const taskFieldName = `task_${req.body.projectId}_${req.body.sprintId}_${req.body.taskId}_comments`;
                let parentTaskField = ``;
                if(req.body.parentTaskId) {
                    parentTaskField = `parentTask_${req.body.projectId}_${req.body.sprintId}_${req.body.parentTaskId}_comments`
                }
                let manageQuery = {};
                if (req.body.read) {
                    manageQuery = {
                        $unset: {
                            [taskFieldName]: ""
                        }
                    }
                    // Get Task Count
                    let obj = {
                        type: "userId",
                        data: [{
                            userId: {
                                $in: req.body.userIds
                            }
                        }, {
                            [taskFieldName]: true
                        }]
                    }
                    mongoCm.MongoDbCrudOpration(req.body.companyId,obj,"find").then((data)=>{
                        if (!(data && data.length)) {
                            reject({
                                status: false,
                                statusText: "User data not found"
                            });
                            return;
                        }

                        exports.updateSprintCount(req.body.companyId,data, taskFieldName, sprintFieldName, parentTaskField, -prevCount, (cData) => {
                            if (!cData.status) {
                                resolve(cData);
                                return;
                            }
                            exports.updateCount(req.body.companyId,req.body.userIds, manageQuery, (tData) => {
                                resolve(tData);
                            });
                        });
                    }).catch((err) => {
                        reject({
                            status: false,
                            err: err
                        });
                    })
                } else if (req.body.set) {
                    const newCount = messageCount - prevCount
                    manageQuery = {
                        $set: {
                            [taskFieldName]:messageCount,
                        }
                    }

                    manageQuery["$inc"] = {
                        [sprintFieldName]: newCount,
                        ...(req.body.parentTaskId ? {[parentTaskField]: newCount} : {})
                    }

                    exports.updateCount(req.body.companyId,req.body.userIds, manageQuery, (tData) => {
                        resolve(tData);
                        if(newCount < 0){
                            try {
                                // Get Task Count
                                let obj = {
                                    type: "userId",
                                    data: [{
                                        [sprintFieldName]: {
                                            $lte: 0
                                        }
                                    }, {
                                        $unset: {
                                            [sprintFieldName]: ""
                                        }
                                    }]
                                }
                                mongoCm. MongoDbCrudOpration(req.body.companyId,obj,"updateMany").then(() => {
                                }).catch((error) => {
                                    logger.error(`${error} ERROR IN MONGO QUERY`);
                                })
                                if(req.body.parentTaskId) {
                                    // UNSET PARENT TASK FIELD
                                    let Pobj = {
                                        type: "userId",
                                        data: [{
                                            [parentTaskField]: {
                                                $lte: 0
                                            }
                                        }, {
                                            $unset: {
                                                [parentTaskField]: ""
                                            }
                                        }]
                                    }
                                    mongoCm.MongoDbCrudOpration(req.body.companyId,Pobj,"updateMany").catch((error) => {
                                        logger.error(`${error} ERROR IN MONGO QUERY`);
                                    })
                                }
                            } catch (error) {
                                logger.error(`Error updating ${error}`)
                            }
                        }
                    });
                } else {
                    manageQuery = {
                        $inc: {
                            [sprintFieldName]: messageCount,
                            [taskFieldName]: messageCount,
                            ...(req.body.parentTaskId ? {[parentTaskField]: messageCount} : {})
                        }
                    }

                    exports.updateCount(req.body.companyId,req.body.userIds, manageQuery, (tData) => {
                        resolve(tData);
                    });
                }
            } else if (req.body.key === 3) {
                const fieldName = `message_${req.body.messageId}_counts`;
                let manageQuery = {};
                if (req.body.read) {
                    manageQuery = {
                        $unset: {
                            [fieldName]: ""
                        }
                    }
                }  else if (req.body.set) {
                    manageQuery = {
                        $set: {
                            [fieldName]: messageCount
                        }
                    }
                } else {
                    manageQuery = {
                        $inc: {
                            [fieldName]: messageCount
                        }
                    }
                }
                exports.updateCount(req.body.companyId,req.body.userIds, manageQuery, (tData) => {
                    resolve(tData);
                });
            } else if (req.body.key === 4) {
                const fieldName = `mention_counts`;
                let manageQuery = {};
                if (req.body.readAll) {
                    manageQuery = {
                        $unset: {
                            [fieldName]: ""
                        }
                    }
                } else {
                    if (req.body.read) {
                        manageQuery = {
                            $inc: {
                                [fieldName]: -1
                            }
                        }
                    } else {
                        manageQuery = {
                            $inc: {
                                [fieldName]: 1
                            }
                        }
                    }
                }
                exports.updateCount(req.body.companyId,req.body.userIds, manageQuery, (tData) => {
                    if (req.body.readAll === false && req.body.read === true) {
                        exports.updateMentionCount(req.body.companyId,req.body.userIds,fieldName, (cdata) => {
                            resolve(cdata);
                        })
                    } else {
                        resolve(tData);
                    }
                });
            } else if (req.body.key === 5) {
                const fieldName = `notification_counts`;
                let manageQuery = {};
                if (req.body.readAll) {
                    manageQuery = {
                        $unset: {
                            [fieldName]: ""
                        }
                    }
                } else {
                    if (req.body.read) {
                        manageQuery = {
                            $inc: {
                                [fieldName]: -1
                            }
                        }
                    } else {
                        manageQuery = {
                            $inc: {
                                [fieldName]: 1
                            }
                        }
                    }
                }
                exports.updateCount(req.body.companyId,req.body.userIds, manageQuery, (tData) => {
                    if (req.body.readAll === false && req.body.read === true) {
                        exports.updateMentionCount(req.body.companyId,req.body.userIds,fieldName, (cdata) => {
                            resolve(cdata);
                        })
                    } else {
                        resolve(tData);
                    }
                });
            }
            else {
                resolve({
                    status: true
                });
            }
        })
    } catch (error) {
        reject({
            status: false,
            err: error
        })
    }
};


/**
 * Update Mention Count Function
 * @param {Array} UserIds - User Ids which is need to update
 * @param {String} CompanyId - Company Id In which Count is need to update
 * @param {Object} FieldName - Name of the field which is needed to update
 * @returns {function} - Function which is return with object which contain status true or false
*                          If status is false then error is returned
 */
exports.updateMentionCount = (companyId,userIds,fieldName,cb) => {
    try {
        let obj = {
            type: "userId",
            data: [{
                userId: {
                    $in: userIds
                }
            }]
        }
        mongoCm.MongoDbCrudOpration(companyId,obj,"find").then((data)=>{
            if (!(data && data.length)) {
                cb({
                    status: false,
                    statusText: "User data not found"
                });
                return;
            }
            let count = 0;
            let UpdateuserIds = [];
            let countFunction = (row) => {
                if (count >= data.length) {
                    if (UpdateuserIds.length) {
                        let manageQuery = {
                            $unset: {
                                [fieldName]: ""
                            }
                        }
                        exports.updateCount(companyId,UpdateuserIds, manageQuery, (tData) => {
                            cb(tData);
                        });
                    } else {
                        cb({
                            status: true,
                            statusText: "Update Successfully"
                        })
                    }
                    return;
                } else {
                    if (row[fieldName] <= 0) {
                        UpdateuserIds.push(row.userId)
                        count++;
                        countFunction(data[count]);
                    } else {
                        count++;
                        countFunction(data[count]);
                    }
                }
            }
            countFunction(data[count]);
        }).catch((err) => {
            cb({
                status: false,
                err: err
            });
        })
    } catch (error) {
        cb({
            status: false,
           statusText: `Error: ${error}`
        })
    }
}