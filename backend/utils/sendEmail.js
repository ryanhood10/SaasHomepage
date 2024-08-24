const nodemailer = require("nodemailer");


const sendEmail = async (options) => {

    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        },
        //only in test mode
        tls: {
            rejectUnauthorized: false
        },
        secure: false,
    });

    // send mail with defined transport object
    let message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`, // sender address
        to: options.email,
        subject: options.subject,
        // text: options.message, 
        html: options.message,
    };

    const info = await transporter.sendMail(message);

    console.log("Message sent: %s", info.messageId);

}


module.exports = sendEmail;