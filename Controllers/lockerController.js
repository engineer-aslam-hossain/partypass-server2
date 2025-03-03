const db = require("../Configs/db"); // Import your database connection
// const logger = require("../lib/logger");
const catchAsync = require("../utils/catchAsync");

// Get all locker list
exports.getAllLockerByInstitue = catchAsync(async (req, res, next) => {
  const instituteId = req.params.id;
  // logger.info({
  //   label: "info",
  //   message: `Getting list of the Lockers of ${instituteId}`,
  //   methodName: "getAllLockerByInstitue",
  //   filepath: "lockerController.js",
  //   payload: JSON.stringify("start of the function"),
  // });

  let [rows] = await db.query(
    `
    SELECT 
      l.*, 
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
    FROM locker l
    LEFT JOIN institution i ON l.institution_id = i.institution_id
    WHERE l.institution_id = ?
  `,
    [instituteId]
  );

  rows = rows.map((row) => ({
    ...row,
    institution:
      typeof row.institution === "string"
        ? JSON.parse(row.institution)
        : row.institution,
  }));

  // logger.info({
  //   label: "info",
  //   message: `Sending list of the Lockers of ${instituteId} to client`,
  //   methodName: "getAllLockerByInstitue",
  //   filepath: "lockerController.js",
  //   payload: JSON.stringify("end of the function"),
  // });

  return res.status(200).json({ status: "success", data: rows });
});

// Get Locker by ID
exports.getLockerById = catchAsync(async (req, res) => {
  const lockerId = req.params.id;
  // logger.info({
  //   label: "info",
  //   message: `Searching a Locker by id`,
  //   methodName: "getLockerById",
  //   filepath: "lockerController.js",
  //   payload: JSON.stringify(lockerId),
  // });

  const [rows] = await db.query(
    `
    SELECT 
      l.*, 
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
    FROM locker l
    LEFT JOIN institution i ON l.institution_id = i.institution_id
    WHERE l.id = ?
  `,
    [lockerId]
  );

  if (rows.length === 0) {
    // logger.info({
    //   label: "info",
    //   message: "Locker not found",
    //   methodName: "getLockerById",
    //   filepath: "lockerController.js",
    //   payload: JSON.stringify(lockerId),
    // });
    return res.status(404).json({ message: "Locker not found" });
  }

  const locker = {
    ...rows[0],
    institution:
      typeof rows[0].institution === "string"
        ? JSON.parse(rows[0].institution)
        : rows[0].institution,
  };

  // logger.info({
  //   label: "info",
  //   message: "Locker info has been sent to client",
  //   methodName: "getLockerById",
  //   filepath: "lockerController.js",
  //   payload: JSON.stringify(lockerId),
  // });

  return res.status(200).json({ status: "success", data: locker });
});

// Create a new Locker
exports.createLocker = catchAsync(async (req, res) => {
  const { institution_id, locker_number, status } = req.body;

  // logger.info({
  //   label: "info",
  //   message: `Creating a new Locker`,
  //   methodName: "createLocker",
  //   filepath: "lockerController.js",
  //   payload: JSON.stringify(req.body),
  // });

  const [rows] = await db.query(
    "SELECT * FROM locker WHERE locker_number = ? AND institution_id = ?",
    [locker_number, institution_id]
  );

  if (rows[0]) {
    return res.status(409).json({
      message: "locker is already available",
    });
  }

  await db.query(
    "INSERT INTO locker (institution_id, locker_number, status) VALUES (?, ?, ?)",
    [institution_id, locker_number, status]
  );

  // logger.info({
  //   label: "info",
  //   message: "New Locker created successfully",
  //   methodName: "createLocker",
  //   filepath: "lockerController.js",
  //   payload: JSON.stringify(req.body),
  // });

  return res
    .status(201)
    .json({ status: "success", message: "New Locker created successfully" });
});

// Update Locker by ID
exports.updateLocker = catchAsync(async (req, res) => {
  const lockerId = req.params.id;
  // logger.info({
  //   label: "info",
  //   message: `Updating a Locker item`,
  //   methodName: "updateLocker",
  //   filepath: "lockerController.js",
  //   payload: JSON.stringify(lockerId),
  // });

  const { institution_id, locker_number, status } = req.body;

  const [result] = await db.query(
    "UPDATE locker SET institution_id = ?, locker_number = ?, status = ? WHERE id = ?",
    [institution_id, locker_number, status, lockerId]
  );

  if (result.affectedRows === 0) {
    // logger.info({
    //   label: "info",
    //   message: "Locker not found",
    //   methodName: "updateLocker",
    //   filepath: "lockerController.js",
    //   payload: JSON.stringify(lockerId),
    // });
    return res.status(404).json({ message: "Locker not found" });
  }

  // logger.info({
  //   label: "info",
  //   message: "Locker updated successfully",
  //   methodName: "updateLocker",
  //   filepath: "lockerController.js",
  //   payload: JSON.stringify(lockerId),
  // });
  return res
    .status(200)
    .json({ status: "success", message: "Locker updated successfully" });
});

// Delete Locker by ID
exports.deleteLocker = catchAsync(async (req, res) => {
  const lockerId = req.params.id;

  // logger.info({
  //   label: "info",
  //   message: `Deleting a Locker item`,
  //   methodName: "deleteLocker",
  //   filepath: "lockerController.js",
  //   payload: JSON.stringify(lockerId),
  // });

  const [result] = await db.query("DELETE FROM locker WHERE id = ?", [
    lockerId,
  ]);

  if (result.affectedRows === 0) {
    // logger.info({
    //   label: "info",
    //   message: "Locker not found",
    //   methodName: "deleteLocker",
    //   filepath: "lockerController.js",
    //   payload: JSON.stringify(lockerId),
    // });
    return res.status(404).json({ message: "Locker not found" });
  }

  // logger.info({
  //   label: "info",
  //   message: "Locker deleted successfully",
  //   methodName: "deleteLocker",
  //   filepath: "lockerController.js",
  //   payload: JSON.stringify(lockerId),
  // });

  return res
    .status(204)
    .json({ status: "success", message: "Locker deleted successfully" });
});
