// IMPORTANT NOTE: 

// IF YOU HAVE CHANGES IN THIS FILE, PLEASE VERIFY THE CHANGES BECAUSE THIS FILE IS CONNECTED TO THE PAYMENT MODULE.
// AND YOUR CHANGES ARE REQUIRED. ALSO ADD YOUR CHANGES TO THE 'CHARGEBEE-SETUP' AND 'PADDLE-SETUP' FOLDER.

const express = require("express");
const fs = require("fs");
var cors = require('cors');
const path = require('path');
let swaggerJsdoc = require("swagger-jsdoc");
let swaggerUi = require("swagger-ui-express");
const bodyParser = require("body-parser");
const config =  require('./Config/config.js');
const awsRef =  require('./Config/aws.js');
const logger = require("./Config/loggerConfig");
const { DateTime } = require("luxon");
const { readUpdate } = require("./utils/FB_Track.js");
const { makeDefaultBrandSettings } = require("./Modules/Admin/common/controller.js");

makeDefaultBrandSettings()
.catch((error) => {
    console.log("makeDefaultBrandSettings: ", error);
});
function initializeControllers() {
    const envFile = fs.readFileSync(__dirname + "/.env");
    const envConfig = require('dotenv').parse(envFile);
    envConfig.PORT = Number(envConfig.PORT);
    envConfig.NOOFPRESETCOMPANY = Number(envConfig.NOOFPRESETCOMPANY);
    for (const key in envConfig) {
        process.env[key] = envConfig[key];
        if (key === "APIKEY" || key === "AUTODOMAIN" || key === "PROJECTID" || key === "STORAGEBUCKET" || key === "MESSAGINGSENDERID" || key === "APPID" || key === "MEASUREMENTID") {
            config["FIREBASE_"+key] = envConfig[key];
        } else {
            config[key] = envConfig[key];
            if (key === "WASABI_ACCESS_KEY") {
                awsRef.wasabiAccessKey = envConfig["WASABI_ACCESS_KEY"];
            } else if (key === "WASABI_SECRET_ACCESS_KEY") {
                awsRef.wasabiSecretAccessKey = envConfig["WASABI_SECRET_ACCESS_KEY"];
            } else if (key === "WASABIENDPOINT") {
                awsRef.wasabiEndPoint = envConfig["WASABIENDPOINT"];
            } else if (key === "WASABI_REGION") {
                awsRef.region = envConfig["WASABI_REGION"];
            } else if (key === "IAM_ENDPOINT") {
                awsRef.iamEndPoint = envConfig["IAM_ENDPOINT"];
            } else if (key === "USERPROFILEBUCKET") {
                awsRef.userProfileBucket = envConfig["USERPROFILEBUCKET"];
            } else if (key === "WASABI_USERID") {
                awsRef.wasabiUserId = envConfig["WASABI_USERID"];
            }
        }
    }
    // require('dotenv').config();
    // config =  require('./Config/config.js');
    // const expandedConfig = dotenvExpand({ parsed: envConfig });
    const { startInterval } = require("./middlewares/mongoConnector/helper.js");
    startInterval();
    const { setWasabiCredential } = require("./Modules/wasabi/controller.js");
    setWasabiCredential()
    //IMPORT CUSTOM FILES
    require('./Modules/auth/init').init(app);
    // require('./Modules/notification/init').init(app);
    require('./Modules/notification1/init').init(app);
    require('./Modules/import_settings/init').init(app);
    // 
    require('./Modules/remove-sprint-operations/init').init(app);
    require('./Modules/tasks/init.js').init(app);
    require('./Modules/sprints/init.js').init(app);
    require('./Modules/logTime/init.js').init(app);
    require('./Modules/milestone/init.js').init(app);
    require('./Modules/wasabi/init.js').init(app);
    require('./Modules/Company/init.js').init(app);
    require('./Modules/notification/notification-middleware/init').init(app);
    require('./Modules/notification/prepare-notification-data/init').init(app);
    require('./Modules/projectSetting/init').init(app);
    require('./Modules/taskIndex/init').init(app);
    require('./Modules/createProject/init.js').init(app);
    require('./Modules/notification-count/init').init(app);
    require('./Modules/notification/sendEmail/init').init(app);
    require('./Modules/trackerUserPermission/init').init(app);
    require('./Modules/checkinstallstep/init').init(app);
    require('./Modules/SaasAdmin/init').init(app);
    require('./cron.js')
    require('./Modules/Admin/admin.js').init(app);
    require('./Modules/emailTemplate/init').init(app);
    require('./Modules/email-notification/init').init(app);
    require('./Modules/AI/init').init(app);
    require('./Modules/usersModule/init').init(app);
}

// FIRES EVENT WHEN THE ENV IS UPDATED
fs.watchFile(__dirname+'/.env', () => {
    initializeControllers();
})

const app = express();

app.use(cors())

app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.raw({limit: '50mb'}));
app.use(express.static(path.join(__dirname, './frontend/dist')));
app.use(express.static(path.join(__dirname, './installation/dist')));
// startInterval();

