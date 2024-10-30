const fs = require("fs");
const path = require("path");
const logger = require("../../../Config/loggerConfig");

exports.getlogo = (req, res) => {
    try {
        const rootPath = '../../../public/images/';
        let fileName = "";
        let folderName = "web-logo/";
        let folderFullPath = __dirname + "/" + rootPath + folderName;
        let queryData = req.query;
        if (!(req.query && req.query.key)) {
            queryData.key = "logo";
            queryData.type = "admin";
        }

        if (queryData.key === "logo" && queryData.type === "admin") {
            folderName = "admin-logo/"
            folderFullPath = __dirname + "/" + rootPath + folderName;
        }

        if (queryData.key === "logo" && queryData.type === "web") {
            folderName = "web-logo/"
            folderFullPath = __dirname + "/" + rootPath + folderName;
        }
        if (queryData.key === "logo" && queryData.type === "desktop") {
            folderName = "desktop-logo/"
            folderFullPath = __dirname + "/" + rootPath + folderName;
        }
        
        if (queryData.key === "favicon") {
            folderName = "favicon/"
            folderFullPath = __dirname + "/" + rootPath + folderName;
        }
        fs.readdir(folderFullPath, (err, files) => {
            files.forEach(file => {
                fileName = file || "";
            });
            const filePath = rootPath + folderName + fileName;
            res.sendFile(path.join(__dirname, filePath));
        });

    } catch (error) {
        console.log("error", error);
        res.send("Not Set Logo");
    }
};

exports.makeDefaultBrandSettings = () => {
    return new Promise((resolve, reject) => {
        try {
            let defaultJsonAlianHub = {
                "productName": "Alian Hub",
                // "productDescription": "Welcome to User Guide of all-in-one project management system - Alian Hub. You will find detailed instructions, steps and helpful hints for your queries here. From getting started by creating your first project to ensuring that your team has access to all of the resources they need, checking the status of the project and successfully completing the tasks. This user guide will lead you across anything you need to learn and understand. You can view the details of every query through the sections of this user guide.",
                "termsOfService": "https://alianhub.com/terms-and-conditions/",
                "privacyPolicy": "https://alianhub.com/privacy-policy/",
                "helpLink":"https://help.alianhub.com/"
            };
            const filePath = path.join(__dirname, '/../../../' , 'brandSettings.json');
            if (!fs.existsSync(filePath)) {
                fs.writeFile(filePath, JSON.stringify(defaultJsonAlianHub, null, 2), (err) => {
                    if (err) {
                        logger.error('Error writing file getBrandSettingsData:', err);
                        reject(error)
                    } else {
                        resolve(defaultJsonAlianHub);
                    }
                });
            } else {
                reject("File already exists")
            }
        } catch (error) {
            reject(error)
        }
    })
}

exports.getBrandSettingsData = (req, res) => {
    try {
        const filePath = path.join(__dirname,'/../../../', 'brandSettings.json');

        if (!fs.existsSync(filePath)) {
            exports.makeDefaultBrandSettings()
            .then((data) => {
                res.status(200).json(JSON.parse(data));
            })
            .catch((error) => {
                res.status(404).send(error);
            })
        } else {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    logger.error('Error writing file getBrandSettingsData:', err);
                    return res.status(500).send('Internal Server Error');
                }
                res.status(200).json(JSON.parse(data));
            });
        }
    } catch (error) {
        res.status(404).send(error);
    }
}