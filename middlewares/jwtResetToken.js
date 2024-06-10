const jwt = require('jsonwebtoken');
require('dotenv').config();


module.exports = (user, expiresIn = "20m") => {
    const payload = {
        id: user.id,
        username: user.username
    }

    return jwt.sign(payload, process.env.JWT_RESET_SECRET, { expiresIn })
}