const express = require("express");
const router = express.Router();
const User = require("../models/User");
const logger = require("../utils/logger");

// Get all users (admin only)
router.get("/", async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const users = await User.find().select("-password");
    res.json({ users });
  } catch (error) {
    logger.error("Get users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    logger.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update user
router.put("/:id", async (req, res) => {
  try {
    const { firstName, lastName, email, role } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email, role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    logger.error("Update user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router; 