const ThreatData = require("../../models/ThreatData");
const logger = require("../../utils/logger");
const crypto = require("crypto");

class AdvancedThreatDetectionEngine {
  constructor(io, wss) {
    this.io = io;
    this.wss = wss;
    this.isRunning = false;
    this.detectionModels = new Map();
    this.threatIntelligence = new Map();
    this.behaviorProfiles = new Map();
    this.attackCampaigns = new Map();
    // NEW: keep a small buffer of recent threats for streaming APIs
    this.recentThreats = [];

    // Initialize detection engines
    this.initializeDetectionEngines();
  }

  initializeDetectionEngines() {
    // Signature-based detection engine
    this.detectionModels.set("signature", new SignatureDetectionEngine());

    // Anomaly detection engine
    this.detectionModels.set("anomaly", new AnomalyDetectionEngine());

    // Behavioral analysis engine
    this.detectionModels.set("behavioral", new BehavioralAnalysisEngine());

    // Machine Learning engine
    this.detectionModels.set("ml", new MLThreatEngine());

    logger.info("Advanced threat detection engines initialized");
  }

  async start() {
    if (this.isRunning) return;

    this.isRunning = true;
    logger.info("Starting Advanced Threat Detection Engine");

    // Load threat intelligence
    await this.loadThreatIntelligence();

    // Start continuous monitoring
    this.startContinuousMonitoring();

    // Initialize behavior baselines
    await this.initializeBehaviorBaselines();
  }

  async loadThreatIntelligence() {
    // Simulated threat intelligence data
    const threatIntel = {
      maliciousIPs: [
        "185.220.101.45",
        "87.251.75.245",
        "91.240.118.172",
        "159.65.153.82",
        "198.23.239.134",
        "104.248.169.173",
      ],
      suspiciousDomains: [
        "malware-c2.com",
        "phishing-site.net",
        "data-exfil.org",
      ],
      knownAttackSignatures: [
        { pattern: /\/etc\/passwd/gi, type: "FILE_ACCESS_ATTEMPT" },
        { pattern: /admin.*admin/gi, type: "BRUTE_FORCE_ATTEMPT" },
        { pattern: /union.*select/gi, type: "SQL_INJECTION" },
      ],
      attackTechniques: {
        T1190: "Exploit Public-Facing Application",
        T1566: "Phishing",
        T1110: "Brute Force",
        T1041: "Exfiltration Over C2 Channel",
      },
    };

    this.threatIntelligence.set("current", threatIntel);
    logger.info("Threat intelligence loaded");
  }

  async initializeBehaviorBaselines() {
    // Create baseline behavior profiles for different network segments
    const baselineProfiles = {
      internal_users: {
        avgPacketSize: 850,
        avgConnectionDuration: 120,
        commonPorts: [80, 443, 22, 25],
        peakHours: [9, 10, 11, 13, 14, 15, 16, 17],
        avgRequestsPerHour: 245,
      },
      servers: {
        avgPacketSize: 1200,
        avgConnectionDuration: 300,
        commonPorts: [80, 443, 22, 3306, 5432],
        peakHours: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
          20, 21, 22, 23,
        ],
        avgRequestsPerHour: 1200,
      },
      external: {
        avgPacketSize: 650,
        avgConnectionDuration: 45,
        commonPorts: [80, 443],
        suspiciousPatterns: ["large_data_transfer", "off_hours_activity"],
      },
    };

