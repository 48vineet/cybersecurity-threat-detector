class NetworkFeatureExtractor {
  extractFeatures(networkData) {
    const features = {
      // Connection-based features
      totalConnections: networkData.connections.length,
      establishedConnections: this.countByState(
        networkData.connections,
        "ESTABLISHED"
      ),
      listeningPorts: this.countByState(networkData.connections, "LISTEN"),

      // Protocol distribution
      tcpConnections: this.countByProtocol(networkData.connections, "tcp"),
      udpConnections: this.countByProtocol(networkData.connections, "udp"),

      // Port analysis
      highPorts: this.countHighPorts(networkData.connections),
      privilegedPorts: this.countPrivilegedPorts(networkData.connections),

      // External connections (potential threat indicator)
      externalConnections: this.countExternalConnections(
        networkData.connections
      ),

      // Traffic volume features
      totalBytesReceived: this.sumNetworkStats(
        networkData.networkStats,
        "bytesReceived"
      ),
      totalBytesSent: this.sumNetworkStats(
        networkData.networkStats,
        "bytesSent"
      ),
      totalPackets:
        this.sumNetworkStats(networkData.networkStats, "packetsReceived") +
        this.sumNetworkStats(networkData.networkStats, "packetsSent"),

      // Time-based features
      hourOfDay: new Date().getHours(),
      isOffHours: this.isOffHours(),

      // Calculated risk indicators
      portDiversity: this.calculatePortDiversity(networkData.connections),
      connectionEntropy: this.calculateConnectionEntropy(
        networkData.connections
      ),
    };

    return this.normalizeFeatures(features);
  }

  // Feature extraction helper methods
  countByState(connections, state) {
    return connections.filter((conn) => conn.state === state).length;
  }

  countExternalConnections(connections) {
    return connections.filter((conn) => !this.isInternalIP(conn.remoteIP))
      .length;
  }

  isInternalIP(ip) {
    if (!ip) return true;
    return (
      ip.startsWith("192.168.") ||
      ip.startsWith("10.") ||
      ip.startsWith("172.16.") ||
      ip.startsWith("127.")
    );
  }

  calculatePortDiversity(connections) {
    const ports = new Set(connections.map((c) => c.remotePort));
    return ports.size / Math.max(connections.length, 1);
  }

  normalizeFeatures(features) {
    // Normalize features to 0-1 range for ML models
    return {
      totalConnections: Math.min(features.totalConnections / 100, 1),
      externalConnections: Math.min(features.externalConnections / 20, 1),
      portDiversity: features.portDiversity,
      isOffHours: features.isOffHours ? 1 : 0,
      // ... normalize other features
      rawFeatures: features, // Keep raw for analysis
    };
  }
}

module.exports = NetworkFeatureExtractor;
