const catchAsync = require("../utils/catchAsync");
const db = require("../Configs/db");
// const logger = require("../lib/logger");

// Get the list of purchased tickets for a specific user
exports.getUserPurchasedTickets = catchAsync(async (req, res) => {
  const userId = req?.user?.id; // Get user ID from request parameters

  // logger.info({
  //   label: "info",
  //   message: `Getting User Purchased Tickets items`,
  //   methodName: "getUserPurchasedTickets",
  //   filepath: "userController.js",
  //   payload: JSON.stringify(userId),
  // });

  const [rows] = await db.query(
    `
    SELECT 
      p.*,
      JSON_OBJECT(
        'ticket_id', t.ticket_id,
        'name', t.name,
        'description', t.description,
        'price', t.price,
        'date', t.date,
        'start_datetime', t.start_datetime,
        'end_datetime', t.end_datetime,
        'is_regular', t.is_regular,
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
      ) AS ticket
    FROM 
      purchase p
    JOIN 
      ticket_type t ON p.ticket_id = t.ticket_id
    LEFT JOIN 
      institution i ON t.institution_id = i.institution_id
    WHERE 
      p.user_id = ?`,
    [userId]
  );

  if (!Array.isArray(rows)) {
    // logger.error("Expected an array for rows, but received: ", typeof rows);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }

  if (rows.length > 0) {
    rows.forEach((row) => {
      if (row.ticket && typeof row.ticket === "string") {
        row.ticket = JSON.parse(row.ticket);
      }
      if (
        row.ticket.institution &&
        typeof row.ticket.institution === "string"
      ) {
        row.ticket.institution = JSON.parse(row.ticket.institution);
      }
    });
  }

  if (rows.length === 0) {
    // logger.info({
    //   label: "info",
    //   message: `No purchased tickets found for user`,
    //   methodName: "getUserPurchasedTickets",
    //   filepath: "userController.js",
    //   payload: JSON.stringify(userId),
    // });
    return res.status(404).json({ message: "No purchased tickets found" });
  }

  // logger.info({
  //   label: "info",
  //   message: "Purchase list of the user has been sent to client",
  //   methodName: "getUserPurchasedTickets",
  //   filepath: "userController.js",
  //   payload: JSON.stringify(userId),
  // });

  return res.status(200).json({
    status: "success",
    data: rows,
  });
});

exports.userList = catchAsync(async (req, res, next) => {
  // logger.info({
  //   label: "info",
  //   message: `Getting User List`,
  //   methodName: "userList",
  //   filepath: "userController.js",
  //   payload: JSON.stringify("start of the function"),
  // });

  const [results] = await db.query(`
  SELECT 
    u.user_id,
    u.name,
    u.email,
    u.phone,
    u.role,
    u.is_social,
    u.social_uuid,
    u.date_of_birth,
    CASE 
      WHEN u.institution_id IS NOT NULL THEN JSON_OBJECT(
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
      ELSE NULL
    END AS institution,
    up.profile_pic,
    COALESCE(
      JSON_ARRAYAGG(
        CASE 
          WHEN ud.id IS NOT NULL THEN JSON_OBJECT(
            'id', ud.id,
            'identity_type_id', ud.identity_type_id,
            'id_number', ud.id_number,
            'upload_date', ud.upload_date,
            'id_file1', ud.id_file1,
            'id_file2', ud.id_file2,
            'is_verified', ud.is_verified
          )
          ELSE NULL
        END
      ),
      JSON_ARRAY()
    ) AS documents
  FROM 
    users u
  LEFT JOIN 
    institution i ON u.institution_id = i.institution_id
  LEFT JOIN 
    user_profile up ON u.user_id = up.user_id
  LEFT JOIN 
    user_document ud ON u.user_id = ud.user_id
  GROUP BY 
    u.user_id,
    u.name,
    u.email,
    u.phone,
    u.role,
    u.is_social,
    u.social_uuid,
    u.date_of_birth,
    i.institution_id,
    i.name,
    i.email,
    i.phone,
    i.address,
    i.map_location,
    i.status,
    i.details,
    i.cover_photo,
    i.video_link,
    up.profile_pic;
`);

  const formattedResults = results.map((result) => ({
    ...result,
    institution:
      typeof result.institution === "string"
        ? JSON.parse(result.institution)
        : result.institution,
  }));

  // logger.info({
  //   label: "info",
  //   message: `Sending User List to client`,
  //   methodName: "userList",
  //   filepath: "userController.js",
  //   payload: JSON.stringify("end of the function"),
  // });

  return res.status(200).json({
    status: "success",
    data: formattedResults,
  });
});

exports.userInfoById = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  const [rows] = await db.query(
    `
  SELECT 
    u.*, 
    up.profile_pic,
    CASE 
      WHEN u.institution_id IS NOT NULL THEN JSON_OBJECT(
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
      ELSE NULL
    END AS institution
  FROM 
    users u
  LEFT JOIN 
    user_profile up 
  ON 
    u.user_id = up.user_id
  LEFT JOIN 
    institution i 
  ON 
    u.institution_id = i.institution_id
  WHERE 
    u.user_id = ?;
  `,
    [userId]
  );

  if (rows.length > 0 && rows[0].institution) {
    rows[0].institution =
      typeof rows[0].institution === "string"
        ? JSON.parse(rows[0].institution)
        : rows[0].institution;
  }

  const userObject = rows[0];

  // Remove the password field if it exists
  if (userObject && userObject.password) {
    delete userObject.password;
  }

  if (!userObject) {
    return res.status(404).json({ message: "user not found" });
  }

  return res.status(200).json({ status: "success", data: rows[0] });
});
