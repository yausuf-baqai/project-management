
// const AWS = require('aws-sdk');
const awsRef = require('../../Config/aws.js');
const { S3Client, GetObjectCommand ,CreateBucketCommand , PutObjectCommand ,DeleteObjectCommand,ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { IAMClient, CreatePolicyCommand ,CreateUserCommand,AttachUserPolicyCommand,CreateAccessKeyCommand} = require("@aws-sdk/client-iam");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const fs = require("fs");
const logger = require("../../Config/loggerConfig");
const sharp = require('sharp');
const thumbnailArray = require("../../thumbnail.json");
const { SCHEMA_TYPE } = require('../../Config/schemaType.js');
const { MongoDbCrudOpration } = require('../../utils/mongo-handler/mongoQueries.js');
const { default: mongoose } = require('mongoose');

/**
 * S3 client configuration for create bucket
 */
let s3Client = new S3Client({
    region: awsRef.region,
    credentials: {
        accessKeyId: awsRef.wasabiAccessKey,
        secretAccessKey: awsRef.wasabiSecretAccessKey,
    },
    endpoint: awsRef.wasabiEndPoint,
});

/**
 * Iam  client configuration for create policy and user
 */
let iamClient = new IAMClient({
    region: awsRef.region,
    credentials: {
        accessKeyId: awsRef.wasabiAccessKey,
        secretAccessKey: awsRef.wasabiSecretAccessKey,
    },
    endpoint: awsRef.iamEndPoint,
});

/**
 * Wasabi credential snapshot for get credential from companyId
*/
exports.wasabiCredential = [];
exports.setWasabiCredential = () => {
    try {
        let obj = {
            type: SCHEMA_TYPE.WASABICREDENTIALS,
            data: [{}]
        }
        MongoDbCrudOpration('global', obj, "find").then((res) => {
            res.forEach((doc) => {
                let ind = exports.wasabiCredential.findIndex((dt)=>{
                    return JSON.parse(JSON.stringify(dt))?._id === JSON.parse(JSON.stringify(doc))?._id
                })
                if (ind === -1) {
                    exports.wasabiCredential.push(doc);
                }
            })
        })
        s3Client = new S3Client({
            region: awsRef.region,
            credentials: {
                accessKeyId: awsRef.wasabiAccessKey,
                secretAccessKey: awsRef.wasabiSecretAccessKey,
            },
            endpoint: awsRef.wasabiEndPoint,
        });
        iamClient = new IAMClient({
            region: awsRef.region,
            credentials: {
                accessKeyId: awsRef.wasabiAccessKey,
                secretAccessKey: awsRef.wasabiSecretAccessKey,
            },
            endpoint: awsRef.iamEndPoint,
        });
    } catch (error) {
        logger.error(`Set wasabi credential error:  ${error}`);
    }
}

/**
 * Create a new Bucket using companyId
 * @param {Objcet} CompanyId
 */
exports.createNewBucketInWasabi = (companyId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const command = new CreateBucketCommand({ Bucket: companyId });
            const response = await s3Client.send(command);
            logger.info(`Bucket is created successfully for company ${companyId}`);
            resolve(response);
        } catch (error) {
            reject(error);
        }
    })
}

/**
 * Create a new Policy document for a bucket from companyId
 * @param {Objcet} CompanyId
 */
exports.createNewPolicyDocument = (companyId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const policyDocument = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Action": "s3:ListAllMyBuckets",
                        "Resource": "arn:aws:s3:::*"
                    },
                    {
                        "Effect": "Allow",
                        "Action": "s3:*",
                        "Resource": [
                            `arn:aws:s3:::${companyId}`,
                            `arn:aws:s3:::${companyId}/*`
                        ]
                    }
                ]
            }
            const createPolicyCommand = new CreatePolicyCommand({
                PolicyName: `${companyId}-bucket-policy`,
                PolicyDocument: JSON.stringify(policyDocument),
            });
            try {
                const createPolicyResponse = await iamClient.send(createPolicyCommand);
                logger.info(`New policy document is created for company ${companyId}`);
                resolve(createPolicyResponse)
            } catch (error) {
                reject(error);
            }
        } catch (error) {
            reject(error);
        }
    })
}

