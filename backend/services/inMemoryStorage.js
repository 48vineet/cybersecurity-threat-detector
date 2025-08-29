class InMemoryStorage {
  constructor() {
    this.threats = [];
    this.users = new Map();
    this.sessions = new Map();
    this.maxThreats = 1000; // Keep only last 1000 threats in memory
  }

  // Threat storage methods
  async saveThreat(threatData) {
    try {
      // Add timestamp if not present
      if (!threatData.timestamp) {
        threatData.timestamp = new Date();
      }

      // Add unique ID if not present
      if (!threatData._id) {
        threatData._id = `mem_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
      }

      this.threats.push(threatData);

      // Keep only the last maxThreats
      if (this.threats.length > this.maxThreats) {
        this.threats = this.threats.slice(-this.maxThreats);
      }

      return threatData;
    } catch (error) {
      console.error("Error saving threat to in-memory storage:", error);
      throw error;
    }
  }

  async findThreats(query = {}, options = {}) {
    try {
      let filteredThreats = [...this.threats];

      // Apply basic filtering
      if (query.sourceIP) {
        filteredThreats = filteredThreats.filter(
          (t) => t.sourceIP === query.sourceIP
        );
      }

      if (query.threatLevel) {
        filteredThreats = filteredThreats.filter(
          (t) => t.threatLevel === query.threatLevel
        );
      }

      if (query.timestamp) {
        const timestamp = new Date(query.timestamp.$gte || query.timestamp);
        filteredThreats = filteredThreats.filter(
          (t) => new Date(t.timestamp) >= timestamp
        );
      }

      // Apply sorting
      if (options.sort) {
        const [field, order] = options.sort.split(" ");
        filteredThreats.sort((a, b) => {
          if (order === "desc" || order === "-1") {
            return b[field] - a[field];
          }
          return a[field] - b[field];
        });
      }

      // Apply limit
      if (options.limit) {
        filteredThreats = filteredThreats.slice(0, options.limit);
      }

      return filteredThreats;
    } catch (error) {
      console.error("Error finding threats in in-memory storage:", error);
      return [];
    }
  }

  async countThreats(query = {}) {
    try {
      const threats = await this.findThreats(query);
      return threats.length;
    } catch (error) {
      console.error("Error counting threats in in-memory storage:", error);
      return 0;
    }
  }

  async getThreatStats(hours = 24) {
    try {
      const now = new Date();
      const hoursAgo = new Date(now.getTime() - hours * 60 * 60 * 1000);

      const recentThreats = this.threats.filter(
        (t) => new Date(t.timestamp) >= hoursAgo
      );

      return {
        total: recentThreats.length,
        high: recentThreats.filter((t) =>
          ["HIGH", "CRITICAL"].includes(t.threatLevel)
        ).length,
        blocked: recentThreats.filter((t) => t.isBlocked).length,
        critical: recentThreats.filter((t) => t.threatLevel === "CRITICAL")
          .length,
      };
    } catch (error) {
      console.error(
        "Error getting threat stats from in-memory storage:",
        error
      );
      return { total: 0, high: 0, blocked: 0, critical: 0 };
    }
  }

  // User storage methods
  async saveUser(userData) {
    try {
      const userId = userData.id || userData._id || `user_${Date.now()}`;
      const user = {
        ...userData,
        id: userId,
        _id: userId,
      };
      this.users.set(userId, user);
      return user;
    } catch (error) {
      console.error("Error saving user to in-memory storage:", error);
      throw error;
    }
  }

  async findUser(query) {
    try {
      for (const [id, user] of this.users) {
        if (query.email && user.email === query.email) {
          return user;
        }
        if (query.username && user.username === query.username) {
          return user;
        }
        if (
          (query.id && user.id === query.id) ||
          (query._id && user._id === query._id)
        ) {
          return user;
        }
      }
      return null;
    } catch (error) {
      console.error("Error finding user in in-memory storage:", error);
      return null;
    }
  }

  // Session storage methods
  async saveSession(sessionId, sessionData) {
    try {
      this.sessions.set(sessionId, { ...sessionData, createdAt: new Date() });
      return sessionData;
    } catch (error) {
      console.error("Error saving session to in-memory storage:", error);
      throw error;
    }
  }

  async findSession(sessionId) {
    try {
      return this.sessions.get(sessionId) || null;
    } catch (error) {
      console.error("Error finding session in in-memory storage:", error);
      return null;
    }
  }

  async deleteSession(sessionId) {
    try {
      this.sessions.delete(sessionId);
      return true;
    } catch (error) {
      console.error("Error deleting session from in-memory storage:", error);
      return false;
    }
  }

  // Cleanup old sessions
  cleanupOldSessions(maxAge = 24 * 60 * 60 * 1000) {
    // 24 hours default
    try {
      const now = new Date();
      for (const [sessionId, session] of this.sessions) {
        if (now - session.createdAt > maxAge) {
          this.sessions.delete(sessionId);
        }
      }
    } catch (error) {
      console.error("Error cleaning up old sessions:", error);
    }
  }

  // Get storage statistics
  getStats() {
    return {
      threats: this.threats.length,
      users: this.users.size,
      sessions: this.sessions.size,
      maxThreats: this.maxThreats,
    };
  }

  // Clear all data (useful for testing)
  clear() {
    this.threats = [];
    this.users.clear();
    this.sessions.clear();
  }
}

module.exports = InMemoryStorage;
