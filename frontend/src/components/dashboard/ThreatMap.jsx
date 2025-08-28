import { useMemo, useState } from "react";
import { useThreat } from "../../context/ThreatContext";
import { motion } from "framer-motion";
import {
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

const ThreatMap = () => {
  const { threats } = useThreat();
  const [selectedCountry, setSelectedCountry] = useState(null);

  const geographicData = useMemo(() => {
    const countryStats = {};

    threats.forEach((threat) => {
      if (threat.sourceLocation && threat.sourceLocation.country) {
        const country = threat.sourceLocation.country;
        if (!countryStats[country]) {
          countryStats[country] = {
            country,
            city: threat.sourceLocation.city,
            total: 0,
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            blocked: 0,
            latitude: threat.sourceLocation.latitude || 0,
            longitude: threat.sourceLocation.longitude || 0,
          };
        }

        countryStats[country].total++;
        countryStats[country][threat.threatLevel.toLowerCase()]++;

        if (threat.isBlocked) {
          countryStats[country].blocked++;
        }
      }
    });

    return Object.values(countryStats).sort((a, b) => b.total - a.total);
  }, [threats]);

  const maxThreats = Math.max(...geographicData.map((d) => d.total), 1);

  const getThreatColor = (total, max) => {
    const ratio = total / max;
    if (ratio > 0.7) return "bg-danger-500";
    if (ratio > 0.4) return "bg-orange-500";
    if (ratio > 0.2) return "bg-yellow-500";
    return "bg-success-500";
  };

  const getRiskLevel = (country) => {
    const criticalPercent = (country.critical / country.total) * 100;
    const highPercent = (country.high / country.total) * 100;

    if (criticalPercent > 50) return "CRITICAL";
    if (criticalPercent > 20 || highPercent > 60) return "HIGH";
    if (highPercent > 30) return "MEDIUM";
    return "LOW";
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">
          Geographic Threat Distribution
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <MapPinIcon className="h-4 w-4" />
          <span>{geographicData.length} locations</span>
        </div>
      </div>

      {/* World Map Simulation */}
      <div className="relative bg-gray-900 rounded-lg p-4 mb-6 min-h-64">
        <div className="absolute inset-0 bg-gradient-to-br from-cyber-900/20 to-transparent rounded-lg pointer-events-none" />

        {/* Simulated world map with threat indicators */}
        <div className="relative h-60 overflow-hidden">
          {geographicData.slice(0, 10).map((country, index) => (
            <motion.div
              key={country.country}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`absolute cursor-pointer ${getThreatColor(
                country.total,
                maxThreats
              )} rounded-full animate-pulse-slow`}
              style={{
                left: `${Math.random() * 80 + 10}%`,
                top: `${Math.random() * 70 + 15}%`,
                width: `${Math.min(
                  Math.max((country.total / maxThreats) * 30, 8),
                  40
                )}px`,
                height: `${Math.min(
                  Math.max((country.total / maxThreats) * 30, 8),
                  40
                )}px`,
              }}
              onClick={() => setSelectedCountry(country)}
              title={`${country.country}: ${country.total} threats`}
            >
              <div className="w-full h-full rounded-full border-2 border-white/30 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {country.total}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-gray-800/90 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-2">Threat Volume</div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success-500 rounded-full"></div>
            <span className="text-xs text-gray-300">Low</span>
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-xs text-gray-300">Med</span>
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-xs text-gray-300">High</span>
            <div className="w-2 h-2 bg-danger-500 rounded-full"></div>
            <span className="text-xs text-gray-300">Critical</span>
          </div>
        </div>
      </div>

      {/* Country Statistics */}
      <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
        {geographicData.map((country, index) => {
          const riskLevel = getRiskLevel(country);

          return (
            <motion.div
              key={country.country}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                selectedCountry?.country === country.country
                  ? "bg-cyber-500/20 border-cyber-500/50"
                  : "bg-gray-700/50 border-gray-600 hover:bg-gray-700"
              }`}
              onClick={() => setSelectedCountry(country)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${getThreatColor(
                      country.total,
                      maxThreats
                    )}`}
                  />
                  <div>
                    <div className="text-sm font-medium text-white">
                      {country.country}
                      {country.city && country.city !== "Unknown" && (
                        <span className="text-gray-400 ml-1">
                          ({country.city})
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      Risk Level:{" "}
                      <span
                        className={`${
                          riskLevel === "CRITICAL"
                            ? "text-danger-400"
                            : riskLevel === "HIGH"
                            ? "text-orange-400"
                            : riskLevel === "MEDIUM"
                            ? "text-yellow-400"
                            : "text-success-400"
                        }`}
                      >
                        {riskLevel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-semibold text-white">
                    {country.total} threats
                  </div>
                  <div className="text-xs text-gray-400">
                    {country.blocked} blocked
                  </div>
                </div>
              </div>

              {selectedCountry?.country === country.country && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 pt-3 border-t border-gray-600"
                >
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <div className="text-xs text-danger-400">
                        {country.critical}
                      </div>
                      <div className="text-xs text-gray-400">Critical</div>
                    </div>
                    <div>
                      <div className="text-xs text-orange-400">
                        {country.high}
                      </div>
                      <div className="text-xs text-gray-400">High</div>
                    </div>
                    <div>
                      <div className="text-xs text-yellow-400">
                        {country.medium}
                      </div>
                      <div className="text-xs text-gray-400">Medium</div>
                    </div>
                    <div>
                      <div className="text-xs text-success-400">
                        {country.low}
                      </div>
                      <div className="text-xs text-gray-400">Low</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ThreatMap;
