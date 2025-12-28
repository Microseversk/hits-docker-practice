let fs = require("fs");
let express = require("express");
let db = require("../db");
let router = express.Router();
let { v4: uuidv4 } = require("uuid");
const {
  streamToString,
  getFileExtension,
  ensureDirectoryExists,
} = require("../utils/fileUtils");

/* GET index page */
router.get("/", function (req, res, next) {
  db.connection.query(
    "SELECT * FROM data ORDER BY date DESC",
    function (err, rows, fields) {
      if (err) {
        console.error("Database error:", err);
        res.render("index", {
          title: "PhotoGallery",
          version: "0.1.0",
          images: [],
          error: "Error loading images",
        });
        return;
      }
      res.render("index", {
        title: "PhotoGallery",
        version: "0.1.0",
        images: rows || [],
      });
    }
  );
});

/* GET new image form page */
router.get("/new", function (req, res, next) {
  res.render("new", { title: "Upload New Image - PhotoGallery" });
});

/* POST new image */
router.post("/new", async function (req, res, next) {
  console.log("Request fields:", req.body);
  console.log("Request files:", Object.getOwnPropertyNames(req.files || {}));

  if (!req.files || !req.files["image"]) {
    res.status(400).send("image required");
    return;
  }

  try {
    // Получаем расширение файла из оригинального имени или пути
    const imageFile = req.files["image"];
    const originalName = imageFile.name || imageFile.path || "";
    const extension = getFileExtension(originalName);
    const fileName = uuidv4() + extension;

    // Убеждаемся, что директория существует
    const imagesDir = "./public/images";
    ensureDirectoryExists(imagesDir);

    const imageDataString = await streamToString(imageFile);
    fs.writeFileSync(imagesDir + "/" + fileName, imageDataString);

    // Используем параметризованные запросы для защиты от SQL-инъекций
    const name = req.body["name"] || "";
    const description = req.body["description"] || "";
    const author = req.body["author"] || "";

    db.connection.query(
      "INSERT INTO data (name, description, author, path) VALUES (?, ?, ?, ?)",
      [name, description, author, fileName],
      function (err, rows, fields) {
        if (err) {
          console.error("Database error:", err);
          res.status(500).send("Database error: " + err.message);
          return;
        }
        console.log("Image saved:", rows);
        res.status(200).send(fileName);
      }
    );
  } catch (err) {
    console.error("Error processing image:", err);
    res.status(500).send("Error: " + err.toString());
  }
});

/* GET all images */
router.get("/all", async function (req, res, next) {
  db.connection.query("SELECT * from data", function (err, rows, fields) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(rows);
    }
  });
});

module.exports = router;
