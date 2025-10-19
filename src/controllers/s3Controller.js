const localS3Service = require("../services/localS3Service");

class S3Controller {
  async uploadFile(req, res) {
    try {
      const { bucket, fileName, base64Content } = req.body;

      // Validations
      if (!bucket || !fileName || !base64Content) {
        return res.status(400).json({
          error: "Missing required fields",
          required: ["bucket", "fileName", "base64Content"],
        });
      }

      const result = await localS3Service.uploadFile(
        bucket,
        fileName,
        base64Content
      );

      res.status(201).json({
        success: true,
        message: "File uploaded successfully",
        data: result,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        error: "Upload failed",
        message: error.message,
      });
    }
  }

  async getFile(req, res) {
    try {
      const { bucket, fileName } = req.params;

      const fileData = await localS3Service.getFile(bucket, fileName);

      res.json({
        success: true,
        data: fileData,
      });
    } catch (error) {
      if (error.code === "ENOENT") {
        return res.status(404).json({
          error: "File not found",
          message: `File ${fileName} does not exist in bucket ${bucket}`,
        });
      }
      res.status(500).json({
        error: "Failed to retrieve file",
        message: error.message,
      });
    }
  }

  async deleteFile(req, res) {
    try {
      const { bucket, fileName } = req.params;

      await localS3Service.deleteFile(bucket, fileName);

      res.json({
        success: true,
        message: "File deleted successfully",
      });
    } catch (error) {
      if (error.code === "ENOENT") {
        return res.status(404).json({
          error: "File not found",
          message: `File ${fileName} does not exist in bucket ${bucket}`,
        });
      }
      res.status(500).json({
        error: "Failed to delete file",
        message: error.message,
      });
    }
  }

  async listFiles(req, res) {
    try {
      const { bucket } = req.params;

      const files = await localS3Service.listFiles(bucket);

      res.json({
        success: true,
        data: {
          bucket,
          filesCount: files.length,
          files,
        },
      });
    } catch (error) {
      if (error.code === "ENOENT") {
        return res.status(404).json({
          error: "Bucket not found",
          message: `Bucket ${bucket} does not exist`,
        });
      }
      res.status(500).json({
        error: "Failed to list files",
        message: error.message,
      });
    }
  }

  async serveFile(req, res) {
    try {
      const { bucket, fileName } = req.params;

      const fileBuffer = await localS3Service.getFileBuffer(bucket, fileName);
      const mimeType = localS3Service.getMimeType(fileName);

      res.set("Content-Type", mimeType);
      res.send(fileBuffer);
    } catch (error) {
      if (error.code === "ENOENT") {
        return res.status(404).json({
          error: "File not found",
          message: `The requested file does not exist`,
        });
      }
      res.status(500).json({
        error: "Failed to serve file",
        message: error.message,
      });
    }
  }
}

module.exports = new S3Controller();
