const nodemailer = require('nodemailer');
const mailjetTransport = require('nodemailer-mailjet-transport');


require('dotenv').config();

const mailjetOptions = {
    auth: {
        apiKey: process.env.MAILJET_API_KEY,
        apiSecret: process.env.MAILJET_API_SECRET
    }
};


const transporter = nodemailer.createTransport(mailjetTransport(mailjetOptions));

async function sendEmail(from, to, subject, text) {
    try {
        const mailOptions = {
            from: from,
            to: to,
            subject: 'Test Email',
            text: 'This is a test email sent using Nodemailer with Mailjet!'
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

sendEmail('alessandrocampo97@gmail.com', 'proteusalex@gmail.com')

module.exports = {
    sendEmail, transporter
};
