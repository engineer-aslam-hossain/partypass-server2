// const logger = require("../lib/logger");
const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;

  return new AppError(message, 400);
};

const handleDuplicateFieldDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.erros).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please login again!", 401);

const handleTokenExpiredError = () =>
  new AppError("Your token has expired! please login again.", 401);

const sendErrorDev = (err, res) => {
  // logger.error({
  //   label: "error",
  //   message: err.message,
  //   methodName: "sendErrorDev",
  //   filepath: "error_controller.js",
  //   payload: JSON.stringify(err.stack),
  // });

  return res.status(Number(err.statusCode)).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    // logger.error({
    //   label: "error",
    //   message: err.message,
    //   methodName: "sendErrorProd",
    //   filepath: "error_controller.js",
    //   payload: JSON.stringify(err.stack),
    // });

    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // logger.error({
    //   label: "error",
    //   message: err.message,
    //   methodName: "sendErrorProd",
    //   filepath: "error_controller.js",
    //   payload: JSON.stringify(err.stack),
    // });

    return res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || "500";
  err.status = err.status || "error";

  console.log(err);

  if (process.env.NODE_ENV.trim() === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV.trim() === "production") {
    let error = { ...err };

    if (err.name === "CastError") error = handleCastErrorDB(error);
    if (err.name === 11000) error = handleDuplicateFieldDB(error);
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleTokenExpiredError();

    sendErrorProd(error, res);
  }
};
