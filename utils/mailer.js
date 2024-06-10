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

// async function sendEmail(from, to, subject, text) {
//     try {
//         const mailOptions = {
//             from: from,
//             to: to,
//             subject: subject,
//             text: text
//         };

//         const info = await transporter.sendMail(mailOptions);
//         console.log('Email sent: ' + info.response);
//     } catch (error) {
//         console.error('Error sending email:', error);
//     }
// }


async function sendResetPasswordEmail(userEmail, resetToken) {
    console.log(userEmail, resetToken)
    try {
        const resetLink = `http://localhost:3000/users/reset-password?token=${resetToken}`;


        const mailOptions = {
            from: process.env.DOMAIN_EMAIL,
            to: userEmail,
            subject: 'Password Reset',
            text: `Please click the following link to reset your password: ${resetLink}`
        };

        const info = await transporter.sendMail(mailOptions);
        return info
    } catch (error) {
        console.error('Error sending email:', error);
    }
}



module.exports = {
    transporter, sendResetPasswordEmail
};
