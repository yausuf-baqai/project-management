const { requestWithDigestAuth } = require('../../serviceFunction');


/**
 * User Add
 * @param {Object} data 
 * @param {Object} cb 
 * @returns 
 */
exports.useradd = async (data, cb) => {
    const request_url = `${process.env.MONGO_CLOUD_URL}/atlas/v2/groups/${data.projectId}/databaseUsers`;
    const url = request_url; // Replace with your MongoDB API endpoint
    const username = data.publicKey;
    const password = data.privateKey;
    const passObject = {
        "awsIAMType": "NONE",
        "databaseName": data.userdatabase,
        "groupId": data.projectId,
        "roles": [
            {
                "databaseName": "admin",
                "roleName": "atlasAdmin"
            }
        ],
        "scopes": [],
        "username": data.username,
        "password": data.userpassword
    }
    const response = await requestWithDigestAuth(url, username, password, "POST", passObject);

    if (response) {
        if (response?.data) {
            cb({
                status: true,
                data: response.data
            });
            return;
        }
        cb({
            status: false,
            error: "Password is not update. Please try again"
        });
    } else {
        cb({
            status: false,
            error: "Something Went to wrong."
        });
    }
};
