const db = require("../Configs/db"); // Import your database connection
// const logger = require("../lib/logger");
const catchAsync = require("../utils/catchAsync");
const { imageUpload } = require("../utils/fileUpload");

// Get all institutions
exports.getAllInstitutions = catchAsync(async (req, res) => {
  // logger.info({
  //   label: "info",
  //   message: `Beggening of getAllInstitutions Function`,
  //   methodName: "getAllInstitutions",
  //   filepath: "instituteController.js",
  //   payload: JSON.stringify("start of the function"),
  // });

  const [rows] = await db.query("SELECT * FROM institution");

  // logger.info({
  //   label: "info",
  //   message: `List of Institutions has been sent to client`,
  //   methodName: "getAllInstitutions",
  //   filepath: "instituteController.js",
  //   payload: JSON.stringify("end of the function"),
  // });

  return res.status(200).json({
    status: "success",
    data: rows,
  });
});

// Get all the ticket of a institution
exports.getAllTicketOfTheInstitution = catchAsync(async (req, res) => {
  // logger.info({
  //   label: "info",
  //   message: `Beggening of getAllTicketOfTheInstitution Function`,
  //   methodName: "getAllTicketOfTheInstitution",
  //   filepath: "instituteController.js",
  //   payload: JSON.stringify("start of the function"),
  // });

  const institutionId = req.params.id;
  // Fetch institution details
  const [institution] = await db.query(
    `
SELECT * FROM institution WHERE institution_id = ?;
`,
    [institutionId]
  );

  // Fetch related tickets
  const [tickets] = await db.query(
    `
SELECT * FROM ticket_type WHERE institution_id = ?;
`,
    [institutionId]
  );

  // Merge results
  if (institution.length) {
    institution[0].Tickets = tickets; // Attach tickets list
  }

  // logger.info({
  //   label: "info",
  //   message: `List of Institutions has been sent to client`,
  //   methodName: "getAllTicketOfTheInstitution",
  //   filepath: "instituteController.js",
  //   payload: JSON.stringify("end of the function"),
  // });

  return res.status(200).json({ status: "success", data: institution });
});

// Get institution by ID
exports.getInstitutionById = catchAsync(async (req, res) => {
  const institutionId = req.params.id;

  // logger.info({
  //   label: "info",
  //   message: `Beggening of getInstitutionById Function`,
  //   methodName: "getInstitutionById",
  //   filepath: "instituteController.js",
  //   payload: JSON.stringify(institutionId),
  // });

  const [rows] = await db.query(
    "SELECT * FROM institution WHERE institution_id = ?",
    [institutionId]
  );
  if (rows.length === 0) {
    // logger.info({
    //   label: "info",
    //   message: `Institution not found`,
    //   methodName: "getInstitutionById",
    //   filepath: "instituteController.js",
    //   payload: JSON.stringify(institutionId),
    // });
    return res.status(404).json({ message: "Institution not found" });
  }

  // logger.info({
  //   label: "info",
  //   message: `Institute information has been sent to client`,
  //   methodName: "getInstitutionById",
  //   filepath: "instituteController.js",
  //   payload: JSON.stringify(institutionId),
  // });
  return res.status(200).json({ status: "success", data: rows[0] });
});

// Create a new institution
exports.createInstitution = catchAsync(async (req, res) => {
  // logger.info({
  //   label: "info",
  //   message: `Beggening of createInstitution Function`,
  //   methodName: "createInstitution",
  //   filepath: "instituteController.js",
  //   payload: JSON.stringify(req.body),
  // });

  const {
    name,
    email,
    phone,
    address,
    map_location,
    status,
    details,
    video_link,
  } = req.body;

  let coverPhotoUrl = null;
  if (req.file) {
    coverPhotoUrl = await imageUpload(req.file);
  }

  // Validate input data
  if (!name || !email || !phone) {
    // logger.info({
    //   label: "info",
    //   message: "Name, email, and phone are required",
    //   methodName: "createInstitution",
    //   filepath: "instituteController.js",
    //   payload: JSON.stringify(req.body),
    // });

    return res
      .status(400)
      .json({ message: "Name, email, and phone are required" });
  }

  // Insert the new institution into the database
  await db.query(
    "INSERT INTO institution (name, email, phone, address, map_location, status, details, cover_photo, video_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      name,
      email,
      phone,
      address,
      map_location,
      status,
      details,
      coverPhotoUrl,
      video_link,
    ]
  );

  // logger.info({
  //   label: "info",
  //   message: "Institution created successfully",
  //   methodName: "createInstitution",
  //   filepath: "instituteController.js",
  //   payload: JSON.stringify(req.body),
  // });

  return res
    .status(201)
    .json({ status: "success", message: "Institution created successfully" });
});

