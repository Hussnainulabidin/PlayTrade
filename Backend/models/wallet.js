const mongoose = require("mongoose");
const validator = require("validator");

const walletActionsSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    amount : {
        type : Number,
        required : true
    },
    type : {
        type : String,
        enum : ["deposit", "withdrawal", "transfer"],
        required : true
    },
    message : {
        type : String,
        required : true
    },
    createdAt : {
        type : Date,
        default : Date.now
    }
})

const walletActions = mongoose.model("walletActions", walletActionsSchema , "walletActions");

module.exports = walletActions;


