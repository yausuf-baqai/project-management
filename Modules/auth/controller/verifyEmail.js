
const mongoRef = require('../../../utils/mongo-handler/mongoQueries');
/**
 * 
 * @param {Object} req 
 * @param {Object} res 
 * @returns 
 */
exports.verifyEmail = (req , res) => {
    try {
        if(!req.body.uid || req.body.uid === '') {
            res.send({
                status: false,
                statusText: "uid is required."
            });
            return;
        }

        if(!req.body.token || req.body.token === '') {
            res.send({
                status: false,
                statusText: "token is required."
            });
            return;
        }

        // db.collection(dbCollections.USERS).doc(req.body.uid).get().then(doc => {
        //     const tokenTime = new Date(doc.data().verificationTokenTime.seconds*1000);
        //     const ValidTime = new Date(tokenTime.setMinutes(tokenTime.getMinutes() + 10));

        //     if (!doc.exists) {
        //         res.send({
        //             status: false, 
        //             statusText:'Couldn’t find your Account',
        //             showResendVerification: false
        //         });
        //         return;
        //     } else if (doc.data().isEmailVerified === true) {

        //         db.collection(dbCollections.USERS).doc(req.body.uid).update({
        //             verificationToken: ""
        //         }).then(() => {
        //             res.send({
        //                 status: false,
        //                 alreadyVarified: true,
        //                 statusText: 'Your email is already verified',
        //                 showResendVerification: false
        //             });
        //             return;
        //         }).catch((error) => {
        //             logger.error(`Verifiy email Update User Error: ${error.messge}`);
        //             res.send({
        //                 status: false, 
        //                 statusText:error.message
        //             });  
        //         })
        //     } else if( ValidTime < new Date() ) {
        //         res.send({
        //             status: false,
        //             email: doc.data().Employee_Email,
        //             statusText: 'This link is expired',
        //             showResendVerification: true
        //         });
        //         return;
        //     } else if ( doc.data().verificationToken == req.body.token ) {
        //         admin.auth().updateUser(req.body.uid, {
        //             emailVerified: true
        //         })
        //         .then(() => {
        //             db.collection(dbCollections.USERS).doc(req.body.uid).update({
        //                 isEmailVerified: true,
        //                 verificationToken: "",
        //                 updatedAt: new Date()
        //             })
        //             .then(() => {
        //                 res.send({
        //                     status: true, 
        //                     statusText:'Email verified successfully.',
        //                     showResendVerification: false
        //                 });
        //                 return;
        //             })
        //             .catch(error => {
        //                 logger.error(`Verifiy Email Update User Error: ${error.messge}`);
        //                 res.send({
        //                     status: false, 
        //                     statusText: error.message
        //                 });
        //             });
        //         })
        //         .catch(error => {
        //             logger.error(`Verifiy Email Auth Update User Error: ${error.messge}`);
        //             res.send({
        //                 status: false,
        //                 statusText: error.message
        //             });
        //         })
        //     } else if (doc.data().verificationToken !==  "" && doc.data().verificationToken !== req.body.token) {
        //         res.send({
        //             status: false, 
        //             statusText: 'This link has expired',
        //             showResendVerification: true,
        //             email: doc.data().Employee_Email
        //         });
        //         return;
        //     }
        // })
        // .catch(error => {
        //     logger.error(`Verifiy Email Get User Error: ${error.messge}`);
        //     res.send({
        //         status: false, 
        //         statusText: error.message
        //     });
        // })
        let obj = {
            type: 'users',
            data: [
                {
                    _id: req.body.uid
                },
            ]
        }
        mongoRef.MongoDbCrudOpration("global",obj,"findOne").then((response)=>{
            if (response && response !== null) {          
                const tokenTime = new Date(response.verificationTokenTime);
                const ValidTime = new Date(tokenTime.setMinutes(tokenTime.getMinutes() + 10));
                if (response.isEmailVerified === true) {
                    let object = {
                        type: 'users',
                        data: [
                            {
                                _id: req.body.uid
                            },
                            {
                                $set: {
                                    verificationToken: ""
                                }
                            }
                        ]
                    }
                    mongoRef.MongoDbCrudOpration("global",object,"findOneAndUpdate").then(()=>{
                        res.send({
                            status: false,
                            alreadyVarified: true,
                            statusText: 'Your email is already verified',
                            showResendVerification: false
                        });
                        return;
                    }).catch((error)=>{
                        res.send({
                            status: false, 
                            statusText:error.message
                        });  
                    })
                } else if ((ValidTime < new Date()) || (response.verificationToken !==  "" && response.verificationToken !== req.body.token)) {
                    res.send({
                        status: false,
                        email: response.Employee_Email,
                        statusText: 'This link is expired',
                        showResendVerification: true
                    });
                    return;
                } else if (response.verificationToken == req.body.token) {
                    let object = {
                        type: 'users',
                        data: [
                            {
                                _id: req.body.uid
                            },
                            {
                                $set: {
                                    verificationToken: "",
                                    isEmailVerified: true
                                }
                            }
                        ]
                    }
                    mongoRef.MongoDbCrudOpration("global",object,"findOneAndUpdate").then(()=>{
                        res.send({
                            status: true, 
                            statusText:'Email verified successfully.',
                            showResendVerification: false
                        });
                        return;
                    }).catch((error)=>{
                        res.send({
                            status: false, 
                            statusText:error.message
                        });  
                    })
                }   
            } else {
                res.send({
                    status: false, 
                    statusText:'Couldn’t find your Account',
                    showResendVerification: false
                });
                return;
            }
        }).catch((error)=>{
            res.send({
                status: false,
                statusText: error
            })
        })
    } catch(error) {
        res.send({
            status: false,
            statusText: error.message
        });
    }
};