    this.behaviorProfiles = new Map(Object.entries(baselineProfiles));
    logger.info("Behavior baselines initialized");
  }

  startContinuousMonitoring() {
    // Generate realistic threat data every 1-3 seconds
    setInterval(() => {
      this.generateAndAnalyzeThreat();
    }, Math.random() * 2000 + 1000);

    // Process threat correlation every 30 seconds
    setInterval(() => {
      this.correlateThreatEvents();
    }, 30000);

    // Update behavior baselines every 5 minutes
    setInterval(() => {
      this.updateBehaviorBaselines();
    }, 300000);

    logger.info("Continuous monitoring started");
  }

  async generateAndAnalyzeThreat() {
    try {
      const mockThreat = this.generateAdvancedMockThreat();
      const analysisResult = await this.analyzeComprehensiveThreat(mockThreat);

      if (analysisResult.threatScore > 0.1) {
        // Only process significant threats
        // Save to database
        const threatData = new ThreatData(analysisResult);
        await threatData.save();

        // Real-time notifications
        this.broadcastThreatUpdate(analysisResult);

        // NEW: keep recent threats in memory (cap ~200)
        this.recentThreats.push(analysisResult);
        if (this.recentThreats.length > 200) {
          this.recentThreats.shift();
        }

        // Check for attack campaigns
        await this.checkAttackCampaign(analysisResult);
      }
    } catch (error) {
      logger.error("Error in threat generation/analysis:", error);
      // Prevent the error from crashing the application
    }
  }

  generateAdvancedMockThreat() {
    const scenarios = [
      this.generateBruteForceAttempt(),
      this.generateDataExfiltrationAttempt(),
      this.generateMalwareActivity(),
      this.generatePhishingAttempt(),
      this.generateDDoSActivity(),
      this.generateNormalTraffic(),
      this.generateInsiderThreat(),
      this.generateAdvancedPersistentThreat(),
    ];

    // Weight scenarios - more normal traffic, occasional threats
    const weights = [0.1, 0.05, 0.08, 0.07, 0.05, 0.55, 0.03, 0.07];
    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        const threat = scenarios[i];
        // Validate threat data
        if (!threat.sourceIP || !threat.destinationIP || !threat.protocol) {
          throw new Error("Invalid threat data generated");
        }
        return threat;
      }
    }

    return this.generateNormalTraffic();
  }

  generateBruteForceAttempt() {
    const attackerIPs = [
      "185.220.101.45",
      "87.251.75.245",
      "91.240.118.172",
      "159.65.153.82",
      "198.23.239.134",
    ];
    const targetServices = [
      { port: 22, protocol: "SSH" },
      { port: 23, protocol: "Telnet" },
      { port: 3389, protocol: "RDP" },
      { port: 21, protocol: "FTP" },
    ];

    const service =
      targetServices[Math.floor(Math.random() * targetServices.length)];

    return {
      sourceIP: attackerIPs[Math.floor(Math.random() * attackerIPs.length)],
      destinationIP: "192.168.1." + (Math.floor(Math.random() * 50) + 100),
      protocol: service.protocol,
      packetSize: Math.floor(Math.random() * 200) + 64,
      payloadSize: Math.floor(Math.random() * 100) + 32,
      features: {
        portNumber: service.port,
        connectionDuration: Math.floor(Math.random() * 5) + 1,
        requestFrequency: Math.floor(Math.random() * 50) + 20,
        dataTransferRate: Math.floor(Math.random() * 1000) + 100,
        headerAnomalies: ["repeated_auth_failures"],
        payloadEntropy: Math.random() * 0.3 + 0.2,
      },
      threatCategory: "BRUTE_FORCE",
      attackSignature: "rapid_auth_attempts",
    };
  }

  generateDataExfiltrationAttempt() {
    return {
      sourceIP: "192.168.1." + (Math.floor(Math.random() * 50) + 100),
      destinationIP: "185.220.101.45", // External malicious IP
      protocol: "HTTPS",
      packetSize: Math.floor(Math.random() * 3000) + 2000, // Large packets
      payloadSize: Math.floor(Math.random() * 2500) + 1800,
      features: {
        portNumber: 443,
        connectionDuration: Math.floor(Math.random() * 300) + 120,
        requestFrequency: Math.floor(Math.random() * 10) + 2,
        dataTransferRate: Math.floor(Math.random() * 10000) + 5000, // High transfer rate
        headerAnomalies: ["unusual_user_agent", "encrypted_payload"],
        payloadEntropy: Math.random() * 0.3 + 0.7, // High entropy
      },
      threatCategory: "DATA_EXFILTRATION",
      attackSignature: "large_data_transfer_external",
    };
  }

  generateMalwareActivity() {
    const malwareTypes = ["trojan", "ransomware", "botnet", "keylogger"];
    const malwareType =
      malwareTypes[Math.floor(Math.random() * malwareTypes.length)];

    return {
      sourceIP: "104.248.169.173", // C2 server
      destinationIP: "192.168.1." + (Math.floor(Math.random() * 100) + 50),
      protocol: "HTTP",
      packetSize: Math.floor(Math.random() * 1000) + 500,
      payloadSize: Math.floor(Math.random() * 800) + 400,
      features: {
        portNumber: Math.floor(Math.random() * 1000) + 8000, // High port
        connectionDuration: Math.floor(Math.random() * 30) + 5,
        requestFrequency: Math.floor(Math.random() * 5) + 1,
        dataTransferRate: Math.floor(Math.random() * 2000) + 500,
        headerAnomalies: ["suspicious_headers", "base64_payload"],
        payloadEntropy: Math.random() * 0.4 + 0.5,
      },
      threatCategory: "MALWARE",
      attackSignature: `${malwareType}_communication`,
    };
  }

  generateNormalTraffic() {
    const normalIPs = ["192.168.1.100", "192.168.1.101", "192.168.1.102"];
    const webServices = [
      { port: 80, protocol: "HTTP" },
      { port: 443, protocol: "HTTPS" },
    ];

    const service = webServices[Math.floor(Math.random() * webServices.length)];

    return {
      sourceIP: normalIPs[Math.floor(Math.random() * normalIPs.length)],
      destinationIP: "8.8.8.8", // Google DNS
      protocol: service.protocol,
      packetSize: Math.floor(Math.random() * 1000) + 200,
      payloadSize: Math.floor(Math.random() * 800) + 150,
      features: {
        portNumber: service.port,
        connectionDuration: Math.floor(Math.random() * 60) + 10,
        requestFrequency: Math.floor(Math.random() * 10) + 1,
        dataTransferRate: Math.floor(Math.random() * 2000) + 100,
        headerAnomalies: [],
        payloadEntropy: Math.random() * 0.4 + 0.3,
      },
      threatCategory: "BENIGN",
      attackSignature: null,
    };
  }

  async analyzeComprehensiveThreat(threatData) {
    const startTime = Date.now();

    // Multi-layer analysis
    const analyses = await Promise.all([
      this.detectionModels.get("signature").analyze(threatData),
      this.detectionModels
        .get("anomaly")
        .analyze(threatData, this.behaviorProfiles),
      this.detectionModels
        .get("behavioral")
        .analyze(threatData, this.behaviorProfiles),
      this.detectionModels.get("ml").analyze(threatData),
    ]);

    // Combine analysis results
    const combinedAnalysis = this.combineAnalysisResults(analyses, threatData);

    // Add geolocation data
    combinedAnalysis.sourceLocation = await this.getGeolocation(
      threatData.sourceIP
    );

    // Calculate processing metrics
    combinedAnalysis.processingTime = Date.now() - startTime;
    combinedAnalysis.detectionLatency = Math.floor(Math.random() * 50) + 10;

    return combinedAnalysis;
  }

  combineAnalysisResults(analyses, originalData) {
    const [signature, anomaly, behavioral, ml] = analyses;

    // Weighted threat score calculation
    const weights = {
      signature: 0.3,
      anomaly: 0.25,
      behavioral: 0.25,
      ml: 0.2,
    };

    let threatScore =
      signature.threatScore * weights.signature +
      anomaly.threatScore * weights.anomaly +
      behavioral.threatScore * weights.behavioral +
      ml.threatScore * weights.ml;

    // Apply threat intelligence boost
    if (this.isMaliciousIP(originalData.sourceIP)) {
      threatScore = Math.min(threatScore + 0.3, 1.0);
    }

    const detectionMethods = [];
    if (signature.detected) detectionMethods.push(signature.method);
    if (anomaly.detected) detectionMethods.push(anomaly.method);
    if (behavioral.detected) detectionMethods.push(behavioral.method);
    if (ml.detected) detectionMethods.push(ml.method);

    const threatLevel = this.calculateThreatLevel(threatScore);
    const isBlocked =
      threatScore > 0.7 || this.isMaliciousIP(originalData.sourceIP);

    return {
      ...originalData,
      timestamp: new Date(),
      threatScore: Math.round(threatScore * 1000) / 1000,
      threatLevel,
      isBlocked,
      blockReason: isBlocked ? "Automated threat response" : null,
      detectionMethods,
      mitigationActions: isBlocked
        ? this.generateMitigationActions(originalData)
        : [],
    };
  }

  isMaliciousIP(ip) {
    const threatIntel = this.threatIntelligence.get("current");
    return threatIntel && threatIntel.maliciousIPs.includes(ip);
  }

  calculateThreatLevel(score) {
    if (score >= 0.8) return "CRITICAL";
    if (score >= 0.6) return "HIGH";
    if (score >= 0.3) return "MEDIUM";
    return "LOW";
  }

  generateMitigationActions(threatData) {
    const actions = [];

    if (this.isMaliciousIP(threatData.sourceIP)) {
      actions.push(`Block IP ${threatData.sourceIP}`);
    }

    if (threatData.threatCategory === "BRUTE_FORCE") {
      actions.push("Enable account lockout policy");
      actions.push("Implement rate limiting");
    }

    if (threatData.threatCategory === "DATA_EXFILTRATION") {
      actions.push("Monitor data access patterns");
      actions.push("Implement DLP policies");
    }

    return actions;
  }

  generatePhishingAttempt() {
    return {
      sourceIP: "87.251.75.245", // Malicious IP
      destinationIP: "192.168.1." + (Math.floor(Math.random() * 50) + 100),
      protocol: "HTTP",
      packetSize: Math.floor(Math.random() * 800) + 400,
      payloadSize: Math.floor(Math.random() * 600) + 300,
      features: {
        portNumber: 80,
        connectionDuration: Math.floor(Math.random() * 60) + 15,
        requestFrequency: Math.floor(Math.random() * 8) + 2,
        dataTransferRate: Math.floor(Math.random() * 1500) + 300,
        headerAnomalies: ["suspicious_redirect", "phishing_content"],
        payloadEntropy: Math.random() * 0.3 + 0.4,
      },
      threatCategory: "PHISHING",
      attackSignature: "phishing_redirect",
    };
  }

  generateDDoSActivity() {
    return {
      sourceIP: "159.65.153.82", // Botnet IP
      destinationIP: "192.168.1." + (Math.floor(Math.random() * 10) + 1),
      protocol: "TCP",
      packetSize: Math.floor(Math.random() * 200) + 64,
      payloadSize: Math.floor(Math.random() * 100) + 32,
      features: {
        portNumber: 80,
        connectionDuration: Math.floor(Math.random() * 10) + 1,
        requestFrequency: Math.floor(Math.random() * 100) + 50,
        dataTransferRate: Math.floor(Math.random() * 5000) + 2000,
        headerAnomalies: ["flood_pattern"],
        payloadEntropy: Math.random() * 0.2 + 0.1,
      },
      threatCategory: "DDOS",
      attackSignature: "connection_flood",
    };
  }

  generateInsiderThreat() {
    return {
      sourceIP: "192.168.1." + (Math.floor(Math.random() * 50) + 100),
      destinationIP: "192.168.1." + (Math.floor(Math.random() * 20) + 1),
      protocol: "SMB",
      packetSize: Math.floor(Math.random() * 1500) + 800,
      payloadSize: Math.floor(Math.random() * 1200) + 600,
      features: {
        portNumber: 445,
        connectionDuration: Math.floor(Math.random() * 180) + 60,
        requestFrequency: Math.floor(Math.random() * 15) + 5,
        dataTransferRate: Math.floor(Math.random() * 3000) + 1000,
        headerAnomalies: ["unusual_access_pattern"],
        payloadEntropy: Math.random() * 0.3 + 0.5,
      },
      threatCategory: "INSIDER_THREAT",
      attackSignature: "unusual_file_access",
    };
  }

  generateAdvancedPersistentThreat() {
    return {
      sourceIP: "104.248.169.173", // APT C2 server
      destinationIP: "192.168.1." + (Math.floor(Math.random() * 30) + 20),
      protocol: "HTTPS",
      packetSize: Math.floor(Math.random() * 1000) + 600,
      payloadSize: Math.floor(Math.random() * 800) + 500,
      features: {
        portNumber: 443,
        connectionDuration: Math.floor(Math.random() * 600) + 300,
        requestFrequency: Math.floor(Math.random() * 5) + 1,
        dataTransferRate: Math.floor(Math.random() * 1000) + 200,
        headerAnomalies: ["encrypted_c2", "steganography"],
        payloadEntropy: Math.random() * 0.2 + 0.7,
      },
      threatCategory: "APT",
      attackSignature: "persistent_backdoor",
    };
  }

  async correlateThreatEvents() {
    try {
      // This would correlate related threat events
      logger.info("Correlating threat events...");
    } catch (error) {
      logger.error("Error correlating threat events:", error);
    }
  }

  async updateBehaviorBaselines() {
    try {
      // This would update behavior baselines based on recent data
      logger.info("Updating behavior baselines...");
    } catch (error) {
      logger.error("Error updating behavior baselines:", error);
    }
  }

  async checkAttackCampaign(threatData) {
    try {
      // This would check if the threat is part of a larger campaign
      const campaignId = `campaign_${threatData.sourceIP}_${Date.now()}`;
      if (threatData.threatScore > 0.7) {
        logger.info(`Potential attack campaign detected: ${campaignId}`);
      }
    } catch (error) {
      logger.error("Error checking attack campaign:", error);
    }
  }

  subscribeToStream(ws, filters) {
    try {
      // Handle WebSocket subscription for threat streams
      ws.threatFilters = filters;
      logger.info("Client subscribed to threat stream");
    } catch (error) {
      logger.error("Error subscribing to threat stream:", error);
    }
  }

  async getGeolocation(ip) {
    // Simulated geolocation data
    const locations = {
      "192.168.1.100": {
        country: "Local",
        city: "Internal",
        latitude: 0,
        longitude: 0,
        isp: "Internal Network",
      },
      "185.220.101.45": {
        country: "Russia",
        city: "Moscow",
        latitude: 55.7558,
        longitude: 37.6173,
        isp: "Malicious Hosting",
      },
      "87.251.75.245": {
        country: "China",
        city: "Beijing",
        latitude: 39.9042,
        longitude: 116.4074,
        isp: "Unknown ISP",
      },
      "91.240.118.172": {
        country: "Netherlands",
        city: "Amsterdam",
        latitude: 52.3676,
        longitude: 4.9041,
        isp: "VPN Provider",
      },
    };

    return (
      locations[ip] || {
        country: "Unknown",
        city: "Unknown",
        latitude: 0,
        longitude: 0,
        isp: "Unknown ISP",
      }
    );
  }

  broadcastThreatUpdate(threatData) {
    // Socket.io broadcast
    this.io.to("threat-monitoring").emit("threatUpdate", threatData);

    // High-priority threats get immediate alerts
    if (
      threatData.threatLevel === "CRITICAL" ||
      threatData.threatLevel === "HIGH"
    ) {
      this.io.to("threat-monitoring").emit("criticalThreatAlert", threatData);
    }

    // WebSocket broadcast for high-frequency data
    if (this.wss && this.wss.clients) {
      const message = JSON.stringify({
        type: "THREAT_UPDATE",
        data: threatData,
      });

      this.wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          // WebSocket.OPEN
          client.send(message);
        }
      });
    }
  }

  // NEW: provide recent threats for server streaming calls
  getRecentThreats(limit = 10) {
    if (!Array.isArray(this.recentThreats) || this.recentThreats.length === 0) {
      return [];
    }
    return this.recentThreats.slice(-limit);
  }

  stop() {
    this.isRunning = false;
    logger.info("Advanced Threat Detection Engine stopped");
  }
}

