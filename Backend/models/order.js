const mongoose = require("mongoose");
const validator = require("validator");

const orderSchema = new mongoose.Schema(
  {
    accountID: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "A valorant account must a accountID"],
    },
    clientID: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "A valorant account must a cutomerID"],
    },
    sellerID: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "A valorant account must a sellerID"],
    },
    creartedAT: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["processing", "completed", "refunded"],
      default: "processing",
    },
    review: {
      type: String,
      enum: ["positive", "negative"],
    },
    reviewMessage: {
      type: String,
      maxlength: 100,
    },
    game : String,
    price : Number
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const order = mongoose.model("order", orderSchema , "order");

module.exports = order;