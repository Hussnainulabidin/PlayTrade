const mongoose = require("mongoose");

const valorantSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A valorant account must have a title"],
  },
  description: String,
  price: {
    type: Number,
    required: [true, "A valorant account must have a price"],
  },
  ign: String,
  login: {
    type: String,
    required: [true, "A valorant account must have a login/username"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "A valorant account must have a password"],
  },
  email_login: String,
  email_password: String,
  server: {
    type : String,
    required: [true, "A valorant account must have a server"],
    enum: ["Europe", "North America", "Asia Pasific", "Brazil" , "Latin America"]
  },
  delivery_instructions: String,
  gallery: [],
  account_data: {
    current_rank: {
      type: String,
      required: [true, "A valorant account must have a current rank"],
      enum: ["Unranked", "Iron", "Bronze", "Silver", "Gold" , "Platinum", "Diamond", "Ascendent", "Immortal", "Radiant"],
      default: "Unranked",
    },
    current_division: {
      type: Number,
      required: [true, "A valorant account must have a current division"],
      enum: [1, 2, 3],
      default: 1,
    },
    peak_rank: String,
    peak_division: Number,
    level: Number,
    valorant_points: Number,
    radianite_points: Number,
    agents: Number,
    skins: Number,
    buddies: Number,
    sprays: Number,
    titles: Number,
  },
});

const valorant = mongoose.model("valorant", valorantSchema , "valorant");

module.exports = valorant;
