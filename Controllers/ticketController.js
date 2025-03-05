const db = require("../Configs/db"); // Import your database connection
// const logger = require("../lib/logger");
const catchAsync = require("../utils/catchAsync");
const moment = require("moment");

// Get all ticket types
exports.getAllTicketTypes = catchAsync(async (req, res, next) => {
  // logger.info({
  //   label: "info",
  //   message: `Getting list of the TicketType items`,
  //   methodName: "getAllTicketTypes",
  //   filepath: "ticketController.js",
  //   payload: JSON.stringify("start of the function"),
  // });

  let [rows] = await db.query(`
SELECT 
    tt.*, 
    JSON_OBJECT(
      'institution_id', i.institution_id,
      'name', i.name,
      'email', i.email,
      'phone', i.phone,
      'address', i.address,
      'map_location', i.map_location,
      'status', i.status,
      'details', i.details,
      'cover_photo', i.cover_photo,
      'video_link', i.video_link
     
    ) AS institution
  FROM ticket_type tt
  LEFT JOIN institution i ON tt.institution_id = i.institution_id
  `);

  rows = rows.map((row) => ({
    ...row,
    institution:
      typeof row.institution === "string"
        ? JSON.parse(row.institution)
        : row.institution,
  }));

  // logger.info({
  //   label: "info",
  //   message: `Sending list of the TicketType items to client`,
  //   methodName: "getAllTicketTypes",
  //   filepath: "ticketController.js",
  //   payload: JSON.stringify("end of the function"),
  // });

  return res.status(200).json({ status: "success", data: rows });
});

// Get ticket type by ID
exports.getTicketTypeById = catchAsync(async (req, res) => {
  const ticketId = req.params.id;
  // logger.info({
  //   label: "info",
  //   message: `Searching a TicketType item`,
  //   methodName: "getTicketTypeById",
  //   filepath: "ticketController.js",
  //   payload: JSON.stringify(ticketId),
  // });

  const [rows] = await db.query(
    `
    SELECT 
      tt.*, 
      JSON_OBJECT(
        'institution_id', i.institution_id,
        'name', i.name,
        'email', i.email,
        'phone', i.phone,
        'address', i.address,
        'map_location', i.map_location,
        'status', i.status,
        'details', i.details,
        'cover_photo', i.cover_photo,
        'video_link', i.video_link
      ) AS institution
    FROM ticket_type tt
    LEFT JOIN institution i ON tt.institution_id = i.institution_id
    WHERE tt.ticket_id = ?
  `,
    [ticketId]
  );

  if (rows.length > 0) {
    rows[0].institution =
      typeof rows[0].institution === "string"
        ? JSON.parse(rows[0].institution)
        : rows[0].institution;
  }

  if (rows.length === 0) {
    // logger.info({
    //   label: "info",
    //   message: "Ticket type not found",
    //   methodName: "getTicketTypeById",
    //   filepath: "ticketController.js",
    //   payload: JSON.stringify(ticketId),
    // });
    return res
      .status(404)
      .json({ status: "success", message: "Ticket type not found" });
  }

  // logger.info({
  //   label: "info",
  //   message: "Ticket type has been sent to client",
  //   methodName: "getTicketTypeById",
  //   filepath: "ticketController.js",
  //   payload: JSON.stringify(ticketId),
  // });

  return res.status(200).json(rows[0]);
});

// Create a new ticket type
exports.createTicketType = catchAsync(async (req, res) => {
  const {
    name,
    description,
    institution_id,
    price,
    capacity,
    is_regular,
    date,
    start_datetime,
    end_datetime,
    benefits,
  } = req.body;

  console.log("req.body", req.body);

  // logger.info({
  //   label: "info",
  //   message: `Creating a TicketType item`,
  //   methodName: "createTicketType",
  //   filepath: "ticketController.js",
  //   payload: JSON.stringify(req.body),
  // });

  await db.query(
    "INSERT INTO ticket_type (name, description, institution_id, price, capacity, is_regular, date, start_datetime, end_datetime, benefits) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      name,
      description,
      institution_id,
      price,
      capacity,
      is_regular,
      date === "" || date == null
        ? null
        : moment(date).format("YYYY-MM-DD HH:mm:ss"),
      start_datetime,
      end_datetime,
      benefits,
    ]
  );

  // logger.info({
  //   label: "info",
  //   message: "Ticket type created successfully",
  //   methodName: "createTicketType",
  //   filepath: "ticketController.js",
  //   payload: JSON.stringify(req.body),
  // });

  return res
    .status(201)
    .json({ status: "success", message: "Ticket type created successfully" });
});

