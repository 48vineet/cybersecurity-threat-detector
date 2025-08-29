const mongoose = require("mongoose");

const threatDataSchema = new mongoose.Schema(
  {
    // Basic packet information
    timestamp: { type: Date, default: Date.now, index: true },
    sourceIP: { type: String, required: true, index: true },
    destinationIP: { type: String, required: true },
    protocol: {
      type: String,
      enum: [
        "TCP",
        "UDP",
        "ICMP",
        "HTTP",
        "HTTPS",
        "FTP",
        "SSH",
        "SMB",
        "RDP",
        "Telnet",
      ],
      required: true,
    },

    // Packet details
    packetSize: { type: Number, required: true },
    payloadSize: { type: Number, default: 0 },

    // Geolocation data
    sourceLocation: {
      country: String,
      city: String,
      latitude: Number,
      longitude: Number,
      isp: String,
    },

    // Advanced threat analysis
    threatScore: { type: Number, min: 0, max: 1, required: true, index: true },
    threatLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      required: true,
      index: true,
    },
    threatCategory: {
      type: String,
      enum: [
        "MALWARE",
        "PHISHING",
        "DDoS",
        "DDOS",
        "BRUTE_FORCE",
        "DATA_EXFILTRATION",
        "ANOMALY",
        "UNKNOWN",
        "BENIGN",
        "INSIDER_THREAT",
        "APT",
      ],
      default: "UNKNOWN",
    },

    // Detection details
    detectionMethods: [
      {
        method: {
          type: String,
          enum: ["SIGNATURE", "ANOMALY", "BEHAVIORAL", "ML_MODEL"],
        },
        confidence: { type: Number, min: 0, max: 1 },
        details: String,
      },
    ],

    // Network features
    features: {
      portNumber: Number,
      connectionDuration: Number,
      requestFrequency: Number,
      dataTransferRate: Number,
      packetIntervalVariance: Number,
      headerAnomalies: [String],
      payloadEntropy: Number,
    },

    // Response and mitigation
    isBlocked: { type: Boolean, default: false },
    blockReason: String,
    mitigationActions: [String],

    // Correlation and context
    attackCampaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttackCampaign",
    },
    relatedThreats: [
      { type: mongoose.Schema.Types.ObjectId, ref: "ThreatData" },
    ],

    // Metadata
    processed: { type: Boolean, default: false },
    falsePositive: { type: Boolean, default: false },
    analystNotes: String,

    // Performance metrics
    processingTime: Number, // milliseconds
    detectionLatency: Number, // milliseconds
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for complex queries
threatDataSchema.index({ sourceIP: 1, timestamp: -1 });
threatDataSchema.index({ threatLevel: 1, timestamp: -1 });
threatDataSchema.index({ threatCategory: 1, threatScore: -1 });

// Virtual for threat age
threatDataSchema.virtual("threatAge").get(function () {
  return Date.now() - this.timestamp.getTime();
});

// Static methods
threatDataSchema.statics.getHighThreats = function (limit = 50) {
  return this.find({
    threatLevel: { $in: ["HIGH", "CRITICAL"] },
  })
    .sort({ timestamp: -1 })
    .limit(limit);
};

threatDataSchema.statics.getThreatStatistics = async function (timeRange = 24) {
  const hoursAgo = new Date(Date.now() - timeRange * 60 * 60 * 1000);

  return this.aggregate([
    { $match: { timestamp: { $gte: hoursAgo } } },
    {
      $group: {
        _id: "$threatLevel",
        count: { $sum: 1 },
        avgThreatScore: { $avg: "$threatScore" },
      },
    },
  ]);
};

module.exports = mongoose.model("ThreatData", threatDataSchema);
