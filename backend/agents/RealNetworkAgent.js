const { spawn } = require("child_process");
const si = require("systeminformation");
const WebSocket = require("ws");
const EventEmitter = require("events");
const logger = require("../../utils/logger");

class RealNetworkTelemetryAgent extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = options;
    this.running = false;
    this.serverUrl = options.serverUrl || "ws://localhost:3002";
    this.ws = null;
    this.networkInterfaces = [];
  }

  async start() {
    if (this.running) return;
    this.running = true;
    logger.info(
      "RealNetworkTelemetryAgent started (awaiting external telemetry)"
    );
    await this.connectToServer();
    await this.discoverNetworkInterfaces();
    this.startRealNetworkCapture();
    console.log("🔥 Real Network Telemetry Agent started");
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    this.removeAllListeners("telemetry");
    logger.info("RealNetworkTelemetryAgent stopped");
  }

  async discoverNetworkInterfaces() {
    try {
      const interfaces = await si.networkInterfaces();
      this.networkInterfaces = interfaces.filter(
        (iface) => !iface.internal && iface.operstate === "up"
      );
      console.log(
        "📡 Discovered network interfaces:",
        this.networkInterfaces.map((i) => i.iface)
      );
    } catch (error) {
      console.error("Failed to discover network interfaces:", error);
    }
  }

  startRealNetworkCapture() {
    // Method 1: Use netstat for active connections
    this.captureActiveConnections();

    // Method 2: Monitor network interface statistics
    this.monitorNetworkStats();

    // Method 3: Parse system logs for network events
    this.parseSystemLogs();
  }

  captureActiveConnections() {
    setInterval(async () => {
      try {
        const connections = await si.networkConnections();
        const activeConnections = connections.filter(
          (conn) => conn.state === "ESTABLISHED" || conn.state === "LISTEN"
        );

        for (const conn of activeConnections) {
          const networkData = this.processRealConnection(conn);
          if (networkData.isSuspicious) {
            this.sendToMLEngine(networkData);
          }
        }
      } catch (error) {
        console.error("Error capturing connections:", error);
      }
    }, 2000);
  }

  processRealConnection(connection) {
    // Analyze real connection for suspicious patterns
    const features = {
      timestamp: Date.now(),
      sourceIP: connection.localaddress || "127.0.0.1",
      destIP: connection.peeraddress || "0.0.0.0",
      sourcePort: connection.localport,
      destPort: connection.peerport,
      protocol: connection.protocol?.toUpperCase() || "TCP",
      state: connection.state,
      pid: connection.pid,
      process: connection.process,
    };

    // Real-time threat analysis
    const analysis = this.analyzeConnectionSecurity(features);

    return {
      ...features,
      ...analysis,
      source: "REAL_NETWORK",
    };
  }

  analyzeConnectionSecurity(connection) {
    let threatScore = 0;
    let isSuspicious = false;
    let reasons = [];

    // Check for suspicious ports
    const suspiciousPorts = [4444, 6666, 1337, 31337, 54321];
    if (suspiciousPorts.includes(connection.destPort)) {
      threatScore += 0.7;
      isSuspicious = true;
      reasons.push("Suspicious destination port");
    }

    // Check for external connections to suspicious IPs
    if (this.isExternalIP(connection.destIP)) {
      if (this.isKnownMaliciousIP(connection.destIP)) {
        threatScore += 0.9;
        isSuspicious = true;
        reasons.push("Connection to known malicious IP");
      }
    }

    // Check for unusual high ports
    if (connection.destPort > 8000 && connection.destPort < 65535) {
      threatScore += 0.3;
      if (Math.random() > 0.8) isSuspicious = true; // 20% chance
      reasons.push("High port number usage");
    }

    // Check for off-hours activity
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      threatScore += 0.2;
      reasons.push("Off-hours network activity");
    }

    return {
      threatScore: Math.min(threatScore, 1.0),
      isSuspicious,
      reasons,
      threatCategory: this.categorizeThreat(reasons),
      features: {
        isExternal: this.isExternalIP(connection.destIP),
        isHighPort: connection.destPort > 8000,
        isOffHours: hour < 6 || hour > 22,
      },
    };
  }

  isExternalIP(ip) {
    if (!ip || ip === "0.0.0.0") return false;
    return (
      !ip.startsWith("192.168.") &&
      !ip.startsWith("10.") &&
      !ip.startsWith("127.") &&
      !ip.startsWith("172.16.")
    );
  }

  isKnownMaliciousIP(ip) {
    const maliciousIPs = ["185.220.101.45", "87.251.75.245", "91.240.118.172"];
    return maliciousIPs.includes(ip);
  }

  categorizeThreat(reasons) {
    if (reasons.some((r) => r.includes("malicious"))) return "MALWARE";
    if (reasons.some((r) => r.includes("port"))) return "PORT_SCAN";
    if (reasons.some((r) => r.includes("off-hours")))
      return "SUSPICIOUS_ACTIVITY";
    return "ANOMALY";
  }

  sendToMLEngine(networkData) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "REAL_NETWORK_DATA",
          data: networkData,
          agentId: this.agentId,
          timestamp: Date.now(),
        })
      );
    }
  }

  // Additional methods for network stats monitoring...
  async monitorNetworkStats() {
    setInterval(async () => {
      try {
        const networkStats = await si.networkStats();
        const anomalies = this.detectNetworkAnomalies(networkStats);

        if (anomalies.length > 0) {
          anomalies.forEach((anomaly) => this.sendToMLEngine(anomaly));
        }
      } catch (error) {
        console.error("Network stats monitoring error:", error);
      }
    }, 5000);
  }

  detectNetworkAnomalies(networkStats) {
    const anomalies = [];

    networkStats.forEach((stat) => {
      // Check for unusual traffic spikes
      if (stat.rx_bytes > 10000000) {
        // 10MB in one reading
        anomalies.push({
          type: "HIGH_BANDWIDTH_USAGE",
          interface: stat.iface,
          rxBytes: stat.rx_bytes,
          txBytes: stat.tx_bytes,
          timestamp: Date.now(),
          threatScore: 0.6,
          isSuspicious: true,
        });
      }
    });

    return anomalies;
  }

  // Push decoded network telemetry to subscribers
  ingest(data) {
    if (!this.running) return;
    // Expect data in the shape expected by processRealTimeData(...)
    this.emit("telemetry", data);
  }
}

// Normalize accidental double /api prefix (keeps method/body via 307)
this.app.use((req, res, next) => {
  if (req.url.startsWith("/api/api/")) {
    req.url = req.url.replace("/api/api/", "/api/");
  }
  next();
});

module.exports = RealNetworkTelemetryAgent;
