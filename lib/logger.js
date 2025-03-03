// const DailyRotateFile = require("winston-daily-rotate-file");
// const winston = require("winston");
// const { createLogger, format, transports } = winston;
// const { combine, timestamp, printf } = format;

// const logger = () => {
//   const options = {
//     error: {
//       level: "error",
//       filename: "./logs/error/error-%DATE%.log",
//       auditFile: "./logs/error/audits/error.audit.json",
//       dirname: "./logs/error",
//       createSymlink: true,
//       symlinkName: "error.log",
//       handleExceptions: true,
//       json: false,
//       maxSize: "20m",
//       maxFiles: "30d",
//       datePattern: "YYYY-MM-DD",
//       colorize: false,
//     },

//     info: {
//       level: "info",
//       filename: "./logs/combined/combined-%DATE%.log",
//       auditFile: "./logs/combined/audits/combined.audit.json",
//       dirname: "./logs/combined",
//       createSymlink: true,
//       symlinkName: "combined.log",
//       handleExceptions: true,
//       json: false,
//       maxSize: "20m",
//       maxFiles: "30d",
//       datePattern: "YYYY-MM-DD",
//       colorize: false,
//     },

//     warn: {
//       level: "warn",
//       filename: "./logs/combined/combined-%DATE%.log",
//       auditFile: "./logs/combined/audits/combined.audit.json",
//       dirname: "./logs/combined",
//       createSymlink: true,
//       symlinkName: "combined.log",
//       handleExceptions: true,
//       json: false,
//       maxSize: "20m",
//       maxFiles: "30d",
//       datePattern: "YYYY-MM-DD",
//       colorize: false,
//     },

//     console: {
//       level: "debug",
//       json: false,
//       handleExceptions: true,
//       colorize: true,
//     },
//   };

//   const myFormat = printf(
//     ({ message, label, timestamp, methodName, filepath, payload }) =>
//       `${timestamp} [${label}] : ${message} in ${filepath} on the method ${methodName} with payload ${
//         payload || "{payload not provided while writing log}"
//       }`
//   );

//   return createLogger({
//     format: combine(timestamp(), myFormat),
//     exitOnError: false,
//     defaultMeta: { service: "PartyPass Server" },
//     transports: [
//       new DailyRotateFile(options.error),
//       new DailyRotateFile(options.info),
//       new DailyRotateFile(options.warn),
//       new transports.Console(options.console),
//     ],
//   });
// };

// module.exports = logger();
