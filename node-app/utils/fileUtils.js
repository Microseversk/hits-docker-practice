const fs = require("fs");
const { Readable } = require("stream");

/**
 * Преобразует поток в строку (Buffer)
 * @param {ReadableStream} stream - Поток для чтения
 * @returns {Promise<Buffer>} - Промис с данными в виде Buffer
 */
function streamToString(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

/**
 * Получает расширение файла из имени или пути
 * @param {string} fileName - Имя или путь файла
 * @returns {string} - Расширение файла с точкой (например, ".jpg")
 */
function getFileExtension(fileName) {
  if (!fileName || typeof fileName !== "string") {
    return ".jpg";
  }
  return fileName.includes(".") ? "." + fileName.split(".").pop() : ".jpg";
}

/**
 * Убеждается, что директория существует, создает её если нужно
 * @param {string} dirPath - Путь к директории
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

module.exports = {
  streamToString,
  getFileExtension,
  ensureDirectoryExists,
};

