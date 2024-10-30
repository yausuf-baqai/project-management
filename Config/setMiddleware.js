const jwt = require('./jwt');
const verifyJWTTokenWithCRoute = [
    "/api/v1/verifyToken",
    "/api/v1/createproject",
    "/api/v1/importSettings",
    // "/api/v1/manualLogtime",
    // "/api/v1/deleteManualLogtime",
    // "/api/v1/timetracker/end",
    // "/api/v1/timetracker/capture",
    // "/api/v1/timeTracker/start",
    "/api/v2/manualLogtime",
    "/api/v2/deleteManualLogtime",
    "/api/v2/timeTracker/start",
    "/api/v2/timetracker/end",
    "/api/v2/timetracker/capture",
    "/api/v2/timetracker/timelog",
    "/api/v1/addmilestone",
    "/api/v1/updatemilestone",
    "/api/v1/deletemilestone",
    "/api/v1/clearmilestonestatus",
    "/api/v1/cancelmilestonestatus",
    "/api/v1/refundamount",
    "/api/v1/draggablemilestone",
    "/api/v1/updateunreadcommentscount",
    "/api/v1/sendNotification",
    "/api/v1/handleHistory",
    "/api/v1/handleNotification",
    "/api/v1/prepare-notification-data",
    "/api/v1/get-tasks",
    "/api/v1/projectSetting/taskType",
    "/api/v1/projectSetting/taskStatus",
    // "/api/v1/removeSprintOperations",
    "/api/v1/sprint",
    "/api/v1/sprint/:id",
    "/api/v1/folder",
    "/api/v1/folder/:id",
    "/api/v1/taskIndex",
    "/api/v1/updateTaskIndexOnload",
    "/api/tasks",
    "/api/v2/tasks",
    "/api/v1/wasabi/retriveObject",
    "/api/v1/wasabi/deleteFile",
    "/api/v1/removeUserNotification",
    "/api/v1/importSettingsProjectFunction",
    "/api/v2/getCardDetails",
    "/api/v2/createCustomerChargbee",
    '/api/v2/createPaymnetSourceChargebee',
    '/api/v2/createSubscriptionChargebee',
    '/api/v1/getInvoiceAndCreditNotes',
    '/api/v1/updateCardForSubscription',
    '/api/v1/updateSubscriptionPayment',
    '/api/v2/updateSubscriptionChargebeeEstimate',
    '/api/v1/addAndRemoveUserInChargebeeSubscription',
    '/api/v1/addAndRemoveUserInPaymentSubscriptionEstimate',
    'api/v1/checkSendInviatation',
    '/api/v1/checkSubscriptionSchedule',
    '/api/v1/removeSubscriptionScheduledChanges',
    '/api/v1/getSubscription',
    '/api/v1/payPendingInvoice',
    '/api/v1/getInvoiceAndCreditNoteURL',
    '/api/v2/company/delete',
    '/api/v2/addDefaultSubscriptionFun'
];
const verifyJWTToken = [
    "/api/v1/company/create",
    "/api/v2/company/create",
    "/api/v1/wasabi/retriveUserProfile",
    "/api/v1/wasabi/uploadFile",
    "/api/v1/createPaymentPlan",
    "/api/v1/getSubscriptionPaymentResource/:id",
    "/api/v1/getSubscriptionTransection/:id",
    "/api/v1/getEnv",
    "/api/v1/userStatusUpdate",
    "/api/v1/userAndCompanyCheck"
];


/**
 * Middleware With CompanyId
 * @param {*} app 
 */
exports.setMiddlewareWithC = (app) => {
    app.use(verifyJWTTokenWithCRoute, jwt.verifyJWTTokenWithC)
};


/**
 * Middleware
 * @param {*} app 
 */
exports.setMiddleware = (app) => {
    app.use(verifyJWTToken, jwt.verifyJWTToken)
};
