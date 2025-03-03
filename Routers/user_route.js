const express = require("express");
const authController = require("../Controllers/authController");
const authenticateJWT = require("../utils/authenticatedJWT");
// const profileController = require("../Controllers/profile_controller");
const userController = require("../Controllers/userController");
const authorize = require("../utils/authorize");
const { upload } = require("../utils/upload");
const { getTotalCounter } = require("../Controllers/dashboardController");
const user_router = express.Router();

user_router.route("/signup").post(authController.createUser);
user_router.route("/login").post(authController.login);
// user_router
//   .route("/userinfo")
//   .get(authenticateJWT, authorize("read", "User"), authController.userInfo);
user_router
  .route("/create-user")
  .post(
    authenticateJWT,
    authorize("create", "User"),
    authController.createUser
  );

user_router
  .route("/update-user")
  .patch(
    authenticateJWT,
    authorize("update", "User"),
    authController.updateUser
  );
user_router
  .route("/update-user/:id")
  .patch(
    authenticateJWT,
    authorize("update", "Admin"),
    authController.updateUserById
  );

user_router
  .route("/delete-user")
  .delete(
    authenticateJWT,
    authorize("delete", "User"),
    authController.deleteUser
  );
user_router
  .route("/delete-user/:id")
  .delete(
    authenticateJWT,
    authorize("delete", "Admin"),
    authController.deleteUserById
  );

user_router
  .route("/list")
  .get(authenticateJWT, authorize("list", "User"), userController.userList);
user_router
  .route("/:id/purchases")
  .get(
    authenticateJWT,
    authorize("read", "Purchase"),
    userController.getUserPurchasedTickets
  );

user_router
  .route("/profile/info")
  .get(authenticateJWT, authorize("read", "User"), authController.userInfo);

user_router
  .route("/profile/upload-profile-picture")
  .patch(
    authenticateJWT,
    authorize("upload", "User"),
    authController.uploadProfilePicture
  );

user_router
  .route("/profile/info/:id")
  .get(
    authenticateJWT,
    authorize("read", "System Admin"),
    userController.userInfoById
  );

user_router
  .route("/dashboard/analytics")
  .get(authenticateJWT, authorize("read", "System Admin"), getTotalCounter);

module.exports = user_router;