// Detection Engine Classes
class SignatureDetectionEngine {
  async analyze(threatData) {
    let threatScore = 0;
    let detected = false;

    // Check for known attack signatures
    if (threatData.attackSignature) {
      switch (threatData.attackSignature) {
        case "rapid_auth_attempts":
          threatScore = 0.8;
          detected = true;
          break;
        case "large_data_transfer_external":
          threatScore = 0.9;
          detected = true;
          break;
        case "trojan_communication":
        case "ransomware_communication":
          threatScore = 0.95;
          detected = true;
          break;
        default:
          threatScore = 0.1;
      }
    }

    return {
      threatScore,
      detected,
      method: {
        method: "SIGNATURE",
        confidence: detected ? 0.9 : 0.1,
        details: `Signature-based detection: ${
          threatData.attackSignature || "No signature match"
        }`,
      },
    };
  }
}

class AnomalyDetectionEngine {
  async analyze(threatData, behaviorProfiles) {
    let threatScore = 0;
    let detected = false;

    // Packet size anomaly
    if (threatData.packetSize > 2000) {
      threatScore += 0.3;
      detected = true;
    }

    // Port anomaly
    if (threatData.features.portNumber > 8000) {
      threatScore += 0.2;
    }

    // High data transfer rate
    if (threatData.features.dataTransferRate > 5000) {
      threatScore += 0.4;
      detected = true;
    }

    // Entropy anomaly
    if (threatData.features.payloadEntropy > 0.7) {
      threatScore += 0.3;
    }

    return {
      threatScore: Math.min(threatScore, 1.0),
      detected,
      method: {
        method: "ANOMALY",
        confidence: detected ? 0.7 : 0.2,
        details: "Statistical anomaly detection based on network baselines",
      },
    };
  }
}

