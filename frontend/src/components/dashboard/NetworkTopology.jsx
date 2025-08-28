import { useState, useMemo } from "react";
import { useThreat } from "../../context/ThreatContext";
import { motion } from "framer-motion";
import {
  ComputerDesktopIcon,
  ServerIcon,
  GlobeAltIcon,
  ShieldExclamationIcon,
  WifiIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const NetworkTopology = () => {
  const { threats } = useThreat();
  const [selectedNode, setSelectedNode] = useState(null);

  const networkData = useMemo(() => {
    // Create network nodes based on threat data
    const nodes = new Map();
    const connections = new Map();

    // Add internal network nodes
    nodes.set("gateway", {
      id: "gateway",
      type: "gateway",
      label: "Network Gateway",
      ip: "192.168.1.1",
      status: "secure",
      threats: 0,
      position: { x: 50, y: 50 },
    });

    nodes.set("firewall", {
      id: "firewall",
      type: "firewall",
      label: "Firewall",
      ip: "192.168.1.2",
      status: "active",
      threats: 0,
      position: { x: 50, y: 30 },
    });

    // Process threats to create network topology
    threats.slice(0, 50).forEach((threat, index) => {
      const sourceId = `src_${threat.sourceIP}`;
      const destId = `dest_${threat.destinationIP}`;

      // Add source node (external)
      if (!nodes.has(sourceId)) {
        const isInternal =
          threat.sourceIP.startsWith("192.168") ||
          threat.sourceIP.startsWith("10.");
        nodes.set(sourceId, {
          id: sourceId,
          type: isInternal ? "internal" : "external",
          label: isInternal ? "Internal Host" : "External Host",
          ip: threat.sourceIP,
          status: threat.isBlocked
            ? "blocked"
            : threat.threatLevel === "CRITICAL"
            ? "critical"
            : "warning",
          threats: 1,
          threatLevel: threat.threatLevel,
          country: threat.sourceLocation?.country,
          position: {
            x: isInternal ? Math.random() * 30 + 20 : Math.random() * 30 + 70,
            y: Math.random() * 60 + 20,
          },
        });
      } else {
        const node = nodes.get(sourceId);
        node.threats++;
        if (threat.threatLevel === "CRITICAL" && node.status !== "blocked") {
          node.status = "critical";
        }
      }

      // Add destination node (usually internal)
      if (!nodes.has(destId)) {
        const isInternal =
          threat.destinationIP.startsWith("192.168") ||
          threat.destinationIP.startsWith("10.");
        nodes.set(destId, {
          id: destId,
          type: isInternal ? "server" : "external",
          label: isInternal ? "Internal Server" : "External Server",
          ip: threat.destinationIP,
          status: "normal",
          threats: 0,
          position: {
            x: isInternal ? Math.random() * 30 + 20 : Math.random() * 30 + 70,
            y: Math.random() * 60 + 20,
          },
        });
      }

      // Add connection
      const connectionId = `${sourceId}-${destId}`;
      if (!connections.has(connectionId)) {
        connections.set(connectionId, {
          source: sourceId,
          target: destId,
          threats: 1,
          threatLevel: threat.threatLevel,
          protocol: threat.protocol,
          blocked: threat.isBlocked,
        });
      } else {
        const conn = connections.get(connectionId);
        conn.threats++;
        if (threat.threatLevel === "CRITICAL") {
          conn.threatLevel = "CRITICAL";
        }
      }
    });

    return {
      nodes: Array.from(nodes.values()),
      connections: Array.from(connections.values()),
    };
  }, [threats]);

  const getNodeIcon = (type) => {
    switch (type) {
      case "gateway":
        return WifiIcon;
      case "firewall":
        return ShieldExclamationIcon;
      case "server":
        return ServerIcon;
      case "internal":
        return ComputerDesktopIcon;
      case "external":
        return GlobeAltIcon;
      default:
        return ComputerDesktopIcon;
    }
  };

  const getNodeColor = (status) => {
    switch (status) {
      case "critical":
        return "bg-danger-500 border-danger-400 animate-pulse";
      case "warning":
        return "bg-orange-500 border-orange-400";
      case "blocked":
        return "bg-gray-600 border-gray-500";
      case "secure":
        return "bg-success-500 border-success-400";
      case "active":
        return "bg-cyber-500 border-cyber-400";
      default:
        return "bg-gray-500 border-gray-400";
    }
  };

  const getConnectionColor = (threatLevel, blocked) => {
    if (blocked) return "stroke-gray-500";
    switch (threatLevel) {
      case "CRITICAL":
        return "stroke-danger-500";
      case "HIGH":
        return "stroke-orange-500";
      case "MEDIUM":
        return "stroke-yellow-500";
      default:
        return "stroke-success-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Network Topology</h2>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span className="text-gray-400">Secure</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-gray-400">Warning</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-danger-500 rounded-full animate-pulse"></div>
              <span className="text-gray-400">Critical</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span className="text-gray-400">Blocked</span>
            </div>
          </div>
        </div>

        {/* Network Diagram */}
        <div className="relative bg-gray-900 rounded-lg p-8 min-h-96">
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            {/* Network Connections */}
            {networkData.connections.map((connection, index) => {
              const sourceNode = networkData.nodes.find(
                (n) => n.id === connection.source
              );
              const targetNode = networkData.nodes.find(
                (n) => n.id === connection.target
              );

              if (!sourceNode || !targetNode) return null;

              return (
                <motion.line
                  key={`${connection.source}-${connection.target}`}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  x1={`${sourceNode.position.x}%`}
                  y1={`${sourceNode.position.y}%`}
                  x2={`${targetNode.position.x}%`}
                  y2={`${targetNode.position.y}%`}
                  className={`${getConnectionColor(
                    connection.threatLevel,
                    connection.blocked
                  )} stroke-2`}
                  strokeDasharray={connection.blocked ? "5,5" : "none"}
                />
              );
            })}
          </svg>

          {/* Network Nodes */}
          {networkData.nodes.map((node, index) => {
            const Icon = getNodeIcon(node.type);

            return (
              <motion.div
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="absolute cursor-pointer"
                style={{
                  left: `${node.position.x}%`,
                  top: `${node.position.y}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 2,
                }}
                onClick={() => setSelectedNode(node)}
              >
                <div
                  className={`relative p-3 rounded-lg border-2 ${getNodeColor(
                    node.status
                  )} shadow-lg`}
                >
                  <Icon className="h-6 w-6 text-white" />

                  {/* Threat indicator */}
                  {node.threats > 0 && (
                    <div className="absolute -top-2 -right-2 bg-danger-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                      {node.threats}
                    </div>
                  )}
                </div>

                {/* Node label */}
                <div className="mt-2 text-center">
                  <div className="text-xs font-medium text-white bg-gray-800/90 rounded px-2 py-1">
                    {node.label}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{node.ip}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Node Details Panel */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Node Details</h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">
                Basic Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white capitalize">
                    {selectedNode.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">IP Address:</span>
                  <span className="text-white">{selectedNode.ip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span
                    className={`capitalize ${
                      selectedNode.status === "critical"
                        ? "text-danger-400"
                        : selectedNode.status === "warning"
                        ? "text-orange-400"
                        : selectedNode.status === "blocked"
                        ? "text-gray-400"
                        : selectedNode.status === "secure"
                        ? "text-success-400"
                        : "text-cyber-400"
                    }`}
                  >
                    {selectedNode.status}
                  </span>
                </div>
                {selectedNode.country && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Country:</span>
                    <span className="text-white">{selectedNode.country}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">
                Threat Statistics
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Threats:</span>
                  <span className="text-white">{selectedNode.threats}</span>
                </div>
                {selectedNode.threatLevel && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Highest Level:</span>
                    <span
                      className={`${
                        selectedNode.threatLevel === "CRITICAL"
                          ? "text-danger-400"
                          : selectedNode.threatLevel === "HIGH"
                          ? "text-orange-400"
                          : selectedNode.threatLevel === "MEDIUM"
                          ? "text-yellow-400"
                          : "text-success-400"
                      }`}
                    >
                      {selectedNode.threatLevel}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Connections:</span>
                  <span className="text-white">
                    {
                      networkData.connections.filter(
                        (c) =>
                          c.source === selectedNode.id ||
                          c.target === selectedNode.id
                      ).length
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent connections */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-400 mb-3">
              Recent Connections
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin">
              {networkData.connections
                .filter(
                  (c) =>
                    c.source === selectedNode.id || c.target === selectedNode.id
                )
                .slice(0, 5)
                .map((connection, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-700/50 rounded"
                  >
                    <div className="text-sm text-white">
                      {connection.source === selectedNode.id
                        ? `→ ${
                            networkData.nodes.find(
                              (n) => n.id === connection.target
                            )?.ip
                          }`
                        : `← ${
                            networkData.nodes.find(
                              (n) => n.id === connection.source
                            )?.ip
                          }`}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">
                        {connection.protocol}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          connection.threatLevel === "CRITICAL"
                            ? "bg-danger-500/20 text-danger-400"
                            : connection.threatLevel === "HIGH"
                            ? "bg-orange-500/20 text-orange-400"
                            : connection.threatLevel === "MEDIUM"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-success-500/20 text-success-400"
                        }`}
                      >
                        {connection.threats}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default NetworkTopology;
