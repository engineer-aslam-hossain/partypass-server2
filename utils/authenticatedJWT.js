// JWT Authentication middleware
const jwt = require("jsonwebtoken");
const catchAsync = require("./catchAsync");
const authenticateJWT = catchAsync(async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied, no token provided" });
  }

  const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET); // `Bearer <token>`
  req.user = decoded; // Attach user info to the request

  next();
});

module.exports = authenticateJWT;
