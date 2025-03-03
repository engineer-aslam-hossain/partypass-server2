const express = require("express");
const authenticateJWT = require("../utils/authenticatedJWT");
const ticketController = require("../Controllers/ticketController");
const authorize = require("../utils/authorize");
const ticket_router = express.Router();

ticket_router
  .route("/create")
  .post(
    authenticateJWT,
    authorize("create", "TicketType"),
    ticketController.createTicketType
  );
ticket_router
  .route("/update/:id")
  .patch(
    authenticateJWT,
    authorize("update", "TicketType"),
    ticketController.updateTicketType
  );
ticket_router
  .route("/delete/:id")
  .delete(
    authenticateJWT,
    authorize("delete", "TicketType"),
    ticketController.deleteTicketType
  );
ticket_router.route("/list").get(ticketController.getAllTicketTypes);

ticket_router.route("/:id").get(ticketController.getTicketTypeById);

module.exports = ticket_router;