class BehavioralAnalysisEngine {
  async analyze(threatData, behaviorProfiles) {
    let threatScore = 0;
    let detected = false;

    // Time-based analysis
    const currentHour = new Date().getHours();

    // Off-hours activity (assuming business hours 9-17)
    if (currentHour < 9 || currentHour > 17) {
      if (threatData.features.dataTransferRate > 2000) {
        threatScore += 0.4;
        detected = true;
      }
    }

    // Frequency analysis
    if (threatData.features.requestFrequency > 30) {
      threatScore += 0.3;
      detected = true;
    }

    // Connection duration analysis
    if (
      threatData.features.connectionDuration < 5 &&
      threatData.features.requestFrequency > 10
    ) {
      threatScore += 0.2; // Rapid connections could indicate scanning
    }

    return {
      threatScore: Math.min(threatScore, 1.0),
      detected,
      method: {
        method: "BEHAVIORAL",
        confidence: detected ? 0.6 : 0.3,
        details:
          "Behavioral pattern analysis based on user and entity behavior",
      },
    };
  }
}

class MLThreatEngine {
  async analyze(threatData) {
    // Simulated ML model prediction
    let threatScore = 0;
    let detected = false;

    // Feature-based ML simulation
    const features = [
      threatData.packetSize / 3000, // Normalized packet size
      threatData.features.payloadEntropy,
      threatData.features.requestFrequency / 100,
      threatData.features.dataTransferRate / 10000,
    ];

    // Simple ML simulation (weighted sum with sigmoid)
    const weights = [0.2, 0.4, 0.3, 0.3];
    let sum = 0;

    for (let i = 0; i < features.length; i++) {
      sum += features[i] * weights[i];
    }

    // Apply sigmoid function
    threatScore = 1 / (1 + Math.exp(-sum));

    // Add some randomness to simulate model uncertainty
    threatScore += (Math.random() - 0.5) * 0.1;
    threatScore = Math.max(0, Math.min(1, threatScore));

    detected = threatScore > 0.5;

    return {
      threatScore,
      detected,
      method: {
        method: "ML_MODEL",
        confidence: detected
          ? Math.min(threatScore + 0.1, 1.0)
          : Math.max(threatScore - 0.1, 0.1),
        details: `ML model prediction with ${features.length} features`,
      },
    };
  }
}

module.exports = AdvancedThreatDetectionEngine;
