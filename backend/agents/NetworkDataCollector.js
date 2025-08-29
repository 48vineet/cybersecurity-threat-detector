const si = require("systeminformation");
const WebSocket = require("ws");
const os = require("os");
const { exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);

class HackathonNetworkAgent {
  constructor() {
    this.ws = null;
    this.collectionInterval = null;
    this.networkBaseline = null;
    this.connectionHistory = new Map();
    this.threatIndicators = new Set();
    this.isRunning = false;
  }

  async start() {
    console.log("🚀 Starting Real Network Monitoring Agent...");
    
    try {
      // Connect to your backend WebSocket
      this.ws = new WebSocket("ws://localhost:3002");

      this.ws.on("open", () => {
        console.log("✅ Hackathon Network Agent Connected to Backend!");
        this.isRunning = true;
        this.initializeBaseline();
        this.startDataCollection();
      });

      this.ws.on("error", (error) => {
        console.error("❌ WebSocket connection error:", error.message);
        this.reconnect();
      });

      this.ws.on("close", () => {
        console.log("🔌 WebSocket connection closed, attempting to reconnect...");
        this.isRunning = false;
        this.reconnect();
      });

    } catch (error) {
      console.error("❌ Failed to start network agent:", error);
      this.reconnect();
    }
  }

  async reconnect() {
    if (this.isRunning) return;
    
    setTimeout(async () => {
      console.log("🔄 Attempting to reconnect...");
      await this.start();
    }, 5000);
  }

  async initializeBaseline() {
    try {
      console.log("📊 Initializing network baseline...");
      
      // Get initial network state
      const [networkStats, connections, interfaces] = await Promise.all([
        si.networkStats(),
        si.networkConnections(),
        si.networkInterfaces()
      ]);

      // Calculate baseline metrics
      this.networkBaseline = {
        timestamp: Date.now(),
        interfaces: interfaces.map(iface => ({
          name: iface.iface,
          ip: iface.ip4,
          mac: iface.mac,
          type: iface.type,
          speed: iface.speed,
          duplex: iface.duplex
        })),
        baselineStats: networkStats.map(stat => ({
          interface: stat.iface,
          rxBytes: stat.rx_bytes,
          txBytes: stat.tx_bytes,
          rxPackets: stat.rx_packets,
          txPackets: stat.tx_packets
        })),
        baselineConnections: connections.length
      };

      console.log(`✅ Network baseline established with ${connections.length} active connections`);
      
    } catch (error) {
      console.error("❌ Failed to initialize baseline:", error);
    }
  }

  async startDataCollection() {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
    }

    console.log("🔄 Starting real-time network data collection...");
    
    // Collect data every 2 seconds for real-time monitoring
    this.collectionInterval = setInterval(async () => {
      if (!this.isRunning) return;
      
      try {
        console.log("📊 Collecting network data...");
        const networkData = await this.collectRealNetworkData();
        
        if (networkData && networkData.connections) {
          console.log(`📡 Collected ${networkData.connections.length} network connections`);
          console.log(`🌐 Public IP: ${networkData.publicIP}`);
          console.log(`🏠 Local IPs: ${networkData.localIPs?.length || 0}`);
          
          this.analyzeNetworkData(networkData);
          this.sendToBackend(networkData);
        } else {
          console.warn("⚠️ No network data collected");
        }
      } catch (error) {
        console.error("❌ Error collecting network data:", error);
      }
    }, 2000);

