const express = require("express");
const router = express.Router();
const ThreatData = require("../models/ThreatData");
const { requireRole } = require("../middleware/auth");

// Test connectivity
router.get("/test", (req, res) => {
  res.json({ message: "Threats API is working" });
});

// Get recent threats
router.get("/recent", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const threats = await ThreatData.find()
      .sort({ timestamp: -1 })
      .limit(limit);
    res.json(threats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get threat statistics
router.get("/stats", async (req, res) => {
  try {
    const timeRange = parseInt(req.query.hours) || 24;
    const hoursAgo = new Date(Date.now() - timeRange * 60 * 60 * 1000);

    const [total, high, blocked, critical] = await Promise.all([
      ThreatData.countDocuments({ timestamp: { $gte: hoursAgo } }),
      ThreatData.countDocuments({
        timestamp: { $gte: hoursAgo },
        threatLevel: { $in: ["HIGH", "CRITICAL"] },
      }),
      ThreatData.countDocuments({
        timestamp: { $gte: hoursAgo },
        isBlocked: true,
      }),
      ThreatData.countDocuments({
        timestamp: { $gte: hoursAgo },
        threatLevel: "CRITICAL",
      }),
    ]);

    res.json({ total, high, blocked, critical });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Block IP address
router.post(
  "/block-ip",
  requireRole(["admin", "analyst"]),
  async (req, res) => {
    try {
      const { ip } = req.body;

      // Update all threats from this IP to blocked status
      await ThreatData.updateMany(
        { sourceIP: ip },
        {
          $set: {
            isBlocked: true,
            blockReason: "Manually blocked by security analyst",
          },
        }
      );

      res.json({ message: `IP ${ip} has been blocked`, blockedIP: ip });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Mark threat as false positive
router.patch(
  "/:id/false-positive",
  requireRole(["admin", "analyst"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const threat = await ThreatData.findByIdAndUpdate(
        id,
        {
          falsePositive: true,
          analystNotes: "Marked as false positive by security analyst",
        },
        { new: true }
      );

      if (!threat) {
        return res.status(404).json({ error: "Threat not found" });
      }

      res.json({ message: "Threat marked as false positive", threat });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
