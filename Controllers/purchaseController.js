const db = require("../Configs/db"); // Import your database connection
// const logger = require("../lib/logger");
const catchAsync = require("../utils/catchAsync");
const moment = require("moment");

// Get all purchases
exports.getAllPurchases = catchAsync(async (req, res) => {
  // logger.info({
  //   label: "info",
  //   message: "Beginning of getAllPurchases Function",
  //   methodName: "getAllPurchases",
  //   filepath: "purchaseController.js",
  //   payload: "start of the function",
  // });

  const [rows] = await db.query(`
    SELECT 
      p.*,
      JSON_OBJECT(
        'user_id', u.user_id,
        'name', u.name,
        'email', u.email,
        'phone', u.phone,
        'role', u.role,
        'is_social', u.is_social,
        'institution_id', u.institution_id,
        'date_of_birth', u.date_of_birth,
        'social_uuid', u.social_uuid
      ) AS user,
      JSON_OBJECT(
        'ticket_id', tt.ticket_id,
        'name', tt.name,
        'description', tt.description,
        'institution_id', tt.institution_id,
        'price', tt.price,
        'capacity', tt.capacity,
        'benefits', tt.benefits,
        'is_regular', tt.is_regular,
        'date', tt.date,
        'start_datetime', tt.start_datetime,
        'end_datetime', tt.end_datetime,
        'institution', JSON_OBJECT(
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
        )
      ) AS ticket_type
    FROM purchase p
    LEFT JOIN ticket_type tt ON p.ticket_id = tt.ticket_id
    LEFT JOIN institution i ON tt.institution_id = i.institution_id
    LEFT JOIN users u ON p.user_id = u.user_id
  `);

  if (!Array.isArray(rows)) {
    // logger.error("Expected an array for rows, but received: ", typeof rows);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }

  if (rows.length > 0) {
    rows.forEach((row) => {
      if (row.ticket_type && typeof row.ticket_type === "string") {
        row.ticket_type = JSON.parse(row.ticket_type);
      }
      if (
        row.ticket_type.institution &&
        typeof row.ticket_type.institution === "string"
      ) {
        row.ticket_type.institution = JSON.parse(row.ticket_type.institution);
      }
      if (row.user && typeof row.user === "string") {
        row.user = JSON.parse(row.user);
      }
    });
  }

  if (rows.length === 0) {
    // logger.info({
    //   label: "info",
    //   message: "No purchases found",
    //   methodName: "getAllPurchases",
    //   filepath: "purchaseController.js",
    //   payload: "No purchases found",
    // });
    return res
      .status(404)
      .json({ status: "success", message: "No purchases found" });
  }

  // logger.info({
  //   label: "info",
  //   message: "Purchase list has been sent to client",
  //   methodName: "getAllPurchases",
  //   filepath: "purchaseController.js",
  //   payload: "end of the function",
  // });

  return res.status(200).json({ status: "success", data: rows });
});

// Get all purchases for a institute
exports.getPurchaseListByInstituteId = catchAsync(async (req, res) => {
  const instituteId = req.params.id;
  // logger.info({
  //   label: "info",
  //   message: `Searching list of institute purchase items`,
  //   methodName: "getPurchaseByInstituteId",
  //   filepath: "purchaseController.js",
  //   payload: JSON.stringify(instituteId),
  // });

  const [rows] = await db.query(
    `
    SELECT 
      p.*,
      JSON_OBJECT(
        'user_id', u.user_id,
        'name', u.name,
        'email', u.email,
        'phone', u.phone,
        'role', u.role,
        'is_social', u.is_social,
        'institution_id', u.institution_id,
        'date_of_birth', u.date_of_birth,
        'social_uuid', u.social_uuid
      ) AS user,
      JSON_OBJECT(
        'ticket_id', tt.ticket_id,
        'name', tt.name,
        'description', tt.description,
        'institution_id', tt.institution_id,
        'price', tt.price,
        'capacity', tt.capacity,
        'benefits', tt.benefits,
        'is_regular', tt.is_regular,
        'date', tt.date,
        'start_datetime', tt.start_datetime,
        'end_datetime', tt.end_datetime,
        'institution', JSON_OBJECT(
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
        )
      ) AS ticket_type
    FROM purchase p
    LEFT JOIN ticket_type tt ON p.ticket_id = tt.ticket_id
    LEFT JOIN institution i ON tt.institution_id = i.institution_id
    LEFT JOIN users u ON p.user_id = u.user_id
    WHERE tt.institution_id = ?
  `,
    [instituteId]
  );

  if (!Array.isArray(rows)) {
    // logger.error("Expected an array for rows, but received: ", typeof rows);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }

  if (rows.length > 0) {
    rows.forEach((row) => {
      if (row.ticket_type && typeof row.ticket_type === "string") {
        row.ticket_type = JSON.parse(row.ticket_type);
      }
      if (
        row.ticket_type.institution &&
        typeof row.ticket_type.institution === "string"
      ) {
        row.ticket_type.institution = JSON.parse(row.ticket_type.institution);
      }
      if (row.user && typeof row.user === "string") {
        row.user = JSON.parse(row.user);
      }
    });
  }

  if (rows.length === 0) {
    // logger.info({
    //   label: "info",
    //   message: "No purchases found for the institute",
    //   methodName: "getPurchaseByInstituteId",
    //   filepath: "purchaseController.js",
    //   payload: "No purchases found",
    // });
    return res
      .status(404)
      .json({ status: "success", message: "No purchases found" });
  }

  // logger.info({
  //   label: "info",
  //   message: "Institute purchase list has been sent to client",
  //   methodName: "getPurchaseByInstituteId",
  //   filepath: "purchaseController.js",
  //   payload: "end of the function",
  // });

  return res.status(200).json({ status: "success", data: rows });
});

// Get purchase by ID
exports.getPurchaseById = catchAsync(async (req, res) => {
  const purchaseId = req.params.id;
  // logger.info({
  //   label: "info",
  //   message: `Searching a purchase item`,
  //   methodName: "getPurchaseById",
  //   filepath: "purchaseController.js",
  //   payload: JSON.stringify(purchaseId),
  // });

  const [rows] = await db.query(
    `
    SELECT 
      p.*,
      JSON_OBJECT(
        'user_id', u.user_id,
        'name', u.name,
        'email', u.email,
        'phone', u.phone,
        'role', u.role,
        'is_social', u.is_social,
        'institution_id', u.institution_id,
        'date_of_birth', u.date_of_birth,
        'social_uuid', u.social_uuid
      ) AS user,
      JSON_OBJECT(
        'ticket_id', tt.ticket_id,
        'name', tt.name,
        'description', tt.description,
        'institution_id', tt.institution_id,
        'price', tt.price,
        'capacity', tt.capacity,
        'benefits', tt.benefits,
        'is_regular', tt.is_regular,
        'date', tt.date,
        'start_datetime', tt.start_datetime,
        'end_datetime', tt.end_datetime,
        'institution', JSON_OBJECT(
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
        )
      ) AS ticket_type
    FROM purchase p
    LEFT JOIN ticket_type tt ON p.ticket_id = tt.ticket_id
    LEFT JOIN institution i ON tt.institution_id = i.institution_id
    LEFT JOIN users u ON p.user_id = u.user_id
    WHERE p.purchase_id = ?
  `,
    [purchaseId]
  );

  if (!Array.isArray(rows)) {
    // logger.error("Expected an array for rows, but received: ", typeof rows);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }

  if (rows.length > 0) {
    rows.forEach((row) => {
      if (row.ticket_type && typeof row.ticket_type === "string") {
        row.ticket_type = JSON.parse(row.ticket_type);
      }
      if (
        row.ticket_type.institution &&
        typeof row.ticket_type.institution === "string"
      ) {
        row.ticket_type.institution = JSON.parse(row.ticket_type.institution);
      }
      if (row.user && typeof row.user === "string") {
        row.user = JSON.parse(row.user);
      }
    });
  }

  if (rows.length === 0) {
    // logger.info({
    //   label: "info",
    //   message: `Purchase not found`,
    //   methodName: "getPurchaseById",
    //   filepath: "purchaseController.js",
    //   payload: JSON.stringify(purchaseId),
    // });
    return res.status(404).json({ message: "Purchase not found" });
  }

  // logger.info({
  //   label: "info",
  //   message: `Purchase item has been sent to client`,
  //   methodName: "getPurchaseById",
  //   filepath: "purchaseController.js",
  //   payload: JSON.stringify(purchaseId),
  // });

  return res.status(200).json({ status: "success", data: rows[0] });
});

// Create a new purchase
exports.createPurchase = catchAsync(async (req, res) => {
  const {
    user_id,
    ticket_id,
    ticket_date,
    price_amount,
    payment_status,
    payment_method,
    ticket_status,
  } = req.body;

  // logger.info({
  //   label: "info",
  //   message: `Creating a purchase item`,
  //   methodName: "createPurchase",
  //   filepath: "purchaseController.js",
  //   payload: JSON.stringify(req.body),
  // });

  // Validate input data
  if (
    !user_id ||
    !ticket_id ||
    !ticket_date ||
    !price_amount ||
    !payment_status ||
    !payment_method
  ) {
    // logger.info({
    //   label: "info",
    //   message: "All fields are required",
    //   methodName: "createPurchase",
    //   filepath: "purchaseController.js",
    //   payload: JSON.stringify(req.body),
    // });

    return res.status(400).json({ message: "All fields are required" });
  }

  // Insert the new purchase into the database
  await db.query(
    "INSERT INTO purchase (user_id, ticket_id, purchase_date, ticket_date, price_amount, payment_status, payment_method, ticket_status) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)",
    [
      user_id,
      ticket_id,
      ticket_date === "" || ticket_date == null
        ? null
        : moment(ticket_date).format("YYYY-MM-DD HH:mm:ss"),
      price_amount,
      payment_status,
      payment_method,
      ticket_status,
    ]
  );

  // logger.info({
  //   label: "info",
  //   message: "Purchase created successfully",
  //   methodName: "createPurchase",
  //   filepath: "purchaseController.js",
  //   payload: JSON.stringify(req.body),
  // });

  return res
    .status(201)
    .json({ status: "success", message: "Purchase created successfully" });
});

// Update purchase by ID
exports.updatePurchase = catchAsync(async (req, res) => {
  const purchaseId = req.params.id;
  const {
    ticket_date,
    price_amount,
    payment_status,
    payment_method,
    ticket_status,
  } = req.body;

  // logger.info({
  //   label: "info",
  //   message: `Updating a purchase item`,
  //   methodName: "updatePurchase",
  //   filepath: "purchaseController.js",
  //   payload: JSON.stringify(purchaseId),
  // });

  const [result] = await db.query(
    "UPDATE purchase SET ticket_date = ?, price_amount = ?, payment_status = ?, payment_method = ?, ticket_status = ? WHERE purchase_id = ?",
    [
      ticket_date === "" || ticket_date == null
        ? null
        : moment(ticket_date).format("YYYY-MM-DD HH:mm:ss"),
      price_amount,
      payment_status,
      payment_method,
      ticket_status,
      purchaseId,
    ]
  );

  if (result.affectedRows === 0) {
    // logger.info({
    //   label: "info",
    //   message: "Purchase not found",
    //   methodName: "updatePurchase",
    //   filepath: "purchaseController.js",
    //   payload: JSON.stringify(purchaseId),
    // });
    return res.status(404).json({ message: "Purchase not found" });
  }

  // logger.info({
  //   label: "info",
  //   message: "Purchase updated successfully",
  //   methodName: "updatePurchase",
  //   filepath: "purchaseController.js",
  //   payload: JSON.stringify(purchaseId),
  // });
  return res.status(200).json({ message: "Purchase updated successfully" });
});

// Update purchase by Staff
exports.updatePurchaseByStaff = catchAsync(async (req, res) => {
  const purchaseId = req.params.id;
  const { ticket_id, ticket_status } = req.body;

  // logger.info({
  //   label: "info",
  //   message: `User Entry update by staff`,
  //   methodName: "updatePurchaseByStaff",
  //   filepath: "purchaseController.js",
  //   payload: JSON.stringify(req.body),
  // });

  console.log("ticket_status", ticket_status);

  if (ticket_status === 1) {
    //

    const [rows] = await db.query(
      `
  SELECT l.id
  FROM locker l
  WHERE l.institution_id = (
      SELECT t.institution_id
      FROM ticket_type t
      WHERE t.ticket_id = ?
      LIMIT 1
  )
  AND l.id NOT IN (
      SELECT locker_id
      FROM locker_allocation
  )
  ORDER BY l.id ASC
  LIMIT 1;
  `,
      [ticket_id]
    );

    console.log("rows", rows);

    if (rows[0]) {
      const [lockerAllocation] = await db.query(
        "SELECT * FROM locker_allocation WHERE locker_id = ?",
        [rows[0].id]
      );

      console.log("lockerAllocation", lockerAllocation);

      if (lockerAllocation.length > 0) {
        await db.query(
          "UPDATE locker_allocation SET status = ? WHERE locker_id = ?",
          [ticket_status, rows[0].id]
        );
      } else {
        await db.query(
          "INSERT INTO locker_allocation (purchase_id, locker_id, status, allocation_date) VALUES (?, ?, ?, NOW())",
          [purchaseId, rows[0].id, ticket_status]
        );
      }
    }
  }

  const [result] = await db.query(
    "UPDATE purchase SET ticket_status = ? WHERE purchase_id = ?",
    [ticket_status, purchaseId]
  );

  if (result.affectedRows === 0) {
    // logger.info({
    //   label: "info",
    //   message: "Purchase not found",
    //   methodName: "updatePurchaseByStaff",
    //   filepath: "purchaseController.js",
    //   payload: JSON.stringify(req.body),
    // });
    return res.status(404).json({ message: "Purchase not found" });
  }

  // logger.info({
  //   label: "info",
  //   message: "User Entry update by staff successfully",
  //   methodName: "updatePurchaseByStaff",
  //   filepath: "purchaseController.js",
  //   payload: JSON.stringify(purchaseId),
  // });

  return res.status(200).json({
    status: "success",
    message: "User Entry update by staff successfully",
  });
});

// Delete purchase by ID
exports.deletePurchase = catchAsync(async (req, res) => {
  const purchaseId = req.params.id;
  // logger.info({
  //   label: "info",
  //   message: `Deleting a purchase item`,
  //   methodName: "deletePurchase",
  //   filepath: "purchaseController.js",
  //   payload: JSON.stringify(purchaseId),
  // });

  const [result] = await db.query(
    "DELETE FROM purchase WHERE purchase_id = ?",
    [purchaseId]
  );
  if (result.affectedRows === 0) {
    // logger.info({
    //   label: "info",
    //   message: "Purchase not found",
    //   methodName: "deletePurchase",
    //   filepath: "purchaseController.js",
    //   payload: JSON.stringify(purchaseId),
    // });
    return res.status(404).json({ message: "Purchase not found" });
  }

  // logger.info({
  //   label: "info",
  //   message: "Purchase deleted successfully",
  //   methodName: "deletePurchase",
  //   filepath: "purchaseController.js",
  //   payload: JSON.stringify(purchaseId),
  // });
  return res
    .status(204)
    .json({ status: "success", message: "Purchase deleted successfully" });
});
