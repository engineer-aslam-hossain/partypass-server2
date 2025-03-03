// const logger = require("../lib/logger");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${this.statusCode}`.startsWith("4") ? "failed" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);

    // logger.error({
    //   label: "error",
    //   message: message,
    //   methodName: "AppError",
    //   filepath: "appError.js",
    //   payload: JSON.stringify(this.constructor),
    // });
  }
}

module.exports = AppError;
