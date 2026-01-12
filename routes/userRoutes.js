const express = require("express");
require("dotenv").config();

const User = require("../models/usermodel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const logger = require("../logger");
const authenticationMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  console.error("FATAL ERROR: SECRET_KEY is not defined!");
  process.exit(1);
}

// Bcrypt salt rounds
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

// Random delay to slow brute-force attacks
const randomizedDelay = async () => {
  const delay = Math.floor(Math.random() * (3000 - 500 + 1)) + 500;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

// Login rate limiter
const loginLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 5,
  message: "Too many login attempts. Try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${req.ip}_${req.body.username}`,
  handler: (req, res) => {
    logger.warn("Login rate limit exceeded", {
      username: req.body.username,
      ip: req.ip,
    });
    res.status(429).json({ message: "Too many attempts. Try later." });
  },
});

// ---------------- REGISTER ----------------
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        message:
          "Username must be 4–20 characters and contain only letters, numbers, or underscores.",
      });
    }

    const existingUser = await User.findOne()
      .setOptions({ sanitizeFilter: true })
      .where("username")
      .equals(username);

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const passwordRules = [
      /(?=.*[A-Z])/,
      /(?=.*\d)/,
      /(?=.*[!@#$%^&*()_\-+=<>?])/,
      /.{16,}/,
    ];

    if (!passwordRules.every((rule) => rule.test(password))) {
      return res.status(400).json({
        message:
          "Password must contain uppercase, number, special character, and be at least 16 characters long.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await new User({ username, password: hashedPassword }).save();

    res.json({ message: "Registration successful" });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
});

// ---------------- LOGIN ----------------
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne()
      .setOptions({ sanitizeFilter: true })
      .where("username")
      .equals(username);

    if (!user) {
      await randomizedDelay();
      return res.status(400).json("Invalid credentials");
    }

    // Account lock check
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      return res.status(403).json({
        message: "Account temporarily locked. Try again later.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= 3) {
        user.lockoutUntil = new Date(Date.now() + 2 * 60 * 1000);
      }

      await user.save();
      await randomizedDelay();
      return res.status(400).json("Invalid credentials");
    }

    // Reset lockout on success
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      SECRET_KEY,
      { expiresIn: "30m" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 30 * 60 * 1000,
    });

    logger.info("User logged in", { username });
    res.json({ message: "Login successful" });
  } catch (error) {
    logger.error("Login error", error);
    res.status(500).json("Login failed");
  }
});

// ---------------- UPDATE PROFILE ----------------
router.post("/update", authenticationMiddleware, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.user.userId },
      req.body,
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: "Update failed" });
  }
});

// ---------------- GET PROFILE ----------------
router.get("/profile", authenticationMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

module.exports = router;
