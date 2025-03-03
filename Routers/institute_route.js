const express = require("express");
const authenticateJWT = require("../utils/authenticatedJWT");
const instituteController = require("../Controllers/instituteController");
const authorize = require("../utils/authorize");
const { upload } = require("../utils/upload");
const institute_router = express.Router();

institute_router
  .route("/create")
  .post(
    authenticateJWT,
    authorize("create", "Institution"),
    upload.single("cover_photo"),
    instituteController.createInstitution
  );
institute_router
  .route("/update/:id")
  .patch(
    authenticateJWT,
    authorize("update", "Institution"),
    upload.single("cover_photo"),
    instituteController.updateInstitution
  );
institute_router
  .route("/delete/:id")
  .delete(
    authenticateJWT,
    authorize("delete", "Institution"),
    instituteController.deleteInstitution
  );
institute_router.route("/list").get(instituteController.getAllInstitutions);
institute_router
  .route("/:id/ticketlist")
  .get(instituteController.getAllTicketOfTheInstitution);

institute_router.route("/:id").get(instituteController.getInstitutionById);

module.exports = institute_router;
