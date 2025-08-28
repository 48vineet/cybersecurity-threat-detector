const express = require("express");
const router = express.Router();
const User = require("../models/User");
const logger = require("../utils/logger");

// Get user settings
router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("preferences");
    res.json({ 
      settings: user.preferences || {
        notifications: true,
        theme: "dark",
        alertLevel: "medium"
      }
    });
  } catch (error) {
    logger.error("Get settings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update user settings
router.put("/", async (req, res) => {
  try {
    const { notifications, theme, alertLevel } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { 
        preferences: {
          notifications,
          theme,
          alertLevel
        }
      },
      { new: true }
    ).select("preferences");

    res.json({ 
      message: "Settings updated successfully",
      settings: user.preferences 
    });
  } catch (error) {
    logger.error("Update settings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get system settings (admin only)
router.get("/system", async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    // TODO: Implement system settings logic
    res.json({
      message: "System settings endpoint",
      settings: {
        threatDetectionLevel: "high",
        autoBlock: true,
        logRetention: 30
      }
    });
  } catch (error) {
    logger.error("Get system settings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router; 