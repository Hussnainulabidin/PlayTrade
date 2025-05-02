const mongoose = require("mongoose");
const slugify = require("slugify");

const brawlstarsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A brawlstars account must have a title"],
  },
  slug: String,
  description: {
    type: String,
    maxlength: [2048, "Description length can not exceed the limit 2048"]
  },
  price: {
    type: Number,
    required: [true, "A brawlstars account must have a price"],
  },
  ign: String,
  login: {
    type: String,
    required: [true, "A brawlstars account must have a login/username"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "A brawlstars account must have a password"],
  },
  email_login: String,
  email_password: String,
  delivery_instructions: String,
  gallery: [],
  account_data: {
    rank: {
      type: String,
      required: [true, "A brawlstars account must have a current rank"],
      enum: {
        values: ["Gold", "Diamond", "Mythic", "Legendary", "Master", "Pro"],
        message: "You must provide a correct RANK value"
      },
      default: "Gold",
    },
    MaxLevelBrawlers: Number,
    BrawlersCount: Number,
    TrophiesCount: Number,
    XPLevel: Number,
    Gems: Number,
  },
  status: {
    type: String,
    enum: ["draft", "active", "sold", "processing"],
    default: "draft",
  },
  lastUpdated: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  sellerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", // References the User model
    required: [true, "A valorant account must belong to a user"],
  },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

brawlstarsSchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });
  this.set({ lastUpdated: Date.now() });
  next();
});

brawlstarsSchema.pre(/update/i, function (next) {
  this.set({ lastUpdated: Date.now() });
  next();
});

brawlstarsSchema.virtual('timeSinceLastUpdated').get(function () {
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

const brawlstars = mongoose.model("brawlstars", brawlstarsSchema, "brawlstars");

module.exports = brawlstars;
