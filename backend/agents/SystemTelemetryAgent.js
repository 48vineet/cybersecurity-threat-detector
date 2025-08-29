// backend/agents/SystemTelemetryAgent.js
const si = require("systeminformation");

class SystemTelemetryAgent {
  constructor(threatEngine) {
    this.threatEngine = threatEngine;
    this.baseline = null;
  }

  async start() {
    await this.establishBaseline();
    this.startContinuousMonitoring();
  }

  async establishBaseline() {
    const samples = [];
    for (let i = 0; i < 10; i++) {
      const sample = await this.collectSystemMetrics();
      samples.push(sample);
      await this.sleep(1000);
    }

    this.baseline = this.calculateBaseline(samples);
    console.log("📊 System baseline established");
  }

  async collectSystemMetrics() {
    const [cpu, memory, networkStats, processes] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.networkStats(),
      si.processes(),
    ]);

    return { cpu, memory, networkStats, processes };
  }

  startContinuousMonitoring() {
    setInterval(async () => {
      const currentMetrics = await this.collectSystemMetrics();
      const anomalies = this.detectSystemAnomalies(currentMetrics);

      anomalies.forEach((anomaly) => {
        this.threatEngine.processRealTimeData(anomaly);
      });
    }, 3000);
  }

  detectSystemAnomalies(currentMetrics) {
    const anomalies = [];

    // CPU usage spike
    if (currentMetrics.cpu.currentload > this.baseline.cpu.average * 2) {
      anomalies.push({
        type: "CPU_SPIKE",
        value: currentMetrics.cpu.currentload,
        baseline: this.baseline.cpu.average,
        timestamp: Date.now(),
        threatScore: 0.4,
        source: "SYSTEM_MONITOR",
      });
    }

    // Memory usage anomaly
    if (currentMetrics.memory.active > this.baseline.memory.average * 1.5) {
      anomalies.push({
        type: "MEMORY_ANOMALY",
        value: currentMetrics.memory.active,
        baseline: this.baseline.memory.average,
        timestamp: Date.now(),
        threatScore: 0.3,
        source: "SYSTEM_MONITOR",
      });
    }

    // Network anomalies
    currentMetrics.networkStats.forEach((stat, index) => {
      const baselineStat = this.baseline.networkStats[index];
      if (baselineStat && stat.rx_bytes > baselineStat.rx_bytes * 3) {
        anomalies.push({
          type: "NETWORK_SPIKE",
          interface: stat.iface,
          value: stat.rx_bytes,
          baseline: baselineStat.rx_bytes,
          timestamp: Date.now(),
          threatScore: 0.6,
          source: "SYSTEM_MONITOR",
        });
      }
    });

    return anomalies;
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = SystemTelemetryAgent;