    console.log("✅ Real-time network data collection started (every 2 seconds)");
  }

  async collectRealNetworkData() {
    try {
      // Get comprehensive network information
      const [networkStats, connections, interfaces, defaultGateway] = await Promise.all([
        si.networkStats(),
        si.networkConnections(),
        si.networkInterfaces(),
        this.getDefaultGateway()
      ]);

      // Get your public IP address
      const publicIP = await this.getPublicIP();
      
      // Get active network processes
      const activeProcesses = await this.getActiveNetworkProcesses();

      const networkData = {
        timestamp: Date.now(),
        publicIP: publicIP,
        defaultGateway: defaultGateway,
        localIPs: this.getLocalIPs(),
        
        // Active network connections
        connections: connections.map(conn => ({
          localIP: conn.localaddress,
          remoteIP: conn.peeraddress,
          localPort: conn.localport,
          remotePort: conn.peerport,
          protocol: conn.protocol,
          state: conn.state,
          pid: conn.pid,
          process: activeProcesses[conn.pid] || 'Unknown'
        })),

        // Network interface statistics
        networkStats: networkStats.map(stat => ({
          interface: stat.iface,
          bytesReceived: stat.rx_bytes,
          bytesSent: stat.tx_bytes,
          packetsReceived: stat.rx_packets,
          packetsSent: stat.tx_packets,
          errors: stat.rx_errors + stat.tx_errors,
          dropped: stat.rx_dropped + stat.tx_dropped
        })),

        // Network interfaces
        interfaces: interfaces.map(iface => ({
          name: iface.iface,
          ip: iface.ip4,
          mac: iface.mac,
          type: iface.type,
          speed: iface.speed,
          duplex: iface.duplex,
          mtu: iface.mtu,
          carrier: iface.carrier
        })),

        // Connection analysis
        connectionAnalysis: this.analyzeConnections(connections),
        
        // Threat indicators
        threatIndicators: Array.from(this.threatIndicators)
      };

      return networkData;

    } catch (error) {
      console.error("❌ Error collecting network data:", error);
      return {
        timestamp: Date.now(),
        error: error.message,
        connections: [],
        networkStats: [],
        interfaces: []
      };
    }
  }

  async getDefaultGateway() {
    try {
      if (os.platform() === 'win32') {
        const { stdout } = await execAsync('route print | findstr "0.0.0.0"');
        const lines = stdout.split('\n');
        for (const line of lines) {
          if (line.includes('0.0.0.0')) {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 4) {
              return parts[3];
            }
          }
        }
      } else {
        const { stdout } = await execAsync('ip route | grep default');
        const match = stdout.match(/default via (\S+)/);
        return match ? match[1] : null;
      }
    } catch (error) {
      console.warn("⚠️ Could not determine default gateway:", error.message);
    }
    return null;
  }

  async getPublicIP() {
    try {
      // Try multiple IP services for redundancy
      const ipServices = [
        'https://api.ipify.org',
        'https://ipinfo.io/ip',
        'https://icanhazip.com'
      ];

      for (const service of ipServices) {
        try {
          const response = await fetch(service);
          if (response.ok) {
            const ip = await response.text();
            return ip.trim();
          }
        } catch (error) {
          continue;
        }
      }
    } catch (error) {
      console.warn("⚠️ Could not determine public IP:", error.message);
    }
    return 'Unknown';
  }

  getLocalIPs() {
    const interfaces = os.networkInterfaces();
    const localIPs = [];

    Object.keys(interfaces).forEach(ifaceName => {
      interfaces[ifaceName].forEach(iface => {
        if (iface.family === 'IPv4' && !iface.internal) {
          localIPs.push({
            interface: ifaceName,
            ip: iface.address,
            netmask: iface.netmask,
            mac: iface.mac
          });
        }
      });
    });

    return localIPs;
  }

  async getActiveNetworkProcesses() {
    try {
      if (os.platform() === 'win32') {
        const { stdout } = await execAsync('netstat -ano | findstr ESTABLISHED');
        const processes = {};
        
        for (const line of stdout.split('\n')) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5) {
            const pid = parts[4];
            if (pid && pid !== 'PID') {
              try {
                const { stdout: taskOutput } = await execAsync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`);
                const taskMatch = taskOutput.match(/"([^"]+)"/);
                if (taskMatch) {
                  processes[pid] = taskMatch[1];
                }
              } catch (error) {
                processes[pid] = 'Unknown';
              }
            }
          }
        }
        
        return processes;
      } else {
        const { stdout } = await execAsync('netstat -tulpn 2>/dev/null | grep ESTABLISHED');
        const processes = {};
        
        stdout.split('\n').forEach(line => {
          const match = line.match(/(\d+)\/(\w+)/);
          if (match) {
            const pid = match[1];
            const process = match[2];
            processes[pid] = process;
          }
        });
        
        return processes;
      }
    } catch (error) {
      console.warn("⚠️ Could not get active network processes:", error.message);
      return {};
    }
  }

  analyzeConnections(connections) {
    const analysis = {
      totalConnections: connections.length,
      byProtocol: {},
      byState: {},
      suspiciousConnections: [],
      externalConnections: [],
      internalConnections: []
    };

    connections.forEach(conn => {
      // Count by protocol
      analysis.byProtocol[conn.protocol] = (analysis.byProtocol[conn.protocol] || 0) + 1;
      
      // Count by state
      analysis.byState[conn.state] = (analysis.byState[conn.state] || 0) + 1;

      // Categorize connections
      if (this.isInternalIP(conn.remoteIP)) {
        analysis.internalConnections.push(conn);
      } else {
        analysis.externalConnections.push(conn);
        
        // Check for suspicious external connections
        if (this.isSuspiciousConnection(conn)) {
          analysis.suspiciousConnections.push(conn);
        }
      }
    });

    return analysis;
  }

  isInternalIP(ip) {
    if (!ip) return false;
    
    // Check for private IP ranges
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^127\./,
      /^169\.254\./
    ];

    return privateRanges.some(range => range.test(ip));
  }

  isSuspiciousConnection(conn) {
    // Check for suspicious patterns
    const suspiciousPorts = [22, 23, 3389, 445, 1433, 3306, 5432, 6379];
    const suspiciousStates = ['TIME_WAIT', 'CLOSE_WAIT', 'FIN_WAIT_2'];
    
    return (
      suspiciousPorts.includes(conn.remotePort) ||
      suspiciousStates.includes(conn.state) ||
      conn.remotePort > 49152 // Dynamic ports
    );
  }

  analyzeNetworkData(networkData) {
    if (!this.networkBaseline) return;

    // Detect anomalies
    const anomalies = [];
    
    // Check for unusual connection count
    const connectionChange = Math.abs(networkData.connections.length - this.networkBaseline.baselineConnections);
    if (connectionChange > 10) {
      anomalies.push({
        type: 'UNUSUAL_CONNECTION_COUNT',
        severity: 'MEDIUM',
        message: `Connection count changed by ${connectionChange} from baseline`,
        current: networkData.connections.length,
        baseline: this.networkBaseline.baselineConnections
      });
    }

    // Check for suspicious external connections
    if (networkData.connectionAnalysis.suspiciousConnections.length > 5) {
      anomalies.push({
        type: 'MULTIPLE_SUSPICIOUS_CONNECTIONS',
        severity: 'HIGH',
        message: `${networkData.connectionAnalysis.suspiciousConnections.length} suspicious external connections detected`,
        connections: networkData.connectionAnalysis.suspiciousConnections
      });
    }

    // Check for unusual network activity
    networkData.networkStats.forEach(stat => {
      const baseline = this.networkBaseline.baselineStats.find(b => b.interface === stat.interface);
      if (baseline) {
        const rxChange = Math.abs(stat.bytesReceived - baseline.rxBytes);
        const txChange = Math.abs(stat.bytesSent - baseline.txBytes);
        
        if (rxChange > baseline.rxBytes * 0.5 || txChange > baseline.txBytes * 0.5) {
          anomalies.push({
            type: 'UNUSUAL_NETWORK_ACTIVITY',
            severity: 'MEDIUM',
            message: `Unusual network activity on interface ${stat.interface}`,
            interface: stat.interface,
            rxChange: rxChange,
            txChange: txChange
          });
        }
      }
    });

    // Update threat indicators
    if (anomalies.length > 0) {
      anomalies.forEach(anomaly => {
        this.threatIndicators.add(anomaly.type);
      });
      
      console.log(`🚨 Detected ${anomalies.length} network anomalies:`, anomalies);
    }

    // Update baseline periodically
    if (Date.now() - this.networkBaseline.timestamp > 60000) { // Every minute
      this.updateBaseline(networkData);
    }
  }

  updateBaseline(networkData) {
    this.networkBaseline = {
      timestamp: Date.now(),
      baselineConnections: networkData.connections.length,
      baselineStats: networkData.networkStats
    };
  }

  sendToBackend(data) {
    if (!this.ws) {
      console.warn("⚠️ WebSocket not connected, cannot send data");
      return;
    }
    
    if (this.ws.readyState === WebSocket.OPEN) {
      try {
        const message = {
          type: "REAL_NETWORK_DATA",
          data: data,
          source: "hackathon_network_agent",
          timestamp: Date.now()
        };
        
        console.log("📤 Sending network data to backend...");
        this.ws.send(JSON.stringify(message));
        console.log("✅ Network data sent successfully");
        
      } catch (error) {
        console.error("❌ Error sending data to backend:", error);
      }
    } else {
      console.warn(`⚠️ WebSocket not ready (state: ${this.ws.readyState}), reconnecting...`);
      this.reconnect();
    }
  }

  stop() {
    console.log("🛑 Stopping Network Agent...");
    this.isRunning = false;
    
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    console.log("✅ Network Agent stopped");
  }
}

module.exports = HackathonNetworkAgent;
