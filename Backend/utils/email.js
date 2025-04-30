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
const sendEmail = async(options) => {
    try {
        console.log(options)
        
        let htmlContent;
        
        // Check if this is an order notification email
        if (options.orderDetails) {
            // Order sold notification email template
            htmlContent = `<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Account Sold Notification</title>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f8fb; margin: 0; padding: 0; }
                    .container { width: 100%; max-width: 600px; margin: 20px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
                    .header { text-align: center; padding-bottom: 15px; border-bottom: 1px solid #e4e9ed; }
                    .logo { height: 40px; margin-bottom: 15px; }
                    h1 { color: #2d3748; font-size: 24px; margin: 20px 0; }
                    h2 { color: #4a5568; font-size: 20px; margin: 15px 0; }
                    p { font-size: 16px; color: #4a5568; line-height: 1.6; }
                    .account-box { background-color: #f1f7ff; padding: 15px; border-radius: 6px; margin: 20px 0; }
                    .account-title { font-weight: bold; color: #2c5282; }
                    .details-row { display: flex; margin-bottom: 10px; }
                    .detail-label { flex: 1; font-weight: bold; color: #4a5568; }
                    .detail-value { flex: 2; color: #718096; }
                    .btn { display: inline-block; padding: 12px 24px; background: #4299e1; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
                    .btn:hover { background: #3182ce; }
                    .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e4e9ed; text-align: center; font-size: 12px; color: #a0aec0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Hi ${options.orderDetails.sellerName}</h1>
                    </div>
                    
                    <p>Your account has been sold! Click the button below to chat with the buyer and complete the sale.</p>
                    
                    <div class="account-box">
                        <h2 class="account-title">${options.orderDetails.accountTitle}</h2>
                        <div class="details-row">
                            <div class="detail-label">Game:</div>
                            <div class="detail-value">${options.orderDetails.game}</div>
                        </div>
                        <div class="details-row">
                            <div class="detail-label">Account Ref:</div>
                            <div class="detail-value">${options.orderDetails.accountRefId}</div>
                        </div>
                        <div class="details-row">
                            <div class="detail-label">Price:</div>
                            <div class="detail-value">$${options.orderDetails.price}</div>
                        </div>
                        <div class="details-row">
                            <div class="detail-label">Buyer:</div>
                            <div class="detail-value">${options.orderDetails.buyerUsername}</div>
                        </div>
                    </div>
                    
                    <a href="https://play-trade.com/order/${options.orderDetails.orderId}" class="btn">View Account →</a>
                    
                    <p>Have any questions about this action?</p>
                    <p>We're here to help! Just open a ticket on the website and we'll get back to you.</p>
                    
                    <div class="footer">
                        <p>&copy; 2023 PlayTrade. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>`;
        }
        // Check if it's a 2FA verification email
        else if (options.subject && options.subject.includes('Authentication Code')) {
            // 2FA verification email template
            htmlContent = `<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Two-Factor Authentication</title>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { width: 100%; max-width: 600px; margin: 20px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: center; }
                    h2 { color: #333; }
                    p { font-size: 16px; color: #555; line-height: 1.6; }
                    .verification-code { display: inline-block; padding: 15px 30px; margin: 20px 0; font-size: 32px; font-weight: bold; color: #3B6EF2; background: #f0f4fe; border-radius: 8px; letter-spacing: 5px; }
                    .info { font-size: 14px; color: #777; margin-top: 10px; }
                    .footer { margin-top: 20px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>PlayTrade Security Verification</h2>
                    <p>You've requested to log in to your PlayTrade account. Please use the following verification code to complete the login process:</p>
                    <div class="verification-code">${options.message.replace('Your PlayTrade verification code is: ', '')}</div>
                    <p class="info">This code will expire in 5 minutes for security reasons.</p>
                    <p class="info">If you didn't request this code, please ignore this email or contact support if you believe your account has been compromised.</p>
                    <p class="footer">This is an automated email from PlayTrade. Please do not reply.</p>
                </div>
            </body>
            </html>`;
        } else {
            // Default template for password reset
            htmlContent = `<!DOCTYPE html>
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
            </html>`;
        }

        console.log("sending Email........")
        const mailOptions = {
            from: 'PlayTradeGameService <no-reply@playtrade.com>',
            to: options.email,
            subject: options.subject || 'Message from PlayTrade',
            html: htmlContent
        };

        // Send the email and handle potential errors
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Email sending failed:', error);
        // Throw a custom error that will be caught by the calling function
        throw new AppError(`Failed to send email: ${error.message}`, 500);
    }
}

module.exports = sendEmail;