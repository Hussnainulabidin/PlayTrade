const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

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
    passwordChangedAt : Date,
})

userSchema.pre("save" , async function(next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password , 12);
    this.passwordConfirm = undefined;
    next();
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


const user = mongoose.model("user", userSchema , "user");

module.exports = user;