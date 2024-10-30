const { requestWithDigestAuth } = require('../../serviceFunction');

exports.addNetwork = async (data, cb) => {
    const request_url = `${process.env.MONGO_CLOUD_URL}/atlas/v2/groups/${data.projectId}/accessList`;
    const url = request_url; // Replace with your MongoDB API endpoint
    const username = data.publicKey;
    const password = data.privateKey;
    const reqData = [
        {
            "cidrBlock": "0.0.0.0/0",
            "comment": "Allow all IP addresses"
        }
    ]
    const response = await requestWithDigestAuth(url, username, password, "POST", reqData);
    
    if (response) {
        if (response?.data?.results?.length) {
            const accessNetwork = response.data.results.find((x) => x.cidrBlock === "0.0.0.0/0");
            if (accessNetwork && Object.keys(accessNetwork).length) {
                cb({
                    status: true,
                    data: response.data,
                    key: "New Added"
                });
                return;
            }
            // Add Code Here
            cb({
                status: false,
                error: "Something Want to wrong. Network IP is not add"
            });
            return;
        }
        // Add Code Here
        cb({
            status: false,
            error: "Something Want to wrong. Network IP is not add"
        });
    } else {
        cb({
            status: false,
            error: "Something Went to wrong."
        });
    }
}
/**
 * Mongo Network Get and Add
 * @param {Object} data 
 * @param {Object} cb 
 */
exports.mongonetworkgetandadd = async (data, cb) => {
    const request_url = `${process.env.MONGO_CLOUD_URL}/atlas/v2/groups/${data.projectId}/accessList`;
    const url = request_url; // Replace with your MongoDB API endpoint
    const username = data.publicKey;
    const password = data.privateKey;
    const response = await requestWithDigestAuth(url, username, password);

    if (response) {
        if (response?.data?.results?.length) {
            const accessNetwork = response.data.results.find((x) => x.cidrBlock === "0.0.0.0/0");
            if (accessNetwork && Object.keys(accessNetwork).length) {
                cb({
                    status: true,
                    data: response.data,
                    key: "Already Added"
                });
                return;
            }
            // Add Code Here
            exports.addNetwork(data, (resData) => {
                cb(resData);
            })
            return;
        }
        // Add Code Here
        exports.addNetwork(data, (resData) => {
            cb(resData);
        })
    } else {
        cb({
            status: false,
            error: "Something Went to wrong."
        });
    }
};
