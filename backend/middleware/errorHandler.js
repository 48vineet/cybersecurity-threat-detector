const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error("Error occurred:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      error: "Validation Error",
      details: errors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      error: "Duplicate Field Value",
      field: field,
      message: `${field} already exists`,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Invalid Token",
      message: "Please authenticate",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Token Expired",
      message: "Please login again",
    });
  }

  // Cast error (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      error: "Invalid Resource ID",
      message: "Resource not found",
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
