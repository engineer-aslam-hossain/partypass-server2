const mysql = require("mysql2/promise");
// const logger = require("../lib/logger");

// Function to initialize the database if it doesn't exist
async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
  });

  // Create the database if it doesn't exist
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS ${process.env.DATABASE_NAME}`
  );
  connection.end();
}

// Create the connection to the database
const dbConnection = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  waitForConnections: true,
  queueLimit: 0,
});

async function checkConnection() {
  try {
    // Ensure the database exists
    await initializeDatabase();

    // Get a connection from the pool
    const connection = await dbConnection.getConnection();

    // // Disable foreign key checks temporarily
    // await connection.query("SET FOREIGN_KEY_CHECKS = 0");

    // // Fetch all tables
    // const [tables] = await connection.query("SHOW TABLES");

    // // Generate a drop table query for each table
    // const dropQueries = tables.map(
    //   (row) => `DROP TABLE IF EXISTS \`${Object.values(row)[0]}\``
    // );

    // // Execute each drop table query individually
    // for (let query of dropQueries) {
    //   await connection.query(query);
    // }

    // logger.info({
    //   label: "info",
    //   message: "All existing tables dropped successfully.",
    //   methodName: "dropAllTables",
    //   filepath: "db.js",
    // });

    // // Re-enable foreign key checks
    // await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    // Table Identity Type creation if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS identity_type (
        id INT AUTO_INCREMENT PRIMARY KEY,  -- Primary Key
        type_name VARCHAR(255),
        requirement VARCHAR(255)
      )`);

    // Table institution creation if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS institution (
        institution_id INT AUTO_INCREMENT PRIMARY KEY,  -- Primary Key
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        address VARCHAR(255),
        map_location TEXT(255),
        status INT NOT NULL,
        details TEXT,
        cover_photo VARCHAR(255),
        video_link VARCHAR(255)
      )`);

    // Table Locker creation if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS locker (
        id INT AUTO_INCREMENT PRIMARY KEY,  -- Primary Key
        institution_id INT,                        -- Foreign Key to institution
        locker_number INT,
        status INT NOT NULL,
        FOREIGN KEY (institution_id) REFERENCES institution(institution_id) ON DELETE CASCADE
      )`);

    // Table Users creation if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,  -- Primary Key
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        password VARCHAR(255) NOT NULL,
        role INT NOT NULL,                     
        is_social TINYINT(1) DEFAULT 0,            -- 0 = false, 1 = true
        institution_id INT,
        date_of_birth DATE,
        social_uuid VARCHAR(255),
        FOREIGN KEY (institution_id) REFERENCES institution(institution_id) ON DELETE CASCADE
      )`);

    // Table User profile creation if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_profile (
        id INT AUTO_INCREMENT PRIMARY KEY,  -- Primary Key
        user_id INT UNIQUE,                                 -- Foreign Key to user
        profile_pic VARCHAR(255),
        upload_date DATETIME NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )`);

    // Table User document creation if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_document (
        id INT AUTO_INCREMENT PRIMARY KEY,  -- Primary Key
        user_id INT,                                 -- Foreign Key to user
        identity_type_id INT,                                 -- Foreign Key to identity_type_id
        id_number INT,
        upload_date DATE NOT NULL,
        id_file1 VARCHAR(255),
        id_file2 VARCHAR(255),
        is_verified INT DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (identity_type_id) REFERENCES identity_type(id) ON DELETE CASCADE
      )`);

    // Table ticket_type creation if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ticket_type (
        ticket_id INT AUTO_INCREMENT PRIMARY KEY,  -- Primary Key
        name VARCHAR(100) NOT NULL,
        description TEXT,
        institution_id INT,                        -- Foreign Key to institution
        price DECIMAL(10, 2) NOT NULL,
        capacity INT NOT NULL,
        benefits VARCHAR(255),
        is_regular INT NOT NULL,
        date DATE,
        start_datetime TIME,
        end_datetime TIME,
        FOREIGN KEY (institution_id) REFERENCES institution(institution_id) ON DELETE CASCADE
      )`);

    // Table purchase creation if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS purchase (
        purchase_id INT AUTO_INCREMENT PRIMARY KEY,  -- Primary Key
        user_id INT,                                 -- Foreign Key to user
        ticket_id INT,                               -- Foreign Key to ticket_type
        purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        ticket_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        price_amount DECIMAL(10, 2) NOT NULL,
        payment_status INT NOT NULL,
        payment_method ENUM('credit_card', 'paypal', 'bank_transfer') NOT NULL,
        ticket_status INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (ticket_id) REFERENCES ticket_type(ticket_id) ON DELETE CASCADE
      )`);

    // Table Locker_allocation creation if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS locker_allocation (
        id INT AUTO_INCREMENT PRIMARY KEY,  -- Primary Key
        locker_id INT,                        -- Foreign Key to Locker
        purchase_id INT,                     -- Foreign Key to Purchase
        allocation_date DATETIME NOT NULL,
        status INT NOT NULL,
        FOREIGN KEY (locker_id) REFERENCES locker(locker_id) ON DELETE CASCADE,
        FOREIGN KEY (purchase_id) REFERENCES purchase(purchase_id) ON DELETE CASCADE
      )`);

    // logger.info({
    //   label: "info",
    //   message: "Connected to the MySQL database.",
    //   methodName: "checkConnection",
    //   filepath: "db.js",
    //   payload: JSON.stringify(process.env.DATABASE_USERNAME),
    // });
    connection.release();
  } catch (err) {
    if (err.code === "ER_ACCESS_DENIED_ERROR") {
      // logger.error({
      //   label: "error",
      //   message: "Access denied: Incorrect username or password.",
      //   methodName: "checkConnection",
      //   filepath: "db.js",
      //   payload: JSON.stringify(process.env.DATABASE_USERNAME),
      // });
    } else if (err.code === "ER_BAD_DB_ERROR") {
      // logger.error({
      //   label: "error",
      //   message: "Database does not exist.",
      //   methodName: "checkConnection",
      //   filepath: "db.js",
      //   payload: JSON.stringify(process.env.DATABASE_USERNAME),
      // });
    } else {
      // logger.error({
      //   label: "error",
      //   message: `Database connection error:", ${err.message}`,
      //   methodName: "checkConnection",
      //   filepath: "db.js",
      //   payload: JSON.stringify(process.env.DATABASE_USERNAME),
      // });
    }
  }
}

// Call the function to check the connection
checkConnection();

module.exports = dbConnection;
