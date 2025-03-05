const { asyncParse } = require("../utils/asyncParse");
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
  const parsedData = await asyncParse(req);
  const { fields, files } = parsedData;

  const name = fields.name ? fields.name[0] : null;
  const email = fields.email ? fields.email[0] : null;
  const phone = fields.phone ? fields.phone[0] : null;
  const address = fields.address ? fields.address[0] : null;
  const map_location = fields.map_location ? fields.map_location[0] : null;
  const status = fields.status ? fields.status[0] : null;
  const details = fields.details ? fields.details[0] : null;
  const video_link = fields.video_link ? fields.video_link[0] : null;

  console.log("fields", fields, "files", files);

  let coverPhotoUrl = null;
  if (files?.cover_photo && files.cover_photo[0]) {
    coverPhotoUrl = await imageUpload(files.cover_photo[0]);
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
  const parsedData = await asyncParse(req);
  const { fields, files } = parsedData;

  const name = fields.name ? fields.name[0] : null;
  const email = fields.email ? fields.email[0] : null;
  const phone = fields.phone ? fields.phone[0] : null;
  const address = fields.address ? fields.address[0] : null;
  const map_location = fields.map_location ? fields.map_location[0] : null;
  const status = fields.status ? fields.status[0] : null;
  const details = fields.details ? fields.details[0] : null;
  const video_link = fields.video_link ? fields.video_link[0] : null;

  console.log("fields", fields, "files", files);

  let coverPhotoUrl = null;
  if (files?.cover_photo && files.cover_photo[0]) {
    coverPhotoUrl = await imageUpload(files.cover_photo[0]);
  }

  // logger.info({
  //   label: "info",
  //   message: `Beginning of updateInstitution Function`,
  //   methodName: "updateInstitution",
  //   filepath: "instituteController.js",
  //   payload: JSON.stringify(institutionId),
  // });

  const [existingInstitutionRows] = await db.query(
    "SELECT * FROM institution WHERE institution_id = ?",
    [institutionId]
  );

  if (existingInstitutionRows.length === 0) {
    return res.status(404).json({ message: "Institution not found" });
  }

  const existingInstitution = existingInstitutionRows[0];

  const updatedInstitution = {
    name: name || existingInstitution.name,
    email: email || existingInstitution.email,
    phone: phone || existingInstitution.phone,
    address: address || existingInstitution.address,
    map_location: map_location || existingInstitution.map_location,
    status: status || existingInstitution.status,
    details: details || existingInstitution.details,
    video_link: video_link || existingInstitution.video_link,
    cover_photo: coverPhotoUrl || existingInstitution.cover_photo,
  };

  const [result] = await db.query(
    "UPDATE institution SET name = ?, email = ?, phone = ?, address = ?, map_location = ?, status = ?, details = ?, video_link = ?, cover_photo = ? WHERE institution_id = ?",
    [
      updatedInstitution.name,
      updatedInstitution.email,
      updatedInstitution.phone,
      updatedInstitution.address,
      updatedInstitution.map_location,
      updatedInstitution.status,
      updatedInstitution.details,
      updatedInstitution.video_link,
      updatedInstitution.cover_photo,
      institutionId,
    ]
  );

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
