import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import {
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const UserSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    threatLevels: ["HIGH", "CRITICAL"],
  });

  const tabs = [
    { id: "profile", name: "Profile", icon: UserCircleIcon },
    { id: "notifications", name: "Notifications", icon: BellIcon },
    { id: "security", name: "Security", icon: ShieldCheckIcon },
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNotificationChange = (key, value) => {
    setNotifications({
      ...notifications,
      [key]: value,
    });
  };

  const handleThreatLevelChange = (level) => {
    const currentLevels = notifications.threatLevels;
    const newLevels = currentLevels.includes(level)
      ? currentLevels.filter((l) => l !== level)
      : [...currentLevels, level];

    setNotifications({
      ...notifications,
      threatLevels: newLevels,
    });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    // TODO: Implement profile update API call
    toast.success("Profile updated successfully");
  };

  const handleSavePassword = (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    // TODO: Implement password update API call
    toast.success("Password updated successfully");
    setFormData({
      ...formData,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleSaveNotifications = () => {
    // TODO: Implement notification preferences API call
    toast.success("Notification preferences saved");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-2">User Settings</h2>
        <p className="text-gray-400">
          Manage your account preferences and security settings
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-cyber-500 text-cyber-400"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-medium text-white mb-4">
                  Profile Information
                </h3>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyber-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyber-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyber-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value={user?.role || ""}
                      disabled
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      Contact administrator to change role
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-cyber-600 text-white rounded-lg hover:bg-cyber-700 focus:outline-none focus:ring-2 focus:ring-cyber-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-medium text-white mb-4">
                  Notification Preferences
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-white">
                        Email Notifications
                      </h4>
                      <p className="text-sm text-gray-400">
                        Receive threat alerts via email
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleNotificationChange("email", !notifications.email)
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.email ? "bg-cyber-600" : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.email
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-white">
                        Push Notifications
                      </h4>
                      <p className="text-sm text-gray-400">
                        Receive real-time browser notifications
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleNotificationChange("push", !notifications.push)
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.push ? "bg-cyber-600" : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.push ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-4 bg-gray-700/50 rounded-lg">
                    <h4 className="text-sm font-medium text-white mb-3">
                      Threat Level Alerts
                    </h4>
                    <p className="text-sm text-gray-400 mb-3">
                      Choose which threat levels trigger notifications
                    </p>

                    <div className="space-y-2">
                      {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((level) => (
                        <label key={level} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={notifications.threatLevels.includes(level)}
                            onChange={() => handleThreatLevelChange(level)}
                            className="h-4 w-4 text-cyber-600 bg-gray-700 border-gray-600 rounded focus:ring-cyber-500 focus:ring-2"
                          />
                          <span
                            className={`ml-2 text-sm ${
                              level === "CRITICAL"
                                ? "text-danger-400"
                                : level === "HIGH"
                                ? "text-orange-400"
                                : level === "MEDIUM"
                                ? "text-yellow-400"
                                : "text-success-400"
                            }`}
                          >
                            {level}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotifications}
                    className="px-6 py-2 bg-cyber-600 text-white rounded-lg hover:bg-cyber-700 focus:outline-none focus:ring-2 focus:ring-cyber-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-medium text-white mb-4">
                  Change Password
                </h3>

                <form onSubmit={handleSavePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyber-500 focus:border-transparent"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyber-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyber-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-cyber-600 text-white rounded-lg hover:bg-cyber-700 focus:outline-none focus:ring-2 focus:ring-cyber-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>

              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-white mb-4">
                  Security Information
                </h3>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Last Login:</span>
                      <span className="text-white">
                        {user?.lastLogin
                          ? new Date(user.lastLogin).toLocaleString()
                          : "Never"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Account Created:</span>
                      <span className="text-white">
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Two-Factor Auth:</span>
                      <span
                        className={`${
                          user?.twoFactorEnabled
                            ? "text-success-400"
                            : "text-gray-400"
                        }`}
                      >
                        {user?.twoFactorEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
