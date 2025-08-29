const si = require("systeminformation");
const WebSocket = require("ws");

class HackathonNetworkAgent {
  constructor() {
    this.ws = null;
    this.collectionInterval = null;
  }

  async start() {
    // Connect to your backend WebSocket
    this.ws = new WebSocket("ws://localhost:3002");

    this.ws.on("open", () => {
      console.log("🚀 Hackathon Network Agent Connected!");
      this.startDataCollection();
    });
  }

  async startDataCollection() {
    this.collectionInterval = setInterval(async () => {
      const networkData = await this.collectRealNetworkData();
      this.sendToBackend(networkData);
    }, 2000); // Collect every 2 seconds for demo
  }

  async collectRealNetworkData() {
    // Get REAL network statistics
    const [networkStats, connections] = await Promise.all([
      si.networkStats(),
      si.networkConnections(),
    ]);

    return {
      timestamp: Date.now(),
      connections: connections.map((conn) => ({
        localIP: conn.localaddress,
        remoteIP: conn.peeraddress,
        localPort: conn.localport,
        remotePort: conn.peerport,
        protocol: conn.protocol,
        state: conn.state,
        pid: conn.pid,
      })),
      networkStats: networkStats.map((stat) => ({
        interface: stat.iface,
        bytesReceived: stat.rx_bytes,
        bytesSent: stat.tx_bytes,
        packetsReceived: stat.rx_packets,
        packetsSent: stat.tx_packets,
      })),
    };
  }

  sendToBackend(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "REAL_NETWORK_DATA",
          data,
          source: "hackathon_agent",
        })
      );
    }
  }
}

module.exports = HackathonNetworkAgent;
