const bcrypt = require("bcrypt");


async function hashPassword(password) {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
};

async function comparePassword(password, hashedPassowrd) {
    const match = await bcrypt.compare(password, hashedPassowrd)
    return match
};

module.exports = {
    hashPassword, comparePassword
}