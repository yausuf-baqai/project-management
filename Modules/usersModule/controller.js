const { dbCollections } = require("../../Config/firebaseCollections.js");
const logger = require("../../Config/loggerConfig");
const { MongoDbCrudOpration } = require("../../utils/mongo-handler/mongoQueries.js");
const mongoose = require("mongoose")

exports.updateUserStatus = (req,res) => {
    if(!req.body.userId) {
        res.send({status: false, message: 'userId is required'});
        return;
    }

    let obj = {
        type: 'users',
        data: [
            {
                _id : new mongoose.Types.ObjectId(req.body.userId)
            },
            { 
                'isOnline': true, 
                'lastActive': new Date() 
            }
        ]
    }

    try {
        MongoDbCrudOpration('global', obj, "updateOne").then((response)=>{
            res.send({
                status: true,
                statusText: "User Status Updated",
                data:response
            });
        }).catch((error)=>{
            res.send({
                status: false,
                statusText: "User Status Not Updated"
            });
            logger.error('USER STATUS UPDATE ERROR updateUserStatus: ',error);
        })
    } catch (error) {
        res.send({
            status: false,
            statusText: "User Status Not Updated"
        });
        logger.error('USER STATUS UPDATE ERROR updateUserStatus: ',error);
    }
}

exports.checkUserAndCompany = (req, res) => {
    if(!req.body.userId) {
        res.send({status: false, message: 'userId is required'});
        return;
    }
    let obj = {
        type: 'users',
        data: [
            {
                _id : new mongoose.Types.ObjectId(req.body.userId)
            }
        ]
    }

    try {
        MongoDbCrudOpration('global', obj, "findOne").then((response)=>{
            if(response && response.isEmailVerified == false) {
                res.send({
                    status: false,
                    statusText: "Email Not Verified",
                    data: {}
                });
                return;
            }
            if(response && response.AssignCompany && response.AssignCompany.length > 0) {
                let cObj = {
                    type: dbCollections.COMPANIES,
                    data: [
                        {
                            _id: { $in: [...response.AssignCompany.map((x) => new mongoose.Types.ObjectId(x))] },
                            isDisable: { $in : [false,undefined]}
                        }
                    ]
                }

                MongoDbCrudOpration('global', cObj, "findOne").then((company)=>{
                    if(company) {
                        res.send({
                            status: true,
                            statusText: "Comapny Found",
                            data: {isCompanyFind: true,companyId: company._id,userData:response}
                        });
                        return;
                    } else {
                        res.send({
                            status: true,
                            statusText: "Comapny Not Found",
                            data: {isCompanyFind: false,companyId: '',userData:response}
                        });
                        return;
                    }
                }).catch((error)=>{
                    res.send({
                        status: false,
                        statusText: "Comapny Not Found",
                        data: {isCompanyFind: false,companyId: '',userData:response}
                    });
                    logger.error('USER STATUS UPDATE ERROR checkUserAndCompany: ',error);
                })

            } else {
                res.send({
                    status: true,
                    statusText: "Comapny Not Found",
                    data: {isCompanyFind: false,companyId: '',userData:response}
                });
                return;
            }
        }).catch((error)=>{
            res.send({
                status: false,
                statusText: "User Not Found",
                data: {isCompanyFind: false,companyId: '',userData: null}
            });
            logger.error('USER STATUS UPDATE ERROR checkUserAndCompany: ',error);
        })
    } catch (error) {
        res.send({
            status: false,
            statusText: "User Not Found",
            data: {}
        });
        logger.error('USER STATUS UPDATE ERROR checkUserAndCompany: ',error);
    }
}