const fs = require("fs-extra");
const path = require("path");
const mime = require("mime-types");

class LocalS3Service {
  constructor() {
    this.storagePath = path.join(__dirname, "../storage");
    this.ensureStoragePath();
  }

  ensureStoragePath() {
    fs.ensureDirSync(this.storagePath);
  }

  getBucketPath(bucket) {
    return path.join(this.storagePath, bucket);
  }

  getFilePath(bucket, fileName) {
    return path.join(this.storagePath, bucket, fileName);
  }

  async ensureBucketExists(bucket) {
    const bucketPath = this.getBucketPath(bucket);
    await fs.ensureDir(bucketPath);
  }

  async uploadFile(bucket, fileName, base64Content) {
    await this.ensureBucketExists(bucket);

    const filePath = this.getFilePath(bucket, fileName);
    const buffer = Buffer.from(base64Content, "base64");

    await fs.writeFile(filePath, buffer);

    const stats = await fs.stat(filePath);
    const mimeType = this.getMimeType(fileName);

    return {
      bucket,
      fileName,
      filePath: filePath,
      url: `http://localhost:3000/s3/${bucket}/${fileName}`,
      downloadUrl: `http://localhost:3000/s3/file/${bucket}/${fileName}`,
      size: stats.size,
      mimeType: mimeType,
      lastModified: stats.mtime,
      created: stats.birthtime,
    };
  }

  async getFile(bucket, fileName) {
    const filePath = this.getFilePath(bucket, fileName);

    const buffer = await fs.readFile(filePath);
    const base64Content = buffer.toString("base64");
    const stats = await fs.stat(filePath);
    const mimeType = this.getMimeType(fileName);

    return {
      bucket,
      fileName,
      base64Content,
      size: stats.size,
      mimeType,
      lastModified: stats.mtime,
      url: `http://localhost:3000/s3/${bucket}/${fileName}`,
    };
  }

  async getFileBuffer(bucket, fileName) {
    const filePath = this.getFilePath(bucket, fileName);
    return await fs.readFile(filePath);
  }

  async deleteFile(bucket, fileName) {
    const filePath = this.getFilePath(bucket, fileName);
    await fs.remove(filePath);

    return {
      bucket,
      fileName,
      deleted: true,
      message: "File successfully deleted",
    };
  }

  async listFiles(bucket) {
    const bucketPath = this.getBucketPath(bucket);

    if (!(await fs.pathExists(bucketPath))) {
      throw new Error("Bucket does not exist");
    }

    const files = await fs.readdir(bucketPath);
    const fileList = [];

    for (const file of files) {
      const filePath = path.join(bucketPath, file);
      const stats = await fs.stat(filePath);

      if (stats.isFile()) {
        fileList.push({
          name: file,
          size: stats.size,
          lastModified: stats.mtime,
          created: stats.birthtime,
          url: `http://localhost:3000/s3/${bucket}/${file}`,
          mimeType: this.getMimeType(file),
        });
      }
    }

    return fileList;
  }

  getMimeType(fileName) {
    return mime.lookup(fileName) || "application/octet-stream";
  }
}

module.exports = new LocalS3Service();
