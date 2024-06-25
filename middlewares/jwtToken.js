const jwt = require('jsonwebtoken');
require('dotenv').config();


module.exports = (user, expiresIn = "1d") => {
    const payload = {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin
    }

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn })
}