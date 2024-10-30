const logger = require("../Config/loggerConfig");
const fs = require("fs");
const axios = require('axios');
const crypto = require('crypto');


/**
 * [description]
 * @param  {[type]} data   [description]
 * @param  {[type]} itemCB [description]
 * @param  {[type]} doneCB [description]
 * @return {[type]}        [description]
 */
exports.customParaller = (data, itemCB, doneCB) => {
    if (!(data && data.length)) {
        doneCB();
        return;
    }

    const dataR = JSON.parse(JSON.stringify(data));
    const responseData = [];
    let responseCount = 0;

    const happyTit = (dryFruitD) => {
        responseData.push(dryFruitD);
        if (responseCount >= dataR.length - 1) {
            doneCB(responseData);
            return;
        }
        responseCount += 1;
    };

    for (let k = 0; k < dataR.length; k += 1) {
        itemCB(dataR[k], (rd) => {
            happyTit(rd);
        });
    }
};


/**
 * [description]
 * @param  {[type]}   data         [description]
 * @param  {[type]}   loopCallback [description]
 * @param  {Function} done         [description]
 * @return {[type]}                [description]
 */
exports.customWaterfall = (data, loopCallback, done) => {
    if (!(data && data.length)) {
        done();
        return;
    }

    // data = JSON.parse(JSON.stringify(data));

    let loopCount = 0;
    const loop = () => {
        if (loopCount >= data.length) {
            done();
            return;
        }
        loopCallback(data[loopCount], () => {
            loopCount += 1;
            loop();
        });
    };
    loop();
};


/**
 * Resolves a series of promise factories, retrying if needed.
 *
 * @param {number} maxTryCount How many retries to perform.
 * @param {Array<() => Promise<any>>} promiseFactories Functions
 *     that return promises. These must be functions to enable retrying.
 * @return Corresponding Promise.allSettled values.
 */
exports.allSettledWithRetry = async (maxTryCount, promiseFactories) => {
    let results;
    for (let retry = 0; retry < maxTryCount; retry++) {
      let promiseArray;
      if (results) {
        // This is a retry; fold in results and new promises.
        promiseArray = results.map(
            (x, index) => x.status === "fulfilled"
              ? x.value
              : promiseFactories[index]())
      } else {
        // This is the first run; use promiseFactories only.
        promiseArray = promiseFactories.map(x => x());
      }
      results = await Promise.allSettled(promiseArray);
      // Avoid unnecessary loops, though they'd be inexpensive.
      if (results.every(x => x.status === "fulfilled")) {
        return results;
      }
    }
    return results;
};

exports.writeFile = (path, data, cb) => {
    try {
        fs.writeFile(path, data, (err, wData) => {
            if (err) {
                logger.error(`File Create Issue: ${path} : Error: ${err}`);
                cb({
                    status: false,
                    error: err
                });
                return;
            }
            cb({
                status: true,
                data: wData
            });
        })
    } catch (error) {
        logger.error(`File Create Issue: ${path} : Error: ${error}`);
        cb({
            status: false,
            error
        });
    }
}

exports.requestWithDigestAuth = async (url, username, password, method = 'GET', data = null) => {
    const axiosInstance = axios.create();
    let response;

    try {
        // Initial request to get the nonce and other authentication headers
        response = await axiosInstance({
            method,
            url,
            validateStatus: function (status) {
                return status === 401; // Accept only 401 Unauthorized for the first request
            }
        });
    } catch (error) {
        console.error('Error during initial request:', error);
        return;
    }

    const authHeader = response.headers['www-authenticate'];
    const authDetails = parseDigestAuth(authHeader);

    const ha1 = crypto.createHash('md5').update(`${username}:${authDetails.realm}:${password}`).digest('hex');
    const ha2 = crypto.createHash('md5').update(`${method}:${authDetails.uri}`).digest('hex');
    const responseDigest = crypto.createHash('md5').update(`${ha1}:${authDetails.nonce}:00000001:${authDetails.cnonce}:${authDetails.qop}:${ha2}`).digest('hex');

    const authHeaderValue = `Digest username="${username}", realm="${authDetails.realm}", nonce="${authDetails.nonce}", uri="${authDetails.uri}", qop=${authDetails.qop}, nc=00000001, cnonce="${authDetails.cnonce}", response="${responseDigest}", opaque="${authDetails.opaque}"`;

    // Make the actual request with the Digest Authentication header
    try {
        response = await axiosInstance({
            method,
            url,
            headers: {
                'Accept': 'application/vnd.atlas.2023-02-01+json',
                'Authorization': authHeaderValue
            },
            data
        });
    } catch (error) {
        response = error?.response?.data || {errorCode: "Something went to wrong"};
        console.error('Error during authenticated request:', error.response.data);
        return response;
    }

    return response;
}

function parseDigestAuth(header) {
    const authDetails = {};
    const parts = header.split(', ');

    parts.forEach(part => {
        const [key, value] = part.split('=');
        authDetails[key] = value.replace(/"/g, '');
    });

    authDetails.uri = '/path'; // Replace with your actual URI
    authDetails.cnonce = crypto.randomBytes(16).toString('hex');
    authDetails.qop = 'auth';

    return authDetails;
}