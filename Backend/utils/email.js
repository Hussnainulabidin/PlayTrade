const nodemailer = require('nodemailer');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,  // Your Gmail address
        pass: process.env.EMAIL_PASS   // Your Gmail App Password
    }
});

// Function to send email immediately when an event is created
const sendEmail = catchAsync(async(options) => {
    console.log(options)
    const mailOptions = {
        from: 'PlayTradeGameService <no-reply@playtrade.com>',
        to: options.email,
        subject: options.subject,
        html : `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Password Reset</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { width: 100%; max-width: 600px; margin: 20px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: center; }
            h2 { color: #333; }
            p { font-size: 16px; color: #555; line-height: 1.6; }
            .reset-button { display: inline-block; padding: 14px 24px; margin: 20px 0; font-size: 18px; color: #ffffff; background: #007bff; text-decoration: none; border-radius: 5px; }
            .reset-button:hover { background: #0056b3; }
            .footer { margin-top: 20px; font-size: 12px; color: #777; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Password Reset Request</h2>
            <p>Forgot your password? Click the button below to reset it.</p>
            <a href="${options.resetURL}" class="reset-button">🔐 Reset Password</a>
            <p>If you didn't perform this action, please ignore this email.</p>
            <p class="footer">This is an automated email, please do not reply.</p>
        </div>
    </body>
    </html>`
    };

    await transporter.sendMail(mailOptions);
})

module.exports = sendEmail;