// Update ticket type by ID
exports.updateTicketType = catchAsync(async (req, res) => {
  const ticketId = req.params.id;
  // logger.info({
  //   label: "info",
  //   message: `Updating a TicketType item`,
  //   methodName: "updateTicketType",
  //   filepath: "ticketController.js",
  //   payload: JSON.stringify(ticketId),
  // });

  const {
    name,
    description,
    price,
    capacity,
    is_regular,
    date,
    start_datetime,
    end_datetime,
    benefits,
    institution_id,
  } = req.body;

  const [existingTicketRows] = await db.query(
    "SELECT * FROM ticket_type WHERE ticket_id = ?",
    [ticketId]
  );

  if (existingTicketRows.length === 0) {
    return res.status(404).json({ message: "Ticket type not found" });
  }

  const existingTicket = existingTicketRows[0];

  const updatedTicket = {
    name: name || existingTicket.name,
    description: description || existingTicket.description,
    price: price || existingTicket.price,
    capacity: capacity || existingTicket.capacity,
    is_regular: is_regular || existingTicket.is_regular,
    date:
      date === "" || date == null
        ? existingTicket.date
        : moment(date).format("YYYY-MM-DD HH:mm:ss"),
    start_datetime: start_datetime || existingTicket.start_datetime,
    end_datetime: end_datetime || existingTicket.end_datetime,
    benefits: benefits || existingTicket.benefits,
    institution_id: institution_id || existingTicket.institution_id,
  };

  const [result] = await db.query(
    "UPDATE ticket_type SET name = ?, description = ?, price = ?, capacity = ?, is_regular = ?, date = ?, start_datetime = ?, end_datetime = ?, benefits = ?, institution_id = ? WHERE ticket_id = ?",
    [
      updatedTicket.name,
      updatedTicket.description,
      updatedTicket.price,
      updatedTicket.capacity,
      updatedTicket.is_regular,
      updatedTicket.date,
      updatedTicket.start_datetime,
      updatedTicket.end_datetime,
      updatedTicket.benefits,
      updatedTicket.institution_id,
      ticketId,
    ]
  );

  if (result.affectedRows === 0) {
    // logger.info({
    //   label: "info",
    //   message: "Ticket type not found",
    //   methodName: "updateTicketType",
    //   filepath: "ticketController.js",
    //   payload: JSON.stringify(ticketId),
    // });
    return res.status(404).json({ message: "Ticket type not found" });
  }

  // logger.info({
  //   label: "info",
  //   message: "Ticket type updated successfully",
  //   methodName: "updateTicketType",
  //   filepath: "ticketController.js",
  //   payload: JSON.stringify(ticketId),
  // });
  return res
    .status(200)
    .json({ status: "success", message: "Ticket type updated successfully" });
});

// Delete ticket type by ID
exports.deleteTicketType = catchAsync(async (req, res) => {
  const ticketId = req.params.id;
  // logger.info({
  //   label: "info",
  //   message: `Deleting a TicketType item`,
  //   methodName: "deleteTicketType",
  //   filepath: "ticketController.js",
  //   payload: JSON.stringify(ticketId),
  // });

  const [result] = await db.query(
    "DELETE FROM ticket_type WHERE ticket_id = ?",
    [ticketId]
  );
  if (result.affectedRows === 0) {
    // logger.info({
    //   label: "info",
    //   message: "Ticket type not found",
    //   methodName: "deleteTicketType",
    //   filepath: "ticketController.js",
    //   payload: JSON.stringify(ticketId),
    // });
    return res.status(404).json({ message: "Ticket type not found" });
  }

  // logger.info({
  //   label: "info",
  //   message: "Ticket type deleted successfully",
  //   methodName: "deleteTicketType",
  //   filepath: "ticketController.js",
  //   payload: JSON.stringify(ticketId),
  // });

  return res
    .status(204)
    .json({ status: "success", message: "Ticket type deleted successfully" });
});
