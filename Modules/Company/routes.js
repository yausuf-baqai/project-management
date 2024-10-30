// IMPORTANT NOTE: 

// IF YOU HAVE CHANGES IN THIS FILE, PLEASE VERIFY THE CHANGES BECAUSE THIS FILE IS CONNECTED TO THE PAYMENT MODULE.
// AND YOUR CHANGES ARE REQUIRED. ALSO ADD YOUR CHANGES TO THE 'CHARGEBEE-SETUP' AND 'PADDLE-SETUP' FOLDER.

const ctrl = require('./controller');
const multer = require("multer");
const { handleEvents } = require('./eventController');

const upload = multer({ dest: "wasabiUploads/" });
exports.init = (app) => {

	/**
    * @swagger
    *  components:
    *    schemas:
    *      create:
    *        type: object
    *        required:
    *          - userId
    *          - companyName
    *          - phoneNumber
    *          - country
    *          - city
    *          - state
    *          - countryCodeObj
    *          - logtimeDays
    *          - totalProjects
    *          - isInactive
    *          - isFree
    *          - subscriptionData
    *          - totalData                                                                
    *        properties:
    *         userId:
    *           type: string
    *           required: true
    *           description: The id of user.
    *         companyName:
    *           type: string
    *           required: true
    *           description: The name of company
    *         phoneNumber:
    *           type: string
    *           required: true
    *           description:  The phoneNumber of company.
    *         country:
    *           type: string
    *           required: true
    *           description:  The country of the company.
    *         city:
    *           type: string
    *           required: true
    *           description:  The city of the company.
    *         state:
    *           type: string
    *           required: true
    *           description:  The state of the company.
    *         countryCodeObj:
    *           type: object
    *           required: true
    *           description:  The countryCodeObj of the company.
    *         logtimeDays:
    *           type: number
    *           required: true
    *           description:  How many days of logtime can be added to the company.
    *         totalProjects:
    *           type: number
    *           required: true
    *           description:  The number of active project by default it is 0.
	*         isInactive:
    *           type: boolean
    *           required: true
    *           description: If company is active or not.
	*         isFree:
    *           type: boolean
    *           required: true
    *           description: If it is free company by default it is true.
	*         subscriptionData:
    *           type: object
    *           required: true
    *           description: The subscription data object.
	*         totalData:
    *           type: object
    *           required: true
    *           description: The totalData data object.
    *         file:
    *           type: string
    *           required: false
    *           format: binary
    *           description: The company Icon.
    *         fileName:
    *           type: string
    *           required: false
    *           description: The company Icon Name.
    */           
    /**
     * @swagger
     *  /api/v1/company/create:
     *    post: 
     *      description: This API is used to create a company and create a bucket policy and user for that company in wasabi.
     *      tags: [Company]
     *      summary: Create a company
     *      requestBody:
     *        required: true
     *        content:
     *          multipart/form-data:
     *            schema:
     *              $ref: '#/components/schemas/create'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message
     */

   	/**
     * Create a new Company and Add company In wasabi.
     */
	app.post("/api/v1/company/create",upload.single("file") ,ctrl.createCompany);

    	/**
    * @swagger
    *  components:
    *    schemas:
    *      createV2:
    *        type: object
    *        required:
    *          - userId
    *          - companyName
    *          - phoneNumber
    *          - country
    *          - city
    *          - state
    *          - countryCodeObj
    *          - logtimeDays
    *          - totalProjects
    *          - isInactive
    *          - isFree
    *          - subscriptionData
    *          - totalData                                                                
    *        properties:
    *         userId:
    *           type: string
    *           required: true
    *           description: The id of user.
    *         companyName:
    *           type: string
    *           required: true
    *           description: The name of company
    *         phoneNumber:
    *           type: string
    *           required: true
    *           description:  The phoneNumber of company.
    *         country:
    *           type: string
    *           required: true
    *           description:  The country of the company.
    *         city:
    *           type: string
    *           required: true
    *           description:  The city of the company.
    *         state:
    *           type: string
    *           required: true
    *           description:  The state of the company.
    *         countryCodeObj:
    *           type: object
    *           required: true
    *           description:  The countryCodeObj of the company.
    *         logtimeDays:
    *           type: number
    *           required: true
    *           description:  How many days of logtime can be added to the company.
    *         totalProjects:
    *           type: number
    *           required: true
    *           description:  The number of active project by default it is 0.
	*         isInactive:
    *           type: boolean
    *           required: true
    *           description: If company is active or not.
	*         isFree:
    *           type: boolean
    *           required: true
    *           description: If it is free company by default it is true.
	*         subscriptionData:
    *           type: object
    *           required: true
    *           description: The subscription data object.
	*         totalData:
    *           type: object
    *           required: true
    *           description: The totalData data object.
    *         file:
    *           type: string
    *           required: false
    *           format: binary
    *           description: The company Icon.
    *         fileName:
    *           type: string
    *           required: false
    *           description: The company Icon Name.
    */           
    /**
     * @swagger
     *  /api/v2/company/create:
     *    post: 
     *      description: This API is used to create a company and create a bucket policy and user for that company in wasabi.
     *      tags: [Company]
     *      summary: Create a company
     *      requestBody:
     *        required: true
     *        content:
     *          multipart/form-data:
     *            schema:
     *              $ref: '#/components/schemas/createV2'
     *      responses:
     *          "200":
     *              description: status:true/false,statusText:message
     */

   	/**
     * Create a new Company and Add company In wasabi.
     */
	app.post("/api/v2/company/create", upload.single("file"), ctrl.createCompanyV2);
	app.post("/api/v2/company/createAdmin", upload.single("file"), ctrl.createCompanyFromAdmin);
	app.post("/api/v2/company/delete", ctrl.deleteCompany);
    // 
    app.get('/company-create/events/:id', (req, res) => {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        handleEvents(req, res)
    });

}