logger.info(`>>>>>>>>>>> process.env.NODE_ENV >>>>>>>>>>> ${JSON.stringify(process.env.NODE_ENV)}`);

//CONFIGURE ENV FILE
require('dotenv').config();

if (process.env.CANYONLICENSEKEY) {
    initializeControllers();
}
/*
* For used .env file variable like this
* process.env.YOUR_VARIABLE_NAME
*/

//SET MIDDLEWARE
require('./Config/setMiddleware.js').setMiddlewareWithC(app);
require('./Config/setMiddleware.js').setMiddleware(app);
const { connections } = require("./middlewares/mongoConnector/helper.js");


require('./Modules/checkinstallstep/init').init(app);

// session.sessionSnapShotFunction();
/**
 * Swagger API document configuration
 */
 const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "AlianHub APIs",
            version: "v1"
        },
        servers: [
            {
                url: config.APIURL,
            },
        ],
    },
    apis: [
        "./Modules/auth/routes.js",
        "./Modules/auth/routes2.js",
        "./Modules/notification1/routes.js",
        "./Modules/import_settings/routes.js",
        "./Modules/chargebee/routes2.js",
        "./Modules/remove-sprint-operations/routes.js",
        "./Modules/logTime/routes.js",
        "./Modules/milestone/routes.js",
        "./Modules/wasabi/routes.js",
        "./Modules/Company/routes.js",
        './Modules/notification/prepare-notification-data/routes.js',
        "./Modules/notification/notification-middleware/routes.js",
        "./Modules/projectSetting/routes.js",
        "./Modules/taskIndex/routes.js",
        "./Modules/createProject/routes.js",
        "./Modules/notification-count/routes.js",
        "./Modules/trackerUserPermission/routes.js",
        "./Modules/SaasAdmin/routes.js",
    ]
};

const specs = swaggerJsdoc(swaggerOptions);
app.use(
    "/apidocs",
    swaggerUi.serve,
    swaggerUi.setup(specs)
);


//FOR CHECK SERVER RUNNING OR NOT
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, './frontend/dist/index.html'));
});

// FOR INSTALLATION CODE CANYON
app.get("/api/v1/install", (req, res) => {
    res.sendFile(path.join(__dirname, './installation/dist/index.html'));
});

//FOR CHECK SERVER RUNNING OR NOT
app.get("/health", (req, res) => {
    res.send("Server is running in "+config.NODE_ENV);
});

app.get("/api/v1/getTime", (req, res) => {
    if(!req.query?.zone) {
        res.send("No zone specified");
    } else {
        res.send(DateTime.now().setZone(req.query.zone));
    }
});

app.patch("/api/v1/addTrack", (req, res) => {
    try {
        const {path = null, size = null} = req.body
        if(path === null) {
            res.send({status: false, statusText: "Please provide a path"})
            return;
        } else if(size === null) {
            res.send({status: false, statusText: "Please provide a size"})
            return;
        }

        readUpdate(req.body)
        .then(() => {
            res.send({status: true, statusText: "Updated"});
        })
        .catch((error) => {
            logger.error(`ERROR in update TRACK: ${error.message}`)
            res.send({status: false, statusText: error.message})
        })
    } catch(error) {
        logger.error(`ERROR in update TRACK: ${error.message}`)
        res.send({status: false, statusText: error.message})
    }
})
// setWasabiCredential();

// create Defult Folder
const folderPaths = [
    `${__dirname}/wasabiUploads`,
    `${__dirname}/invoiceAndCreditNotes`,
    `${__dirname}/thumbnails`
];

for (let i = 0; i < folderPaths.length; i += 1) {
    if (!fs.existsSync(folderPaths[i])){
        fs.mkdirSync(folderPaths[i]);
    }
}

//SERVER LISTEN PORT
app.listen(config.PORT, () => {
    console.log("Server ready on "+config.PORT)
});

app.get("/api/v1/getEmailTemplates", (req, res) => {
    res.send({verifyEmail: require("./Modules/Template/sendEmailVerification.js")('${link}','','${brandName}'),resetEmail: require("./Modules/Template/forgotPassword.js")('${email}', '${link}','${brandName}'), invitationEamil: require("./Modules/Template/sendEmailInvitation.js")('${link}','${companyName}','${brandName}')});
});

fs.watch(__dirname + "/Modules/Template/", (event_type, file_name) => {
    try {
        delete require.cache[require.resolve(__dirname + "/Modules/Template/" + file_name)];;
    } catch (error) {
        console.error("ERROR in remove cache", error);
    }
});

app.get("/connections/:id", (req, res) => {
    if (req.params && req.params.id && req.params.id === config.PRECOMPANYKEY) {
        const connectionsJSON = connections.map((x) => ({
            db: x.db,
            createdAt: new Date(x.createdAt),
            lastRequest: new Date(x.lastRequest)
        }))
        res.json({data: connectionsJSON, total: connectionsJSON.length});
    } else {
        res.send('Unauthorized');
    }
})