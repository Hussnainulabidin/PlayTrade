const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto")

const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : [true , "A user must have a username"],
        unique : true
    },
    email : {
        type : String,
        required : [true , "A user must have an email"],
        unique : true,
        lowercase : true,
        validate : [validator.isEmail , "Please provide a valid email"]
    },
    password : {
        type : String,
        required : [true , "A user must have a password"],
        minlength : 7,
        select : false
    },
    passwordConfirm : {
        type : String,
        required : [true , "A user must have a password"],
        validate : {
            //This only works on CREATE and SAVE
            validator : function(el) {
                return el === this.password;
            },
            message : "Passwords are not the same"
        }
    },
    photo : String,
    role : {
        type : String,
        enum : ["user" , "seller" , "admin"],
        default : "user"
    },
    status : {
        type : String,
        enum : ["Active" , "Suspended"],
        default : "Active"
    },
    wallet : {
        type : Number,
        default : 0
    },
    joinDate : {
        type : Date,
        default : Date.now
    },
    passwordChangedAt : Date,
    passwordResetToken : String,
    passwordResetExpires : Date,
})

userSchema.pre("save" , async function(next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password , 12);
    this.passwordConfirm = undefined;
    next();
})

userSchema.pre("save" , function(next) {
    if(!this.isModified("password")) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next()
})

userSchema.methods.correctPassword = async function(candidatePassword , userPassword) {
    return await bcrypt.compare(candidatePassword , userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if(this.passwordChangedAt) {
        
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000 , 10);

        console.log(JWTTimestamp, changedTimestamp);
        return JWTTimestamp < changedTimestamp;
    }

    return false;
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    this.passwordResetExpires = Date.now() + 10 * 60 * 60 * 1000;

    return resetToken
}

const user = mongoose.model("user", userSchema , "user");

module.exports = user;