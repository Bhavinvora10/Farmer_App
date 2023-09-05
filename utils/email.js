const nodemailer = require('nodemailer');

const sendEmail = options => {
    // Create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        }
    });

    // Define the email options
    const msgObj = {
        from: 'No-reply on this email <no-reply@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // Send the email
    transporter.sendMail(msgObj);
};

module.exports = sendEmail;