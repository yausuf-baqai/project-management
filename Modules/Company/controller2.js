
const { SCHEMA_TYPE } = require("../../Config/schemaType.js");
const { MongoDbCrudOpration } = require("../../utils/mongo-handler/mongoQueries.js");
const companyRef = require('./controller.js');
const helperCtr = require('../auth/controller/helper.js');
let errorArray = [];
const config = require('../../Config/config.js');
const sendMailRef  = require("../../Modules/service.js");

exports.setUpPreDefineCompanies = () => {
    return new Promise((resolve, reject) => {
        try {
            let obj = {
                type: SCHEMA_TYPE.PRECOMPANIES,
                data: {
                    isAvailable: false,
                    pickupCount: 0
                }
            }
            MongoDbCrudOpration("global", obj, "save").then((resp)=>{
                let companyId = JSON.parse(JSON.stringify(resp))._id
                let axiosData = {
                    "companyId": companyId
                }
                const allProcess = [
                    companyRef.createCompanyDataWasabiFun({}, companyId), // Create a new Bucket from Company Id
                    companyRef.importSettingsFun(axiosData), // Import Settings
                ];
                Promise.allSettled(allProcess).then((result)=>{
                    let errors = result.filter((x) => x.status === "rejected");
                    if (errors.length) {
                        errorArray.push({type: 'Import Setting And Wasabi Error',error: errors});
                        reject();
                    } else {
                        helperCtr.addSnapShotPermissionInCollecation(companyId, "all").then(()=>{
                            let object = {
                                type: SCHEMA_TYPE.PRECOMPANIES,
                                data: [
                                    {
                                        _id: companyId
                                    },
                                    {
                                        isAvailable: true,
                                        pickupCount: 0
                                    }
                                ]
                            }
                            MongoDbCrudOpration("global", object, "findOneAndUpdate").then(()=>{
                                resolve();
                            }).catch((error)=>{
                                errorArray.push({type: 'Mongo Db Doc Update error',error: error.message ? error.message : error});
                                reject(error);
                            })
                        }).catch((error)=>{
                            errorArray.push({type: 'Add Snap Shot Permisson Error',error: error.message ? error.message : error});
                            reject(error);
                        })
                    }
                }).catch((error)=>{
                    errorArray.push({type: 'Promise Catch Error',error: error.message ? error.message : error});
                    reject();
                })
            }).catch((error)=>{
                errorArray.push({type: 'Mongo Db Doc Save Error',error: error.message ? error.message : error});
                reject(error);
            })
        } catch (error) {
            errorArray.push({type: 'setUpPreDefineCompanies Try Catch Error',error: error.message ? error.message : error});
            reject(error);
        }
    })
}

exports.sendEmail = (attachMents,cb) => {
    sendMailRef.sendAttachMail('PreCompanies Set Error', `PreCompanies Process In ${config.NODE_ENV} Has Error Please check below file for more detail`,config.ERRORRECIVEREMAIL,attachMents, (res)=>{
        cb(res);
    })
}