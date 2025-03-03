const db = require("../Configs/db"); // Import your database connection
// const logger = require("../lib/logger");
const catchAsync = require("../utils/catchAsync");

// Get all Locker Allocation
exports.getAllLockerAllocation = catchAsync(async (req, res, next) => {
  // logger.info({
  //   label: "info",
  //   message: `Getting list of the Locker Allocations`,
  //   methodName: "getAllLockerAllocationByInstitue",
  //   filepath: "lockerAllocationController.js",
  //   payload: JSON.stringify("start of the function"),
  // });

  const [rows] = await db.query("SELECT * FROM locker_allocation");

  // logger.info({
  //   label: "info",
  //   message: `Sending list of the Locker Allocations to client`,
  //   methodName: "getAllLockerAllocationByInstitue",
  //   filepath: "lockerAllocationController.js",
  //   payload: JSON.stringify("end of the function"),
  // });

  return res.status(200).json({ status: "success", data: rows });
});

// Allocate a Locker
exports.allocateLocker = catchAsync(async (req, res) => {
  const { purchase_id, locker_id, status, allocation_date } = req.body;

  // logger.info({
  //   label: "info",
  //   message: `Creating a new Locker Allocation`,
  //   methodName: "createLockerAllocation",
  //   filepath: "lockerAllocationController.js",
  //   payload: JSON.stringify(req.body),
  // });

  const [bals] = await db.query("SELECT * FROM locker_allocation");

  console.log(bals);

  const [rows] = await db.query(
    "SELECT * FROM locker_allocation WHERE purchase_id = ? AND locker_id = ?",
    [purchase_id, locker_id]
  );

  if (rows[0]) {
    return res.status(409).json({ message: "Locker is already allocated" });
  }

  await db.query(
    "INSERT INTO locker_allocation (purchase_id, locker_id, status, allocation_date) VALUES (?, ?, ?, ?)",
    [purchase_id, locker_id, status, allocation_date]
  );

  // logger.info({
  //   label: "info",
  //   message: "Locker Allocated successfully",
  //   methodName: "createLockerAllocation",
  //   filepath: "lockerAllocationController.js",
  //   payload: JSON.stringify(req.body),
  // });

  return res
    .status(201)
    .json({ status: "success", message: "Locker Allocated successfully" });
});

// Update Locker Allocation by ID
exports.updateLockerAllocatioin = catchAsync(async (req, res) => {
  const lockerAllocationId = req.params.id;
  // logger.info({
  //   label: "info",
  //   message: `Updating a Locker item`,
  //   methodName: "updateLockerAllocatioin",
  //   filepath: "lockerAllocationController.js",
  //   payload: JSON.stringify(lockerAllocationId),
  // });

  const { purchase_id, locker_id, status, allocation_date } = req.body;

  const [result] = await db.query(
    "UPDATE locker_allocation SET purchase_id = ?, locker_id = ?, status = ?, allocation_date = ? WHERE id = ?",
    [purchase_id, locker_id, status, allocation_date, lockerAllocationId]
  );

  if (result.affectedRows === 0) {
    // logger.info({
    //   label: "info",
    //   message: "Locker Allocation not found",
    //   methodName: "updateLockerAllocatioin",
    //   filepath: "lockerAllocationController.js",
    //   payload: JSON.stringify(lockerAllocationId),
    // });
    return res.status(404).json({ message: "Locker Allocation not found" });
  }

  // logger.info({
  //   label: "info",
  //   message: "Locker Allocation updated successfully",
  //   methodName: "updateLockerAllocatioin",
  //   filepath: "lockerAllocationController.js",
  //   payload: JSON.stringify(lockerAllocationId),
  // });

  return res.status(200).json({
    status: "success",
    message: "Locker Allocation updated successfully",
  });
});

// Delete Locker by ID
exports.deleteLockerAllocation = catchAsync(async (req, res) => {
  const lockerId = req.params.id;

  // logger.info({
  //   label: "info",
  //   message: `Deleting a Locker item`,
  //   methodName: "deleteLocker",
  //   filepath: "lockerAllocationController.js",
  //   payload: JSON.stringify(lockerId),
  // });

  const [result] = await db.query(
    "DELETE FROM locker_allocation WHERE id = ?",
    [lockerId]
  );

  if (result.affectedRows === 0) {
    // logger.info({
    //   label: "info",
    //   message: "Locker not found",
    //   methodName: "deleteLocker",
    //   filepath: "lockerAllocationController.js",
    //   payload: JSON.stringify(lockerId),
    // });
    return res.status(404).json({ message: "Locker not found" });
  }

  // logger.info({
  //   label: "info",
  //   message: "Locker deleted successfully",
  //   methodName: "deleteLocker",
  //   filepath: "lockerAllocationController.js",
  //   payload: JSON.stringify(lockerId),
  // });

  return res
    .status(204)
    .json({ status: "success", message: "Locker deleted successfully" });
});

// Get Locker Allocation by ID
exports.getLockerAllocationById = catchAsync(async (req, res) => {
  const lockerId = req.params.id;

  // logger.info({
  //   label: "info",
  //   message: `Getting a Locker item`,
  //   methodName: "getLocker",
  //   filepath: "lockerAllocationController.js",
  //   payload: JSON.stringify(lockerId),
  // });

  const [rows] = await db.query(
    "SELECT * FROM locker_allocation WHERE id = ?",
    [lockerId]
  );

  if (!rows[0]) {
    // logger.info({
    //   label: "info",
    //   message: "Locker not found",
    //   methodName: "getLocker",
    //   filepath: "lockerAllocationController.js",
    //   payload: JSON.stringify(lockerId),
    // });
    return res.status(404).json({ message: "Locker not found" });
  }

  // logger.info({
  //   label: "info",
  //   message: "Sending Locker item to client",
  //   methodName: "getLocker",
  //   filepath: "lockerAllocationController.js",
  //   payload: JSON.stringify(lockerId),
  // });

  return res.status(200).json({ status: "success", data: rows[0] });
});