/**
 * Update Local File In Wassabi
 * @param {String} CompanyId - CompanyId in which file is need to upload
 * @param {String} Path - Path where file is uploaded in Wasabi
 * @param {Object} File - File Which is need to Upload
 * @returns {Promise<String>} A Promise that resolves with the updated file path upon successful upload.
 *                            Rejects with an error message if any issues occur during the upload process.
 */
exports.updateLocalWasabiFiles = (companyId, path, file) => {
    return new Promise((resolve, reject) => {
        let ind = exports.wasabiCredential.findIndex((dta)=>{
            return JSON.parse(JSON.stringify(dta))?._id === companyId
        })

        if (ind === -1) {
            reject(`No credential found for given company id`)
            return;
        }
        let updatedFilePath = path
        const s3clientCompany = new S3Client({
            region: awsRef.region,
            credentials: {
                accessKeyId:  exports.wasabiCredential[ind].accessKeyId,
                secretAccessKey: exports.wasabiCredential[ind].secretAccessKey,
            },
            endpoint: awsRef.wasabiEndPoint,
        });
        const fileContent = fs.readFileSync(file);
        const bucketName = companyId;
        const fileName = updatedFilePath;
        
        const params = {
            Bucket: bucketName,
            Key: fileName,
            Body: fileContent,
        };
        try {
            s3clientCompany.send(new PutObjectCommand(params))
            .then(() => {
                resolve(updatedFilePath);
            }).catch((error)=>{
                reject(`Error while upload file: ${error}`)
            })
        } catch (error) {
            reject(`File upload error: ${error}`)
        }
    })
}


exports.uploadIamgesInWasabi = (imageArray,companyId) => {
    return new Promise(async (resolve, reject) => {
        try {
            imageArray.forEach((x)=>{
                exports.updateLocalWasabiFiles(companyId,x.path,x.filePath).catch((error)=>{
                    logger.error(`updateLocalWasabiFiles: ${error}`);
                });
            });
            resolve()
        } catch (error) {
            reject(error);
        }
    })
}

exports.uploadTaskTypeImage = (companyId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let imageArray = [
                {
                    path:'setting/task_type/bug.png',
                    filePath: __dirname + "/../../wasabiUploadsLocal/bug.png"
                },
                {
                    path:'setting/task_type/design.png',
                    filePath: __dirname + "/../../wasabiUploadsLocal/design.png"
                },
                {
                    path:'setting/task_type/subtask.png',
                    filePath: __dirname + "/../../wasabiUploadsLocal/subtask.png"
                },
                {
                    path:'setting/task_type/task.png',
                    filePath: __dirname + "/../../wasabiUploadsLocal/task.png"
                },

            ];
            exports.uploadIamgesInWasabi(imageArray,companyId).then(() => {
                resolve();
            })
        } catch (error) {
            reject(error);
        }
    })
}
exports.uploadPriority = (companyId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let imageArray = [
                {
                    path:'taskPriorities/priority_medium.png',
                    filePath: __dirname + "/../../wasabiUploadsLocal/priority_medium.png"
                },
                {
                    path:'taskPriorities/priority_low.png',
                    filePath: __dirname + "/../../wasabiUploadsLocal/priority_low.png"
                },
                {
                    path:'taskPriorities/priority_high.png',
                    filePath: __dirname + "/../../wasabiUploadsLocal/priority_high.png"
                }

            ];
            exports.uploadIamgesInWasabi(imageArray,companyId).then(() => {
                resolve();
            })
        } catch (error) {
            reject(error);
        }
    })
}

/**
 * Update A thumbnail File In Wassabi
 * @param {String} Base64 - Base64String Which is need to be uploaded
 * @param {String} Path - Path where file is uploaded in Wasabi
 * @param {String} Width - Height of the thumbnail file
 * @param {String} Height - Width of the thumbnail file
 * @param {String} CompanyId - CompanyId in which file is need to upload
 * @param {String} AccessKeyId - AccessKeyId of Company For Upload file In wasabi
 * @param {String} SecretAccessKey - AccessKeyId of Company For Upload file In wasabi
 * @returns {Promise<String>} A Promise that resolves with the updated file name upon successful upload.
 *                            Rejects with an error message if any issues occur during the upload process.
 */