// Update institution by ID
exports.updateInstitution = catchAsync(async (req, res) => {
  const institutionId = req.params.id;
  const {
    name,
    email,
    phone,
    address,
    map_location,
    status,
    details,
    video_link,
  } = req.body;

  // logger.info({
  //   label: "info",
  //   message: `Beginning of updateInstitution Function`,
  //   methodName: "updateInstitution",
  //   filepath: "instituteController.js",
  //   payload: JSON.stringify(institutionId),
  // });

  let coverPhotoUrl = null;
  if (req.file) {
    coverPhotoUrl = await imageUpload(req.file);
  }

  // Create an object of fields to update
  const fieldsToUpdate = {
    name,
    email,
    phone,
    address,
    map_location,
    status,
    details,
    video_link,
    cover_photo: coverPhotoUrl,
  };

  // Filter out fields that are null or undefined
  const updateFields = Object.keys(fieldsToUpdate).filter(
    (key) => fieldsToUpdate[key] !== null && fieldsToUpdate[key] !== undefined
  );

  if (updateFields.length === 0) {
    return res.status(400).json({ message: "No fields to update" });
  }

  // Build the SQL query dynamically
  const updateQuery = `UPDATE institution SET ${updateFields
    .map((field) => `${field} = ?`)
    .join(", ")} WHERE institution_id = ?`;

  // Create the array of values for the SQL query
  const updateValues = [
    ...updateFields.map((field) => fieldsToUpdate[field]),
    institutionId,
  ];

  // Execute the query
  const [result] = await db.query(updateQuery, updateValues);

  if (result.affectedRows === 0) {
    // logger.info({
    //   label: "info",
    //   message: "Institution not found",
    //   methodName: "updateInstitution",
    //   filepath: "instituteController.js",
    //   payload: JSON.stringify(institutionId),
    // });

    return res.status(404).json({ message: "Institution not found" });
  }

  // logger.info({
  //   label: "info",
  //   message: "Institution updated successfully",
  //   methodName: "updateInstitution",
  //   filepath: "instituteController.js",
  //   payload: JSON.stringify(institutionId),
  // });

  return res
    .status(200)
    .json({ status: "success", message: "Institution updated successfully" });
});

// Delete institution by ID
exports.deleteInstitution = catchAsync(async (req, res) => {
  const institutionId = req.params.id;

  // logger.info({
  //   label: "info",
  //   message: `Beggening of deleteInstitution Function`,
  //   methodName: "deleteInstitution",
  //   filepath: "instituteController.js",
  //   payload: JSON.stringify(institutionId),
  // });

  const [result] = await db.query(
    "DELETE FROM institution WHERE institution_id = ?",
    [institutionId]
  );
  if (result.affectedRows === 0) {
    // logger.info({
    //   label: "info",
    //   message: "Institution not found",
    //   methodName: "deleteInstitution",
    //   filepath: "instituteController.js",
    //   payload: JSON.stringify(institutionId),
    // });
    return res.status(404).json({ message: "Institution not found" });
  }

  // logger.info({
  //   label: "info",
  //   message: "Institution deleted successfully",
  //   methodName: "deleteInstitution",
  //   filepath: "instituteController.js",
  //   payload: JSON.stringify(institutionId),
  // });
  return res
    .status(204)
    .json({ status: "success", message: "Institution deleted successfully" });
});
