const logger = require("../utils/logger");

class SchedulerService {
  constructor() {
    this.jobs = new Map();
  }

  initialize(io) {
    logger.info("Scheduler service initialized");

    // Example: Add a recurring job
    const exampleJob = setInterval(() => {
      try {
        logger.info("Example job running...");
        if (io && typeof io.emit === 'function') {
          io.emit("exampleEvent", { message: "Example job executed" });
        }
      } catch (error) {
        logger.error("Error in scheduled job:", error);
      }
    }, 60000); // Runs every 60 seconds

    this.jobs.set("exampleJob", exampleJob);
  }

  stopAll() {
    logger.info("Stopping all scheduled jobs...");
    this.jobs.forEach((job, jobName) => {
      clearInterval(job);
      logger.info(`Stopped job: ${jobName}`);
    });
    this.jobs.clear();
  }
}

module.exports = new SchedulerService();
