const app = require("./app");
// const logger = require("./lib/logger");

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  //   logger.info({
  //     label: "info",
  //     message: `Server running on port ${port}`,
  //     methodName: "server",
  //     filepath: "index.js",
  //     payload: JSON.stringify("start the server"),
  //   });
});

process.on("unhandledRejection", (err) => {
  server.close(() => {
    process.exit(1);
  });
});
