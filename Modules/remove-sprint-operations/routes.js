const ctrl = require('./controller');

exports.init = (app) => {

    /**
     * @swagger
    *  components:
    *    schemas:
    *      importSettings:
    *        type: object
    *        required:
    *          - projectId
    *          - companyId
    *          - isFolder
    *          - mainSprint
    *          - sprintId
    *          - folderId  
    *          - historyObject
    *          - notificationObject
    *          - updateObject
    *          - isTask
    *        properties:
    *         companyId:
    *           type: string
    *           required: true
    *           description: The company Id.
    *         projectId:
    *           type: string
    *           required: true
    *           description: The project Id.
    *         isFolder:
    *           type: boolean
    *           required: true
    *           description: To check Folder or not.
    *         sprintId:
    *           type: string
    *           required: false
    *           description: The sprint Id.
    *         folderId:
    *           type: string
    *           required: false
    *           description: The folder Id.
    *         mainSprint:
    *           type: boolean
    *           required: true
    *           description: To check sprint is main sprint or not.
    *         historyObject:
    *           type: object
    *           required: true
    *           description: The object to be inserted in history collection.
    *         notificationObject: 
    *           type: object
    *           required: true
    *           description: The object to be inserted in notification collection.
    *         updateObject:
    *           type: object
    *           required: true
    *           description: The object to be updated at index of folder, sprint or task.
    *         isTask:
    *           type: boolean
    *           required: false
    *           description: Specifies whether to perform operation on task, sprint or folder.
    *         taskId:
    *           type: string
    *           required: false
    *           description: The id of the task on which operation is performed.
 
     */
    /**
     * @swagger
     *  /api/v1/removeSprintOperations:
     *    post: 
     *      description: This API is used for Remove all sprints, folder and containing tasks.
     *      tags: [Remove Sprint And Folder APIs]
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/removeSprintOperations'
     *      responses:
     *          "200":
     *              description: status:true/false, statusText:message
     */

    // app.post('/api/v1/removeSprintOperations', ctrl.removeSprintOperations);
};