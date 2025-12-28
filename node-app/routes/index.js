const fs = require("fs");
const express = require("express");
const db = require("../db");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const config = require("../config");
const {
  streamToString,
  getFileExtension,
  ensureDirectoryExists,
} = require("../utils/fileUtils");

/**
 * GET / - Главная страница с галереей изображений
 */
router.get("/", async (req, res, next) => {
  try {
    const { results: images } = await db.query(
      "SELECT * FROM data ORDER BY date DESC"
    );
    res.render("index", {
      title: config.app.title,
      version: config.app.version,
      images: images || [],
    });
  } catch (err) {
    console.error("Database error:", err);
    res.render("index", {
      title: config.app.title,
      version: config.app.version,
      images: [],
      error: "Error loading images",
    });
  }
});

/**
 * GET /new - Страница формы загрузки изображения
 */
router.get("/new", (req, res, next) => {
  res.render("new", {
    title: `Upload New Image - ${config.app.title}`,
    maxFileSize: config.upload.maxFileSize,
  });
});

/**
 * POST /new - Загрузка нового изображения
 * Валидация:
 * - Проверка наличия файла
 * - Проверка размера файла
 * - Проверка типа файла
 */
router.post("/new", async (req, res, next) => {
  try {
    // Валидация: проверка наличия файла
    if (!req.files || !req.files["image"]) {
      return res.status(400).json({ error: "image required" });
    }

    const imageFile = req.files["image"];

    // Валидация: проверка размера файла
    const fileSize = imageFile.size || 0;
    if (fileSize > config.upload.maxFileSize) {
      return res.status(400).json({
        error: `File size exceeds maximum allowed size of ${
          config.upload.maxFileSize / 1024 / 1024
        }MB`,
      });
    }

    // Валидация: проверка типа файла
    const mimeType = imageFile.type || "";
    if (!config.upload.allowedMimeTypes.includes(mimeType)) {
      return res.status(400).json({
        error: "Invalid file type. Allowed types: JPEG, PNG, GIF, WebP",
      });
    }

    // Получаем расширение файла
    const originalName = imageFile.name || imageFile.path || "";
    const extension = getFileExtension(originalName);
    const fileName = uuidv4() + extension;

    // Убеждаемся, что директория существует
    ensureDirectoryExists(config.upload.uploadDir);

    // Сохраняем файл
    const imageData = await streamToString(imageFile);
    const filePath = path.join(config.upload.uploadDir, fileName);
    fs.writeFileSync(filePath, imageData);

    // Сохраняем метаданные в БД
    const name = (req.body["name"] || "").trim();
    const description = (req.body["description"] || "").trim();
    const author = (req.body["author"] || "").trim();

    await db.query(
      "INSERT INTO data (name, description, author, path) VALUES (?, ?, ?, ?)",
      [name, description, author, fileName]
    );

    res.status(200).json({
      success: true,
      fileName: fileName,
      message: "Image uploaded successfully",
    });
  } catch (err) {
    console.error("Error processing image:", err);
    res.status(500).json({
      error: "Internal server error",
      message: config.server.env === "development" ? err.message : undefined,
    });
  }
});

/**
 * GET /all - API endpoint для получения всех изображений в формате JSON
 */
router.get("/all", async (req, res, next) => {
  try {
    const { results: images } = await db.query(
      "SELECT * FROM data ORDER BY date DESC"
    );
    res.json(images || []);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({
      error: "Failed to fetch images",
      message: config.server.env === "development" ? err.message : undefined,
    });
  }
});

module.exports = router;
