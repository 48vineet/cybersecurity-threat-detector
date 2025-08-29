import { useState, useEffect } from "react";
import { useThreat } from "../../context/ThreatContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  CpuChipIcon,
  BoltIcon,
  EyeIcon,
  TrophyIcon,
  BeakerIcon,
} from "@heroicons/react/24/outline";

const MLDashboard = () => {
  const { threats } = useThreat();
  const [mlStats, setMLStats] = useState({
    processedSamples: 0,
    threatsDetected: 0,
    accuracy: 0.94,
    processingTimeMs: 12,
    modelVersion: "1.0-hackathon",
  });

  const [mlThreats, setMLThreats] = useState([]);

  useEffect(() => {
    // Listen for ML-specific updates
    const socket = socketRef.current;

    socket?.on("mlThreatDetected", (threat) => {
      setMLThreats((prev) => [threat, ...prev.slice(0, 9)]);
    });

    socket?.on("mlStatsUpdate", (stats) => {
      setMLStats(stats);
    });

    socket?.on("criticalMLAlert", (alert) => {
      // Special handling for critical ML alerts
      toast.error(`🤖 ${alert.message}`, {
        duration: 8000,
        style: {
          background: "#dc2626",
          color: "white",
          fontSize: "16px",
          fontWeight: "bold",
        },
      });
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* ML Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-cyber-600 to-cyber-700 rounded-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">ML Accuracy</p>
              <p className="text-3xl font-bold animate-pulse">
                {(mlStats.accuracy * 100).toFixed(1)}%
              </p>
            </div>
            <TrophyIcon className="h-10 w-10 opacity-80" />
          </div>
          <div className="mt-2 text-sm opacity-75">{mlStats.modelVersion}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-success-500 to-success-600 rounded-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Samples Processed</p>
              <p className="text-3xl font-bold">
                {mlStats.processedSamples.toLocaleString()}
              </p>
            </div>
            <BeakerIcon className="h-10 w-10 opacity-80" />
          </div>
          <div className="mt-2 text-sm opacity-75">Real-time analysis</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Threats Detected</p>
              <p className="text-3xl font-bold">{mlStats.threatsDetected}</p>
            </div>
            <EyeIcon className="h-10 w-10 opacity-80" />
          </div>
          <div className="mt-2 text-sm opacity-75">By AI models</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Processing Speed</p>
              <p className="text-3xl font-bold">{mlStats.processingTimeMs}ms</p>
            </div>
            <BoltIcon className="h-10 w-10 opacity-80" />
          </div>
          <div className="mt-2 text-sm opacity-75">Average latency</div>
        </motion.div>
      </div>

      {/* ML Threat Detection Feed */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <CpuChipIcon className="h-6 w-6 mr-2 text-cyber-400" />
          🤖 AI-Powered Threat Detection
        </h3>

        <div className="space-y-3">
          <AnimatePresence>
            {mlThreats.map((threat, index) => (
              <motion.div
                key={`${threat.timestamp}-${index}`}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.3 }}
                className={`p-4 rounded-lg border-l-4 ${
                  threat.overallThreatLevel === "CRITICAL"
                    ? "bg-danger-500/10 border-danger-500"
                    : threat.overallThreatLevel === "HIGH"
                    ? "bg-orange-500/10 border-orange-500"
                    : "bg-yellow-500/10 border-yellow-500"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full animate-pulse ${
                          threat.overallThreatLevel === "CRITICAL"
                            ? "bg-danger-500"
                            : threat.overallThreatLevel === "HIGH"
                            ? "bg-orange-500"
                            : "bg-yellow-500"
                        }`}
                      />
                      <div>
                        <p className="text-lg font-bold text-white">
                          🤖 {threat.threatClass.type} Detected
                        </p>
                        <p className="text-sm text-gray-300">
                          Anomaly Score:{" "}
                          {(threat.anomalyScore * 100).toFixed(1)}% | Risk
                          Score: {(threat.riskScore * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-sm">
                      <span className="text-cyber-400">
                        ML Confidence: {(threat.confidence * 100).toFixed(1)}%
                      </span>
                      <span className="text-gray-400">
                        Processing: {threat.processingTime}ms
                      </span>
                      <span className="text-success-400">
                        Source: Real Network Data
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-2xl font-bold ${
                        threat.overallThreatLevel === "CRITICAL"
                          ? "text-danger-400"
                          : threat.overallThreatLevel === "HIGH"
                          ? "text-orange-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {threat.overallThreatLevel}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(threat.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {mlThreats.length === 0 && (
          <div className="text-center py-8">
            <CpuChipIcon className="h-16 w-16 text-gray-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-400 text-lg">
              AI Models Ready - Monitoring Network...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MLDashboard;
