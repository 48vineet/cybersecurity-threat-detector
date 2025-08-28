import { useThreat } from "../../context/ThreatContext";
import { motion } from "framer-motion";
import {
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const ThreatOverview = () => {
  const { threats, stats, loading } = useThreat();

  const recentThreats = threats.slice(0, 10);
  const criticalThreats = threats
    .filter((t) => t.threatLevel === "CRITICAL")
    .slice(0, 5);

  const statCards = [
    {
      name: "Total Threats",
      value: stats.total,
      icon: ShieldExclamationIcon,
      color: "cyber",
      change: "+12%",
      changeType: "increase",
    },
    {
      name: "High Priority",
      value: stats.high,
      icon: ExclamationTriangleIcon,
      color: "danger",
      change: "+8%",
      changeType: "increase",
    },
    {
      name: "Blocked",
      value: stats.blocked,
      icon: CheckCircleIcon,
      color: "success",
      change: "+15%",
      changeType: "increase",
    },
    {
      name: "Active Monitoring",
      value: "24/7",
      icon: ClockIcon,
      color: "cyber",
      change: "Online",
      changeType: "neutral",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200"
          >
            <div className="flex items-center">
              <div
                className={`flex-shrink-0 p-3 rounded-lg bg-${card.color}-500/20`}
              >
                <card.icon className={`h-6 w-6 text-${card.color}-400`} />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-400">{card.name}</p>
                <p className="text-2xl font-bold text-white">{card.value}</p>
              </div>
            </div>
            <div className="mt-4">
              <span
                className={`text-sm ${
                  card.changeType === "increase"
                    ? "text-success-400"
                    : card.changeType === "decrease"
                    ? "text-danger-400"
                    : "text-gray-400"
                }`}
              >
                {card.change}
              </span>
              <span className="text-sm text-gray-400 ml-2">from last hour</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Threats */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Recent Threats
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
            {recentThreats.map((threat, index) => (
              <motion.div
                key={threat._id || index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      threat.threatLevel === "CRITICAL"
                        ? "bg-danger-500 animate-pulse"
                        : threat.threatLevel === "HIGH"
                        ? "bg-orange-500"
                        : threat.threatLevel === "MEDIUM"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {threat.sourceIP}
                    </p>
                    <p className="text-xs text-gray-400">
                      {threat.threatCategory || "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {(threat.threatScore * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(threat.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Critical Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Critical Alerts
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
            {criticalThreats.length > 0 ? (
              criticalThreats.map((threat, index) => (
                <motion.div
                  key={threat._id || index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="p-4 bg-danger-500/10 border border-danger-500/20 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-danger-400" />
                        <h4 className="text-sm font-semibold text-danger-400">
                          Critical Threat Detected
                        </h4>
                      </div>
                      <p className="text-sm text-white mt-1">
                        Source: {threat.sourceIP}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {threat.threatCategory} - Score:{" "}
                        {(threat.threatScore * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">
                        {new Date(threat.timestamp).toLocaleTimeString()}
                      </p>
                      {threat.isBlocked && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-500/20 text-success-400 mt-1">
                          Blocked
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircleIcon className="h-12 w-12 text-success-400 mx-auto mb-3" />
                <p className="text-gray-400">No critical threats detected</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Threat Distribution Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
      >
        <h3 className="text-lg font-semibold text-white mb-4">
          Threat Level Distribution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((level, index) => {
            const count = threats.filter((t) => t.threatLevel === level).length;
            const percentage =
              threats.length > 0 ? (count / threats.length) * 100 : 0;

            return (
              <div key={level} className="text-center">
                <div
                  className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    level === "CRITICAL"
                      ? "bg-danger-500/20 text-danger-400"
                      : level === "HIGH"
                      ? "bg-orange-500/20 text-orange-400"
                      : level === "MEDIUM"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-success-500/20 text-success-400"
                  }`}
                >
                  <span className="text-lg font-bold">{count}</span>
                </div>
                <p className="text-sm font-medium text-white">{level}</p>
                <p className="text-xs text-gray-400">
                  {percentage.toFixed(1)}%
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default ThreatOverview;
