// backend/middleware/networkMonitor.js
const originalHttp = require("http");
const originalHttps = require("https");

class ApplicationNetworkMonitor {
  constructor(threatEngine) {
    this.threatEngine = threatEngine;
    this.requests = new Map();
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Intercept HTTP requests
    const originalHttpRequest = originalHttp.request;
    originalHttp.request = (options, callback) => {
      this.logOutgoingRequest("HTTP", options);
      return originalHttpRequest.call(originalHttp, options, callback);
    };

    // Intercept HTTPS requests
    const originalHttpsRequest = originalHttps.request;
    originalHttps.request = (options, callback) => {
      this.logOutgoingRequest("HTTPS", options);
      return originalHttpsRequest.call(originalHttps, options, callback);
    };
  }

  logOutgoingRequest(protocol, options) {
    const requestData = {
      timestamp: Date.now(),
      protocol,
      hostname: options.hostname || options.host,
      port: options.port || (protocol === "HTTPS" ? 443 : 80),
      path: options.path || "/",
      method: options.method || "GET",
      source: "APPLICATION_LEVEL",
    };

    // Analyze if this request is suspicious
    const analysis = this.analyzeRequest(requestData);
    if (analysis.isSuspicious) {
      this.threatEngine.processRealTimeData(analysis);
    }
  }

  analyzeRequest(requestData) {
    let threatScore = 0;
    let reasons = [];

    // Check for requests to suspicious domains
    const suspiciousDomains = ["pastebin.com", "bit.ly", "tinyurl.com"];
    if (
      suspiciousDomains.some((domain) => requestData.hostname.includes(domain))
    ) {
      threatScore += 0.5;
      reasons.push("Request to suspicious domain");
    }

    // Check for unusual ports
    if (![80, 443, 8080, 3000].includes(requestData.port)) {
      threatScore += 0.3;
      reasons.push("Unusual port usage");
    }

    return {
      ...requestData,
      threatScore,
      isSuspicious: threatScore > 0.4,
      reasons,
      threatCategory: "OUTBOUND_CONNECTION",
    };
  }
}

module.exports = ApplicationNetworkMonitor;
