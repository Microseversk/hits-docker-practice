const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

// Мокаем БД
jest.mock("../../db", () => ({
  connection: {
    query: jest.fn(),
  },
}));

describe("Routes Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /", () => {
    test("должен вернуть страницу", (done) => {
      const mockImages = [
        {
          id: 1,
          name: "Test Image",
          path: "test.jpg",
          date: new Date(),
        },
      ];

      db.connection.query.mockImplementation((query, callback) => {
        callback(null, mockImages);
      });

      request(app)
        .get("/")
        .expect(200)
        .end(done);
    });
  });

  describe("GET /new", () => {
    test("должен вернуть форму", (done) => {
      request(app)
        .get("/new")
        .expect(200)
        .end(done);
    });
  });

  describe("GET /all", () => {
    test("должен вернуть JSON с изображениями", (done) => {
      const mockImages = [{ id: 1, name: "Test", path: "test.jpg" }];

      db.connection.query.mockImplementation((query, callback) => {
        callback(null, mockImages);
      });

      request(app)
        .get("/all")
        .expect(200)
        .expect("Content-Type", /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(Array.isArray(res.body)).toBe(true);
          done();
        });
    });
  });
});

