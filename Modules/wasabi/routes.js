const ctrl = require('./controller');
const multer = require("multer");


const upload = multer({ dest: "wasabiUploads/" });
exports.init = (app) => {

    /**
    * @swagger
    *  components:
    *    schemas:
    *      retriveObject:
    *        type: object
    *        required:
    *          - companyId
    *          - path
    *        properties:
    *         companyId:
    *           type: string
    *           required: true
    *           description: The companyId.
    *         path:
    *           type: string
    *           required: true
    *           description: The path of file.
    */           
    /**
     * @swagger
     *  /api/v1/wasabi/retriveObject:
     *    post: 
     *      description: This API is used to get the sharing url of the object.
     *      tags: [Wasabi]
     *      summary: Retrive an object from the Bucket
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/retriveObject'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message
     */

    /**
     * get presigned url of the wasabi object
     */
	app.post("/api/v1/wasabi/retriveObject", ctrl.getPresignedUrl);


     /**
    * @swagger
    *  components:
    *    schemas:
    *      retriveUserProfile:
    *        type: object
    *        required:
    *          - path
    *        properties:
    *         path:
    *           type: string
    *           required: true
    *           description: The path of file.
    */           
    /**
     * @swagger
     *  /api/v1/wasabi/retriveUserProfile:
     *    post: 
     *      description: This API is used to get the sharing url of the UserProfile.
     *      tags: [Wasabi]
     *      summary: Retrive an User Profile from the Bucket
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/retriveUserProfile'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message
     */

    /**
     * get presigned url of the userProffileObject
     */
    app.post("/api/v1/wasabi/retriveUserProfile",ctrl.getUserProfilePresignedUrl)
	
	/**
    * @swagger
    *  components:
    *    schemas:
    *      uploadFile:
    *        type: object
    *        required:
    *          - path
    *          - file
    *        properties:
    *         companyId:
    *           type: string
    *           required: false
    *           description: The companyId.
    *         path:
    *           type: string
    *           required: true
    *           description: The path of file.
    *         replaceFile:
    *           type: boolean
    *           required: false
    *           description: Set true if you want to replace same name file in wasabi Other wise this parameter is not required.
    *         file:
    *           type: string
    *           required: true
    *           format: binary
    *           description: File which is bieng to upload in wasabi.
    *         isUserProfile:
    *           type: boolean
    *           required: false
    *           description: true if it is userProfile outherwise not required.
    *         key:
    *           type: string
    *           required: false
    *           description: if you want to genrate thumbnail then pass thumbnail string.
    */           
    /**
     * @swagger
     *  /api/v1/wasabi/uploadFile:
     *    post: 
     *      description: This API is used to upload an object to the Bucket (File is required with companyid and file path).
     *      tags: [Wasabi]
     *      summary: Upload an object to the Bucket
     *      requestBody:
     *        required: true
     *        content:
     *          multipart/form-data:
     *            schema:
     *              $ref: '#/components/schemas/uploadFile'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message
     */

    /**
     * upload file in wasabi.
     */
	app.post("/api/v1/wasabi/uploadFile",upload.single("file"), ctrl.uploadFileWasabi);


	/**
    * @swagger
    *  components:
    *    schemas:
    *      deleteFile:
    *        type: object
    *        required:
    *          - companyId
    *          - path
    *        properties:
    *         companyId:
    *           type: string
    *           required: true
    *           description: The companyId.
    *         path:
    *           type: string
    *           required: true
    *           description: The path of file.
    */           
    /**
     * @swagger
     *  /api/v1/wasabi/deleteFile:
     *    post: 
     *      description: This API is used to delete the object from the bucket.
     *      tags: [Wasabi]
     *      summary: Delete the object from the Bucket
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/deleteFile'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message
     */

    /**
     * delete file from wasabi api.
     */
	app.post("/api/v1/wasabi/deleteFile", ctrl.deleteFileWasabi);
}