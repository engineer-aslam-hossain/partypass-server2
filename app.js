const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const dotenv = require("dotenv");
// dotenv.config({ path: "./Configs/config.env" });
dotenv.config({ path: "./Configs/locale.env" });
const route = require("./Routers/route");
const dbConnection = require("./Configs/db");
const sanitaizer = require("./helper/sanitaizer");
const rateLimitMiddleware = require("./lib/rateLimitMiddleware");

const app = express();

// const repObj = {
//   USERNAME: process.env.DATABASE_USERNAME,
//   PASSWORD: process.env.DATABASE_PASSWORD,
// };

// const DB = process.env.DATABASE.replace(
//   /USERNAME|PASSWORD/gi,
//   function (matched) {
//     return repObj[matched];
//   }
// );

// mongoose
//   .connect(DB)
//   .then(() => console.log("DB connection successful"))
//   .catch((err) => console.log(err));

// schema
// app.set("trust proxy", true);
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://mianguyen10.github.io",
  "https://partypass-frontend.netlify.app",
  "https://partypass-admin.netlify.app",
];

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

// MIDDLEWARES

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", "true"); // if credentials are involved
  next();
});
app.use(rateLimitMiddleware()); // Apply rate limiting globally
app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// app.use(express.static("public"));

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this IP, please try again in an hour!",
});

app.use("/api", limiter);

app.use(
  express.json({
    limit: "10kb",
  })
);

app.use(sanitaizer);

app.use(
  hpp({
    whitelist: ["duration"],
  })
);
// parent route of all routes
app.use(route);

module.exports = app;
