const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const WebSocket = require("ws");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const schedulerService = require("./services/scheduler");
const { authMiddleware } = require("./middleware/auth"); // Ensure correct import
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const InMemoryStorage = require("./services/inMemoryStorage");
require("dotenv").config();

// NEW: remove hard dependency on agents (lazy-load later)
// const RealNetworkTelemetryAgent = require("./agents/RealNetworkAgent");
// const SystemTelemetryAgent = require("./agents/SystemTelemetryAgent");

const authRoutes = require("./routes/auth");
const threatsRoutes = require("./routes/threats");
const analyticsRoutes = require("./routes/analytics");
const usersRoutes = require("./routes/users");
const settingsRoutes = require("./routes/settings");

class AdvancedCyberSecurityServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = socketIo(this.server, {
      cors: {
        origin:
          process.env.NODE_ENV === "production"
            ? ["https://your-domain.com"]
            : ["http://localhost:5173"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    // High-frequency WebSocket server for real-time data streaming
    this.wss = new WebSocket.Server({
      port: process.env.WS_PORT || 3002,
      verifyClient: this.verifyWebSocketClient.bind(this),
    });

    this.connectedClients = new Map();
    this.threatSubscriptions = new Map();
    this.networkTopologyClients = new Set();

    // NEW: track DB connectivity instead of exiting on error
    this.dbConnected = false;

    // Initialize in-memory storage for when database is not available
    this.inMemoryStorage = new InMemoryStorage();

    this.initialize();
  }

  async initialize() {
    await this.setupDatabase();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketIO();
    this.setupWebSocketServer();
    this.setupNetworkAgent(); // <-- ADD THIS LINE
    this.setupRealTimeServices();
    this.setupErrorHandling();
    this.startServer();
  }

  async setupDatabase() {
    try {
      await mongoose.connect(
        process.env.MONGODB_URI || "mongodb://localhost:27017/cybersecurity",
        {
          // Removed deprecated options
        }
      );
      logger.info("Connected to MongoDB");
      this.dbConnected = true; // NEW
    } catch (error) {
      logger.error("Database connection failed:", error);
      // NEW: continue to run server in degraded mode
      this.dbConnected = false;
      logger.warn("Starting server without database (degraded mode).");
    }
  }

  setupMiddleware() {
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "ws:", "wss:"],
          },
        },
      })
    );

    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:5173", // Ensure this matches your frontend URL
        credentials: true,
      })
    );

    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path} - ${req.ip}`);
      next();
    });
  }

  setupRoutes() {
    if (this.dbConnected) {
      // When DB is up, use full routes
      this.app.use("/api/auth", authRoutes);
      this.app.use("/api/threats", authMiddleware, threatsRoutes);
      this.app.use("/api/analytics", authMiddleware, analyticsRoutes);
      this.app.use("/api/users", authMiddleware, usersRoutes);
      this.app.use("/api/settings", authMiddleware, settingsRoutes);
    } else {
      // NEW: fallback routes for degraded mode
      this.setupDegradedRoutes();
    }

    // Health check
    this.app.get("/health", (req, res) => {
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        dbConnected: this.dbConnected,
        connections: {
          socketIO: this.io.engine.clientsCount,
          webSocket: this.wss.clients.size,
        },
      });
    });

    // WebSocket info endpoint
    this.app.get("/api/websocket/info", (req, res) => {
      res.json({
        port: process.env.WS_PORT || 3002,
        clients: this.wss.clients.size,
        subscriptions: this.threatSubscriptions.size,
      });
    });
  }

  setupDegradedRoutes() {
    // Minimal auth routes for degraded mode
    this.app.post("/api/auth/login", async (req, res) => {
      try {
        const { email, password, username } = req.body || {};
        
        if ((!email && !username) || !password) {
          return res.status(400).json({ 
            error: "Email/username and password required" 
          });
        }
        
        // In degraded mode, accept any reasonable credentials
        const userEmail = email || `${username}@local.dev`;
        const userUsername = username || email.split("@")[0];
        
        const user = {
          id: "dummy",
          email: userEmail,
          username: userUsername,
          role: "analyst",
          firstName: userUsername,
          lastName: "User",
          preferences: { theme: "dark" }
        };
        
        // Save to in-memory storage
        await this.inMemoryStorage.saveUser(user);
        
        return res.json({
          token: "dummy-token",
          user: user,
          message: "Login successful (degraded mode)"
        });
      } catch (error) {
        console.error("Login error in degraded mode:", error);
        return res.status(500).json({ error: "Login failed" });
      }
    });

    this.app.post("/api/auth/register", async (req, res) => {
      try {
        const { email, username, password, firstName, lastName } = req.body || {};
        
        if (!email || !username || !password) {
          return res.status(400).json({ 
            error: "Email, username, and password required" 
          });
        }
        
        const user = {
          id: `user_${Date.now()}`,
          email,
          username,
          firstName: firstName || username,
          lastName: lastName || "User",
          role: "analyst",
          preferences: { theme: "dark" }
        };
        
        // Save to in-memory storage
        await this.inMemoryStorage.saveUser(user);
        
        return res.status(201).json({
          token: "dummy-token",
          user: user,
          message: "Registration successful (degraded mode)"
        });
      } catch (error) {
        console.error("Registration error in degraded mode:", error);
        return res.status(500).json({ error: "Registration failed" });
      }
    });

    this.app.get("/api/auth/profile", async (req, res) => {
      try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
          return res.status(401).json({ error: "No token provided" });
        }
        
        // In degraded mode, return a default user
        return res.json({
          user: {
            id: "dummy",
            email: "user@local.dev",
            username: "demo_user",
            role: "analyst",
            firstName: "Demo",
            lastName: "User",
            preferences: { theme: "dark" },
          },
        });
      } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
      }
    });

    // Minimal threats endpoints
    this.app.get("/api/threats/recent", async (req, res) => {
      try {
        const limit = parseInt(req.query.limit) || 100;
        const data = await this.inMemoryStorage.findThreats(
          {},
          { limit, sort: "timestamp desc" }
        );
        return res.json(data);
      } catch (error) {
        console.error("Error getting recent threats:", error);
        return res.json([]);
      }
    });

    this.app.get("/api/threats/stats", async (req, res) => {
      try {
        const hours = parseInt(req.query.hours) || 24;
        const stats = await this.inMemoryStorage.getThreatStats(hours);
        return res.json(stats);
      } catch (error) {
        console.error("Error getting threat stats:", error);
        return res.json({ total: 0, high: 0, blocked: 0, critical: 0 });
      }
    });
  }

  setupSocketIO() {
    // Socket.io namespace for different data types
    const threatNamespace = this.io.of("/threats");
    const analyticsNamespace = this.io.of("/analytics");
    const networkNamespace = this.io.of("/network");

    // Main connection handler
    this.io.on("connection", (socket) => {
      logger.info(`Socket.io client connected: ${socket.id}`);

      // Store client info
      this.connectedClients.set(socket.id, {
        socket,
        subscriptions: new Set(),
        joinedAt: new Date(),
        lastSeen: new Date(),
      });

      // Handle authentication
      socket.on("authenticate", (token) => {
        // TODO: Verify JWT token
        socket.authenticated = true;
        socket.emit("authenticated", { success: true });
        logger.info(`Socket client authenticated: ${socket.id}`);
      });

      // Join threat monitoring room
      socket.on("join-threat-room", (filters = {}) => {
        socket.join("threats");

        // Store threat filters for this client
        if (this.connectedClients.has(socket.id)) {
          this.connectedClients.get(socket.id).threatFilters = filters;
        }

        socket.emit("joined-room", { room: "threats", filters });
        logger.info(
          `Client ${socket.id} joined threat room with filters:`,
          filters
        );
      });

      // Join analytics room
      socket.on("join-analytics-room", () => {
        socket.join("analytics");
        socket.emit("joined-room", { room: "analytics" });
      });

      // Join network topology room
      socket.on("join-network-room", () => {
        socket.join("network");
        this.networkTopologyClients.add(socket.id);
        socket.emit("joined-room", { room: "network" });
      });

      // Handle real-time threat queries
      socket.on("query-threats", async (query) => {
        try {
          if (this.dbConnected) {
            const ThreatData = require("./models/ThreatData");
            const threats = await ThreatData.find(query)
              .limit(100)
              .sort({ timestamp: -1 });
            socket.emit("threats-result", threats);
          } else {
            // Use in-memory storage when database is not available
            const threats = await this.inMemoryStorage.findThreats(query, {
              limit: 100,
              sort: "timestamp desc",
            });
            socket.emit("threats-result", threats);
          }
        } catch (error) {
          logger.error("Error querying threats:", error);
          socket.emit("error", { message: "Failed to query threats" });
        }
      });

      // Handle live filtering updates
      socket.on("update-filters", (filters) => {
        if (this.connectedClients.has(socket.id)) {
          this.connectedClients.get(socket.id).threatFilters = filters;
          socket.emit("filters-updated", filters);
        }
      });

      // Heartbeat for connection monitoring
      socket.on("ping", () => {
        if (this.connectedClients.has(socket.id)) {
          this.connectedClients.get(socket.id).lastSeen = new Date();
        }
        socket.emit("pong");
      });

      // Handle disconnect
      socket.on("disconnect", (reason) => {
        logger.info(
          `Socket.io client disconnected: ${socket.id}, reason: ${reason}`
        );
        this.connectedClients.delete(socket.id);
        this.networkTopologyClients.delete(socket.id);
      });
    });

    // Threat-specific namespace
    threatNamespace.on("connection", (socket) => {
      logger.info(`Threat namespace client connected: ${socket.id}`);

      socket.on("subscribe-threat-level", (levels) => {
        socket.threatLevelFilter = levels;
        socket.emit("subscription-confirmed", { levels });
      });
    });

    // Analytics namespace
    analyticsNamespace.on("connection", (socket) => {
      logger.info(`Analytics namespace client connected: ${socket.id}`);

      socket.on("request-historical-data", async (params) => {
        try {
          if (this.dbConnected) {
            const ThreatData = require("./models/ThreatData");
            const data = await ThreatData.find({})
              .limit(100)
              .sort({ timestamp: -1 });
            socket.emit("historical-data", data);
          } else {
            // Use in-memory storage when database is not available
            const data = await this.inMemoryStorage.findThreats(
              {},
              { limit: 100, sort: "timestamp desc" }
            );
            socket.emit("historical-data", data);
          }
        } catch (error) {
          logger.error("Error fetching historical data:", error);
          socket.emit("error", { message: "Failed to fetch historical data" });
        }
      });
    });
  }

  setupWebSocketServer() {
    this.wss.on("connection", (ws, req) => {
      logger.info(
        `WebSocket client connected from ${req.socket.remoteAddress}`
      );

      ws.id = this.generateClientId();
      ws.isAlive = true;
      ws.subscriptions = new Set();

      // Handle different message types
      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data);
          // Handle real network data
          if (message.type === "REAL_NETWORK_DATA" && message.data) {
            // Pass to threat detection engine
            if (this.threatDetectionEngine) {
              this.threatDetectionEngine.processRealTimeData(message.data);
            }
          } else {
            this.handleWebSocketMessage(ws, message);
          }
        } catch (error) {
          logger.error("WebSocket message parsing error:", error);
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Invalid message format",
            })
          );
        }
      });

      // Handle pong responses for heartbeat
      ws.on("pong", () => {
        ws.isAlive = true;
      });

      // Handle connection close
      ws.on("close", (code, reason) => {
        logger.info(`WebSocket client disconnected: ${ws.id}, code: ${code}`);
        this.threatSubscriptions.delete(ws.id);
      });

      // Send welcome message
      ws.send(
        JSON.stringify({
          type: "connected",
          clientId: ws.id,
          timestamp: new Date().toISOString(),
        })
      );
    });

    // Heartbeat mechanism to detect broken connections
    setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
          logger.info(`Terminating inactive WebSocket client: ${ws.id}`);
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000); // Check every 30 seconds
  }

  setupNetworkAgent() {
    try {
      const HackathonNetworkAgent = require("./agents/NetworkDataCollector");
      this.networkAgent = new HackathonNetworkAgent();
      this.networkAgent.start();
      // Listen for incoming data if you want to process locally
      // Or just let backend WebSocket handle it
    } catch (error) {
      logger.warn("HackathonNetworkAgent not available:", error);
    }
  }

  handleWebSocketMessage(ws, message) {
    switch (message.type) {
      case "SUBSCRIBE_THREAT_STREAM":
        this.handleThreatStreamSubscription(ws, message.data);
        break;

      case "SUBSCRIBE_NETWORK_TOPOLOGY":
        this.handleNetworkTopologySubscription(ws, message.data);
        break;

      case "REQUEST_REAL_TIME_STATS":
        this.handleRealTimeStatsRequest(ws, message.data);
        break;

      case "UNSUBSCRIBE":
        this.handleUnsubscribe(ws, message.data);
        break;

      default:
        logger.warn(`Unknown WebSocket message type: ${message.type}`);
        ws.send(
          JSON.stringify({
            type: "error",
            message: `Unknown message type: ${message.type}`,
          })
        );
    }
  }

  handleThreatStreamSubscription(ws, filters) {
    ws.subscriptions.add("threat_stream");
    this.threatSubscriptions.set(ws.id, {
      ws,
      filters: filters || {},
      subscribedAt: new Date(),
    });

    ws.send(
      JSON.stringify({
        type: "SUBSCRIPTION_CONFIRMED",
        subscription: "threat_stream",
        filters,
      })
    );

    logger.info(
      `Client ${ws.id} subscribed to threat stream with filters:`,
      filters
    );
  }

  handleNetworkTopologySubscription(ws, options) {
    ws.subscriptions.add("network_topology");
    this.networkTopologyClients.add(ws.id);

    ws.send(
      JSON.stringify({
        type: "SUBSCRIPTION_CONFIRMED",
        subscription: "network_topology",
        options,
      })
    );
  }

  handleRealTimeStatsRequest(ws, params) {
    // Send current real-time statistics
    const stats = this.calculateRealTimeStats();

    ws.send(
      JSON.stringify({
        type: "REAL_TIME_STATS",
        data: stats,
        timestamp: new Date().toISOString(),
      })
    );
  }

  // NEW: centralized real-time threat detection setup with agents
  setupThreatDetection() {
    try {
      const ThreatDetectionEngine = require("./services/advanced/threatDetectionEngine");
      this.threatDetectionEngine = new ThreatDetectionEngine(
        this.io,
        this.wss,
        this
      );

      // Lazy-load agents; continue without them if unavailable
      let RealNetworkTelemetryAgent;
      let SystemTelemetryAgent;
      try {
        RealNetworkTelemetryAgent = require("./agents/RealNetworkAgent");
      } catch (e) {
        logger.warn(
          "RealNetworkAgent not found; running without network telemetry agent."
        );
      }
      try {
        SystemTelemetryAgent = require("./agents/SystemTelemetryAgent");
      } catch (e) {
        logger.warn(
          "SystemTelemetryAgent not found; running without system telemetry agent."
        );
      }

      // Start real network monitoring (event-driven ingestion) if present
      if (RealNetworkTelemetryAgent) {
        this.networkAgent = new RealNetworkTelemetryAgent();
        this.networkAgent.on("telemetry", async (payload) => {
          try {
            await this.threatDetectionEngine.processRealTimeData(payload);
          } catch (err) {
            logger.error("Failed to process network telemetry:", err);
          }
        });
        this.networkAgent.start();
      }

      if (SystemTelemetryAgent) {
        this.systemAgent = new SystemTelemetryAgent(this.threatDetectionEngine);
        this.systemAgent.start();
      }

      // Start detection engine (awaits real-time data)
      this.threatDetectionEngine.start();

      logger.info("✅ Real-time threat detection initialized");
    } catch (error) {
      logger.error(
        "❌ Failed to initialize real-time threat detection:",
        error
      );
    }
  }

  setupRealTimeServices() {
    // Initialize advanced threat detection via agents
    this.setupThreatDetection();

    // Start services
    schedulerService.initialize(this.io);

    // Start real-time data broadcasting
    this.startRealTimeBroadcasting();

    logger.info("Real-time services initialized");
  }

  startRealTimeBroadcasting() {
    // High-frequency threat data streaming (every 2 seconds)
    setInterval(() => {
      this.broadcastThreatStream();
    }, 2000);

    // Network topology updates (every 10 seconds)
    setInterval(() => {
      this.broadcastNetworkTopology();
    }, 10000);

    // Real-time statistics (every 5 seconds)
    setInterval(() => {
      this.broadcastRealTimeStats();
    }, 5000);
  }

  broadcastThreatStream() {
    if (this.threatSubscriptions.size === 0) return;
    if (!this.threatDetectionEngine) return;

    // Get recent threats for streaming
    const recentThreats = this.threatDetectionEngine.getRecentThreats(10);

    this.threatSubscriptions.forEach((subscription, clientId) => {
      const { ws, filters } = subscription;

      if (ws.readyState === WebSocket.OPEN) {
        try {
          // Filter threats based on client preferences
          const filteredThreats = this.filterThreatsForClient(
            recentThreats,
            filters
          );

          if (filteredThreats.length > 0) {
            ws.send(
              JSON.stringify({
                type: "THREAT_STREAM_UPDATE",
                data: filteredThreats,
                timestamp: new Date().toISOString(),
                count: filteredThreats.length,
              })
            );
          }
        } catch (error) {
          logger.warn(
            `Failed to send threat stream to client ${clientId}:`,
            error.message
          );
        }
      }
    });
  }

  broadcastNetworkTopology() {
    if (this.networkTopologyClients.size === 0) return;
    if (!this.threatDetectionEngine) return;

    const topologyData = this.calculateNetworkTopology();

    this.networkTopologyClients.forEach((clientId) => {
      const client = Array.from(this.wss.clients).find(
        (c) => c.id === clientId
      );

      if (client && client.readyState === WebSocket.OPEN) {
        try {
          client.send(
            JSON.stringify({
              type: "NETWORK_TOPOLOGY_UPDATE",
              data: topologyData,
              timestamp: new Date().toISOString(),
            })
          );
        } catch (error) {
          logger.warn(
            `Failed to send network topology to client ${clientId}:`,
            error.message
          );
        }
      }
    });
  }

  broadcastRealTimeStats() {
    if (!this.threatDetectionEngine) return;

    const stats = this.calculateRealTimeStats();

    // Socket.io broadcast
    this.io.to("threats").emit("realTimeStatsUpdate", stats);

    // WebSocket broadcast - only to clients that have requested real-time stats
    // Since real-time stats are automatically sent to all connected clients,
    // we don't need to check subscriptions here
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(
            JSON.stringify({
              type: "REAL_TIME_STATS_UPDATE",
              data: stats,
              timestamp: new Date().toISOString(),
            })
          );
        } catch (error) {
          logger.warn(
            `Failed to send real-time stats to client ${client.id}:`,
            error.message
          );
        }
      }
    });
  }

  calculateRealTimeStats() {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    // Get recent threats from threat detection engine
    const recentThreats =
      this.threatDetectionEngine?.getRecentThreats(100) || [];
    const lastMinuteThreats = recentThreats.filter(
      (t) => new Date(t.timestamp) > oneMinuteAgo
    );

    return {
      threatsPerMinute: lastMinuteThreats.length,
      blockedThreats: lastMinuteThreats.filter((t) => t.isBlocked).length,
      criticalThreats: lastMinuteThreats.filter(
        (t) => t.threatLevel === "CRITICAL"
      ).length,
      activeConnections: this.io.engine.clientsCount + this.wss.clients.size,
      avgThreatScore: this.calculateAverageThreatScore(lastMinuteThreats),
      topSourceIPs: this.getTopSourceIPs(lastMinuteThreats, 5),
      protocolDistribution: this.getProtocolDistribution(lastMinuteThreats),
    };
  }

  calculateAverageThreatScore(threats) {
    if (threats.length === 0) return 0;
    const sum = threats.reduce(
      (acc, threat) => acc + (threat.threatScore || 0),
      0
    );
    return Math.round((sum / threats.length) * 100) / 100;
  }

  getTopSourceIPs(threats, limit = 5) {
    const ipCounts = {};
    threats.forEach((threat) => {
      ipCounts[threat.sourceIP] = (ipCounts[threat.sourceIP] || 0) + 1;
    });

    return Object.entries(ipCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([ip, count]) => ({ ip, count }));
  }

  getProtocolDistribution(threats) {
    const protocolCounts = {};
    threats.forEach((threat) => {
      protocolCounts[threat.protocol] =
        (protocolCounts[threat.protocol] || 0) + 1;
    });
    return protocolCounts;
  }

  filterThreatsForClient(threats, filters) {
    return threats.filter((threat) => {
      // Apply threat level filter
      if (filters.threatLevels && filters.threatLevels.length > 0) {
        if (!filters.threatLevels.includes(threat.threatLevel)) {
          return false;
        }
      }

      // Apply IP filter
      if (filters.sourceIPs && filters.sourceIPs.length > 0) {
        if (!filters.sourceIPs.includes(threat.sourceIP)) {
          return false;
        }
      }

      // Apply protocol filter
      if (filters.protocols && filters.protocols.length > 0) {
        if (!filters.protocols.includes(threat.protocol)) {
          return false;
        }
      }

      // Apply minimum threat score filter
      if (
        filters.minThreatScore &&
        threat.threatScore < filters.minThreatScore
      ) {
        return false;
      }

      return true;
    });
  }

  calculateNetworkTopology() {
    const recentThreats =
      this.threatDetectionEngine?.getRecentThreats(50) || [];

    // Build network topology from recent threats
    const nodes = new Map();
    const connections = new Map();

    recentThreats.forEach((threat) => {
      // Add source node
      if (!nodes.has(threat.sourceIP)) {
        nodes.set(threat.sourceIP, {
          id: threat.sourceIP,
          ip: threat.sourceIP,
          type:
            threat.sourceIP && threat.sourceIP.startsWith("192.168")
              ? "internal"
              : "external",
          threatCount: 1,
          lastSeen: threat.timestamp,
          location: threat.sourceLocation,
        });
      } else {
        const node = nodes.get(threat.sourceIP);
        node.threatCount++;
        node.lastSeen = threat.timestamp;
      }

      // Add connection
      const connId = `${threat.sourceIP}-${threat.destinationIP}`;
      if (!connections.has(connId)) {
        connections.set(connId, {
          source: threat.sourceIP,
          target: threat.destinationIP,
          threatCount: 1,
          protocols: new Set([threat.protocol]),
          lastActivity: threat.timestamp,
        });
      } else {
        const conn = connections.get(connId);
        conn.threatCount++;
        conn.protocols.add(threat.protocol);
        conn.lastActivity = threat.timestamp;
      }
    });

    return {
      nodes: Array.from(nodes.values()),
      connections: Array.from(connections.values()).map((conn) => ({
        ...conn,
        protocols: Array.from(conn.protocols),
      })),
    };
  }

  verifyWebSocketClient(info) {
    // Basic verification - in production, verify JWT tokens here
    return true;
  }

  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setupErrorHandling() {
    this.app.use(errorHandler);

    process.on("unhandledRejection", (reason, promise) => {
      logger.error("Unhandled Rejection at:", promise, "reason:", reason);
    });

    process.on("uncaughtException", (error) => {
      logger.error("Uncaught Exception thrown:", error);
      this.gracefulShutdown();
    });
  }

  startServer() {
    const PORT = process.env.PORT || 3001;
    this.server.listen(PORT, () => {
      logger.info(`🚀 Cybersecurity Server running on port ${PORT}`);
      logger.info(
        `📡 WebSocket server running on port ${process.env.WS_PORT || 3002}`
      );
      logger.info(`🔒 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`Express server listening on http://localhost:${PORT}`); // Add this log
    });
  }

  gracefulShutdown() {
    logger.info("Shutting down gracefully...");

    if (this.threatDetectionEngine) {
      this.threatDetectionEngine.stop();
    }

    schedulerService.stopAll();

    // Close WebSocket server
    this.wss.close(() => {
      logger.info("WebSocket server closed");
    });

    // Close HTTP server
    this.server.close(() => {
      // Only close MongoDB connection if it's connected
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        mongoose.connection.close();
      }
      process.exit(0);
    });
  }
}

// Initialize and start server
const cyberSecurityServer = new AdvancedCyberSecurityServer();

// Handle graceful shutdown
process.on("SIGTERM", () => cyberSecurityServer.gracefulShutdown());
process.on("SIGINT", () => cyberSecurityServer.gracefulShutdown());

module.exports = cyberSecurityServer;
