const express = require("express");
const authenticateJWT = require("../utils/authenticatedJWT");
const lockerAllocationController = require("../Controllers/lockerAllocationController");
const authorize = require("../utils/authorize");
const locker_allocation_router = express.Router();

locker_allocation_router
  .route("/allocate")
  .post(
    authenticateJWT,
    authorize("assign", "LockerAllocation"),
    lockerAllocationController.allocateLocker
  );

locker_allocation_router
  .route("/update/:id")
  .patch(
    authenticateJWT,
    authorize("update", "LockerAllocation"),
    lockerAllocationController.updateLockerAllocatioin
  );
locker_allocation_router
  .route("/delete/:id")
  .delete(
    authenticateJWT,
    authorize("delete", "LockerAllocation"),
    lockerAllocationController.deleteLockerAllocation
  );
locker_allocation_router
  .route("/list")
  .get(
    authenticateJWT,
    authorize("list", "LockerAllocation"),
    lockerAllocationController.getAllLockerAllocation
  );

locker_allocation_router
  .route("/:id")
  .get(
    authenticateJWT,
    authorize("read", "LockerAllocation"),
    lockerAllocationController.getLockerAllocationById
  );

module.exports = locker_allocation_router;
