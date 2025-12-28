const autocannon = require("autocannon");
const Table = require("cli-table3");

/**
 * Быстрое нагрузочное тестирование для проверки работоспособности
 */
async function quickLoadTest() {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";

  console.log("=".repeat(60));
  console.log("⚡ БЫСТРОЕ НАГРУЗОЧНОЕ ТЕСТИРОВАНИЕ");
  console.log("=".repeat(60));
  console.log(`Base URL: ${baseUrl}\n`);

  const tests = [
    {
      name: "GET / - Главная страница",
      url: `${baseUrl}/`,
      connections: 10,
      duration: 5,
    },
    {
      name: "GET /all - API endpoint",
      url: `${baseUrl}/all`,
      connections: 10,
      duration: 5,
    },
    {
      name: "GET /new - Форма загрузки",
      url: `${baseUrl}/new`,
      connections: 10,
      duration: 5,
    },
  ];

  const results = [];

  for (const test of tests) {
    console.log(`\n🚀 Тест: ${test.name}`);
    console.log(`   URL: ${test.url}`);
    console.log(`   Connections: ${test.connections}, Duration: ${test.duration}s\n`);

    try {
      const result = await autocannon({
        url: test.url,
        connections: test.connections,
        duration: test.duration,
      });

      const table = new Table({
        head: ["Метрика", "Значение"],
        colWidths: [30, 20],
      });

      table.push(
        ["Requests/sec (RPS)", result.requests.average.toFixed(2)],
        ["Latency (avg)", `${result.latency.average.toFixed(2)} ms`],
        ["Latency (p99)", `${result.latency.p99.toFixed(2)} ms`],
        ["Total Requests", result.requests.total],
        ["Errors", result.errors],
        ["Error Rate", `${((result.errors / result.requests.total) * 100).toFixed(2)}%`],
        ["2xx Responses", result["2xx"]],
        ["4xx Responses", result["4xx"]],
        ["5xx Responses", result["5xx"]]
      );

      console.log(table.toString());

      results.push({
        name: test.name,
        rps: result.requests.average,
        latency: result.latency.average,
        errors: result.errors,
        errorRate: (result.errors / result.requests.total) * 100,
      });
    } catch (error) {
      console.error(`❌ Ошибка: ${error.message}`);
    }

    // Пауза между тестами
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Итоговая таблица
  console.log("\n" + "=".repeat(60));
  console.log("📊 ИТОГОВЫЕ РЕЗУЛЬТАТЫ");
  console.log("=".repeat(60));

  const summaryTable = new Table({
    head: ["Тест", "RPS", "Latency (avg)", "Error Rate", "Status"],
    colWidths: [25, 12, 15, 12, 10],
  });

  results.forEach((r) => {
    const status = r.errors === 0 ? "✅ PASS" : "❌ FAIL";
    summaryTable.push([
      r.name,
      r.rps.toFixed(2),
      `${r.latency.toFixed(2)} ms`,
      `${r.errorRate.toFixed(2)}%`,
      status,
    ]);
  });

  console.log(summaryTable.toString());
}

if (require.main === module) {
  quickLoadTest().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

module.exports = { quickLoadTest };