exports.uploadThumbnailFileFromBase64 = (base64,path,name,width,height,companyId,accessKeyId,secretAccessKey) =>{
    new Promise((resolve, reject) => {
        const base64Data = base64.replace(/^data:image\/png;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const fileExtension = name.split('.')[1];
        const fileName = `${name.split('.')[0]}-${width}x${height}.${fileExtension}`
        sharp(buffer)
        .resize(width, height, (!isUserProfile ? {fit: "inside"}: {}))
        .withMetadata()
        .toBuffer()
        .then(resizedBuffer => {
            const bucketName = companyId;
            const params = {
                Bucket: bucketName,
                Key: fileName,
                Body: resizedBuffer,
            };
            try {
                const s3clientCompanyThumb = new S3Client({
                    region: awsRef.region,
                    credentials: {
                        accessKeyId:  accessKeyId,
                        secretAccessKey: secretAccessKey,
                    },
                    endpoint: awsRef.wasabiEndPoint,
                });
                s3clientCompanyThumb.send(new PutObjectCommand(params))
                .then(() => {
                    resolve(fileName)
                }).catch((error)=>{
                    reject(`Error while upload file: ${error}`)
                })
            } catch (error) {
                reject(`File upload error: ${error}`)
            }
        })
        .catch(error => {
            reject('Error:', error);
        });
    })
}


/**
 * Update File In Wassabi
 * @param {String} CompanyId - CompanyId in which file is need to upload
 * @param {String} Path - Path where file is uploaded in Wasabi
 * @param {Object} Base64String - Base64String Which is need to be uploaded
 * @param {Boolean} ReplaceFile - Boolean True if you want to replace existing file in Wasabi
 * @param {String} ThumbanilKey - Thumbnail Key For Genrate Thumbnail
 * @returns {Promise<String>} A Promise that resolves with the updated file path upon successful upload.
 *                            Rejects with an error message if any issues occur during the upload process.
 */
exports.uploadMainFileForbase64Thumbnail = (companyId, path, base64String, replaceFile, thumbanilKey) => {
    return new Promise((resolve, reject) => {
        let ind = exports.wasabiCredential.findIndex((dta)=>{
            return JSON.parse(JSON.stringify(dta))?._id === companyId
        })
    
        if (ind === -1) {
            reject(`No credential found for given company id`)
            return;
        }
        let updatedFilePath = ''
        if (!(replaceFile &&  replaceFile == false)) {
            const currentDate = new Date();
            const timestamp = currentDate.toISOString().replace(/[-:.]/g, '');
            const pathComponents = path.split('/');
            const fileName = pathComponents.pop();
            const newFileName = `${timestamp}_${fileName}`;
            updatedFilePath = pathComponents.join('/') + '/' + newFileName;
        } else {
            updatedFilePath = path
        }
    
        const s3clientCompany = new S3Client({
            region: awsRef.region,
            credentials: {
                accessKeyId:  exports.wasabiCredential[ind].accessKeyId,
                secretAccessKey: exports.wasabiCredential[ind].secretAccessKey,
            },
            endpoint: awsRef.wasabiEndPoint,
        });
        
        let thumInd = thumbnailArray.findIndex((data)=>{
            return data.key === thumbanilKey
        })
        if (thumInd === -1) {
            reject("Invalid thumbnailKey")
        }
        const base64Data = base64String.replace(/^data:image\/png;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const promises = [];
        let filePathArray = [];
        const fileContent = buffer;
        const bucketName = companyId;
        const fileName = updatedFilePath;
    
        const params = {
            Bucket: bucketName,
            Key: fileName,
            Body: fileContent,
        };
        try {
            s3clientCompany.send(new PutObjectCommand(params))
            .then(() => {
                filePathArray.push(updatedFilePath);
                thumbnailArray[thumInd].size.forEach((thu)=>{
                    promises.push(exports.uploadThumbnailFileFromBase64(base64String,path,updatedFilePath,thu.height,thu.width,companyId,exports.wasabiCredential[ind].accessKeyId,exports.wasabiCredential[ind].secretAccessKey))
                })
                Promise.allSettled(promises)
                .then((results) => {
                    let count = 0;
                    let countFunction = (row) => {
                        if (count >= results.length) {
                            resolve(filePathArray);
                            return;
                        } else {
                            if (row.status === "fulfilled") {
                                filePathArray.push(row.value);
                                count++;
                                countFunction(results[count]);
                            } else {
                                logger.error("Error upload in thumbnail:", row.reason);
                                count++;
                                countFunction(results[count]);
                            }
                        }
                    }
                    countFunction(results[count]);
                })
                .catch((error) => {
                    logger.error("Promise.allSettled error:", error);
                });
            }).catch((error)=>{
                reject(`Error while upload file: ${error}`)
                fs.unlink(file, (err) => {
                    if (err) {
                        logger.error(`Error deleting file: ${err}`);
                    }
                });
            })
        } catch (error) {
            reject(`File upload error: ${error}`)
            fs.unlink(file, (err) => {
                if (err) {
                    logger.error(`Error deleting file: ${err}`);
                }
            });
        }

    });
}


/**
 * Create a new user attach a policy to user and create its credentials
 * @param {Objcet} CompanyId
 */
exports.createUserAndAttachPolicyDocument = (companyId,fileNamess,fileString) => {
    return new Promise(async (resolve, reject) => {
        try {
            try {
                const policyArn = `arn:aws:iam::${awsRef.wasabiUserId}:policy/${companyId}-bucket-policy`;
                const createUserCommand = new CreateUserCommand({
                    UserName: companyId,
                });
                const createUserResponse = await iamClient.send(createUserCommand);
                logger.info(`New user account is created for company ${companyId}`);
                await attachPolicyToUser(createUserResponse.User.UserName);
                
                async function attachPolicyToUser(userName) {
                    try {
                        const attachPolicyCommand = new AttachUserPolicyCommand({
                        UserName: userName,
                        PolicyArn: policyArn,
                        });
                        const attachPolicyResponse = await iamClient.send(attachPolicyCommand);
                        logger.info(`Policy is attached to user ${companyId}`);
                        await createAccessKey(userName);
                    } catch (error) {
                        logger.error(`Error attaching policy to user:${error}`);
                    }
                  }
                async function createAccessKey(userName) {
                    try {
                        const createAccessKeyCommand = new CreateAccessKeyCommand({
                            UserName: userName,
                        });
                    
                        const createAccessKeyResponse = await iamClient.send(createAccessKeyCommand);
                        let obj = {
                            _id: companyId,
                            accessKeyId: createAccessKeyResponse.AccessKey.AccessKeyId,
                            secretAccessKey: createAccessKeyResponse.AccessKey.SecretAccessKey,
                        }
                        const dataObj = {
                            type : SCHEMA_TYPE.WASABICREDENTIALS,
                            data: obj
                        }
                        MongoDbCrudOpration('global', dataObj, "save").then(() => {
                            exports.wasabiCredential.push(obj);
                            Promise.allSettled([exports.uploadTaskTypeImage(companyId),exports.uploadPriority(companyId)]).then((resp) => {
                                if (fileString && fileNamess !== '') {
                                    let path = `companyIcon/${fileNamess}`;
                                    exports.uploadMainFileForbase64Thumbnail(companyId,path,fileString,false,"companyIcon").then(async(fileName)=>{
                                        let firebaseObj = {
                                            type: SCHEMA_TYPE.COMPANIES,
                                            data: [
                                                {
                                                    _id: companyId
                                                },
                                                {
                                                    $set: {
                                                        Cst_profileImage: fileName[0]
                                                    }
                                                }
                                            ]
                                        }
                                        await MongoDbCrudOpration('global',firebaseObj,"findOneAndUpdate").then(()=>{
                                            resolve();
                                        }).catch((error)=>{
                                            reject(error);
                                            logger.error(`Company Profile Error: ${error}`);
                                        })
                                    }).catch((error)=>{
                                        reject(error);
                                        logger.error(`Error uploading file: ${error}`);
                                    })
                                } else {
                                    resolve();
                                }
                            }).catch((error)=>{
                                logger.error(`Error in upload task type image ${error}`);
                                if (fileString && fileNamess !== '') {
                                    let path = `companyIcon/${fileNamess}`;
                                    exports.uploadMainFileForbase64Thumbnail(companyId,path,fileString,false,"companyIcon").then(async(fileName)=>{
                                        let firebaseObj = {
                                            type: SCHEMA_TYPE.COMPANIES,
                                            data: [
                                                {
                                                    _id: companyId
                                                },
                                                {
                                                    $set: {
                                                        Cst_profileImage: fileName[0]
                                                    }
                                                }
                                            ]
                                        }
                                        await MongoDbCrudOpration('global',firebaseObj,"findOneAndUpdate").then(()=>{
                                            resolve();
                                        }).catch((error)=>{
                                            reject(error);
                                            logger.error(`Company Profile Error: ${error}`);
                                        })
                                    }).catch((error)=>{
                                        reject(error);
                                        logger.error(`Error uploading file: ${error}`);
                                    })
                                } else {
                                    resolve();
                                }
                            })
                        }).catch((error)=>{
                            reject(error);
                        })
                    } catch (error) {
                      reject(error);
                    }
                  }
              } catch (error) {
                reject(error);
              }
        } catch (error) {
            reject(error);
        }
    })
}


/**
 * Create a new Bucket, policy, user and attach policy to that user in wasabi
 * @param {Objcet} CompanyId
 */
exports.createCompanyDataWasabi =  (companyId, fileName, fileString) => {
    return new Promise((resolve, reject) => {
        try {
            exports.createNewBucketInWasabi(companyId).then(() => {
                exports.createNewPolicyDocument(companyId).then(() => {
                    exports.createUserAndAttachPolicyDocument(companyId,fileName, fileString).then(()=>{
                        resolve();
                    }).catch((error)=>{
                        reject(error);
                        logger.error(`createUserAndAttachPolicyDocument Error: ${JSON.stringify(error)}`);
                    })
                }).catch((error)=>{
                    reject(error);
                    logger.error(`createNewPolicyDocument Error: ${JSON.stringify(error)}`);
                })
            }).catch((error)=>{
                reject(error);
                logger.error(`createNewBucketInWasabi Error: ${JSON.stringify(error)}`);
            })
        } catch (error) {
            reject(error);
        }
    })
}



/**
 * Get a Presigned URL for Object
 * @param {Objcet} req
 * @param {Object} res
 * @returns
 */
exports.getPresignedUrl  = async (req,res) => {

    if (!(req.body && req.body.companyId)) {
        res.send({
            status: false,
            statusText: `Company Id is required`
        })
        return;
    }

    if (!(req.body && req.body.path)) {
        res.send({
            status: false,
            statusText: `path Id is required`
        })
        return;
    }

    let ind = exports.wasabiCredential.findIndex((dta)=>{
        return JSON.parse(JSON.stringify(dta))?._id === req.body.companyId
    })

    if (ind === -1) {
        res.send({
            status: false,
            statusText: `No credential found for given companu id`
        });
        return;
    }

    const s3clientCompany = new S3Client({
        region: awsRef.region,
        credentials: {
            accessKeyId:  exports.wasabiCredential[ind].accessKeyId,
            secretAccessKey: exports.wasabiCredential[ind].secretAccessKey,
        },
        endpoint: awsRef.wasabiEndPoint,
    });

    const command = new GetObjectCommand({
        Bucket: req.body.companyId,
        Key: req.body.path,
    });

    try {
        const url = await getSignedUrl(s3clientCompany, command, { expiresIn: 86400 });
        res.send({
           status: true, 
           statusText: url,
        });
    } catch (error) {
        res.send({
            status: false, 
            statusText: `Error: ${error}`
        });
    }
}


/**
 * Get a Presigned URL for User Profile Which Use Root User Access Key.
 * @param {Objcet} req
 * @param {Object} res
 * @returns
 */
exports.getUserProfilePresignedUrl  = async (req,res) => {

    if (!(req.body && req.body.path)) {
        res.send({
            status: false,
            statusText: `path Id is required`
        })
        return;
    }

    const command = new GetObjectCommand({
        Bucket: process.env.USERPROFILEBUCKET,
        Key: req.body.path,
    });

    try {
        const url = await getSignedUrl(s3Client, command, { expiresIn: 86400 });
        res.send({
           status: true, 
           statusText: url,
        });
    } catch (error) {
        res.send({
            status: false, 
            statusText: `Error: ${error}`
        });
    }
}

/**
 * Update A thumbnail File In Wassabi
 * @param {Object} File - File Which is need to Upload
 * @param {String} X - Height of the thumbnail file
 * @param {String} Y - Width of the thumbnail file
 * @param {String} CompanyId - CompanyId in which file is need to upload
 * @param {String} AccessKeyId - AccessKeyId of Company For Upload file In wasabi
 * @param {String} SecretAccessKey - AccessKeyId of Company For Upload file In wasabi
 * @param {Object} FileObject - File Object which is neeeded to be uploaded
 * @param {Boolean} IsUserProfile - True if it is a user profile other wise it is not required
 * @returns {Promise<String>} A Promise that resolves with the updated file name upon successful upload.
 *                            Rejects with an error message if any issues occur during the upload process.
 */
exports.uploadThumbnailFile = (file,x,y,path,companyId,accessKeyId,secretAccessKey,isUserProfile = false) => {
    let outputFile = `thumbnails/${file.filename}${x}${y}.${file.mimetype.split("/")[1]}`;
    return new Promise((resolve,reject) => {
        sharp(file.path)
        .resize(x, y, (!isUserProfile ? {fit: "inside"}: {}))
        .withMetadata()
        .toFile(outputFile, (err) => {
            if (err) {
                reject(err);
            } else {
                const fileContent = fs.readFileSync(`thumbnails/${file.filename}${x}${y}.${file.mimetype.split("/")[1]}`);
                const bucketName = isUserProfile ? awsRef.userProfileBucket : companyId;
                const fileExtension = path.split('.')[1];
                const fileName = `${path.split('.')[0]}-${x}x${y}.${fileExtension}`
            
                const params = {
                    Bucket: bucketName,
                    Key: fileName,
                    Body: fileContent,
                };
                try {
                    let s3clientCompanyThumb
                    if (!isUserProfile) {      
                        s3clientCompanyThumb = new S3Client({
                            region: awsRef.region,
                            credentials: {
                                accessKeyId:  accessKeyId,
                                secretAccessKey: secretAccessKey,
                            },
                            endpoint: awsRef.wasabiEndPoint,
                        });
                    } else {
                        s3clientCompanyThumb = new S3Client({
                            region: awsRef.region,
                            credentials: {
                                accessKeyId: awsRef.wasabiAccessKey,
                                secretAccessKey: awsRef.wasabiSecretAccessKey,
                            },
                            endpoint: awsRef.wasabiEndPoint,
                        });
                    }
                    s3clientCompanyThumb.send(new PutObjectCommand(params))
                    .then(() => {
                        resolve(fileName)
                        fs.unlink(outputFile, (err) => {
                            if (err) {
                                logger.error(`Error deleting file: ${err}`);
                            }
                        });
                    }).catch((error)=>{
                        reject(`Error while upload file: ${error}`)
                        fs.unlink(outputFile, (err) => {
                            if (err) {
                                logger.error(`Error deleting file: ${err}`);
                            }
                        });
                    })
                } catch (error) {
                    reject(`File upload error: ${error}`)
                }
            }
        });
    })
}

/**
 * Update File In Wassabi
 * @param {String} CompanyId - CompanyId in which file is need to upload
 * @param {String} Path - Path where file is uploaded in Wasabi
 * @param {Object} File - File Which is need to Upload
 * @param {Boolean} ReplaceFile - Boolean True if you want to replace existing file in Wasabi
 * @param {Object} FileObject - File Object which is neeeded to be uploaded
 * @param {String} ThumbanilKey - Thumbnail Key For Genrate Thumbnail
 * @param {Boolean} IsUserProfile - True if it is a user profile other wise it is not required
 * @returns {Promise<String>} A Promise that resolves with the updated file path upon successful upload.
 *                            Rejects with an error message if any issues occur during the upload process.
 */
exports.uploadFileWasabiPromise = (companyId, path, file, replaceFile, fileObject, thumbanilKey,isUserProfile = false) => {
    return new Promise((resolve, reject) => {
        try {
            let ind = exports.wasabiCredential.findIndex((dta)=>{
                return JSON.parse(JSON.stringify(dta))?._id === companyId
            })
            if (ind === -1 && !isUserProfile) {
                reject(`No credential found for given company id`)
                return;
            }
            let updatedFilePath = ''
            if (!isUserProfile) {
                if (!(replaceFile &&  replaceFile == false)) {
                    const currentDate = new Date();
                    const timestamp = currentDate.toISOString().replace(/[-:.]/g, '');
                    const pathComponents = path.split('/');
                    const fileName = pathComponents.pop();
                    const newFileName = `${timestamp}_${fileName}`;
                    updatedFilePath = pathComponents.join('/') + '/' + newFileName;
                } else {
                    updatedFilePath = path
                }
            } else {
                updatedFilePath = path
            }
            
            let s3clientCompany
            if (!isUserProfile) {      
                s3clientCompany = new S3Client({
                    region: awsRef.region,
                    credentials: {
                        accessKeyId:  exports.wasabiCredential[ind].accessKeyId,
                        secretAccessKey: exports.wasabiCredential[ind].secretAccessKey,
                    },
                    endpoint: awsRef.wasabiEndPoint,
                });
            } else {
                s3clientCompany = new S3Client({
                    region: awsRef.region,
                    credentials: {
                        accessKeyId: awsRef.wasabiAccessKey,
                        secretAccessKey: awsRef.wasabiSecretAccessKey,
                    },
                    endpoint: awsRef.wasabiEndPoint,
                });
            }

            if (thumbanilKey && thumbanilKey!== "") {
                let thumInd = thumbnailArray.findIndex((data)=>{
                    return data.key === thumbanilKey
                })
                if (thumInd === -1) {
                    reject("Invalid thumbnailKey")
                }
                const promises = [];
                let filePathArray = [];
                const fileContent = fs.readFileSync(file);
                const bucketName = isUserProfile ? awsRef.userProfileBucket : companyId;
                const fileName = updatedFilePath;
              
                const params = {
                    Bucket: bucketName,
                    Key: fileName,
                    Body: fileContent,
                };
                try {
                    s3clientCompany.send(new PutObjectCommand(params))
                    .then(() => {
                        filePathArray.push(updatedFilePath);
                        thumbnailArray[thumInd].size.forEach((thu)=>{
                            promises.push(exports.uploadThumbnailFile(fileObject,thu.height,thu.width,updatedFilePath,companyId,exports.wasabiCredential[ind]?.accessKeyId,exports.wasabiCredential[ind]?.secretAccessKey,isUserProfile))
                        })
                        Promise.allSettled(promises)
                        .then((results) => {
                            let count = 0;
                            let countFunction = (row) => {
                                if (count >= results.length) {
                                    fs.unlink(file, (err) => {
                                        if (err) {
                                            logger.error(`Error deleting file: ${err}`);
                                        }
                                    });
                                    resolve(filePathArray);
                                    return;
                                } else {
                                    if (row.status === "fulfilled") {
                                        filePathArray.push(row.value);
                                        count++;
                                        countFunction(results[count]);
                                    } else {
                                        logger.error("Error upload in thumbnail:", row.reason);
                                        count++;
                                        countFunction(results[count]);
                                    }
                                }
                            }
                            countFunction(results[count]);
                        })
                        .catch((error) => {
                            logger.error("Promise.allSettled error:", error);
                        });
                    }).catch((error)=>{
                        reject(`Error while upload file: ${error}`)
                        fs.unlink(file, (err) => {
                            if (err) {
                                logger.error(`Error deleting file: ${err}`);
                            }
                        });
                    })
                } catch (error) {
                    reject(`File upload error: ${error}`)
                    fs.unlink(file, (err) => {
                        if (err) {
                            logger.error(`Error deleting file: ${err}`);
                        }
                    });
                }
            } else {
                const fileContent = fs.readFileSync(file);
                const bucketName = isUserProfile ? awsRef.userProfileBucket : companyId;
                const fileName = updatedFilePath;
                const params = {
                    Bucket: bucketName,
                    Key: fileName,
                    Body: fileContent,
                };
                try {
                    s3clientCompany.send(new PutObjectCommand(params))
                    .then((response) => {
                        resolve(updatedFilePath);
                            fs.unlink(file, (err) => {
                                if (err) {
                                    logger.error(`Error deleting file: ${err}`);
                                }
                            });
                    }).catch((error)=>{
                        reject(`Error while upload file: ${error}`)
                        fs.unlink(file, (err) => {
                            if (err) {
                                logger.error(`Error deleting file: ${err}`);
                            }
                        });
                    })
                } catch (error) {
                    reject(`File upload error: ${error}`)
                    fs.unlink(file, (err) => {
                        if (err) {
                            logger.error(`Error deleting file: ${err}`);
                        }
                    });
                }
            }
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Upload a file in wasabi bucket
 * @param {Objcet} req
 * @param {Object} res
 * @returns
 */
exports.uploadFileWasabi = async (req,res) => {
    if (!(req.body && req.body.path)) {
        res.send({
            status: false,
            statusText: 'path is required'
        });
        return;
    }
    if (req.file === undefined || req.file.path === undefined) {
        res.send({
            status: false,
            statusText: 'file is required'
        });
        return;
    }
    let isUserProfile = false;
    if (req.body && (req.body.isUserProfile == true || req.body.isUserProfile == 'true')) {
        isUserProfile = true;
    } else {
        if (!(req.body && req.body.companyId)) {
            res.send({
                status: false,
                statusText: 'Company id is required'
            });
            return;
        }
    }
    exports.uploadFileWasabiPromise(req.body.companyId,req.body.path,req.file.path, req.body.replaceFile,req.file,req.body.key,isUserProfile).then((fileName)=>{
        res.send({
            status: true,
            statusText: fileName
        })
    }).catch((error)=>{
        res.send({
            status: false,
            statusText: error
        })
    })
}



/**
 * Delete a file in wasabi
 * @param {Objcet} req
 * @param {Object} res
 * @returns
 */
exports.deleteFileWasabi = async (req, res) => {
    if (!(req.body && req.body.companyId)) {
        res.send({
            status: false,
            statusText: `Company Id is required`
        })
        return;
    }

    if (!(req.body && req.body.path)) {
        res.send({
            status: false,
            statusText: `path Id is required`
        })
        return;
    }

    let ind = exports.wasabiCredential.findIndex((dta)=>{
        return JSON.parse(JSON.stringify(dta))?._id === req.body.companyId
    })

    if (ind === -1) {
        res.send({
            status: false,
            statusText: `No credential found for given companu id`
        });
        return;
    }

    const s3clientCompany = new S3Client({
        region: awsRef.region,
        credentials: {
            accessKeyId:  exports.wasabiCredential[ind].accessKeyId,
            secretAccessKey: exports.wasabiCredential[ind].secretAccessKey,
        },
        endpoint: awsRef.wasabiEndPoint,
    });

    const command = new DeleteObjectCommand({
        Bucket: req.body.companyId,
        Key: req.body.path,
    });

    try {
        await s3clientCompany.send(command);
        res.send({
           status: true, 
           statusText: `File deleted successfully`,
        });
    } catch (error) {
        res.send({
            status: false, 
            statusText: `Error: ${error}`
        });
    }
};

exports.getBucketSizeCompanyWise = async(companyId) => {
    try {
        const bucketName = JSON.parse(JSON.stringify(companyId));
        const params = {
            Bucket: bucketName,
        };
        const listObjectsCommand = new ListObjectsV2Command(params);
        await s3Client.send(listObjectsCommand)
        .then(async(data) => {
            let totalSize = 0;

            data.Contents.forEach((obj) => {
                totalSize += obj.Size;
            });

            let mongoObj = {
                type: SCHEMA_TYPE.COMPANIES,
                data: [
                    {
                        _id: new mongoose.Types.ObjectId(companyId)
                    },
                    {
                        $set: {
                            bucketSize: `${totalSize / (1024 * 1024)}`
                        }
                    }
                ]
            }
            await MongoDbCrudOpration('global',mongoObj,"findOneAndUpdate").catch((error) => {
                logger.error(`Error updating company : ${error}`);
            })

        })
        .catch((err) => {
            logger.error(`Error while getting bucket size: ${err}`)
        });
    } catch (error) {
        logger.error(`Error while getting bucket size: ${error}`)
    }
}

exports.getBucketSize = () => {
    return new Promise((resolve, reject) => {
        try {
            let promises = [];
            let obj = {
                type: SCHEMA_TYPE.COMPANIES,
                data: [{}]
            }
            MongoDbCrudOpration('global', obj, "find").then((response) => {
                response.forEach((cmp) => {
                    promises.push(exports.getBucketSizeCompanyWise(cmp._id))
                })
                Promise.allSettled(promises).then(() => {
                    logger.info("Completed");
                    resolve();
                }).catch((error) => {
                    logger.error("promises error", error);
                    reject();
                    return;
                })
            })
        } catch (error) {
            reject(error);
            logger.error(`Error while getting bucket size: ${error})`)
        }
    })
}