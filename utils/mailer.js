const nodemailer = require('nodemailer');
const mailjetTransport = require('nodemailer-mailjet-transport');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const mailjetOptions = {
    auth: {
        apiKey: process.env.MAILJET_API_KEY,
        apiSecret: process.env.MAILJET_API_SECRET
    }
};

const transporter = nodemailer.createTransport(mailjetTransport(mailjetOptions));

async function sendResetPasswordEmail(userEmail, resetToken) {
    console.log(userEmail, resetToken);
    try {
        const resetLink = `http://localhost:3000/users/reset-password?token=${resetToken}`;

        const htmlPath = path.join(__dirname, '..', 'views', 'passwordMail.html');
        let html = fs.readFileSync(htmlPath, 'utf8');


        html = html.replace('{{resetLink}}', resetLink);

        const mailOptions = {
            from: process.env.DOMAIN_EMAIL,
            to: userEmail,
            subject: 'Boolbook Password Reset',
            html
        };

        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

module.exports = {
    transporter,
    sendResetPasswordEmail
};
