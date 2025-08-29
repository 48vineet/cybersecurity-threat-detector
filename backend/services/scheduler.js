const schedule = require("node-schedule");
const logger = require("../utils/logger");

class SchedulerService {
  constructor() {
    this.jobs = new Map();
    this.io = null;
  }

  initialize(io) {
    this.io = io;
    this.setupJobs();
    logger.info("Scheduler service initialized");
  }

  setupJobs() {
    // Cleanup old sessions every hour
    this.scheduleJob("cleanup-sessions", "0 * * * *", () => {
      this.cleanupOldSessions();
    });

    // Generate threat statistics every 5 minutes
    this.scheduleJob("threat-stats", "*/5 * * * *", () => {
      this.generateThreatStatistics();
    });

    // System health check every 10 minutes
    this.scheduleJob("health-check", "*/10 * * * *", () => {
      this.performHealthCheck();
    });
  }

  scheduleJob(name, cronExpression, callback) {
    try {
      const job = schedule.scheduleJob(cronExpression, callback);
      this.jobs.set(name, job);
      logger.info(`Scheduled job: ${name}`);
    } catch (error) {
      logger.error(`Failed to schedule job ${name}:`, error);
    }
  }

  cleanupOldSessions() {
    try {
      logger.info("Running session cleanup...");
      // Add session cleanup logic here
    } catch (error) {
      logger.error("Session cleanup failed:", error);
    }
  }

  generateThreatStatistics() {
    try {
      logger.info("Generating threat statistics...");
      // Add threat statistics generation logic here
      if (this.io) {
        this.io.emit("threat-stats-updated", {
          timestamp: new Date().toISOString(),
          message: "Threat statistics updated",
        });
      }
    } catch (error) {
      logger.error("Threat statistics generation failed:", error);
    }
  }

  performHealthCheck() {
    try {
      const healthData = {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        connections: this.io ? this.io.engine.clientsCount : 0,
      };

      logger.info("System health check completed", healthData);

      if (this.io) {
        this.io.emit("health-update", healthData);
      }
    } catch (error) {
      logger.error("Health check failed:", error);
    }
  }

  stopAll() {
    logger.info("Stopping all scheduled jobs...");
    for (const [name, job] of this.jobs) {
      job.cancel();
      logger.info(`Stopped job: ${name}`);
    }
    this.jobs.clear();
  }
}

module.exports = new SchedulerService();
