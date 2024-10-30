const createUserCtrl = require("./controller/createUser");
const sendVerifcationCtrl = require("./controller/sendVerificationMail");
const verifyEmailCtrl = require("./controller/verifyEmail");
const sendForgotPasswordCtrl = require("./controller/sendForgotPasswordMail");
const mongoRef = require('../../utils/mongo-handler/mongoQueries');
const sendInvitationCtrl = require("./controller/sendInvitation");
const verifyInvitationCtrl = require("./controller/verifyInvitation");
const { replaceObjectKey } = require("./helper");
const logger = require('../../Config/loggerConfig');

exports.init = (app) => {
    /**
     * @swagger
    *  components:
    *    schemas:
    *      createUser:
    *        type: object
    *        required:
    *          - firstName
    *          - lastName
    *          - email
    *          - password
    *        properties:
    *         firstName:
    *           type: string
    *           required: true
    *           description: The firstname of user.
    *         lastName:
    *           type: string
    *           required: true
    *           description: The lastname of user.
    *         email:
    *           type: string
    *           required: true
    *           description: The email of user.
    *         password:
    *           type: string
    *           required: true
    *           description: The password of user.
    *         isInvitation:
    *           type: boolean
    *           required: true
    *           description: true if user is creat by companyInvite link or false.
     */
    /**
     * @swagger
     *  /api/v1/createUser:
     *    post: 
     *      description: This API is used for send email verication link.
     *      tags: [Mongodb Auth APIs]
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/createUser'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message
     */

    /**
     * Send Verification Mail API
     */
    app.post("/api/v1/createUser", createUserCtrl.createUser);
    /**
     * @swagger
    *  components:
    *    schemas:
    *      sendVerificationEmail:
    *        type: object
    *        required:
    *          - uid
    *          - email
    *        properties:
    *         uid:
    *           type: string
    *           required: true
    *           description: The uid of user.
    *         email:
    *           type: string
    *           required: true
    *           description: The email of user.
     */
    /**
     * @swagger
     *  /api/v2/sendVerificationEmail:
     *    post: 
     *      description: This API is used for send email verication link.
     *      tags: [Mongodb Auth APIs]
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/sendVerificationEmail'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message
     */

    /**
     * Send Verification Mail API
     */
    app.post("/api/v2/sendVerificationEmail", sendVerifcationCtrl.sendVerificationEmail);

    /**
     * @swagger
    *  components:
    *    schemas:
    *      verifyEmail:
    *        type: object
    *        required:
    *          - uid
    *          - token
    *        properties:
    *         uid:
    *           type: string
    *           required: true
    *           description: The uid of user.
    *         token:  
    *           type: string
    *           required: true
    *           description: The verification token.
     */           
    /**
     * @swagger
     *  /api/v2/verifyEmail:
     *    post: 
     *      description: This API is used for verify email.
     *      tags: [Mongodb Auth APIs]
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/verifyEmail'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message
     */

    /**
     *  Verify Mail API
     */
    app.post('/api/v2/verifyEmail', verifyEmailCtrl.verifyEmail);


     /**
     * @swagger
    *  components:
    *    schemas:
    *      sendForgotPasswordEmail:
    *        type: object
    *        required:
    *          - email
    *          - token
    *          - tokenId
    *        properties:
    *         email:
    *           type: string
    *           required: true
    *           description: The email of user.
    *         token:
    *           type: string
    *           required: true
    *           description: The realm token.
    *         tokenId:
    *           type: string
    *           required: true
    *           description: The realm tokenId.
    */
    /**
     * @swagger
     *  /api/v2/sendForgotPasswordEmail:
     *    post: 
     *      description: This API is used for resend email verication link if token expire.
     *      tags: [Mongodb Auth APIs]
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/sendForgotPasswordEmail'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message
     */

    /**
     *  Verify Mail API
     */
    app.post('/api/v2/sendForgotPasswordEmail', sendForgotPasswordCtrl.sendForgotPasswordEmail);


    /**
     * @swagger
    *  components:
    *    schemas:
    *      sendInvitationEmail:
    *        type: object
    *        required:
    *          - email
    *          - companyId
    *          - companyName
    *          - role
    *          - designation
    *        properties:
    *         email:
    *           type: string
    *           required: true
    *           description: The email of user.
    *         companyId:
    *           type: string
    *           required: true
    *           description: The inviting companyId.
    *         companyName:
    *           type: string
    *           required: true
    *           description: The inviting companyName.
    *         role:
    *           type: string
    *           required: true
    *           description: The provided role id.
    *         designation:
    *           type: string
    *           required: true
    *           description: This is the inviting user designation.
     */
    /**
     * @swagger
     *  /api/v2/sendInvitationEmail:
     *    post: 
     *      description: This API is used for send email invitation link.
     *      tags: [Mongodb Auth APIs]
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/sendInvitationEmail'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message
     */

    /**
     * Send Invitation Mail API
     */
    app.post('/api/v2/sendInvitationEmail', sendInvitationCtrl.sendInvitationEmail);
    app.post('/api/v1/checkSendInviatation', sendInvitationCtrl.checkSendInviatation);


    /**
     * @swagger
     *  components:
     *    schemas:
     *      checkPermission:
     *            type: object
     *            required: 
     *              -key
     *            properties:
     *              key:
     *               type: string
     *               required: true
     *               description: decrypted.
     */
     /**
     * @swagger 
     *  /api/v2/checkPermission:
     *    post: 
     *      description: This API is check user invitation link is valid or not
     *      tags: [Auth APIs]
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/checkPermission'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message,key
     */
     app.post('/api/v2/checkPermission', verifyInvitationCtrl.checkPermission);


    
    /**
     * @swagger
    *  components:
    *    schemas:
    *      mongoOpration:
    *        type: object
    *        required:
    *          - dataObj
    *          - dbName
    *          - methodName
    *        properties:
    *         dataObj:
    *           type: object
    *           required: true
    *           description: The data object which contain type and data keys for mongodb curd opretion.
    *         dbName:
    *           type: string
    *           required: true
    *           description: The name of database.
    *         methodName:
    *           type: string
    *           required: true
    *           description: The name of method of mongodb.
     */
    /**
     * @swagger
     *  /api/v1/mongoOpration:
     *    post: 
     *      description: This API is used for send email invitation link.
     *      tags: [Mongodb Auth APIs]
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/mongoOpration'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message
     */

    /**
     * Mongo db curd operation API
     */
    app.post("/api/v1/mongoOpration", (req,res)=>{
        if (!(req.body && req.body.dataObj)) {
            res.send({
                status: false,
                statusText: `DataObject is missing`
            })
            return;
        }
        if (!(req.body && req.body.dbName)) {
            res.send({
                status: false,
                statusText: `dbName is missing`
            })
            return;
        }
        if (!(req.body && req.body.methodName)) {
            res.send({
                status: false,
                statusText: `methodName is missing`
            })
            return;
        }
        if (!(req.body && req.body.collection)) {
            res.send({
                status: false,
                statusText: `collection is missing`
            })
            return;
        }

        mongoRef.MongoDbCrudOpration(req.body.dbName,{type: req.body.collection , data: replaceObjectKey(req.body.dataObj, "objId")},req.body.methodName).then((response)=>{
            res.send({
                status: true, 
                statusText: response
            })
        }).catch((error)=>{
            logger.error(`ERR: in request ${req.body.collection} ${req.body.methodName} > ${error?.message ? error.message : error}`);
            res.send({
                status: false,
                statusText: error
            })
        })
    })


    app.post("/api/v1/generateToken", createUserCtrl.generateToken);
    app.post('/api/v1/verifyToken', createUserCtrl.verifyToken);
}