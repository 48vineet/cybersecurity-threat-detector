import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useThreat } from "../../context/ThreatContext";
import { motion } from "framer-motion";
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  SignalIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import ThreatOverview from "./ThreatOverview";
import RealTimeStats from "./RealTimeStats";
import ThreatMap from "./ThreatMap";
import ThreatTimeline from "./ThreatTimeline";
import ActiveThreats from "./ActiveThreats";
import NetworkTopology from "./NetworkTopology";
import UserSettings from "./UserSettings";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { connected, networkStatus } = useThreat();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Get current active view from URL or state
  const getCurrentView = () => {
    const path = location.pathname.split("/dashboard/")[1];
    return path || "overview";
  };

  const [activeView, setActiveView] = useState(getCurrentView());

  // Update activeView when location changes
  useEffect(() => {
    setActiveView(getCurrentView());
  }, [location.pathname]);

  const navigationItems = [
    {
      id: "overview",
      name: "Overview",
      icon: ShieldCheckIcon,
      path: "/dashboard/overview",
    },
    {
      id: "threats",
      name: "Active Threats",
      icon: ExclamationTriangleIcon,
      path: "/dashboard/threats",
    },
    {
      id: "analytics",
      name: "Analytics",
      icon: SignalIcon,
      path: "/dashboard/analytics",
    },
    {
      id: "network",
      name: "Network Topology",
      icon: SignalIcon,
      path: "/dashboard/network",
    },
  ];

  const handleNavigation = (id, path) => {
    setActiveView(id);
    navigate(path);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case "overview":
        return <ThreatOverview />;
      case "threats":
        return <ActiveThreats />;
      case "analytics":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ThreatTimeline />
            <ThreatMap />
          </div>
        );
      case "network":
        return <NetworkTopology />;
      case "settings":
        return <UserSettings />;
      default:
        return <ThreatOverview />;
    }
  };

  const getPageTitle = () => {
    switch (activeView) {
      case "overview":
        return "Security Overview";
      case "threats":
        return "Active Threats";
      case "analytics":
        return "Threat Analytics";
      case "network":
        return "Network Topology";
      case "settings":
        return "User Settings";
      default:
        return "Security Overview";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-cyber-500 rounded-lg flex items-center justify-center animate-glow mr-3">
                <ShieldCheckIcon className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">CyberGuard</h1>
            </div>

            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Connection Status */}
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  connected ? "bg-success-500 animate-pulse" : "bg-danger-500"
                }`}
              />
              <span className="text-sm text-gray-300">
                {connected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-1 capitalize">
              Status: {networkStatus}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-4 space-y-2">
            {navigationItems.map((item) => {
              const isActive = activeView === item.id;

              return (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavigation(item.id, item.path)}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "bg-cyber-600 text-white shadow-lg shadow-cyber-500/20"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 mr-3 ${
                      isActive ? "text-white" : "text-gray-400"
                    }`}
                  />
                  {item.name}

                  {/* Active indicator */}
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full" />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="px-6 py-4 border-t border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 bg-cyber-500/20 rounded-full flex items-center justify-center">
                <UserCircleIcon className="h-6 w-6 text-cyber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() =>
                  handleNavigation("settings", "/dashboard/settings")
                }
                className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors duration-200 ${
                  activeView === "settings"
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <Cog6ToothIcon className="h-4 w-4 mr-3" />
                Settings
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center px-3 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 lg:ml-64`}>
        {/* Header */}
        <header className="bg-gray-800 shadow-lg sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors duration-200 lg:hidden"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>

              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:block p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors duration-200"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <div>
                <h2 className="text-2xl font-bold text-white">
                  {getPageTitle()}
                </h2>
                <p className="text-sm text-gray-400">
                  Real-time cybersecurity monitoring and analysis
                </p>
              </div>
            </div>

            <RealTimeStats />
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Routes>
              <Route index element={<ThreatOverview />} />
              <Route path="overview" element={<ThreatOverview />} />
              <Route path="threats" element={<ActiveThreats />} />
              <Route
                path="analytics"
                element={
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ThreatTimeline />
                    <ThreatMap />
                  </div>
                }
              />
              <Route path="network" element={<NetworkTopology />} />
              <Route path="settings" element={<UserSettings />} />
              {/* Fallback route */}
              <Route path="*" element={renderActiveView()} />
            </Routes>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
