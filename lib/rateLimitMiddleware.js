const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");

const getIP = (request) =>
  request.ip ||
  request.headers["x-forwarded-for"] ||
  request.headers["x-real-ip"] ||
  request.connection.remoteAddress;

// Define the rate limiting middlewares
const getRateLimitMiddlewares = ({
  limit = 100,
  windowMs = 60 * 1000,
  delayAfter = Math.round(10 / 2),
  delayMs = () => 500,
} = {}) => [
  slowDown({ keyGenerator: getIP, windowMs, delayAfter, delayMs }),
  rateLimit({ keyGenerator: getIP, windowMs, max: limit }),
];

// Combine them into a single middleware function
const rateLimitMiddleware = (options) => {
  const middlewares = getRateLimitMiddlewares(options);

  return (req, res, next) => {
    let index = 0;

    const nextMiddleware = () => {
      const middleware = middlewares[index++];
      if (middleware) {
        middleware(req, res, (err) => {
          if (err) {
            return next(err); // Propagate errors if any
          }
          nextMiddleware();
        });
      } else {
        next(); // Move to the next middleware in the stack
      }
    };

    nextMiddleware();
  };
};

module.exports = rateLimitMiddleware;
