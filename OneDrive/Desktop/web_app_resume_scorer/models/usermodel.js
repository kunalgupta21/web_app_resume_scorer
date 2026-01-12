const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    firstname: { type: String, default: "" },
    lastname: { type: String, default: "" },
    email: { type: String, default: "" },

    // Security-related fields
    failedLoginAttempts: { type: Number, default: 0 },
    lockoutUntil: { type: Date, default: null },

    // Resume & profile fields
    mobileNumber: { type: String, default: "" },
    portfolio: { type: String, default: "" },
    objective: { type: String, default: "" },
    address: { type: String, default: "" },

    education: { type: Array, default: [] },
    skills: { type: Array, default: [] },
    experience: { type: Array, default: [] },
    projects: { type: Array, default: [] },
    certificates: { type: Array, default: [] },
    courses: { type: Array, default: [] },
    cocurricular: { type: Array, default: [] },
    interests: { type: Array, default: [] },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("users", userSchema);
