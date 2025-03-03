const express = require("express");
const authenticateJWT = require("../utils/authenticatedJWT");
const purchaseController = require("../Controllers/purchaseController");
const authorize = require("../utils/authorize");
const purchase_router = express.Router();

purchase_router
  .route("/create")
  .post(
    authenticateJWT,
    authorize("create", "Purchase"),
    purchaseController.createPurchase
  );
purchase_router
  .route("/update/:id")
  .patch(
    authenticateJWT,
    authorize("update", "Purchase"),
    purchaseController.updatePurchase
  );

purchase_router
  .route("/entry-update/:id")
  .patch(
    authenticateJWT,
    authorize("update", "Event"),
    purchaseController.updatePurchaseByStaff
  );

purchase_router
  .route("/delete/:id")
  .delete(
    authenticateJWT,
    authorize("delete", "Purchase"),
    purchaseController.deletePurchase
  );
purchase_router
  .route("/list")
  .get(
    authenticateJWT,
    authorize("list", "Purchase"),
    purchaseController.getAllPurchases
  );

purchase_router
  .route("/list/institute/:id")
  .get(
    authenticateJWT,
    authorize("institute_list", "Purchase"),
    purchaseController.getPurchaseListByInstituteId
  );
purchase_router
  .route("/:id")
  .get(
    authenticateJWT,
    authorize("read", "Purchase"),
    purchaseController.getPurchaseById
  );

module.exports = purchase_router;
