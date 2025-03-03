const express = require("express");
const authenticateJWT = require("../utils/authenticatedJWT");
const lockerController = require("../Controllers/lockerController");
const authorize = require("../utils/authorize");
const locker_router = express.Router();

locker_router
  .route("/create")
  .post(
    authenticateJWT,
    authorize("create", "Locker"),
    lockerController.createLocker
  );
locker_router
  .route("/update/:id")
  .patch(
    authenticateJWT,
    authorize("update", "Locker"),
    lockerController.updateLocker
  );
locker_router
  .route("/delete/:id")
  .delete(
    authenticateJWT,
    authorize("delete", "Locker"),
    lockerController.deleteLocker
  );
locker_router
  .route("/list/:id")
  .get(
    authenticateJWT,
    authorize("list", "Locker"),
    lockerController.getAllLockerByInstitue
  );

locker_router
  .route("/:id")
  .get(
    authenticateJWT,
    authorize("read", "Locker"),
    lockerController.getLockerById
  );

module.exports = locker_router;
