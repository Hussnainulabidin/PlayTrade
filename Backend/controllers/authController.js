const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const user = require('../models/user');
const sendEmail = require('../utils/email');
const crypto = require("crypto");

// Create a temporary user schema or use a separate collection for unverified users
// We'll use the Redis-like approach with TTL for simplicity in this implementation
const tempUserStore = new Map();

const signToken = id => {
    return jwt.sign({id} , process.env.JWT_SECRET , {
        expiresIn : process.env.JWT_EXPIRES_IN
    });
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // Set cookie options for better security
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };

    // Set the JWT as an HTTP-only cookie
    res.cookie('jwt', token, cookieOptions);
    
    // Remove password from output
    user.password = undefined;
    
    // Return comprehensive response with user data
    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                verified: user.verified,
                joinDate: user.joinDate,
                twoFactorEnabled: user.twoFactorEnabled,
                profilePicture: user.profilePicture
            }
        }
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    // Validate the user data without saving to database
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
        return next(new AppError('Email already in use. Please use a different email address.', 400));
    }

    // Validate the user data
    try {
        await newUser.validate();
    } catch (err) {
        return next(new AppError(`Validation failed: ${err.message}`, 400));
    }

    // Generate a 2FA code for email verification
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const codeExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    
    // Store user data temporarily with the verification code
    const tempUserId = crypto.randomBytes(16).toString('hex');
    
    // Store the temporary user data with an expiration time (5 minutes)
    tempUserStore.set(tempUserId, {
        userData: {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm
        },
        verificationCode: verificationCode,
        expires: codeExpires
    });
    
    // Set a timeout to automatically delete the temporary data after 5 minutes
    setTimeout(() => {
        tempUserStore.delete(tempUserId);
        console.log(`Temporary user data for ${tempUserId} expired and removed`);
    }, 5 * 60 * 1000); // 5 minutes
    
    // Send verification code to user's email
    try {
        const emailSubject = 'Email Verification Code for Your PlayTrade Account';
        console.log('Sending verification email with subject:', emailSubject);
        
        await sendEmail({
            email: req.body.email,
            subject: emailSubject,
            message: `Welcome to PlayTrade! Your verification code is: ${verificationCode}`
        });

        // Return response indicating that verification is required
        res.status(200).json({
            status: 'success',
            message: 'Verification code sent to email',
            requiresTwoFactor: true,
            userId: tempUserId // Send the temporary ID, not the actual MongoDB _id
        });
    } catch (err) {
        // If email sending fails, delete the temp user and return error
        tempUserStore.delete(tempUserId);
        
        console.error('Verification email sending failed:', err);
        return next(new AppError('There was an error sending the verification code. Please try again.', 500));
    }
});

exports.verifySignupCode = catchAsync(async (req, res, next) => {
    const { userId, verificationCode } = req.body;
    
    if (!userId || !verificationCode) {
        return next(new AppError('Please provide both user ID and verification code', 400));
    }
    
    // Retrieve the temporary user data
    const tempUserData = tempUserStore.get(userId);
    
    // Check if temporary user data exists and the code is valid
    if (!tempUserData || tempUserData.verificationCode !== verificationCode) {
        return next(new AppError('Invalid verification code', 401));
    }
    
    // Check if the code has expired
    if (Date.now() > tempUserData.expires) {
        tempUserStore.delete(userId);
        return next(new AppError('Verification code has expired. Please sign up again.', 401));
    }
    
    try {
        // Create the actual user in the database
        const newUser = await User.create({
            username: tempUserData.userData.username,
            email: tempUserData.userData.email,
            password: tempUserData.userData.password,
            passwordConfirm: tempUserData.userData.passwordConfirm,
            verified: true
        });
        
        // Remove the temporary user data
        tempUserStore.delete(userId);
        
        // Issue token and log the user in
        createSendToken(newUser, 201, res);
    } catch (err) {
        return next(new AppError(`Error creating user: ${err.message}`, 500));
    }
});

exports.login = catchAsync(async (req, res, next) => {
    //1. Check if email and password exist
    const {email , password} = req.body;

    if(!email || !password) {
        return next(new AppError("Please provide email and password" , 400));
    }

    //2. Check if user exists and password is correct
    const user = await User
        .findOne({email})
        .select('+password');

    
    if (!user || !(await user.correctPassword(password , user.password))) {
        return next(new AppError("Incorrect email or password" , 401));  //unauthorized
    }

    // 3. Check if 2FA is enabled
    if (user.twoFactorEnabled) {
        // Generate a 6-digit code
        const twoFactorCode = user.generateTwoFactorCode();
        await user.save({ validateBeforeSave: false });
        
        // Send the code via email
        try {
            console.log(`Sending 2FA code to user: ${user._id}, email: ${user.email}...`);
            
            await sendEmail({
                email: user.email,
                subject: 'Your Authentication Code (valid for 5 minutes)',
                message: `Your PlayTrade verification code is: ${twoFactorCode}`
            });
            
            // Return a response indicating 2FA is required
            return res.status(200).json({
                status: 'success',
                message: 'Two-factor authentication required',
                requiresTwoFactor: true,
                userId: user._id
            });
        } catch (err) {
            // Clear the 2FA fields since we couldn't send the email
            user.twoFactorCode = undefined;
            user.twoFactorCodeExpires = undefined;
            await user.save({ validateBeforeSave: false });
            
            console.error('2FA email sending failed:', err);
            return next(new AppError('There was an error sending the verification code. Please try again later!', 500));
        }
    }

    //4. If everything is ok and no 2FA required, send token to client
    user.password = undefined;
    createSendToken(user, 200, res);
})

