const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
  res.send("Hello World! Vercel.");
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
