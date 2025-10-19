const express = require("express");
const router = express.Router();
const s3Controller = require("../controllers/s3Controller");

// Upload file
router.post("/upload", s3Controller.uploadFile);

// Get file
router.get("/file/:bucket/:fileName", s3Controller.getFile);

// Delete file
router.delete("/file/:bucket/:fileName", s3Controller.deleteFile);

// List files in bucket
router.get("/list/:bucket", s3Controller.listFiles);

// Direct file access (simulated S3 URL)
router.get("/:bucket/:fileName", s3Controller.serveFile);

module.exports = router;
