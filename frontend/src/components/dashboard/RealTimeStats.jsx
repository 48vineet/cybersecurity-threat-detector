import { useThreat } from "../../context/ThreatContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  WifiIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const RealTimeStats = () => {
  const {
    realTimeStats,
    connected,
    wsConnected,
    connectionQuality,
    networkStatus,
  } = useThreat();

  const getConnectionStatusColor = () => {
    if (connected && wsConnected) {
      return "text-success-400";
    } else if (connected || wsConnected) {
      return "text-yellow-400";
    }
    return "text-danger-400";
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case "excellent":
        return "text-success-400";
      case "good":
        return "text-success-400";
      case "fair":
        return "text-yellow-400";
      case "poor":
        return "text-danger-400";
      default:
        return "text-gray-400";
    }
  };

  const getSignalBars = (quality) => {
    const bars = [];
    const levels = { excellent: 4, good: 3, fair: 2, poor: 1 };
    const level = levels[quality] || 0;

    for (let i = 0; i < 4; i++) {
      bars.push(
        <div
          key={i}
          className={`w-1 rounded-full ${
            i < level ? "bg-success-400" : "bg-gray-600"
          }`}
          style={{
            height: `${(i + 1) * 3 + 2}px`,
            marginRight: i < 3 ? "1px" : "0",
          }}
        />
      );
    }
    return bars;
  };

  return (
    <div className="flex items-center space-x-6">
      {/* Connection Status */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {getSignalBars(connectionQuality)}
          </div>
          <div
            className={`w-2 h-2 rounded-full ${
              connected && wsConnected
                ? "bg-success-500 animate-pulse"
                : connected || wsConnected
                ? "bg-yellow-500 animate-ping"
                : "bg-danger-500"
            }`}
          />
        </div>

        <div className="text-sm">
          <div className={`font-medium ${getConnectionStatusColor()}`}>
            {connected && wsConnected
              ? "Live"
              : connected || wsConnected
              ? "Partial"
              : "Offline"}
          </div>
          <div className="text-xs text-gray-400 capitalize">
            {networkStatus}
          </div>
        </div>
      </div>

      {/* Real-time metrics */}
      <div className="hidden md:flex items-center space-x-6">
        <motion.div
          key={realTimeStats.threatsPerMinute}
          initial={{ scale: 1.1, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-sm text-center"
        >
          <div className="text-xs text-gray-400">Threats/min</div>
          <div
            className={`font-bold ${
              realTimeStats.threatsPerMinute > 10
                ? "text-danger-400"
                : realTimeStats.threatsPerMinute > 5
                ? "text-yellow-400"
                : "text-success-400"
            }`}
          >
            {realTimeStats.threatsPerMinute}
          </div>
        </motion.div>

        <motion.div
          key={realTimeStats.criticalThreats}
          initial={{ scale: 1.1, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-sm text-center"
        >
          <div className="text-xs text-gray-400">Critical</div>
          <div
            className={`font-bold ${
              realTimeStats.criticalThreats > 0
                ? "text-danger-400 animate-pulse"
                : "text-success-400"
            }`}
          >
            {realTimeStats.criticalThreats}
          </div>
        </motion.div>

        <motion.div
          key={realTimeStats.blockedThreats}
          initial={{ scale: 1.1, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-sm text-center"
        >
          <div className="text-xs text-gray-400">Blocked</div>
          <div className="font-bold text-success-400">
            {realTimeStats.blockedThreats}
          </div>
        </motion.div>

        <motion.div
          key={realTimeStats.activeConnections}
          initial={{ scale: 1.1, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-sm text-center"
        >
          <div className="text-xs text-gray-400">Active</div>
          <div className="font-bold text-cyber-400">
            {realTimeStats.activeConnections}
          </div>
        </motion.div>

        <div className="text-sm text-center">
          <div className="text-xs text-gray-400">Avg Score</div>
          <div
            className={`font-bold ${
              realTimeStats.avgThreatScore > 0.7
                ? "text-danger-400"
                : realTimeStats.avgThreatScore > 0.4
                ? "text-yellow-400"
                : "text-success-400"
            }`}
          >
            {(realTimeStats.avgThreatScore * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Top Source IPs (show on hover or click) */}
      {realTimeStats.topSourceIPs && realTimeStats.topSourceIPs.length > 0 && (
        <div className="hidden lg:block">
          <div className="text-xs text-gray-400 mb-1">Top Sources</div>
          <div className="flex space-x-2">
            {realTimeStats.topSourceIPs.slice(0, 3).map((item, index) => (
              <div
                key={item.ip}
                className="bg-gray-700/50 rounded px-2 py-1 text-xs"
                title={`${item.ip}: ${item.count} threats`}
              >
                <div className="text-white font-mono">
                  {item.ip.split(".").slice(-2).join(".")}
                </div>
                <div className="text-gray-400">{item.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeStats;
