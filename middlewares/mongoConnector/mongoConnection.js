const { checkConnectionExists, createConnection, updateConnectionRecord, connections } = require("./helper");

const requestedDbs = []
function removeFromArray(db) {
    if(requestedDbs.includes(db)) {
        const index = requestedDbs.findIndex(x => x === db)
        requestedDbs.splice(index, 1);
    }
}

exports.handleConnection = async (companyId) => {
    return new Promise((resolve, reject) => {
        try {
            const db = companyId
            if (!db) {
                reject({ status: false, statusText: "No db included" });
            }

            let locals;

            if(requestedDbs.includes(db)) {
                // console.log("INCLUDES REQUEST");
                let reCheck = 0
                const interval = setInterval(() => {
                    if(reCheck >= 30) {
                        // console.log("INTERVAL >> CONNECTION CREATE");
                        clearInterval(interval);
                        createConnection(db)
                        .then((conData) => {
                            // console.log("REQUESTED DB FOUND", db);
                            updateConnectionRecord(db, conData);
                            locals = conData.connection
                            resolve({ status: true, database: locals });
                        })
                        .catch((error) => {
                            // throw error;
                            // console.log("REQUESTED DB NOT FOUND", db);
                            removeFromArray(db)
                            reject({ status: false, statusText: error.message });
                        })

                        return;
                    }
                    reCheck++;
                    const connection = checkConnectionExists({ connections, db })
                    if(connection) {
                        // console.log("INTERVAL >> CONNECTION FOUND");
                        clearInterval(interval);
                        locals = connection.connection
                        removeFromArray(db)
                        resolve({ status: true, database: locals });
                    }
                }, 2000)
            } else {
                // console.log("PUSH REQUESTED DB: ", db);
                requestedDbs.push(db);

                if (connections.length) {
                    const connection = checkConnectionExists({ connections, db })
                    if (connection) {
                        updateConnectionRecord(db)
                        // console.log("REQUESTED DB FOUND", db);
                        // removeFromArray(db)
                        locals = connection.connection
                        resolve({ status: true, database: locals });
                    } else {
                        createConnection(db)
                            .then((conData) => {
                                // console.log("REQUESTED DB FOUND", db);
                                updateConnectionRecord(db, conData);
                                // removeFromArray(db)
                                locals = conData.connection
                                resolve({ status: true, database: locals });
                            })
                            .catch((error) => {
                                // throw error;
                                // removeFromArray(db)
                                // console.log("REQUESTED DB NOT FOUND", db);
                                reject({ status: false, statusText: error.message });
                            })
                    }
                } else {
                   createConnection(db)
                        .then((conData) => {
                            // removeFromArray(db)
                            // console.log("REQUESTED DB FOUND", db);
                            updateConnectionRecord(db, conData);
                            locals = conData.connection
                            resolve({ status: true, database: locals });
                        })
                        .catch((error) => {
                            // removeFromArray(db)
                            // console.log("REQUESTED DB NOT FOUND", db);
                            reject({ status: false, statusText: error.message });
                            // throw error;
                        })
                }
            }
        } catch (err) {
            reject(err);
        }
    })
}