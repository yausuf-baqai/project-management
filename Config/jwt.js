const jwt = require('jsonwebtoken');
const logger = require("./loggerConfig");


/**
 * generate JWT auth token
 * @param {Object} obj 
 * @returns 
 */
const generateJWTToken = (obj) => {
    const companyIds = [...obj.companyIds];
    delete obj.companyIds;
    logger.info(`companyIds ${companyIds.join(',')}`);
    return jwt.sign({...obj}, process.env.JWT_SECRET, {
        audience: companyIds.join(','),
        algorithm: process.env.JWT_ALGORITHM,
        expiresIn: process.env.JWT_EXP,
    });
};


/**
 * Verify JWT Auth token is valid or not
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @returns 
 */
const verifyJWTTokenWithC = (req, res, next) => {
    try {
        let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
        const companyId = req.headers['companyid'] || "";
        if (!companyId) {
            return res.status(401).json({
                status: false,
                error: 'Company id is required',
                statusText: 'Unauthorized',
                isJwtError: true
            });
        }
        if (token) {
            if (token.startsWith('Bearer ')) {
                // Remove Bearer from string
                token = token.slice(7, token.length);
            }
            const generateRegex = new RegExp(companyId, '');
            const isValid = jwt.verify(token, process.env.JWT_SECRET, {audience: generateRegex});
            if (isValid) {
                next();
            } else {
                // Access Denied
                return res.status(401).json({
                    status: false,
                    error: 'Token has expired',
                    statusText: 'Token has expired',
                    isJwtError: true
                });
            }
        } else {
            return res.status(401).json({
                status: false,
                error: 'Unauthorized',
                statusText: 'Unauthorized',
                isJwtError: true
            });
        }
    }
    catch (error) {
        return res.status(401).json({
            status: false,
            error: error.message,
            statusText: 'Unauthorized',
            isJwtError: true
        });
    }
}


const verifyJWTToken = (req, res, next) => {
    try {
        let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase

        if (token) {
            if (token.startsWith('Bearer ')) {
                // Remove Bearer from string
                token = token.slice(7, token.length);
            }
            const isValid = jwt.verify(token, process.env.JWT_SECRET);
            if (isValid) {
                next();
            } else {
                // Access Denied
                return res.status(401).json({
                    status: false,
                    error: 'Token has expired',
                    statusText: 'Token has expired',
                    isJwtError: true
                });
            }
        } else {
            return res.status(401).json({
                status: false,
                error: 'Unauthorized',
                statusText: 'Unauthorized',
                isJwtError: true
            });
        }
    }
    catch (error) {
        return res.status(401).json({
            status: false,
            error: error.message,
            statusText: 'Unauthorized',
            isJwtError: true
        });
    }
}


module.exports = {
    generateJWTToken: generateJWTToken,
    verifyJWTTokenWithC: verifyJWTTokenWithC,
    verifyJWTToken: verifyJWTToken
}