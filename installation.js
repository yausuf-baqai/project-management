const fs = require("fs");
const { exec } = require('child_process');
process.env = require('dotenv').config().parsed;


// Generate build for installation
function generateInstallationBuild() {
    const vueProjectDirectory = __dirname + '/installation';
    if (fs.existsSync(vueProjectDirectory)) {
        console.log("Start Generate Build in Installation");
        let buildCommand = "npm run build";
        if (process.platform === "linux") {
            buildCommand = 'PATH=$(which vue) && $PATH build';
        }
        // Change the current working directory to the Vue project directory
        process.chdir(vueProjectDirectory);
        // Generate production build
        exec(buildCommand, (buildError, buildStdout, buildStderr) => {
            if (buildError) {
                console.log(`Error Generate Build in Installation: ${buildError}`);
                return;
            }
            console.log("End Generate Build in Installation");
            console.log("All Steps is Done");
        });
    } else {
        console.log("All Steps is Done");
    }
};


// Generate Installation ENV
function generateInstallationEnv() {
    const filePath = __dirname + '/installation/.env';
    if (fs.existsSync(__dirname + '/installation')) {
        let data = `VUE_APP_APIURL="${process.env.APIURL.substring(0, process.env.APIURL.length - 1)}"`;
        fs.writeFile(filePath, data, (err, data) => {
            if (err) {
                console.log("Error Generate Installation ENV", err);
            }
            generateInstallationBuild();
        })
    } else {
        generateInstallationBuild();
    }
};

generateInstallationEnv();
