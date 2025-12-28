const {
  streamToString,
  getFileExtension,
  ensureDirectoryExists,
} = require("../../utils/fileUtils");
const { Readable } = require("stream");
const fs = require("fs");

describe("fileUtils", () => {
  describe("streamToString", () => {
    test("должен преобразовать поток в Buffer", async () => {
      const testData = Buffer.from("test data");
      const stream = Readable.from([testData]);

      const result = await streamToString(stream);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toBe("test data");
    });

    test("должен обработать пустой поток", async () => {
      const stream = Readable.from([]);

      const result = await streamToString(stream);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBe(0);
    });

    test("должен обработать большой поток данных", async () => {
      const chunks = [];
      for (let i = 0; i < 100; i++) {
        chunks.push(Buffer.from(`chunk ${i} `));
      }
      const stream = Readable.from(chunks);

      const result = await streamToString(stream);

      expect(result.length).toBeGreaterThan(0);
      expect(result.toString()).toContain("chunk 0");
      expect(result.toString()).toContain("chunk 99");
    });

    test("должен отклонить промис при ошибке потока", async () => {
      const error = new Error("Stream error");
      const stream = new Readable({
        read() {
          this.emit("error", error);
        },
      });

      await expect(streamToString(stream)).rejects.toThrow("Stream error");
    });
  });

  describe("getFileExtension", () => {
    test("должен извлечь расширение из имени файла", () => {
      expect(getFileExtension("image.jpg")).toBe(".jpg");
      expect(getFileExtension("photo.png")).toBe(".png");
      expect(getFileExtension("document.pdf")).toBe(".pdf");
    });

    test("должен извлечь расширение из пути", () => {
      expect(getFileExtension("/path/to/image.jpg")).toBe(".jpg");
      expect(getFileExtension("C:\\path\\to\\photo.png")).toBe(".png");
    });

    test("должен вернуть .jpg для файла без расширения", () => {
      expect(getFileExtension("image")).toBe(".jpg");
      expect(getFileExtension("file")).toBe(".jpg");
    });

    test("должен вернуть .jpg для пустой строки", () => {
      expect(getFileExtension("")).toBe(".jpg");
    });

    test("должен вернуть .jpg для null или undefined", () => {
      expect(getFileExtension(null)).toBe(".jpg");
      expect(getFileExtension(undefined)).toBe(".jpg");
    });

    test("должен обработать файл с несколькими точками", () => {
      expect(getFileExtension("image.backup.jpg")).toBe(".jpg");
      expect(getFileExtension("file.name.ext")).toBe(".ext");
    });
  });

  describe("ensureDirectoryExists", () => {
    const testDir = "./test-temp-dir";

    afterEach(() => {
      // Очистка после тестов
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    });

    test("должен создать директорию, если её нет", () => {
      expect(fs.existsSync(testDir)).toBe(false);

      ensureDirectoryExists(testDir);

      expect(fs.existsSync(testDir)).toBe(true);
    });

    test("не должен выбрасывать ошибку, если директория уже существует", () => {
      fs.mkdirSync(testDir, { recursive: true });
      expect(fs.existsSync(testDir)).toBe(true);

      expect(() => ensureDirectoryExists(testDir)).not.toThrow();
      expect(fs.existsSync(testDir)).toBe(true);
    });

    test("должен создать вложенные директории", () => {
      const nestedDir = `${testDir}/nested/deep`;

      ensureDirectoryExists(nestedDir);

      expect(fs.existsSync(nestedDir)).toBe(true);
    });
  });
});

