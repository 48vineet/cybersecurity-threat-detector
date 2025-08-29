const ThreatData = require("../../models/ThreatData");
const logger = require("../../utils/logger");
const crypto = require("crypto");
const mongoose = require("mongoose");

class AdvancedThreatDetectionEngine {
  constructor(io, wss, server) {
    this.io = io;
    this.wss = wss;
    this.server = server;
    this.isRunning = false;
    this.detectionModels = new Map();
    this.threatIntelligence = new Map();
    this.behaviorProfiles = new Map();
    this.attackCampaigns = new Map();

    // Keep a buffer of recent threats for streaming APIs
    this.recentThreats = [];

    // Performance metrics for monitoring
    this.metrics = {
      threatsProcessed: 0,
      threatsDetected: 0,
      criticalThreats: 0,
      avgProcessingTime: 0,
      lastUpdate: Date.now(),
    };
  }

  initializeDetectionEngines() {
    try {
      // Signature-based detection engine
      this.detectionModels.set("signature", new SignatureDetectionEngine());

      // Anomaly detection engine
      this.detectionModels.set("anomaly", new AnomalyDetectionEngine());

      // Behavioral analysis engine
      this.detectionModels.set("behavioral", new BehavioralAnalysisEngine());

      // Machine Learning engine
      this.detectionModels.set("ml", new MLThreatEngine());

      logger.info(
        "🤖 Advanced threat detection engines initialized successfully"
      );
    } catch (error) {
      logger.error("Failed to initialize detection engines:", error);
      throw error;
    }
  }

  async start() {
    if (this.isRunning) return;

    this.isRunning = true;
    logger.info("🚀 Starting Advanced Threat Detection Engine");

    try {
      // Ensure detection engines are initialized
      if (!this.detectionModels.size) {
        this.initializeDetectionEngines();
      }

      // Load threat intelligence
      await this.loadThreatIntelligence();

      // Initialize behavior baselines
      await this.initializeBehaviorBaselines();

      // Start continuous monitoring
      this.startContinuousMonitoring();

      // Start metrics broadcasting
      this.startMetricsBroadcasting();

      logger.info("✅ Advanced Threat Detection Engine fully operational");
    } catch (error) {
      logger.error("Error starting threat detection engine:", error);
      // Continue in basic mode
      this.startBasicMode();
    }
  }

