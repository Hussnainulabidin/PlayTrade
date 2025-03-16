const mongoose = require("mongoose");
const slugify = require("slugify");

const valorantSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A valorant account must have a title"],
    },
    slug: String,
    description: {
      type: String,
      maxlength: [2048, "Description length cannot exceed 2048 characters"],
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
      type: String,
      required: [true, "A valorant account must have a server"],
      enum: ["Europe", "North America", "Asia Pasific", "Brazil", "Latin America"],
    },
    delivery_instructions: String,
    gallery: [],
    account_data: {
      current_rank: {
        type: String,
        required: [true, "A valorant account must have a current rank"],
        enum: {
          values: [
            "Unranked",
            "Iron",
            "Bronze",
            "Silver",
            "Gold",
            "Platinum",
            "Diamond",
            "Ascendent",
            "Immortal",
            "Radiant",
          ],
          message: "You must provide a correct RANK value",
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
        enum: {
          values: [
            "Unranked",
            "Iron",
            "Bronze",
            "Silver",
            "Gold",
            "Platinum",
            "Diamond",
            "Ascendent",
            "Immortal",
            "Radiant",
          ],
          message: "You must provide a correct RANK value",
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
    views: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["draft", "active", "sold"],
      default: "draft",
    },
    rating: {
      type: String,
      enum: ["None", "Positive", "Negative"],
      default: "None",
    },
    lastUpdated: {
      type: Date,
    },

    //Add user reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References the User model
      required: [true, "A valorant account must belong to a user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate slug from title
valorantSchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });
  this.set({ lastUpdated: Date.now() });
  next();
});

// Update lastUpdated field on any update
valorantSchema.pre(/update/i, function (next) {
  this.set({ lastUpdated: Date.now() });
  next();
});

// Virtual field for time since last update
valorantSchema.virtual("timeSinceLastUpdated").get(function () {
  const now = Date.now();
  const diffMs = now - this.lastUpdated;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours >= 24) {
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day(s) ago`;
  } else if (diffHours >= 1) {
    return `${diffHours} hour(s) ago`;
  } else {
    return `${diffMinutes} minute(s) ago`;
  }
});

const ValorantAccount = mongoose.model("ValorantAccount", valorantSchema, "valorant");
module.exports = ValorantAccount;
