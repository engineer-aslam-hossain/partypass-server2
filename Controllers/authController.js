// const User = require("../Models/User");
// const Profile = require("../Models/Profile");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const db = require("../Configs/db");
const bcrypt = require("bcrypt");
// const logger = require("../lib/logger");
const { imageUpload } = require("../utils/fileUpload");
const { asyncParse } = require("../utils/asyncParse");
const moment = require("moment");

const signToken = (name, id, role, institution_id) => {
  return jwt.sign({ name, id, role, institution_id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });
};

exports.createUser = catchAsync(async (req, res, next) => {
  const { fields, files } = await asyncParse(req);

  const {
    name,
    email,
    phone,
    password,
    role,
    is_social,
    date_of_birth,
    social_uuid,
    institution_id,
  } = fields;

  console.log("fields", fields);

  // logger.info({
  //   label: "info",
  //   message: `Beginning of createUser Function`,
  //   methodName: "createUser",
  //   filepath: "authController.js",
  //   payload: JSON.stringify("start of the function"),
  // });

  if (!password || !password[0]) {
    return next(new AppError("Password is required", 400));
  }

  const hashedPass = await bcrypt.hash(password[0], 12);

  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
    email[0],
  ]);
  if (rows.length > 0) {
    // logger.info({
    //   label: "info",
    //   message: `User already exists`,
    //   methodName: "createUser",
    //   filepath: "authController.js",
    //   payload: JSON.stringify("end of the function"),
    // });
    return res.status(400).json({ message: "User already exists" });
  }

  await db.query(
    `
    INSERT INTO users (name, email, phone, password, role, is_social, institution_id, date_of_birth, social_uuid) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name[0],
      email[0],
      phone ? phone[0] : null,
      hashedPass,
      role ? role[0] : 3,
      is_social ? is_social[0] : false,
      institution_id
        ? institution_id[0] == "null"
          ? null
          : institution_id[0]
        : null,

      date_of_birth === "" || date_of_birth == null
        ? null
        : moment(date_of_birth).format("YYYY-MM-DD HH:mm:ss"),
      social_uuid ? social_uuid[0] : null,
    ]
  );

  const [userRow] = await db.query("SELECT * FROM users WHERE email = ?", [
    email[0],
  ]);
  if (userRow.length > 0) {
    let profilePhotoUrl = null;

    if (files?.profile_pic && files.profile_pic[0]) {
      profilePhotoUrl = await imageUpload(files.profile_pic[0]);

      const userId = userRow[0].user_id;
      const query = `
        INSERT INTO user_profile (user_id, profile_pic, upload_date)
        VALUES (?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          profile_pic = VALUES(profile_pic),
          upload_date = NOW()
      `;
      await db.query(query, [userId, profilePhotoUrl]);
    }
  }

  // logger.info({
  //   label: "info",
  //   message: `User Created Successfully. Please login to get access!`,
  //   methodName: "createUser",
  //   filepath: "authController.js",
  //   payload: JSON.stringify("end of the function"),
  // });

  return res.status(201).json({
    status: "success",
    message: "User Created Successfully. Please login to get access!",
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // logger.info({
  //   label: "info",
  //   message: `Beggening of login Function`,
  //   methodName: "login",
  //   filepath: "authController.js",
  //   payload: JSON.stringify("start of the function"),
  // });

  if (!email || !password) {
    return next(new AppError("Please provide Email & Password", 400));
  }

  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  if (rows.length === 0) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const token = signToken(
    user.name,
    user.user_id,
    user.role,
    user.institution_id
  );

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: false,
    secure: false,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("token", token, cookieOptions);

  // logger.info({
  //   label: "info",
  //   message: `login jwt send to client`,
  //   methodName: "login",
  //   filepath: "authController.js",
  //   payload: JSON.stringify(token),
  // });

  return res.status(200).json({
    status: "success",
    token,
  });
});

exports.userInfo = catchAsync(async (req, res, next) => {
  const user = req.user;

  console.log("user", user);

  let [rows] = await db.query(
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
    [user.id]
  );

  if (rows.length > 0) {
    rows = rows.map((row) => ({
      ...row,
      institution:
        typeof row.institution === "string"
          ? JSON.parse(row.institution)
          : row.institution,
    }));
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

exports.uploadProfilePicture = catchAsync(async (req, res) => {
  const user = req.user;
  const { files } = await asyncParse(req);

  let profilePhotoUrl = null;
  if (files?.profile_pic[0]) {
    profilePhotoUrl = await imageUpload(files.profile_pic[0]);
  }

  const query = `
    INSERT INTO user_profile (user_id, profile_pic, upload_date)
    VALUES (?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      profile_pic = VALUES(profile_pic),
      upload_date = NOW()
  `;

  await db.query(query, [user.id, profilePhotoUrl]);

  return res.status(200).json({
    status: "success",
    message: "profile picture uploaded successfully",
  });
});

exports.updateUser = catchAsync(async (req, res) => {
  const { fields, files } = await asyncParse(req);

  const {
    name,
    email,
    phone,
    password,
    role,
    is_social,
    date_of_birth,
    social_uuid,
    institution_id,
  } = fields;

  // logger.info({
  //   label: "info",
  //   message: `Beginning of updateUser Function`,
  //   methodName: "updateUser",
  //   filepath: "authController.js",
  //   payload: JSON.stringify("start of the function"),
  // });

  console.log("updatedUser", "Beginning of updateUser Function");

  const user = req.user;

  const [existingUserRows] = await db.query(
    "SELECT * FROM users WHERE user_id = ?",
    [user.id]
  );

  if (existingUserRows.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  const existingUser = existingUserRows[0];

  const updatedUser = {
    name: name ? name[0] : existingUser.name,
    email: email ? email[0] : existingUser.email,
    role: role ? role[0] : existingUser.role,
    phone: phone ? phone[0] : existingUser.phone,
    password: password
      ? await bcrypt.hash(password[0], 12)
      : existingUser.password,
    is_social: is_social ? is_social[0] : existingUser.is_social,
    date_of_birth:
      date_of_birth === "" || date_of_birth == null
        ? existingUser.date_of_birth
        : moment(date_of_birth).format("YYYY-MM-DD HH:mm:ss"),
    social_uuid: social_uuid ? social_uuid[0] : existingUser.social_uuid,
    institution_id: institution_id
      ? institution_id[0]
      : existingUser.institution_id,
  };

  console.log("updatedUser", updatedUser);

  await db.query(
    `
    UPDATE users 
    SET name = ?, email = ?, phone = ?, password = ?, role = ?, is_social = ?, date_of_birth = ?, social_uuid = ?, institution_id = ?
    WHERE user_id = ?`,
    [
      updatedUser.name,
      updatedUser.email,
      updatedUser.phone,
      updatedUser.password,
      updatedUser.role,
      updatedUser.is_social,
      updatedUser.date_of_birth,
      updatedUser.social_uuid,
      updatedUser.institution_id,
      user.id,
    ]
  );

  let profilePhotoUrl = null;
  if (files?.profile_pic && files.profile_pic[0]) {
    profilePhotoUrl = await imageUpload(files.profile_pic[0]);

    const [existingProfileRows] = await db.query(
      "SELECT * FROM user_profile WHERE user_id = ?",
      [user.id]
    );

    if (existingProfileRows.length > 0) {
      const query = `
      UPDATE user_profile 
      SET profile_pic = ?, upload_date = NOW() 
      WHERE user_id = ?`;
      await db.query(query, [profilePhotoUrl, user.id]);
    } else {
      const query = `
      INSERT INTO user_profile (user_id, profile_pic, upload_date)
      VALUES (?, ?, NOW())`;
      await db.query(query, [user.id, profilePhotoUrl]);
    }
  }

  // logger.info({
  //   label: "info",
  //   message: `User Updated Successfully`,
  //   methodName: "updateUser",
  //   filepath: "authController.js",
  //   payload: JSON.stringify("end of the function"),
  // });

  return res.status(200).json({
    status: "success",
    message: "User Updated Successfully",
  });
});

exports.updateUserById = catchAsync(async (req, res) => {
  const { fields, files } = await asyncParse(req);

  const {
    name,
    email,
    phone,
    password,
    role,
    is_social,
    date_of_birth,
    social_uuid,
    institution_id,
  } = fields;

  console.log("updatedUser", "Beginning of updateUser Function", fields);
  console.log(moment(date_of_birth).format("YYYY-MM-DD HH:mm:ss"));

  const userId = req.params.id;

  // logger.info({
  //   label: "info",
  //   message: `Beginning of updateUserById Function`,
  //   methodName: "updateUserById",
  //   filepath: "authController.js",
  //   payload: JSON.stringify("start of the function"),
  // });

  const [existingUserRows] = await db.query(
    "SELECT * FROM users WHERE user_id = ?",
    [userId]
  );
  if (existingUserRows.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  const existingUser = existingUserRows[0];
  const updatedUser = {
    name: name ? name[0] : existingUser.name,
    email: email ? email[0] : existingUser.email,
    phone: phone ? phone[0] : existingUser.phone,
    password: password
      ? await bcrypt.hash(password[0], 12)
      : existingUser.password,
    role: role ? role[0] : existingUser.role,
    is_social: is_social ? is_social[0] : existingUser.is_social,
    date_of_birth:
      date_of_birth === "" || date_of_birth == null
        ? existingUser.date_of_birth
        : moment(date_of_birth).format("YYYY-MM-DD HH:mm:ss"),
    social_uuid: social_uuid ? social_uuid[0] : existingUser.social_uuid,
    institution_id: institution_id
      ? institution_id[0]
      : existingUser.institution_id,
  };

  await db.query(
    `
    UPDATE users 
    SET name = ?, email = ?, phone = ?, password = ?, role = ?, is_social = ?, date_of_birth = ?, social_uuid = ?, institution_id = ?
    WHERE user_id = ?`,
    [
      updatedUser.name,
      updatedUser.email,
      updatedUser.phone,
      updatedUser.password,
      updatedUser.role,
      updatedUser.is_social,
      updatedUser.date_of_birth,
      updatedUser.social_uuid,
      updatedUser.institution_id,
      userId,
    ]
  );

  let profilePhotoUrl = null;
  if (files?.profile_pic && files.profile_pic[0]) {
    profilePhotoUrl = await imageUpload(files.profile_pic[0]);

    const [existingProfileRows] = await db.query(
      "SELECT * FROM user_profile WHERE user_id = ?",
      [userId]
    );

    if (existingProfileRows.length > 0) {
      const query = `
      UPDATE user_profile 
      SET profile_pic = ?, upload_date = NOW() 
      WHERE user_id = ?`;
      await db.query(query, [profilePhotoUrl, userId]);
    } else {
      const query = `
      INSERT INTO user_profile (user_id, profile_pic, upload_date)
      VALUES (?, ?, NOW())`;
      await db.query(query, [userId, profilePhotoUrl]);
    }
  }

  // logger.info({
  //   label: "info",
  //   message: `User Updated Successfully by Admin`,
  //   methodName: "updateUserById",
  //   filepath: "authController.js",
  //   payload: JSON.stringify("end of the function"),
  // });

  return res.status(200).json({
    status: "success",
    message: "User Updated Successfully by Admin",
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = req.user;

  // logger.info({
  //   label: "info",
  //   message: `Beginning of deleteUser Function`,
  //   methodName: "deleteUser",
  //   filepath: "authController.js",
  //   payload: JSON.stringify("start of the function"),
  // });

  const [existingUserRows] = await db.query(
    "SELECT * FROM users WHERE user_id = ?",
    [user.id]
  );
  if (existingUserRows.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  await db.query("DELETE FROM users WHERE user_id = ?", [user.id]);

  // logger.info({
  //   label: "info",
  //   message: `User Deleted Successfully`,
  //   methodName: "deleteUser",
  //   filepath: "authController.js",
  //   payload: JSON.stringify("end of the function"),
  // });

  return res.status(200).json({
    status: "success",
    message: "User Deleted Successfully",
  });
});
exports.deleteUserById = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  // logger.info({
  //   label: "info",
  //   message: `Beginning of deleteUserById Function`,
  //   methodName: "deleteUserById",
  //   filepath: "authController.js",
  //   payload: JSON.stringify("start of the function"),
  // });

  const [existingUserRows] = await db.query(
    "SELECT * FROM users WHERE user_id = ?",
    [userId]
  );
  if (existingUserRows.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  await db.query("DELETE FROM users WHERE user_id = ?", [userId]);

  // logger.info({
  //   label: "info",
  //   message: `User Deleted Successfully by Admin`,
  //   methodName: "deleteUserById",
  //   filepath: "authController.js",
  //   payload: JSON.stringify("end of the function"),
  // });

  return res.status(200).json({
    status: "success",
    message: "User Deleted Successfully by Admin",
  });
});
