const jwt = require('jsonwebtoken');
const CustomError = require('../utils/CustomError');
require('dotenv').config();

module.exports = (req, res, next) => {
    const token = req.body.token;
    if (!token) {
        throw new CustomError("Authentication Error", "You don't have the required permissions to perform this action.", 401)
    }

    jwt.verify(token, process.env.JWT_RESET_SECRET, (err, payload) => {
        if (err) {
            throw new CustomError("Authentication Error", err.message.replace('jwt', 'token'), 403)
        }
        req.user = payload;
        req.body.userId = payload.id;
    })
    next()
};