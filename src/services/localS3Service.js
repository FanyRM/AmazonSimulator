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
    // fileName puede contener subdirectorios: "folder/subfolder/file.jpg"
    return path.join(this.storagePath, bucket, fileName);
  }

  async ensureBucketExists(bucket) {
    const bucketPath = this.getBucketPath(bucket);
    await fs.ensureDir(bucketPath);
  }

  async ensureDirectoryExists(filePath) {
    // ✅ NUEVO: Asegurar que todos los directorios padres existan
    const directory = path.dirname(filePath);
    await fs.ensureDir(directory);
  }

  async uploadFile(bucket, fileName, base64Content) {
    await this.ensureBucketExists(bucket);

    const filePath = this.getFilePath(bucket, fileName);

    // ✅ CORREGIDO: Asegurar que todos los directorios padres existan
    await this.ensureDirectoryExists(filePath);

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
    const decodedFileName = decodeURIComponent(fileName);
    const filePath = this.getFilePath(bucket, decodedFileName);

    // ✅ CORREGIDO: Verificar que el archivo existe antes de leerlo
    if (!(await fs.pathExists(filePath))) {
      throw new Error(`File not found: ${fileName}`);
    }

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
    const decodedFileName = decodeURIComponent(fileName);
    const filePath = this.getFilePath(bucket, decodedFileName);

    // ✅ CORREGIDO: Verificar que el archivo existe
    if (!(await fs.pathExists(filePath))) {
      throw new Error(`File not found: ${fileName}`);
    }

    return await fs.readFile(filePath);
  }

  async deleteFile(bucket, fileName) {
    const decodedFileName = decodeURIComponent(fileName);
    const filePath = this.getFilePath(bucket, decodedFileName);

    // ✅ CORREGIDO: Verificar que el archivo existe antes de eliminarlo
    if (!(await fs.pathExists(filePath))) {
      throw new Error(`File not found: ${fileName}`);
    }

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
    // ✅ CORREGIDO: Obtener solo el nombre del archivo para el MIME type
    const baseName = path.basename(fileName);
    return mime.lookup(baseName) || "application/octet-stream";
  }
}

module.exports = new LocalS3Service();
