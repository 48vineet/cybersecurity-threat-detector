import { useState, useMemo } from "react";
import { useThreat } from "../../context/ThreatContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  EyeIcon,
  ShieldExclamationIcon,
  XMarkIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const ActiveThreats = () => {
  const { threats, blockIP, markFalsePositive } = useThreat();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("ALL");
  const [sortBy, setSortBy] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedThreat, setSelectedThreat] = useState(null);

  const filteredAndSortedThreats = useMemo(() => {
    let filtered = threats.filter((threat) => {
      // Safely handle undefined/null values
      const sourceIP = threat.sourceIP || "";
      const destinationIP = threat.destinationIP || "";
      const threatCategory = threat.threatCategory || "";
      
      const matchesSearch =
        sourceIP.toLowerCase().includes(searchTerm.toLowerCase()) ||
        destinationIP.toLowerCase().includes(searchTerm.toLowerCase()) ||
        threatCategory.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLevel =
        filterLevel === "ALL" || threat.threatLevel === filterLevel;

      return matchesSearch && matchesLevel;
    });

    return filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "timestamp") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortBy === "threatScore") {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [threats, searchTerm, filterLevel, sortBy, sortOrder]);

  const handleBlockIP = async (ip) => {
    await blockIP(ip);
    toast.success(`IP ${ip} blocked successfully`);
  };

  const handleMarkFalsePositive = async (threatId) => {
    await markFalsePositive(threatId);
    toast.success("Threat marked as false positive");
  };

  const getThreatLevelColor = (level) => {
    switch (level) {
      case "CRITICAL":
        return "text-danger-400 bg-danger-500/20";
      case "HIGH":
        return "text-orange-400 bg-orange-500/20";
      case "MEDIUM":
        return "text-yellow-400 bg-yellow-500/20";
      case "LOW":
        return "text-success-400 bg-success-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  const getThreatIcon = (category) => {
    switch (category) {
      case "MALWARE":
        return ExclamationTriangleIcon;
      case "BRUTE_FORCE":
        return NoSymbolIcon;
      case "DATA_EXFILTRATION":
        return ShieldExclamationIcon;
      case "DDoS":
        return ClockIcon;
      default:
        return ShieldExclamationIcon;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-white">Active Threats</h2>
            <p className="text-gray-400 mt-1">
              {filteredAndSortedThreats.length} threats detected
            </p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search threats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyber-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="pl-10 pr-8 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyber-500 focus:border-transparent appearance-none"
              >
                <option value="ALL">All Levels</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyber-500 focus:border-transparent"
            >
              <option value="timestamp-desc">Latest First</option>
              <option value="timestamp-asc">Oldest First</option>
              <option value="threatScore-desc">Highest Score</option>
              <option value="threatScore-asc">Lowest Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* Threats Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Threat Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              <AnimatePresence>
                {filteredAndSortedThreats.map((threat, index) => {
                  const ThreatIcon = getThreatIcon(threat.threatCategory);

                  return (
                    <motion.tr
                      key={threat._id || `threat-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedThreat(threat)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <ThreatIcon className="h-6 w-6 text-cyber-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {threat.threatCategory || "Unknown Threat"}
                            </div>
                            <div className="text-sm text-gray-400">
                              {threat.protocol} •{" "}
                              {new Date(threat.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {threat.sourceIP}
                        </div>
                        <div className="text-sm text-gray-400">
                          → {threat.destinationIP}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getThreatLevelColor(
                            threat.threatLevel
                          )}`}
                        >
                          {threat.threatLevel}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-white">
                            {(threat.threatScore * 100).toFixed(1)}%
                          </div>
                          <div className="ml-2 w-16 bg-gray-600 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                threat.threatScore > 0.7
                                  ? "bg-danger-500"
                                  : threat.threatScore > 0.4
                                  ? "bg-yellow-500"
                                  : "bg-success-500"
                              }`}
                              style={{ width: `${threat.threatScore * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {threat.isBlocked ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-500/20 text-danger-400">
                            <NoSymbolIcon className="h-3 w-3 mr-1" />
                            Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            Active
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedThreat(threat);
                          }}
                          className="text-cyber-400 hover:text-cyber-300 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>

                        {!threat.isBlocked && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBlockIP(threat.sourceIP);
                            }}
                            className="text-danger-400 hover:text-danger-300 transition-colors"
                          >
                            <NoSymbolIcon className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkFalsePositive(threat._id);
                          }}
                          className="text-success-400 hover:text-success-300 transition-colors"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Threat Detail Modal */}
      <AnimatePresence>
        {selectedThreat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedThreat(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">
                  Threat Details
                </h3>
                <button
                  onClick={() => setSelectedThreat(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">
                    Basic Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Source IP:</span>{" "}
                      <span className="text-white">
                        {selectedThreat.sourceIP}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Destination IP:</span>{" "}
                      <span className="text-white">
                        {selectedThreat.destinationIP}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Protocol:</span>{" "}
                      <span className="text-white">
                        {selectedThreat.protocol}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Packet Size:</span>{" "}
                      <span className="text-white">
                        {selectedThreat.packetSize} bytes
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">
                    Threat Analysis
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Category:</span>{" "}
                      <span className="text-white">
                        {selectedThreat.threatCategory}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Level:</span>{" "}
                      <span
                        className={`${
                          getThreatLevelColor(selectedThreat.threatLevel).split(
                            " "
                          )[0]
                        }`}
                      >
                        {selectedThreat.threatLevel}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Score:</span>{" "}
                      <span className="text-white">
                        {(selectedThreat.threatScore * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>{" "}
                      <span
                        className={
                          selectedThreat.isBlocked
                            ? "text-danger-400"
                            : "text-yellow-400"
                        }
                      >
                        {selectedThreat.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedThreat.features && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">
                    Network Features
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Port:</span>{" "}
                      <span className="text-white">
                        {selectedThreat.features.portNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Payload Size:</span>{" "}
                      <span className="text-white">
                        {selectedThreat.features.payloadSize} bytes
                      </span>
                    </div>
                    {selectedThreat.features.dataTransferRate && (
                      <div>
                        <span className="text-gray-400">Transfer Rate:</span>{" "}
                        <span className="text-white">
                          {selectedThreat.features.dataTransferRate} KB/s
                        </span>
                      </div>
                    )}
                    {selectedThreat.features.requestFrequency && (
                      <div>
                        <span className="text-gray-400">Frequency:</span>{" "}
                        <span className="text-white">
                          {selectedThreat.features.requestFrequency} req/min
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedThreat.mitigationActions &&
                selectedThreat.mitigationActions.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">
                      Mitigation Actions
                    </h4>
                    <ul className="text-sm text-white space-y-1">
                      {selectedThreat.mitigationActions.map((action, index) => (
                        <li key={`detail-${index}`} className="flex items-center">
                          <CheckCircleIcon className="h-4 w-4 text-success-400 mr-2" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActiveThreats;
