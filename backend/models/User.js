const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },

    // User profile
    firstName: String,
    lastName: String,
    role: {
      type: String,
      enum: ["admin", "analyst", "viewer"],
      default: "viewer",
      index: true,
    },

    // Security settings
    twoFactorEnabled: { type: Boolean, default: false },
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },
    lockoutUntil: Date,

    // Preferences
    preferences: {
      theme: { type: String, enum: ["dark", "light"], default: "dark" },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        threatLevels: [
          { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
        ],
      },
      dashboard: {
        layout: String,
        widgets: [String],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(
      parseInt(process.env.BCRYPT_ROUNDS) || 12
    );
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
userSchema.methods.isLocked = function () {
  return !!(this.lockoutUntil && this.lockoutUntil > Date.now());
};

module.exports = mongoose.model("User", userSchema);
