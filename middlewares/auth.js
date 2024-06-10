const jwt = require('jsonwebtoken');
const CustomError = require('../utils/CustomError');

module.exports = (req, res, next) => {
    if (!req.headers.authorization) {
        throw new CustomError("Authentication Error", "You don't have the required permissions to perform this action. Make sure to be logged in.", 401)
    }
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
        throw new CustomError("Authentication Error", "You don't have the required permissions to perform this action. Make sure to be logged in.", 401)
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if (err) {
            throw new CustomError("Authentication Error", err.message.replace('jwt', 'token'), 403)
        }
        req.user = payload;
        //not sure
        req.body.userId = payload.id;
    })
    next()
};