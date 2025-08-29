const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../utils/logger");

const router = express.Router();

// Default route for testing connectivity
router.get("/test", (req, res) => {
  res.json({ message: "Auth API is working" });
});

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Username, email, and password are required",
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }

    // Password length validation
    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists with this email or username",
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      role: role || "viewer",
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    logger.error("Registration error:", error);

    // Handle MongoDB validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors,
      });
    }

    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        error: `${field} already exists`,
      });
    }

    res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// User login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    logger.info("Login attempt:", { email }); // Log the login attempt

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({
        error: "Account temporarily locked due to too many failed attempts",
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Increment login attempts
      user.loginAttempts += 1;

      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockoutUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }

      await user.save();
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockoutUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    logger.info("Login successful:", { email });
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get current user profile
router.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    logger.error("Profile fetch error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
