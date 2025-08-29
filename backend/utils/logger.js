const DEDUPE_WINDOW_MS = Number(process.env.LOG_DEDUPE_WINDOW_MS || 5000);

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

function logWithLevel(level, ...args) {
  const ts = nowIso();

  // Normalize args
  const message = typeof args[0] === "string" ? args[0] : String(args[0] ?? "");
  const rest = typeof args[0] === "string" ? args.slice(1) : args.slice(1);

  const errors = [];
  const extras = [];
  for (const a of rest) {
    if (a instanceof Error) errors.push(serializeError(a));
    else if (a && a.error instanceof Error) {
      // common pattern: logger.error('msg', { error })
      const copy = { ...a, error: serializeError(a.error) };
      extras.push(copy);
    } else if (typeof a === "object") extras.push(a);
    else if (a !== undefined) extras.push({ data: a });
  }

  // Dedupe only for error logs
  if (level === "ERROR") {
    const signature = buildSignature(level, message, errors);
    if (shouldSuppress(signature, Date.now())) return;
  }

  // Construct one-line output to keep existing style, append JSON metadata
  const meta = {};
  if (errors.length) meta.error = errors[0]; // include first error fully
  if (extras.length) meta.meta = extras.length === 1 ? extras[0] : extras;

  const hasMeta = Object.keys(meta).length > 0;
  const line = `[${level}] ${ts} - ${message}${
    hasMeta ? " " + safeStringify(meta) : ""
  }`;

  // eslint-disable-next-line no-console
  if (level === "ERROR") console.error(line);
  else if (level === "WARN") console.warn(line);
  else console.log(line);
}

const logger = {
  info: (...args) => logWithLevel("INFO", ...args),
  warn: (...args) => logWithLevel("WARN", ...args),
  error: (...args) => logWithLevel("ERROR", ...args),
};

module.exports = logger;
