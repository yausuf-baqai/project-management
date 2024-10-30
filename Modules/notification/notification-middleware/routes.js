
require("./controllerV2");
const {emailCronHandler}  = require("./cron-controller");
exports.init = (app) => {
    
    /**
    * @swagger
    *  components:
    *    schemas:
    *      email-cron-handler:
    *        type: object
    *        required:
    *          - companyId
    *          - key
    *          - projectId
    *          - message
    *          - userId
    *        properties:
    *         companyId:
    *           type: string
    *           required: false
    *           description: This is the dcoument id of selected company.
    *         key:
    *           type: string
    *           required: false
    *           description: This is the type of notification like project or tasks.
    *         message:
    *           type: string
    *           required: false
    *           description: This is the message for the notification.
    *         projectId:
    *           type: string
    *           required: false
    *           description: This is the project ID of notification.
    *         userId:
    *           type: string
    *           required: false
    *           description: This is the user id of user collections.
    */
      /**
     * @swagger
     *  /api/v2/email-cron-handler:
     *    post: 
     *      description: This API is used to email notification ap per receiver.
     *      tags: [Notifications]
     *      summary: Send Email Notification
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/email-cron-handler'
     *      responses:
     *          "200":
     *              description: status:true/false,message:message
     */

    app.post('/api/v2/email-cron-handler',emailCronHandler);
};