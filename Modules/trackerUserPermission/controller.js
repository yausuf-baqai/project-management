const { dbCollections } = require("../../Config/firebaseCollections");
const logger = require("../../Config/loggerConfig");
const { SCHEMA_TYPE } = require("../../Config/schemaType");
const { MongoDbCrudOpration } = require("../../utils/mongo-handler/mongoQueries");
const mongoose = require("mongoose")

exports.handleTrackerUserPermission = (req,res) => {
    try {
        if(!req.body && !Object.keys(req.body)?.length){
            res.send({status: false, message: 'req body is requried'});
            return;
        }
        if(!req.body.CompanyId){
            res.send({status: false, message: 'Company Id is requried'});    
            return;
        }
        if(!req.body.DataObj){
            res.send({status: false, message: 'DataObj is requried'});
            return;
        }
        exports.updateTrackerUsersAndUser(req.body.DataObj,req.body.CompanyId).then((res1)=>{
            res.send(res1);
        })
        .catch((err)=>{
            logger.error(`ERROR in update handleTrackerUserPermission: ${err.message}`)
            res.send(err);
        })
    } catch (error) {
        logger.error(`ERROR in update handleTrackerUserPermission: ${error.message}`)
        res.send({status : false,message: 'Something went wrong.'});
    }
}

exports.updateTrackerUsersAndUser = async (dataObj, companyId) => {
    return new Promise((resolve, reject) => {
        try {
            const incValue = 1;
            const decValue = -1;
            const updateCompanyQuery = {
                type: SCHEMA_TYPE.COMPANIES,
                data: [
                    { _id: new mongoose.Types.ObjectId(companyId) },
                    { $inc: { trackerUsers: dataObj.ops ? incValue : decValue } },
                    ...(dataObj.ops ? [{ new: true, useFindAndModify: false }] : [])
                ]
            };

            MongoDbCrudOpration('global', updateCompanyQuery, "findOneAndUpdate").then((companyData) => {
                if (!dataObj.ops && companyData && companyData.planFeature?.timeTrackerUser > 0 && companyData.trackerUsers > companyData.planFeature.timeTrackerUser) {
                    rollbackTrackerCount();
                } else {
                    const updateCompanyUserQuery = {
                        type: SCHEMA_TYPE.COMPANY_USERS,
                        data: [
                            { [dataObj.data.status === 2 ? 'userId' : '_id']: dataObj.data.status === 2 ? dataObj.data.userId : new mongoose.Types.ObjectId(dataObj.data._id) },
                            { $set: { isTrackerUser: dataObj.ops } },
                        ]
                    };

                    MongoDbCrudOpration(companyId, updateCompanyUserQuery, "findOneAndUpdate").then(() => {
                        resolve({ status: true, message: dataObj.ops ? 'Tracker user added successfully.' : 'Tracker user removed successfully.' })
                    }).catch(()=>{
                        rollbackTrackerCount(true);
                    });
                }
            }).catch(handleError);

            function rollbackTrackerCount (fromError=false) {
                const rollbackCompanyQuery = {
                    type: SCHEMA_TYPE.COMPANIES,
                    data: [
                        { _id: new mongoose.Types.ObjectId(companyId) },
                        { $inc: { trackerUsers: decValue } }
                    ]
                };

                MongoDbCrudOpration('global', rollbackCompanyQuery, "findOneAndUpdate").then(() => {
                    if(!fromError) {
                        resolve({ status: true, message: 'Please upgrade your plan to add more Time Tracker Users.' })
                    } else {
                        resolve({ status: false, message: 'Something went wronge' })
                    }
                }).catch(handleError);
            }

            function handleError(err) {
                logger.error(`ERROR in update updateTrackerUsersAndUser: ${err.message}`)
                reject({ status: false, message: 'Something went wrong.' });
            }
        } catch (error) {
            logger.error(`ERROR in update updateTrackerUsersAndUser: ${error.message}`)
            reject({ status: false, message: 'Something went wrong.' });
        }
    })
};