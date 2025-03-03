// Middleware to check if the user is an Admin

const AppError = require("./appError");
const catchAsync = require("./catchAsync");

const checkAdmin = catchAsync(async (req, res, next) => {
  const user = req.user; // Assuming `req.user` has the decoded JWT payload

  // Check if the user role is 'Admin'
  if (user?.role?.toString().trim() !== "System Admin") {
    return next(new AppError("Access denied: Admins only.", 403));
  }

  // If the user is an Admin, continue to the next middleware or route handler
  next();
});

module.exports = checkAdmin;
