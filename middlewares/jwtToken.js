const jwt = require('jsonwebtoken');

module.exports = (user, expiresIn = "1d") => {
    const payload = {
        id: user.id,
        username: user.username
    }

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn })
}