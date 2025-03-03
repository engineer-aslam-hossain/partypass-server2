const catchAsync = require("../utils/catchAsync");
const db = require("../Configs/db");
// const logger = require("../lib/logger");

exports.getTotalCounter = catchAsync(async (req, res) => {
  // logger.info({
  //   label: "info",
  //   message: `Getting Total Analytics`,
  //   methodName: "getTotalCounter",
  //   filepath: "dashboardController.js",
  //   payload: JSON.stringify("start of the function"),
  // });

  const [users] = await db.query(`SELECT COUNT(*) AS totalUsers FROM users`);
  const [institutions] = await db.query(
    `SELECT COUNT(*) AS totalInstitutions FROM institution`
  );
  const [ticketsSold] = await db.query(
    `SELECT COUNT(*) AS totalTicketsSold FROM purchase`
  );
  const [events] = await db.query(
    `SELECT COUNT(*) AS totalEvents FROM ticket_type`
  );
  const [revenue] = await db.query(
    `SELECT SUM(price_amount) AS totalRevenue FROM purchase`
  );

  const [customers] = await db.query(
    `SELECT COUNT(*) AS totalCustomers FROM users WHERE role = 0`
  );

  const [upcomingEvents] = await db.query(`
        SELECT 
                name AS eventName, 
                date AS eventDate, 
                (SELECT name FROM institution WHERE institution_id = ticket_type.institution_id) AS venue, 
                price AS ticketPrice 
        FROM ticket_type 
        WHERE date >= CURDATE()
    `);

  const [bestSellingProducts] = await db.query(`
            SELECT 
                            t.name AS ticketName, 
                            t.ticket_id AS ticketId,
                            COUNT(p.ticket_id) AS totalSold, 
                            SUM(p.price_amount) AS totalRevenue 
            FROM purchase p
            JOIN ticket_type t ON p.ticket_id = t.ticket_id
            GROUP BY p.ticket_id 
            ORDER BY totalSold DESC
    `);

  // logger.info({
  //   label: "info",
  //   message: `Getting Total Analytics`,
  //   methodName: "getTotalCounter",
  //   filepath: "dashboardController.js",
  //   payload: JSON.stringify("end of the function"),
  // });

  res.status(200).json({
    status: "success",
    data: {
      totalUsers: users[0].totalUsers,
      totalInstitutions: institutions[0].totalInstitutions,
      totalTicketsSold: ticketsSold[0].totalTicketsSold,
      totalEvents: events[0].totalEvents,
      totalRevenue: revenue[0].totalRevenue,
      totalCustomers: customers[0].totalCustomers,
      upcomingEvents,
      bestSellingProducts,
    },
  });
});
