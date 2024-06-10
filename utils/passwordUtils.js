const bcrypt = require("bcrypt");
require('dotenv').config();
const PEPPER_KEY = process.env.PEPPER_KEY;

async function hashPassword(password) {
    const saltRounds = 10;
    const pepperedPassword = password + PEPPER_KEY;
    const hash = await bcrypt.hash(pepperedPassword, saltRounds);
    return hash;
};

async function comparePassword(password, hashedPassword) {
    const pepperedPassword = password + PEPPER_KEY;
    const match = await bcrypt.compare(pepperedPassword, hashedPassword)
    return match;
};

module.exports = {
    hashPassword,
    comparePassword
};
