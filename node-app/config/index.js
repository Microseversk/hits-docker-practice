const path = require("path");

/**
 * Конфигурация приложения
 */
const config = {
  // Настройки сервера
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || "development",
  },

  // Настройки базы данных
  database: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "mysql",
    password: process.env.DB_PASSWORD || "mysql",
    database: process.env.DB_NAME || "db",
  },

  // Настройки загрузки файлов
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ],
    uploadDir: path.join(__dirname, "../public/images"),
  },

  // Настройки приложения
  app: {
    title: "PhotoGallery",
    version: "0.1.0",
  },
};

module.exports = config;

