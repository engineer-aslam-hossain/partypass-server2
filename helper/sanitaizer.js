const validator = require("validator");

// Middleware to sanitize input
const sanitizeRequestBody = (req, res, next) => {
  if (
    req.path.includes("institute/update") ||
    req.path.includes("institute/create")
  ) {
    // Skip the sanitizer for this specific route
    return next();
  }

  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === "string") {
        req.body[key] = validator.escape(req.body[key]).trim();
      }
    }
  }
  next();
};

module.exports = sanitizeRequestBody;
