const request = require("supertest");
const express = require("express");
const path = require("path");
const fs = require("fs");
const os = require("os");
const formData = require("express-form-data");
const db = require("../../db");

// Мокаем модули
jest.mock("../../db", () => ({
  pool: {},
  query: jest.fn(),
  getConnection: jest.fn(),
  // Для обратной совместимости
  connection: {
    query: jest.fn(),
  },
}));

jest.mock("fs", () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  rmSync: jest.fn(),
}));

// Мокаем uuid
jest.mock("uuid", () => ({
  v4: jest.fn(() => "test-uuid-123"),
}));

const indexRouter = require("../../routes/index");

describe("Routes", () => {
  let app;
  let originalRender;

  beforeEach(() => {
    app = express();
    app.set("view engine", "pug");
    app.set("views", path.join(__dirname, "../../views"));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Настройка express-form-data как в app.js
    const options = {
      uploadDir: os.tmpdir(),
      autoClean: true,
    };
    app.use(formData.parse(options));
    app.use(formData.format());
    app.use(formData.stream());

    // Мокаем res.render перед подключением роутера
    originalRender = express.response.render;
    express.response.render = jest.fn(function (view, data, callback) {
      this.status(200);
      this.set("Content-Type", "text/html");
      this.send(
        `<html><body>${view} rendered with data: ${JSON.stringify(
          data || {}
        )}</body></html>`
      );
      if (callback) {
        callback(null, this);
      }
      return this;
    });

    app.use("/", indexRouter);

    // Сброс моков
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(true);
    fs.mkdirSync.mockImplementation(() => {});
  });

  afterEach(() => {
    // Восстанавливаем оригинальный render
    if (originalRender) {
      express.response.render = originalRender;
    }
  });

  describe("GET /", () => {
    test("должен вернуть страницу с изображениями", (done) => {
      const mockImages = [
        {
          id: 1,
          name: "Test Image",
          author: "Test Author",
          description: "Test Description",
          path: "test.jpg",
          date: new Date(),
        },
      ];

      db.query.mockResolvedValue({ results: mockImages, fields: [] });

      request(app)
        .get("/")
        .expect(200)
        .expect("Content-Type", /html/)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).toBe(200);
          done();
        });
    });

    test("должен обработать ошибку базы данных", (done) => {
      const dbError = new Error("Database connection failed");

      db.query.mockRejectedValue(dbError);

      request(app)
        .get("/")
        .expect(200)
        .expect("Content-Type", /html/)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).toBe(200);
          done();
        });
    });

    test("должен показать сообщение, если нет изображений", (done) => {
      db.connection.query.mockImplementation((query, callback) => {
        callback(null, []);
      });

      request(app)
        .get("/")
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).toBe(200);
          done();
        });
    });
  });

  describe("GET /new", () => {
    test("должен вернуть форму загрузки", (done) => {
      request(app)
        .get("/new")
        .expect(200)
        .expect("Content-Type", /html/)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).toBe(200);
          done();
        });
    });
  });

  describe("POST /new", () => {
    test("должен вернуть ошибку 400, если нет файла изображения", (done) => {
      request(app)
        .post("/new")
        .field("name", "Test")
        .field("author", "Author")
        .expect(400)
        .expect("Content-Type", /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).toHaveProperty("error", "image required");
          done();
        });
    });
  });

  describe("GET /all", () => {
    test("должен вернуть все изображения в JSON", (done) => {
      const mockImages = [
        {
          id: 1,
          name: "Image 1",
          path: "image1.jpg",
          date: new Date(),
        },
        {
          id: 2,
          name: "Image 2",
          path: "image2.jpg",
          date: new Date(),
        },
      ];

      db.query.mockResolvedValue({ results: mockImages, fields: [] });

      request(app)
        .get("/all")
        .expect(200)
        .expect("Content-Type", /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(2);
          expect(res.body[0]).toHaveProperty("name", "Image 1");
          done();
        });
    });

    test("должен обработать ошибку базы данных", (done) => {
      const dbError = new Error("Database error");

      db.query.mockRejectedValue(dbError);

      request(app).get("/all").expect(500).end(done);
    });
  });
});
