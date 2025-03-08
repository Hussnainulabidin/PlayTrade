const mongoose = require("mongoose");
const slugify = require("slugify");

const valorantSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A valorant account must have a title"],
  },
  slug : String,
  description: {
    type : String,
    maxlength : [2048 , "Description length can not exceed the limit 2048"]
  },
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
      enum:  {
        values : ["Unranked", "Iron", "Bronze", "Silver", "Gold" , "Platinum", "Diamond", "Ascendent", "Immortal", "Radiant"],
        message : "Incorrect rank"
      },
      default: "Unranked",
    },
    current_division: {
      type: Number,
      required: [true, "A valorant account must have a current division"],
      enum: [1, 2, 3],
      default: 1,
    },
    peak_rank: {
      type: String,
      enum:  {
        values : ["Unranked", "Iron", "Bronze", "Silver", "Gold" , "Platinum", "Diamond", "Ascendent", "Immortal", "Radiant"],
        message : "Incorrect rank"
      },
      default: "Unranked",
    },
    peak_division: {
      type: Number,
      enum: [1, 2, 3],
      default: 1,
    },
    level: Number,
    valorant_points: Number,
    radianite_points: Number,
    agents: Number,
    skins: Number,
    buddies: Number,
    sprays: Number,
    titles: Number,
  },
  views : {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["draft" ,"active", "sold"],
    default: "draft",
  },
  rating: {
    type : String,
    enum: ["None", "Positive" , "Neagtive"],
    default: "None",
  },
  lastUpdated: {
    type: Date,
  },
} , {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

valorantSchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });
  this.set({ lastUpdated: Date.now() });
  next();
});

valorantSchema.pre(/update/i, function (next) {
  this.set({ lastUpdated: Date.now() });
  next();
});

valorantSchema.virtual('timeSinceLastUpdated').get(function () {
  const now = Date.now();
  const diffMs = now - this.lastUpdated;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  
  if (diffHours >= 24) {
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day(s)`;
  } else if (diffHours >= 1) {
    return `${diffHours} hour(s)`;
  } else {
    return `${diffMinutes} minute(s)`;
  }
});

const valorant = mongoose.model("valorant", valorantSchema , "valorant");

module.exports = valorant;
