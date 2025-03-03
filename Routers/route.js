const express = require("express");
const AppError = require("../utils/appError");
const globalErrorHandler = require("../Controllers/error_controller");
const route = express.Router();

const user_router = require("./user_route");
const ticket_router = require("./ticket_route");
const institute_router = require("./institute_route");
const purchase_router = require("./purchase_route");
const locker_router = require("./locker_route");
const locker_allocation_router = require("./locker_allocation_route");

route.use("/api/v1/users", user_router);
route.use("/api/v1/ticket", ticket_router);
route.use("/api/v1/institute", institute_router);
route.use("/api/v1/purchase", purchase_router);
route.use("/api/v1/locker", locker_router);
route.use("/api/v1/locker-allocation", locker_allocation_router);

route.get("/", (req, res) => {
  res.send("Hello from the root route!");
});

route.all("*", (req, res, next) => {
  next(new AppError("Route not exists", 404));
});

route.use(globalErrorHandler);

module.exports = route;
