const mongoose = require("mongoose");
const slugify = require("slugify");

const fortniteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A fortnite account must have a title"],
  },
  slug: String,
  description: {
    type: String,
    maxlength: [2048, "Description length can not exceed the limit 2048"]
  },
  price: {
    type: Number,
    required: [true, "A fortnite account must have a price"],
  },
  ign: String,
  login: {
    type: String,
    required: [true, "A fortnite account must have a login/username"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "A fortnite account must have a password"],
  },
  email_login: String,
  email_password: String,
  delivery_instructions: String,
  gallery: [],
  account_data: {
    mainPlatform: {
      type: String,
      required: [true, "A fortnite account must have a main platform"],
      enum: {
        values: ["PC", "Xbox", "Playstation", "Android", "IOS"],
        message: "Invalid platform"
      },
      default: "PC",
    },
    level: {
      type: Number,
      default: 1
    },
    VBucksCount: Number,
    SkinsCount: Number,
    EmotesCount: Number,
    PickaxesCount: Number,
    BackpacksCount: Number,
    GlidersCount: Number,
    SpraysCount: Number,
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

fortniteSchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });
  this.set({ lastUpdated: Date.now() });
  next();
});

fortniteSchema.pre(/update/i, function (next) {
  this.set({ lastUpdated: Date.now() });
  next();
});

fortniteSchema.virtual('timeSinceLastUpdated').get(function () {
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

const fortnite = mongoose.model("fortnite", fortniteSchema, "fortnite");

module.exports = fortnite;
