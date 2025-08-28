import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
} from "react";
import { io } from "socket.io-client";
import axios from "axios";
import toast from "react-hot-toast";

const ThreatContext = createContext();

const threatReducer = (state, action) => {
  switch (action.type) {
    case "SET_THREATS":
      return { ...state, threats: action.payload, loading: false };
    case "ADD_THREAT":
      return {
        ...state,
        threats: [action.payload, ...state.threats.slice(0, 999)],
        totalThreats: state.totalThreats + 1,
      };
    case "ADD_THREATS_BATCH":
      return {
        ...state,
        threats: [
          ...action.payload,
          ...state.threats.slice(0, 1000 - action.payload.length),
        ],
        totalThreats: state.totalThreats + action.payload.length,
      };
    case "SET_STATS":
      return { ...state, stats: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_CONNECTED":
      return { ...state, connected: action.payload };
    case "SET_WS_CONNECTED":
      return { ...state, wsConnected: action.payload };
    case "ADD_ALERT":
      return {
        ...state,
        alerts: [action.payload, ...state.alerts.slice(0, 49)],
      };
    case "SET_NETWORK_STATUS":
      return { ...state, networkStatus: action.payload };
    case "UPDATE_REAL_TIME_STATS":
      return { ...state, realTimeStats: action.payload };
    case "SET_NETWORK_TOPOLOGY":
      return { ...state, networkTopology: action.payload };
    case "UPDATE_THREAT_FILTERS":
      return { ...state, threatFilters: action.payload };
    case "SET_CONNECTION_QUALITY":
      return { ...state, connectionQuality: action.payload };
    default:
      return state;
  }
};

const initialState = {
  threats: [],
  stats: { total: 0, high: 0, blocked: 0, critical: 0 },
  realTimeStats: {
    threatsPerMinute: 0,
    blockedThreats: 0,
    criticalThreats: 0,
    activeConnections: 0,
    avgThreatScore: 0,
    topSourceIPs: [],
    protocolDistribution: {},
  },
  networkTopology: { nodes: [], connections: [] },
  alerts: [],
  loading: true,
  connected: false,
  wsConnected: false,
  networkStatus: "initializing",
  totalThreats: 0,
  threatFilters: {
    threatLevels: ["MEDIUM", "HIGH", "CRITICAL"],
    protocols: [],
    minThreatScore: 0.3,
  },
  connectionQuality: "good",
};

export const ThreatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(threatReducer, initialState);
  const socketRef = useRef(null);
  const wsRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const connectionQualityRef = useRef(null);

  useEffect(() => {
    initializeConnections();
    fetchInitialData();

    return () => {
      cleanup();
    };
  }, []);

  const initializeConnections = () => {
    setupSocketIO();
    setupWebSocket();
    startHeartbeat();
    startConnectionQualityMonitoring();
  };

  const setupSocketIO = () => {
    socketRef.current = io("http://localhost:3001", {
      transports: ["websocket", "polling"],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: false,
    });

    socketRef.current.on("connect", () => {
      console.log("Socket.io connected");
      dispatch({ type: "SET_CONNECTED", payload: true });
      dispatch({ type: "SET_NETWORK_STATUS", payload: "connected" });

      toast.success("Connected to threat monitoring system", {
        id: "socket-connection",
      });

      // Join threat monitoring room with filters
      socketRef.current.emit("join-threat-room", state.threatFilters);

      // Join other rooms
      socketRef.current.emit("join-analytics-room");
      socketRef.current.emit("join-network-room");

      // Clear any reconnection timeouts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("Socket.io disconnected:", reason);
      dispatch({ type: "SET_CONNECTED", payload: false });
      dispatch({ type: "SET_NETWORK_STATUS", payload: "disconnected" });

      toast.error("Disconnected from monitoring system", {
        id: "socket-connection",
      });

      // Attempt reconnection
      scheduleReconnection();
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket.io connection error:", error);
      dispatch({ type: "SET_CONNECTED", payload: false });
      dispatch({ type: "SET_NETWORK_STATUS", payload: "error" });

      scheduleReconnection();
    });

    // Real-time threat updates
    socketRef.current.on("threatUpdate", (threat) => {
      dispatch({ type: "ADD_THREAT", payload: threat });

      if (threat.threatLevel === "HIGH" || threat.threatLevel === "CRITICAL") {
        showThreatAlert(threat);
      }
    });

    // Batch threat updates
    socketRef.current.on("threatBatchUpdate", (threats) => {
      dispatch({ type: "ADD_THREATS_BATCH", payload: threats });
    });

    // Critical threat alerts
    socketRef.current.on("criticalThreatAlert", (threat) => {
      showCriticalAlert(threat);
    });

    // Real-time stats updates
    socketRef.current.on("realTimeStatsUpdate", (stats) => {
      dispatch({ type: "UPDATE_REAL_TIME_STATS", payload: stats });
    });

    // Network topology updates
    socketRef.current.on("networkTopologyUpdate", (topology) => {
      dispatch({ type: "SET_NETWORK_TOPOLOGY", payload: topology });
    });

    // Connection quality updates
    socketRef.current.on("pong", () => {
      const latency = Date.now() - socketRef.current.pingTime;
      updateConnectionQuality(latency);
    });

    // Room join confirmations
    socketRef.current.on("joined-room", (data) => {
      console.log(`Joined room: ${data.room}`, data);
    });
  };

  const setupWebSocket = () => {
    const wsUrl = `ws://localhost:3002`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log("WebSocket connected for high-frequency data");
      dispatch({ type: "SET_WS_CONNECTED", payload: true });

      // Subscribe to threat stream
      wsRef.current.send(
        JSON.stringify({
          type: "SUBSCRIBE_THREAT_STREAM",
          data: state.threatFilters,
        })
      );

      // Subscribe to network topology updates
      wsRef.current.send(
        JSON.stringify({
          type: "SUBSCRIBE_NETWORK_TOPOLOGY",
          data: {},
        })
      );

      // Request real-time stats
      wsRef.current.send(
        JSON.stringify({
          type: "REQUEST_REAL_TIME_STATS",
          data: {},
        })
      );
    };

    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    wsRef.current.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
      dispatch({ type: "SET_WS_CONNECTED", payload: false });

      // Attempt reconnection after delay
      setTimeout(() => {
        if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
          setupWebSocket();
        }
      }, 5000);
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      dispatch({ type: "SET_WS_CONNECTED", payload: false });
    };
  };

  const handleWebSocketMessage = (message) => {
    switch (message.type) {
      case "connected":
        console.log("WebSocket connection confirmed:", message.clientId);
        break;

      case "THREAT_STREAM_UPDATE":
        if (message.data && message.data.length > 0) {
          dispatch({ type: "ADD_THREATS_BATCH", payload: message.data });
        }
        break;

      case "NETWORK_TOPOLOGY_UPDATE":
        dispatch({ type: "SET_NETWORK_TOPOLOGY", payload: message.data });
        break;

      case "REAL_TIME_STATS_UPDATE":
        dispatch({ type: "UPDATE_REAL_TIME_STATS", payload: message.data });
        break;

      case "SUBSCRIPTION_CONFIRMED":
        console.log("WebSocket subscription confirmed:", message.subscription);
        break;

      case "error":
        console.error("WebSocket error message:", message.message);
        break;

      default:
        console.log("Unknown WebSocket message:", message.type);
    }
  };

  const startHeartbeat = () => {
    heartbeatIntervalRef.current = setInterval(() => {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.pingTime = Date.now();
        socketRef.current.emit("ping");
      }
    }, 30000); // Ping every 30 seconds
  };

  const startConnectionQualityMonitoring = () => {
    connectionQualityRef.current = setInterval(() => {
      const socketConnected = socketRef.current?.connected || false;
      const wsConnected = wsRef.current?.readyState === WebSocket.OPEN;

      let quality = "poor";
      if (socketConnected && wsConnected) {
        quality = "excellent";
      } else if (socketConnected || wsConnected) {
        quality = "good";
      }

      dispatch({ type: "SET_CONNECTION_QUALITY", payload: quality });
    }, 10000); // Check every 10 seconds
  };

  const updateConnectionQuality = (latency) => {
    let quality = "poor";
    if (latency < 100) {
      quality = "excellent";
    } else if (latency < 300) {
      quality = "good";
    } else if (latency < 1000) {
      quality = "fair";
    }

    dispatch({ type: "SET_CONNECTION_QUALITY", payload: quality });
  };

  const scheduleReconnection = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log("Attempting to reconnect...");
      dispatch({ type: "SET_NETWORK_STATUS", payload: "reconnecting" });

      if (socketRef.current) {
        socketRef.current.connect();
      }

      if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
        setupWebSocket();
      }
    }, 5000);
  };

  const showThreatAlert = (threat) => {
    const alertId = `threat-${threat._id || Date.now()}`;

    toast.error(
      `${threat.threatLevel} threat detected from ${threat.sourceIP}`,
      {
        id: alertId,
        duration: 5000,
        icon: "🚨",
      }
    );

    dispatch({
      type: "ADD_ALERT",
      payload: {
        id: alertId,
        timestamp: new Date(),
        type: "threat",
        level: threat.threatLevel,
        message: `${threat.threatLevel} threat from ${threat.sourceIP}`,
        data: threat,
      },
    });
  };

  const showCriticalAlert = (threat) => {
    toast.error(
      `🚨 CRITICAL THREAT DETECTED!\nSource: ${threat.sourceIP}\nCategory: ${threat.threatCategory}`,
      {
        duration: 10000,
        style: {
          background: "#dc2626",
          color: "white",
          border: "2px solid #fca5a5",
        },
      }
    );
  };

  const fetchInitialData = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const [threatsResponse, statsResponse] = await Promise.all([
        axios.get("http://localhost:3001/api/threats/recent"),
        axios.get("http://localhost:3001/api/threats/stats"),
      ]);

      dispatch({ type: "SET_THREATS", payload: threatsResponse.data });
      dispatch({ type: "SET_STATS", payload: statsResponse.data });
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Failed to load threat data");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const updateThreatFilters = (newFilters) => {
    dispatch({ type: "UPDATE_THREAT_FILTERS", payload: newFilters });

    // Update Socket.io subscription
    if (socketRef.current?.connected) {
      socketRef.current.emit("update-filters", newFilters);
    }

    // Update WebSocket subscription
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "SUBSCRIBE_THREAT_STREAM",
          data: newFilters,
        })
      );
    }
  };

  const subscribeToThreatFilters = (filters) => {
    updateThreatFilters(filters);
  };

  const blockIP = async (ip) => {
    try {
      await axios.post("http://localhost:3001/api/threats/block-ip", { ip });
      toast.success(`IP ${ip} has been blocked`);
    } catch (error) {
      toast.error("Failed to block IP");
    }
  };

  const markFalsePositive = async (threatId) => {
    try {
      await axios.patch(
        `http://localhost:3001/api/threats/${threatId}/false-positive`
      );
      toast.success("Threat marked as false positive");
    } catch (error) {
      toast.error("Failed to mark as false positive");
    }
  };

  const cleanup = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    if (wsRef.current) {
      wsRef.current.close();
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (connectionQualityRef.current) {
      clearInterval(connectionQualityRef.current);
    }
  };

  const value = {
    ...state,
    subscribeToThreatFilters,
    updateThreatFilters,
    blockIP,
    markFalsePositive,
    fetchInitialData,
  };

  return (
    <ThreatContext.Provider value={value}>{children}</ThreatContext.Provider>
  );
};

export const useThreat = () => {
  const context = useContext(ThreatContext);
  if (!context) {
    throw new Error("useThreat must be used within a ThreatProvider");
  }
  return context;
};
