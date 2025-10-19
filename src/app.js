const express = require("express");
const s3Routes = require("./routes/s3Routes");

const app = express();

// Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/s3", s3Routes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "Amazon S3 Simulator",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    message: `Route ${req.originalUrl} does not exist`,
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(500).json({
    error: "Internal server error",
    message: error.message,
  });
});

module.exports = app;
