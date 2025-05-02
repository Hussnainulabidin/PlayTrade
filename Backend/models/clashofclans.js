const mongoose = require("mongoose");
const slugify = require("slugify");

const clashofclansSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A Clash of Clans account must have a title"],
  },
  slug: String,
  description: {
    type: String,
    maxlength: [2048, "Description length can not exceed the limit 2048"]
  },
  price: {
    type: Number,
    required: [true, "A Clash of Clans account must have a price"],
  },
  ign: String,
  login: {
    type: String,
    required: [true, "A Clash of Clans account must have a login/username"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "A Clash of Clans account must have a password"],
  },
  email_login: String,
  email_password: String,
  delivery_instructions: String,
  gallery: [],
  account_data: {
    TownHallLevel: {
      type: Number,
      required: [true, "A clash of clans account must have a TownHallLevel"]
    },
    Gems: {
      type: Number,
      required: [true, "A clash of clans account must have a Gems"]
    },
    TrophyCount: Number,
    ClanLevel: Number,
    MinionPrinceLevel: Number,
    BarbarianKingLevel: Number,
    ArcherQueenLevel: Number,
    GrandWardenLevel: Number,
    RoyalChampionLevel: Number,
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
    required: [true, "A Clash of Clans account must belong to a user"],
  },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

clashofclansSchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });
  this.set({ lastUpdated: Date.now() });
  next();
});

clashofclansSchema.pre(/update/i, function (next) {
  this.set({ lastUpdated: Date.now() });
  next();
});

clashofclansSchema.virtual('timeSinceLastUpdated').get(function () {
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

const clashofclans = mongoose.model("clashofclans", clashofclansSchema, "clashofclans");

module.exports = clashofclans;
