const { requestWithDigestAuth, allSettledWithRetry } = require('../../serviceFunction');


/**
 * Mongo Cluster Get
 * @param {Object} data 
 * @param {Object} cb 
 */
exports.mongoclusterget = async (data, cb) => {
    const request_url = `${process.env.MONGO_CLOUD_URL}/atlas/v2/groups/${data.projectId}/clusters`;
    const url = request_url; // Replace with your MongoDB API endpoint
    const username = data.publicKey;
    const password = data.privateKey;

    const response = await requestWithDigestAuth(url, username, password);

    if (response) {
        cb({
            status: true,
            data: response.data
        });
    } else {
        cb({
            status: false,
            error: "Something Went to wrong."
        });
    }
};


/**
 * Mongo Cluster Regions Get
 * @param {Object} data 
 * @param {Object} cb 
 */
exports.mongoclusterregionsget = async (data, cb) => {
    const request_url = `${process.env.MONGO_CLOUD_URL}/atlas/v2/groups/${data.projectId}/clusters/provider/regions?providers=AWS&tier=M0`;
    const url = request_url; // Replace with your MongoDB API endpoint
    const username = data.publicKey;
    const password = data.privateKey;

    const response = await requestWithDigestAuth(url, username, password);

    if (response) {
        if (response?.data?.results?.length) {
            cb({
                status: true,
                data: response?.data?.results[0]?.instanceSizes[0]?.availableRegions || []
            });
        } else {
            cb({
                status: true,
                data: []
            });
        }
    } else {
        cb({
            status: false,
            error: "Something Went to wrong."
        });
    }
};


/**
 * Mongo Single Cluster Get
 * @param {Object} data 
 * @param {Object} cb 
 */
exports.mongosingleclusterget = async (data, cb) => {
    const request_url = `${process.env.MONGO_CLOUD_URL}/atlas/v2/groups/${data.projectId}/clusters/${data.clusterName}`;
    const url = request_url; // Replace with your MongoDB API endpoint
    const username = data.publicKey;
    const password = data.privateKey;

    const response = await requestWithDigestAuth(url, username, password);
    if (response?.errorCode) {
        cb({
            status: false,
            error: response.detail || "Something went to wrong"
        });
    } else {
        if (response?.data) {
            cb({
                status: true,
                data: response?.data
            });
        } else {
            cb({
                status: false,
                error: "Cluster information is not get. Please try again"
            });
        }
    }
};


exports.checkClusterStatus = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const request_url = `${process.env.MONGO_CLOUD_URL}/atlas/v2/groups/${data.projectId}/clusters/${data.clusterName}/status`;
            const url = request_url; // Replace with your MongoDB API endpoint
            const username = data.publicKey;
            const password = data.privateKey;

            const response = await requestWithDigestAuth(url, username, password);
            if (response?.errorCode) {
                setTimeout(() => {
                    reject({
                        status: false
                    });
                }, 3000);
            } else {
                if (response?.data?.changeStatus === "APPLIED") {
                    setTimeout(() => {
                        resolve({
                            status: true
                        });
                    }, 3000);
                } else {
                    setTimeout(() => {
                        reject({
                            status: false
                        });
                    }, 3000);
                }
            }
        } catch (error) {
            setTimeout(() => {
                reject({
                    status: false
                });
            }, 3000)
        }
    })
}

exports.addnewcluster = async (data, cb) => {
    const request_url = `${process.env.MONGO_CLOUD_URL}/atlas/v2/groups/${data.projectId}/clusters`;
    const url = request_url; // Replace with your MongoDB API endpoint
    const username = data.publicKey;
    const password = data.privateKey;
    const passObject = {
        "name": data.clusterName,
        "clusterType": "REPLICASET",
        "replicationSpecs": [{
            "regionConfigs": [{
                "electableSpecs": {
                    "instanceSize": "M0"
                },
                "backingProviderName": "AWS",
                "priority": 7,
                "providerName": "TENANT",
                "regionName": data.clusterRegion
            }]
        }]
    }
    const response = await requestWithDigestAuth(url, username, password, "POST", passObject);
    if (response?.errorCode) {
        if (response.errorCode === "CANNOT_CREATE_FREE_CLUSTER_VIA_PUBLIC_API") {
            cb({
                status: false,
                error: "A free cluster has already been used by you. Kindly pick the above cluster or create a new one in Mongodb."
            });
        } else {
            cb({
                status: false,
                error: response.detail || "Something went to wrong"
            });
        }
    } else {
        if (response?.data) {

            const allProcess = [
                () => exports.checkClusterStatus(data),
            ]
            allSettledWithRetry(60, allProcess)
            .then((allSettledRes) => {
                if (allSettledRes[0].status === "fulfilled") {
                    exports.mongosingleclusterget(data, (singleClusterRes) => {
                        cb(singleClusterRes);
                    })
                } else {
                    cb({
                        status: false,
                        error: "Cluster is not created"
                    });
                }
            }).catch((error) => {
                cb({
                    status: false,
                    error: "Cluster is not created"
                });
            })
        } else {
            cb({
                status: false,
                error: "Cluster is not create. Please try again"
            });
        }
    }
};