exports.protect = catchAsync(async (req, res, next) => {
    //1. Getting token and check if it exists
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if(!token) {
        return next(new AppError("You are not logged in! Please log in to get access" , 401));
    }
    
    //2. Verification token
    const decoded = await promisify (jwt.verify)(token , process.env.JWT_SECRET);

    //3. Check if user still exists
    const freshUser = await user.findById(decoded.id);
    if(!freshUser) {
        return next(new AppError("The user belonging to this token does no longer exist" , 401));
    }

    //4. Check if user changed password after the token was issued
    if(freshUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError("User recently changed password! Please log in again" , 401));
    }
    
    req.user = freshUser;
    next();
})

exports.restrictTo = (...roles) => {
    return (req , res , next) => {
        if(!roles.includes(req.user.role)) {
            return next(new AppError("You do not have permissions to perform this action" , 403));
        }
        next()
    }
}

exports.forgotPassword = catchAsync (async (req , res , next)  => {
    //1) get user bases on posted email
    const user = await User.findOne({email : req.body.email})
    if(!user) {
        return next(new AppError("No user found with that email" ,404))
    }

    //2)generate random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave : false , })

    //3)send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Press the link to Reset \n ${resetURL}.
                    \n If you didn't perform this action, please ignore this email`
    try {
        console.log(`Sending password reset email to: ${user.email}`);
        
        await sendEmail({
            email: user.email,
            subject: 'Your Password Reset Link (valid for 10 hours)',
            resetURL : message
        })

        res.status(200).json({
            status : "success",
            message : "Token sent to email!"
        })
    } catch (err) {
        console.error('Password reset email failed:', err);
        
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save({validateBeforeSave : false , })

        return next(new AppError('There was an error sending the password reset email. Please try again later!', 500))
    }
})

exports.resetPassword = catchAsync ( async (req , res , next) => {
    //1) get user based on token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({passwordResetToken : hashedToken , passwordResetExpires : {$gt : Date.now()}})

    //2)if token has not expired and there is user set the new password
    if(!user) {
        return next(new AppError("Token is invalid or has expired" , 400))
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined

    await user.save();

    const token = signToken(user._id);

    res.status(201).json({
        status: "success",
        token,
        data: {
            user: user
        }
    });
})

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');
  
    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
      return next(new AppError('Your current password is wrong.', 401));
    }
  
    // 3) If so, update password
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPassword;
    await user.save();
  
    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
});

exports.toggleTwoFactorAuth = catchAsync(async (req, res, next) => {
    // Update user's 2FA settings
    const user = await User.findByIdAndUpdate(
        req.user.id,
        { twoFactorEnabled: req.body.enabled },
        { new: true, runValidators: true }
    );

    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        success: true,
        data: {
            twoFactorEnabled: user.twoFactorEnabled
        }
    });
});

exports.logoutAllSessions = catchAsync(async (req, res, next) => {
    // Update the user's passwordChangedAt field to invalidate all tokens
    const user = await User.findByIdAndUpdate(
        req.user.id,
        { passwordChangedAt: Date.now() },
        { new: true }
    );

    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        success: true,
        message: 'Logged out from all sessions'
    });
});

exports.verifyTwoFactorCode = catchAsync(async (req, res, next) => {
    const { userId, verificationCode } = req.body;
    
    if (!userId || !verificationCode) {
        return next(new AppError('Please provide both user ID and verification code', 400));
    }
    
    // Find the user with the given verification code
    const user = await User.findOne({
        _id: userId,
        twoFactorCode: verificationCode,
        twoFactorCodeExpires: { $gt: Date.now() }
    });
    
    if (!user) {
        console.log('Invalid 2FA attempt:', { userId, codeProvided: verificationCode });
        return next(new AppError('Invalid or expired verification code', 401));
    }
    
    // Clear the 2FA fields
    user.twoFactorCode = undefined;
    user.twoFactorCodeExpires = undefined;
    await user.save({ validateBeforeSave: false });
    
    console.log('Successful 2FA verification for user:', userId);
    
    // Issue token and log the user in
    createSendToken(user, 200, res);
});

exports.resendVerificationCode = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }
    
    // Check if user with this email already exists in the database
    const existingUser = await User.findOne({ email }).select('+password');
    if (existingUser && existingUser.verified) {
        // If user exists and is verified, they should just log in
        return next(new AppError('This email is already registered and verified. Please log in.', 400));
    }
    
    // Generate a new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const codeExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    
    // Store temporary user data
    const tempUserId = crypto.randomBytes(16).toString('hex');
    
    // Store the user data temporarily with the verification code
    tempUserStore.set(tempUserId, {
        userData: {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.password // Use the same password for confirmation
        },
        verificationCode: verificationCode,
        expires: codeExpires
    });
    
    // Set a timeout to automatically delete the temporary data after 5 minutes
    setTimeout(() => {
        tempUserStore.delete(tempUserId);
        console.log(`Temporary user data for ${tempUserId} expired and removed`);
    }, 5 * 60 * 1000); // 5 minutes
    
    // Send the new verification code
    try {
        const emailSubject = 'Email Verification Code for Your PlayTrade Account';
        console.log('Resending verification email with subject:', emailSubject);
        
        await sendEmail({
            email: req.body.email,
            subject: emailSubject,
            message: `Welcome to PlayTrade! Your verification code is: ${verificationCode}`
        });
        
        // Return success response with the new temporary user ID
        res.status(200).json({
            status: 'success',
            message: 'Verification code sent to email',
            requiresTwoFactor: true,
            userId: tempUserId
        });
    } catch (err) {
        // If email sending fails, clean up and return error
        tempUserStore.delete(tempUserId);
        
        console.error('Verification email sending failed:', err);
        return next(new AppError('There was an error sending the verification code. Please try again.', 500));
    }
});