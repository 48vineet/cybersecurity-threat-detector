const DEDUPE_WINDOW_MS = Number(process.env.LOG_DEDUPE_WINDOW_MS || 5000);
const fs = require("fs");
const path = require("path");

// --- helpers ---
function serializeError(err) {
  if (!err) return null;
  return {
    name: err.name,
    message: err.message,
    stack: err.stack,
    code: err.code,
  };
}

function safeStringify(obj) {
  const seen = new WeakSet();
  try {
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) return "[Circular]";
        seen.add(value);
      }
      return value;
    });
  } catch {
    return String(obj);
  }
}

function nowIso() {
  return new Date().toISOString();
}

// Build a signature for deduping: level + message + first error name/message (if any)
function buildSignature(level, message, errors) {
  const errSig = errors.length
    ? `${errors[0].name || "Error"}:${errors[0].message || ""}`
    : "";
  return `${level}|${message}|${errSig}`;
}

// Dedupe state: signature -> { lastAt, suppressed }
const dedupeState = new Map();
function shouldSuppress(signature, now) {
  const state = dedupeState.get(signature);
  if (!state) {
    dedupeState.set(signature, { lastAt: now, suppressed: 0 });
    return false;
  }
  if (now - state.lastAt < DEDUPE_WINDOW_MS) {
    state.suppressed++;
    return true;
  }
  // window elapsed; emit summary on next log for visibility
  state.lastAt = now;
  const suppressed = state.suppressed;
  state.suppressed = 0;
  if (suppressed > 0) {
    // eslint-disable-next-line no-console
    console.warn(`[WARN] ${nowIso()} - Repeated logs suppressed`, {
      signature,
      suppressed,
      windowMs: DEDUPE_WINDOW_MS,
    });
  }
  return false;
}

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || "info";
    this.logFile = process.env.LOG_FILE || "logs/app.log";

    // Ensure logs directory exists
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(data && { data }),
    };

    // Console output
    const consoleMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;

    switch (level) {
      case "error":
        console.error(consoleMessage, data || "");
        break;
      case "warn":
        console.warn(consoleMessage, data || "");
        break;
      case "info":
        console.info(consoleMessage, data || "");
        break;
      default:
        console.log(consoleMessage, data || "");
    }

    // File output
    try {
      fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + "\n");
    } catch (error) {
      console.error("Failed to write to log file:", error.message);
    }
  }

  error(message, data) {
    this.log("error", message, data);
  }

  warn(message, data) {
    this.log("warn", message, data);
  }

  info(message, data) {
    this.log("info", message, data);
  }

  debug(message, data) {
    if (this.logLevel === "debug") {
      this.log("debug", message, data);
    }
  }
}

module.exports = new Logger();