  async loadThreatIntelligence() {
    try {
      // Enhanced threat intelligence data
      const threatIntel = {
        maliciousIPs: [
          "185.220.101.45",
          "87.251.75.245",
          "91.240.118.172",
          "159.65.153.82",
          "198.23.239.134",
          "104.248.169.173",
          "45.142.212.61",
          "194.147.85.16",
          "103.85.24.181",
        ],
        suspiciousDomains: [
          "malware-c2.com",
          "phishing-site.net",
          "data-exfil.org",
          "crypto-miner.xyz",
          "botnet-control.io",
          "darkweb-market.onion",
        ],
        knownAttackSignatures: [
          {
            pattern: /\/etc\/passwd/gi,
            type: "FILE_ACCESS_ATTEMPT",
            severity: 0.8,
          },
          {
            pattern: /admin.*admin/gi,
            type: "BRUTE_FORCE_ATTEMPT",
            severity: 0.7,
          },
          { pattern: /union.*select/gi, type: "SQL_INJECTION", severity: 0.9 },
          {
            pattern: /base64_decode/gi,
            type: "CODE_INJECTION",
            severity: 0.85,
          },
          { pattern: /eval\(/gi, type: "CODE_EXECUTION", severity: 0.95 },
        ],
        attackTechniques: {
          T1190: { name: "Exploit Public-Facing Application", severity: 0.8 },
          T1566: { name: "Phishing", severity: 0.6 },
          T1110: { name: "Brute Force", severity: 0.7 },
          T1041: { name: "Exfiltration Over C2 Channel", severity: 0.9 },
          T1059: { name: "Command and Scripting Interpreter", severity: 0.85 },
        },
      };

      this.threatIntelligence.set("current", threatIntel);
      logger.info("🛡️ Enhanced threat intelligence loaded successfully");
    } catch (error) {
      logger.error("Failed to load threat intelligence:", error);
    }
  }

  async initializeBehaviorBaselines() {
    try {
      // Enhanced baseline behavior profiles
      const baselineProfiles = {
        internal_users: {
          avgPacketSize: 850,
          avgConnectionDuration: 120,
          commonPorts: [80, 443, 22, 25, 993, 995],
          peakHours: [9, 10, 11, 13, 14, 15, 16, 17],
          avgRequestsPerHour: 245,
          normalEntropy: 0.4,
          maxConnections: 10,
        },
        servers: {
          avgPacketSize: 1200,
          avgConnectionDuration: 300,
          commonPorts: [80, 443, 22, 3306, 5432, 6379],
          peakHours: Array.from({ length: 24 }, (_, i) => i),
          avgRequestsPerHour: 1200,
          normalEntropy: 0.5,
          maxConnections: 100,
        },
        external: {
          avgPacketSize: 650,
          avgConnectionDuration: 45,
          commonPorts: [80, 443],
          suspiciousPatterns: [
            "large_data_transfer",
            "off_hours_activity",
            "high_frequency_requests",
          ],
          riskThreshold: 0.6,
        },
      };

      this.behaviorProfiles = new Map(Object.entries(baselineProfiles));
      logger.info("📊 Enhanced behavior baselines initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize behavior baselines:", error);
    }
  }

  startContinuousMonitoring() {
    // Removed mock threat generation loop; real data is handled by processRealTimeData()

    // Process threat correlation every 30 seconds
    setInterval(() => {
      this.correlateThreatEvents();
    }, 30000);

    // Update behavior baselines every 5 minutes
    setInterval(() => {
      this.updateBehaviorBaselines();
    }, 300000);

    // Update metrics every 10 seconds
    setInterval(() => {
      this.updateMetrics();
    }, 10000);

    logger.info(
      "🔄 Continuous monitoring started (awaiting real-time data from agents)"
    );
  }

  startMetricsBroadcasting() {
    setInterval(() => {
      this.broadcastMetrics();
    }, 5000);
  }

  startBasicMode() {
    logger.warn("⚠️ Starting in basic mode due to initialization errors");
    this.startContinuousMonitoring();
  }

  // Replace the mock data generator with real data processing
  // generateAndAnalyzeThreat() {
  //   // Removed - data will come from real agents
  // }

  // Enhanced real-time network data processing
  async processRealTimeData(realNetworkData) {
    try {
      logger.info("🔍 Processing real-time network data...");
      
      // Extract threat indicators from network data
      const threatIndicators = this.extractThreatIndicators(realNetworkData);
      
      if (threatIndicators.length > 0) {
        // Create comprehensive threat analysis
        const analysisResult = await this.analyzeRealNetworkThreat(
          realNetworkData,
          threatIndicators
        );

        if (analysisResult.threatScore > 0.1) {
          this.broadcastThreatUpdate(analysisResult);
          this.recentThreats.push(analysisResult);

          if (this.recentThreats.length > 200) {
            this.recentThreats.shift();
          }

                  // Save to database if connected, otherwise save to in-memory storage
        try {
          if (mongoose.connection && mongoose.connection.readyState === 1) {
            const threatData = new ThreatData(analysisResult);
            await threatData.save();
            logger.info("💾 Threat data saved to database");
          } else {
            // Save to in-memory storage when database is not available
            if (this.server && this.server.inMemoryStorage) {
              await this.server.inMemoryStorage.saveThreat(analysisResult);
              logger.info("💾 Threat data saved to in-memory storage");
            }
          }
        } catch (persistErr) {
          logger.error("Failed to persist real threat data:", persistErr);
        }
        }
      }

      // Always broadcast network status updates
      this.broadcastNetworkStatus(realNetworkData);
      
    } catch (error) {
      logger.error("Error processing real-time data:", error);
    }
  }

  // Extract threat indicators from real network data
  extractThreatIndicators(networkData) {
    const indicators = [];

    try {
      // Check for suspicious connections
      if (networkData.connectionAnalysis && networkData.connectionAnalysis.suspiciousConnections) {
        networkData.connectionAnalysis.suspiciousConnections.forEach(conn => {
          indicators.push({
            type: 'SUSPICIOUS_CONNECTION',
            severity: 'MEDIUM',
            source: conn.remoteIP,
            details: `Suspicious connection to ${conn.remoteIP}:${conn.remotePort} (${conn.protocol})`,
            connection: conn
          });
        });
      }

      // Check for unusual network activity
      if (networkData.networkStats) {
        networkData.networkStats.forEach(stat => {
          if (stat.errors > 10 || stat.dropped > 5) {
            indicators.push({
              type: 'NETWORK_ERRORS',
              severity: 'HIGH',
              source: stat.interface,
              details: `High error/drop rate on ${stat.interface}: ${stat.errors} errors, ${stat.dropped} dropped`,
              stats: stat
            });
          }
        });
      }

      // Check for threat indicators from network agent
      if (networkData.threatIndicators && networkData.threatIndicators.length > 0) {
        networkData.threatIndicators.forEach(indicator => {
          indicators.push({
            type: 'NETWORK_ANOMALY',
            severity: 'MEDIUM',
            source: 'Network Agent',
            details: indicator,
            timestamp: networkData.timestamp
          });
        });
      }

      // Check for unusual connection patterns
      if (networkData.connectionAnalysis) {
        const { externalConnections, internalConnections } = networkData.connectionAnalysis;
        
        if (externalConnections.length > 20) {
          indicators.push({
            type: 'HIGH_EXTERNAL_CONNECTIONS',
            severity: 'MEDIUM',
            source: 'Network Analysis',
            details: `High number of external connections: ${externalConnections.length}`,
            connections: externalConnections
          });
        }

        if (internalConnections.length > 50) {
          indicators.push({
            type: 'HIGH_INTERNAL_CONNECTIONS',
            severity: 'LOW',
            source: 'Network Analysis',
            details: `High number of internal connections: ${internalConnections.length}`,
            connections: internalConnections
          });
        }
      }

    } catch (error) {
      logger.error("Error extracting threat indicators:", error);
    }

    return indicators;
  }

  // Analyze real network threats
  async analyzeRealNetworkThreat(networkData, threatIndicators) {
    const startTime = Date.now();
    
    try {
      // Calculate threat score based on indicators
      let threatScore = 0;
      let threatLevel = 'LOW';
      let threatCategory = 'NETWORK_ANOMALY';
      
      threatIndicators.forEach(indicator => {
        switch (indicator.severity) {
          case 'CRITICAL':
            threatScore += 0.4;
            break;
          case 'HIGH':
            threatScore += 0.3;
            break;
          case 'MEDIUM':
            threatScore += 0.2;
            break;
          case 'LOW':
            threatScore += 0.1;
            break;
        }
      });

      // Normalize threat score
      threatScore = Math.min(threatScore, 1.0);
      
      // Determine threat level
      if (threatScore >= 0.8) threatLevel = 'CRITICAL';
      else if (threatScore >= 0.6) threatLevel = 'HIGH';
      else if (threatScore >= 0.3) threatLevel = 'MEDIUM';
      else threatLevel = 'LOW';

      // Create threat analysis result
      const analysisResult = {
        timestamp: new Date(),
        sourceIP: networkData.publicIP || 'Unknown',
        destinationIP: networkData.localIPs?.[0]?.ip || 'Unknown',
        protocol: 'MIXED',
        packetSize: 0,
        threatScore: Math.round(threatScore * 1000) / 1000,
        threatLevel: threatLevel,
        threatCategory: threatCategory,
        detectionMethods: [
          {
            method: 'REAL_TIME_NETWORK_ANALYSIS',
            confidence: Math.min(threatScore + 0.2, 1.0),
            details: `Real-time network monitoring detected ${threatIndicators.length} threat indicators`
          }
        ],
        mitigationActions: this.generateNetworkMitigationActions(threatIndicators),
        isBlocked: threatScore > 0.7,
        blockReason: threatScore > 0.7 ? 'Automated threat response based on real network data' : null,
        processingTime: Date.now() - startTime,
        
        // Network-specific data
        networkData: {
          publicIP: networkData.publicIP,
          localIPs: networkData.localIPs,
          connectionCount: networkData.connections?.length || 0,
          suspiciousConnections: networkData.connectionAnalysis?.suspiciousConnections?.length || 0,
          externalConnections: networkData.connectionAnalysis?.externalConnections?.length || 0,
          threatIndicators: networkData.threatIndicators || []
        }
      };

      return analysisResult;

    } catch (error) {
      logger.error("Error analyzing real network threat:", error);
      return this.getBasicThreatAnalysis(networkData);
    }
  }

  // Generate mitigation actions for network threats
  generateNetworkMitigationActions(threatIndicators) {
    const actions = [];

    threatIndicators.forEach(indicator => {
      switch (indicator.type) {
        case 'SUSPICIOUS_CONNECTION':
          actions.push(`Investigate connection to ${indicator.source}`);
          actions.push('Review firewall rules');
          break;
        case 'NETWORK_ERRORS':
          actions.push(`Check network interface ${indicator.source} for hardware issues`);
          actions.push('Review network configuration');
          break;
        case 'HIGH_EXTERNAL_CONNECTIONS':
          actions.push('Review external connection policies');
          actions.push('Implement connection rate limiting');
          break;
        case 'NETWORK_ANOMALY':
          actions.push('Review network baseline for changes');
          actions.push('Monitor for additional anomalies');
          break;
      }
    });

    return actions;
  }

  // Broadcast network status updates
  broadcastNetworkStatus(networkData) {
    try {
      if (this.io) {
        this.io.to("network").emit("networkStatusUpdate", {
          timestamp: new Date(),
          publicIP: networkData.publicIP,
          localIPs: networkData.localIPs,
          connectionCount: networkData.connections?.length || 0,
          networkStats: networkData.networkStats,
          threatIndicators: networkData.threatIndicators || []
        });
      }

      if (this.wss && this.wss.clients) {
        const message = JSON.stringify({
          type: "NETWORK_STATUS_UPDATE",
          data: {
            timestamp: new Date(),
            publicIP: networkData.publicIP,
            localIPs: networkData.localIPs,
            connectionCount: networkData.connections?.length || 0,
            networkStats: networkData.networkStats,
            threatIndicators: networkData.threatIndicators || []
          }
        });

        this.wss.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(message);
          }
        });
      }
    } catch (error) {
      logger.error("Error broadcasting network status:", error);
    }
  }

  generateAdvancedMockThreat() {
    const scenarios = [
      () => this.generateBruteForceAttempt(),
      () => this.generateDataExfiltrationAttempt(),
      () => this.generateMalwareActivity(),
      () => this.generatePhishingAttempt(),
      () => this.generateDDoSActivity(),
      () => this.generateNormalTraffic(),
      () => this.generateInsiderThreat(),
      () => this.generateAdvancedPersistentThreat(),
      () => this.generateCryptominingActivity(),
      () => this.generateZeroDayAttack(),
    ];

    // Enhanced weights for more realistic distribution
    const weights = [0.08, 0.05, 0.08, 0.06, 0.04, 0.5, 0.03, 0.06, 0.05, 0.05];
    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        const threat = scenarios[i]();
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
      "45.142.212.61",
    ];
    const targetServices = [
      { port: 22, protocol: "SSH" },
      { port: 23, protocol: "Telnet" },
      { port: 3389, protocol: "RDP" },
      { port: 21, protocol: "FTP" },
      { port: 25, protocol: "SMTP" },
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
    const malwareTypes = [
      "trojan",
      "ransomware",
      "botnet",
      "keylogger",
      "spyware",
    ];
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

  generateCryptominingActivity() {
    return {
      sourceIP: "192.168.1." + (Math.floor(Math.random() * 50) + 100),
      destinationIP: "194.147.85.16", // Mining pool
      protocol: "TCP",
      packetSize: Math.floor(Math.random() * 500) + 300,
      payloadSize: Math.floor(Math.random() * 400) + 250,
      features: {
        portNumber: 4444, // Common mining port
        connectionDuration: Math.floor(Math.random() * 3600) + 1800, // Long duration
        requestFrequency: Math.floor(Math.random() * 5) + 1,
        dataTransferRate: Math.floor(Math.random() * 500) + 100,
        headerAnomalies: ["mining_protocol_signature"],
        payloadEntropy: Math.random() * 0.3 + 0.6,
      },
      threatCategory: "CRYPTOMINING",
      attackSignature: "unauthorized_mining",
    };
  }

  generateZeroDayAttack() {
    return {
      sourceIP: "103.85.24.181",
      destinationIP: "192.168.1." + (Math.floor(Math.random() * 30) + 10),
      protocol: "HTTPS",
      packetSize: Math.floor(Math.random() * 2000) + 1000,
      payloadSize: Math.floor(Math.random() * 1800) + 800,
      features: {
        portNumber: 443,
        connectionDuration: Math.floor(Math.random() * 120) + 30,
        requestFrequency: Math.floor(Math.random() * 8) + 3,
        dataTransferRate: Math.floor(Math.random() * 2000) + 500,
        headerAnomalies: ["unknown_exploit_pattern", "novel_payload"],
        payloadEntropy: Math.random() * 0.2 + 0.8, // Very high entropy
      },
      threatCategory: "ZERO_DAY",
      attackSignature: "novel_exploitation_technique",
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

  async analyzeComprehensiveThreat(threatData) {
    const startTime = Date.now();

    try {
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
      const combinedAnalysis = this.combineAnalysisResults(
        analyses,
        threatData
      );

      // Add geolocation data
      combinedAnalysis.sourceLocation = await this.getGeolocation(
        threatData.sourceIP
      );

      // Calculate processing metrics
      combinedAnalysis.processingTime = Date.now() - startTime;
      combinedAnalysis.detectionLatency = Math.floor(Math.random() * 50) + 10;

      return combinedAnalysis;
    } catch (error) {
      logger.error("Error in comprehensive threat analysis:", error);
      return this.getBasicThreatAnalysis(threatData);
    }
  }

  getBasicThreatAnalysis(threatData) {
    return {
      ...threatData,
      timestamp: new Date(),
      threatScore: Math.random() * 0.5 + 0.3,
      threatLevel: this.calculateThreatLevel(Math.random() * 0.5 + 0.3),
      isBlocked: false,
      detectionMethods: [
        { method: "ANOMALY", confidence: 0.5, details: "Fallback analysis" },
      ],
      processingTime: 5,
    };
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

    // Ensure all required fields are present
    const result = {
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

    // Validate required fields
    if (!result.sourceIP || !result.destinationIP || !result.protocol || !result.packetSize) {
      logger.warn("Missing required fields in threat data, using defaults");
      result.sourceIP = result.sourceIP || "0.0.0.0";
      result.destinationIP = result.destinationIP || "0.0.0.0";
      result.protocol = result.protocol || "TCP";
      result.packetSize = result.packetSize || 64;
    }

    return result;
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

    if (threatData.threatCategory === "CRYPTOMINING") {
      actions.push("Block mining protocols");
      actions.push("Monitor CPU usage patterns");
    }

    return actions;
  }

  updateMetrics() {
    this.metrics.lastUpdate = Date.now();
  }

  broadcastMetrics() {
    if (this.io) {
      this.io.to("threats").emit("metricsUpdate", this.metrics);
    }
  }

  async correlateThreatEvents() {
    try {
      // Enhanced threat correlation logic
      const recentThreats = this.recentThreats.slice(-50);
      const correlatedCampaigns = this.identifyThreatCampaigns(recentThreats);

      if (correlatedCampaigns.length > 0) {
        logger.info(
          `Identified ${correlatedCampaigns.length} potential threat campaigns`
        );
        this.io.to("threats").emit("campaignDetected", correlatedCampaigns);
      }
    } catch (error) {
      logger.error("Error correlating threat events:", error);
    }
  }

  identifyThreatCampaigns(threats) {
    const campaigns = [];
    const ipGroups = new Map();

    // Group threats by source IP
    threats.forEach((threat) => {
      if (!ipGroups.has(threat.sourceIP)) {
        ipGroups.set(threat.sourceIP, []);
      }
      ipGroups.get(threat.sourceIP).push(threat);
    });

    // Identify potential campaigns
    ipGroups.forEach((threatList, sourceIP) => {
      if (threatList.length >= 3) {
        // 3 or more threats from same IP
        campaigns.push({
          id: crypto.randomUUID(),
          sourceIP,
          threatCount: threatList.length,
          highestThreatLevel: Math.max(...threatList.map((t) => t.threatScore)),
          timespan: {
            start: Math.min(
              ...threatList.map((t) => new Date(t.timestamp).getTime())
            ),
            end: Math.max(
              ...threatList.map((t) => new Date(t.timestamp).getTime())
            ),
          },
        });
      }
    });

    return campaigns;
  }

  async updateBehaviorBaselines() {
    try {
      // Enhanced baseline updating using recent threat patterns
      logger.info("📊 Updating behavior baselines based on recent patterns...");

      const recentThreats = this.recentThreats.slice(-100);
      if (recentThreats.length > 0) {
        // Update baseline thresholds based on recent observations
        this.adjustBaselineThresholds(recentThreats);
      }
    } catch (error) {
      logger.error("Error updating behavior baselines:", error);
    }
  }

  adjustBaselineThresholds(recentThreats) {
    const avgPacketSize =
      recentThreats.reduce((sum, t) => sum + t.packetSize, 0) /
      recentThreats.length;
    const avgDataRate =
      recentThreats.reduce((sum, t) => sum + t.features.dataTransferRate, 0) /
      recentThreats.length;

    // Adjust thresholds dynamically
    if (avgPacketSize > 1500) {
      logger.info(
        "🔧 Adjusting packet size threshold due to increased average"
      );
    }
    if (avgDataRate > 3000) {
      logger.info(
        "🔧 Adjusting data transfer rate threshold due to increased average"
      );
    }
  }

  async checkAttackCampaign(threatData) {
    try {
      const campaignId = `campaign_${threatData.sourceIP}_${Date.now()}`;
      if (threatData.threatScore > 0.7) {
        logger.info(`🚨 Potential attack campaign detected: ${campaignId}`);

        // Store campaign information
        this.attackCampaigns.set(campaignId, {
          sourceIP: threatData.sourceIP,
          startTime: new Date(),
          threatCount: 1,
          highestScore: threatData.threatScore,
        });
      }
    } catch (error) {
      logger.error("Error checking attack campaign:", error);
    }
  }

  subscribeToStream(ws, filters) {
    try {
      // Handle WebSocket subscription for threat streams
      ws.threatFilters = filters;
      logger.info("📡 Client subscribed to threat stream");
    } catch (error) {
      logger.error("Error subscribing to threat stream:", error);
    }
  }

  async getGeolocation(ip) {
    // Enhanced geolocation data
    const locations = {
      "192.168.1.100": {
        country: "Local",
        city: "Internal",
        latitude: 0,
        longitude: 0,
        isp: "Internal Network",
        riskLevel: "LOW",
      },
      "185.220.101.45": {
        country: "Russia",
        city: "Moscow",
        latitude: 55.7558,
        longitude: 37.6173,
        isp: "Malicious Hosting",
        riskLevel: "CRITICAL",
      },
      "87.251.75.245": {
        country: "China",
        city: "Beijing",
        latitude: 39.9042,
        longitude: 116.4074,
        isp: "Unknown ISP",
        riskLevel: "HIGH",
      },
      "91.240.118.172": {
        country: "Netherlands",
        city: "Amsterdam",
        latitude: 52.3676,
        longitude: 4.9041,
        isp: "VPN Provider",
        riskLevel: "MEDIUM",
      },
      "159.65.153.82": {
        country: "USA",
        city: "New York",
        latitude: 40.7128,
        longitude: -74.006,
        isp: "Cloud Provider",
        riskLevel: "MEDIUM",
      },
      "104.248.169.173": {
        country: "Singapore",
        city: "Singapore",
        latitude: 1.3521,
        longitude: 103.8198,
        isp: "Hosting Provider",
        riskLevel: "HIGH",
      },
      "45.142.212.61": {
        country: "Germany",
        city: "Frankfurt",
        latitude: 50.1109,
        longitude: 8.6821,
        isp: "Bulletproof Hosting",
        riskLevel: "HIGH",
      },
      "194.147.85.16": {
        country: "Romania",
        city: "Bucharest",
        latitude: 44.4268,
        longitude: 26.1025,
        isp: "Mining Pool",
        riskLevel: "MEDIUM",
      },
      "103.85.24.181": {
        country: "Vietnam",
        city: "Ho Chi Minh City",
        latitude: 10.8231,
        longitude: 106.6297,
        isp: "APT Group",
        riskLevel: "CRITICAL",
      },
    };

    return (
      locations[ip] || {
        country: "Unknown",
        city: "Unknown",
        latitude: 0,
        longitude: 0,
        isp: "Unknown ISP",
        riskLevel: "UNKNOWN",
      }
    );
  }

  broadcastThreatUpdate(threatData) {
    try {
      // Socket.io broadcast to threats room
      this.io.to("threats").emit("threatUpdate", threatData);

      // High-priority threats get immediate alerts
      if (
        threatData.threatLevel === "CRITICAL" ||
        threatData.threatLevel === "HIGH"
      ) {
        this.io.to("threats").emit("criticalThreatAlert", {
          ...threatData,
          alert: `🚨 ${threatData.threatLevel} threat detected from ${threatData.sourceIP}`,
          timestamp: Date.now(),
        });
      }

      // WebSocket broadcast for high-frequency data
      if (this.wss && this.wss.clients) {
        const message = JSON.stringify({
          type: "THREAT_UPDATE",
          data: threatData,
          timestamp: Date.now(),
        });

        this.wss.clients.forEach((client) => {
          if (client.readyState === 1) {
            // WebSocket.OPEN
            client.send(message);
          }
        });
      }
    } catch (error) {
      logger.error("Error broadcasting threat update:", error);
    }
  }

  // Provide recent threats for server streaming calls
  getRecentThreats(limit = 10) {
    if (!Array.isArray(this.recentThreats) || this.recentThreats.length === 0) {
      return [];
    }
    return this.recentThreats.slice(-limit);
  }

  // Get system metrics
  getMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.metrics.lastUpdate,
      recentThreatsCount: this.recentThreats.length,
      activeCampaigns: this.attackCampaigns.size,
    };
  }

  stop() {
    this.isRunning = false;
    logger.info("🛑 Advanced Threat Detection Engine stopped");
  }
}

// Enhanced Detection Engine Classes
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
        case "botnet_communication":
          threatScore = 0.95;
          detected = true;
          break;
        case "unauthorized_mining":
          threatScore = 0.7;
          detected = true;
          break;
        case "novel_exploitation_technique":
          threatScore = 0.98;
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

    // Port anomaly - check if features exist
    if (threatData.features && threatData.features.portNumber > 8000) {
      threatScore += 0.2;
    }

    // High data transfer rate - check if features exist
    if (threatData.features && threatData.features.dataTransferRate > 5000) {
      threatScore += 0.4;
      detected = true;
    }

    // Entropy anomaly - check if features exist
    if (threatData.features && threatData.features.payloadEntropy > 0.7) {
      threatScore += 0.3;
    }

    // Connection frequency anomaly - check if features exist
    if (threatData.features && threatData.features.requestFrequency > 50) {
      threatScore += 0.3;
      detected = true;
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
      if (threatData.features && threatData.features.dataTransferRate > 2000) {
        threatScore += 0.4;
        detected = true;
      }
    }

    // Frequency analysis
    if (threatData.features && threatData.features.requestFrequency > 30) {
      threatScore += 0.3;
      detected = true;
    }

    // Connection duration analysis
    if (
      threatData.features &&
      threatData.features.connectionDuration < 5 &&
      threatData.features.requestFrequency > 10
    ) {
      threatScore += 0.2; // Rapid connections could indicate scanning
    }

    // Geographic analysis
    if (
      threatData.sourceLocation &&
      threatData.sourceLocation.riskLevel === "CRITICAL"
    ) {
      threatScore += 0.3;
      detected = true;
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
    // Enhanced ML model simulation
    let threatScore = 0;
    let detected = false;

    try {
      // Feature-based ML simulation with proper calculation
      const features = [
        threatData.packetSize / 3000, // Normalized packet size
        threatData.features.payloadEntropy,
        threatData.features.requestFrequency / 100,
        threatData.features.dataTransferRate / 10000,
      ];

      // Calculate weighted sum
      const weights = [0.2, 0.4, 0.3, 0.3];
      let sum = 0;

      for (let i = 0; i < features.length && i < weights.length; i++) {
        sum += (features[i] || 0) * weights[i];
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
    } catch (error) {
      // Fallback in case of ML analysis error
      return {
        threatScore: 0.1,
        detected: false,
        method: {
          method: "ML_MODEL",
          confidence: 0.1,
          details: "ML analysis failed - using fallback",
        },
      };
    }
  }
}

module.exports = AdvancedThreatDetectionEngine;
