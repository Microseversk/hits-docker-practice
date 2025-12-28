const autocannon = require("autocannon");
const Table = require("cli-table3");

/**
 * Нагрузочное тестирование приложения
 */
class LoadTester {
  constructor(baseUrl = "http://localhost:3000") {
    this.baseUrl = baseUrl;
    this.results = [];
  }

  /**
   * Форматирует результаты теста в таблицу
   */
  formatResults(results) {
    const table = new Table({
      head: ["Метрика", "Значение"],
      colWidths: [30, 20],
    });

    table.push(
      ["Requests/sec (RPS)", results.requests.average.toFixed(2)],
      ["Latency (avg)", `${results.latency.average.toFixed(2)} ms`],
      ["Latency (min)", `${results.latency.min.toFixed(2)} ms`],
      ["Latency (max)", `${results.latency.max.toFixed(2)} ms`],
      ["Latency (p99)", `${results.latency.p99.toFixed(2)} ms`],
      ["Throughput", `${(results.throughput.average / 1024).toFixed(2)} KB/s`],
      ["Total Requests", results.requests.total],
      ["Total Duration", `${(results.duration / 1000).toFixed(2)}s`],
      ["Errors", results.errors],
      ["Error Rate", `${((results.errors / results.requests.total) * 100).toFixed(2)}%`],
      ["Timeouts", results.timeouts],
      ["2xx Responses", results["2xx"]],
      ["4xx Responses", results["4xx"]],
      ["5xx Responses", results["5xx"]]
    );

    return table.toString();
  }

  /**
   * Запускает нагрузочный тест
   */
  async runTest(name, options) {
    console.log(`\n🚀 Запуск теста: ${name}`);
    console.log(`   URL: ${options.url}`);
    console.log(`   Connections: ${options.connections}, Duration: ${options.duration}s\n`);

    try {
      const result = await autocannon({
        ...options,
        url: options.url,
      });

      const formatted = this.formatResults(result);
      console.log(formatted);

      this.results.push({
        name,
        ...result,
      });

      return result;
    } catch (error) {
      console.error(`❌ Ошибка при выполнении теста ${name}:`, error.message);
      throw error;
    }
  }

  /**
   * Генерирует итоговый отчет
   */
  generateReport() {
    console.log("\n" + "=".repeat(60));
    console.log("📊 ИТОГОВЫЙ ОТЧЕТ ПО НАГРУЗОЧНОМУ ТЕСТИРОВАНИЮ");
    console.log("=".repeat(60));

    const summaryTable = new Table({
      head: ["Тест", "RPS", "Latency (avg)", "Error Rate", "Status"],
      colWidths: [20, 12, 15, 12, 10],
    });

    this.results.forEach((result) => {
      const errorRate = ((result.errors / result.requests.total) * 100).toFixed(2);
      const status = result.errors === 0 ? "✅ PASS" : "⚠️ WARN";
      
      summaryTable.push([
        result.name,
        result.requests.average.toFixed(2),
        `${result.latency.average.toFixed(2)} ms`,
        `${errorRate}%`,
        status,
      ]);
    });

    console.log(summaryTable.toString());
  }
}

// Основная функция
async function main() {
  const tester = new LoadTester();
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";

  console.log("=".repeat(60));
  console.log("🔥 НАГРУЗОЧНОЕ ТЕСТИРОВАНИЕ PHOTOGALLERY");
  console.log("=".repeat(60));
  console.log(`Base URL: ${baseUrl}\n`);

  // Тест 1: GET / - Главная страница (низкая нагрузка)
  await tester.runTest("GET / (Low Load)", {
    url: `${baseUrl}/`,
    connections: 10,
    duration: 10,
    pipelining: 1,
  });

  // Тест 2: GET / - Главная страница (средняя нагрузка)
  await tester.runTest("GET / (Medium Load)", {
    url: `${baseUrl}/`,
    connections: 50,
    duration: 30,
    pipelining: 1,
  });

  // Тест 3: GET / - Главная страница (высокая нагрузка)
  await tester.runTest("GET / (High Load)", {
    url: `${baseUrl}/`,
    connections: 100,
    duration: 60,
    pipelining: 1,
  });

  // Тест 4: GET /all - API endpoint (низкая нагрузка)
  await tester.runTest("GET /all (Low Load)", {
    url: `${baseUrl}/all`,
    connections: 10,
    duration: 10,
    pipelining: 1,
  });

  // Тест 5: GET /all - API endpoint (высокая нагрузка)
  await tester.runTest("GET /all (High Load)", {
    url: `${baseUrl}/all`,
    connections: 100,
    duration: 60,
    pipelining: 1,
  });

  // Тест 6: GET /new - Форма загрузки
  await tester.runTest("GET /new", {
    url: `${baseUrl}/new`,
    connections: 20,
    duration: 15,
    pipelining: 1,
  });

  // Генерация итогового отчета
  tester.generateReport();
}

// Запуск тестов
if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

module.exports = { LoadTester };

