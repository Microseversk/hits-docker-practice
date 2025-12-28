const autocannon = require("autocannon");

/**
 * Краткая сводка по нагрузочному тестированию
 */
async function generateSummary() {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";

  console.log("=".repeat(70));
  console.log("📊 КРАТКАЯ СВОДКА ПО НАГРУЗОЧНОМУ ТЕСТИРОВАНИЮ");
  console.log("=".repeat(70));
  console.log(`Base URL: ${baseUrl}\n`);

  const tests = [
    {
      name: "GET /",
      url: `${baseUrl}/`,
      connections: 50,
      duration: 15,
    },
    {
      name: "GET /all",
      url: `${baseUrl}/all`,
      connections: 50,
      duration: 15,
    },
    {
      name: "GET /new",
      url: `${baseUrl}/new`,
      connections: 20,
      duration: 10,
    },
  ];

  const summary = [];

  for (const test of tests) {
    console.log(`\n⏳ Тестирование: ${test.name}...`);
    
    try {
      const result = await autocannon({
        url: test.url,
        connections: test.connections,
        duration: test.duration,
      });

      const errorRate = ((result.errors / result.requests.total) * 100).toFixed(2);

      summary.push({
        endpoint: test.name,
        rps: result.requests.average,
        latency: result.latency.average,
        p99: result.latency.p99,
        errors: result.errors,
        errorRate: parseFloat(errorRate),
        totalRequests: result.requests.total,
      });

      console.log(`   ✅ RPS: ${result.requests.average.toFixed(2)}`);
      console.log(`   ✅ Latency: ${result.latency.average.toFixed(2)}ms`);
      console.log(`   ✅ Errors: ${result.errors} (${errorRate}%)`);
    } catch (error) {
      console.error(`   ❌ Ошибка: ${error.message}`);
    }
  }

  // Итоговая таблица
  console.log("\n" + "=".repeat(70));
  console.log("📈 ИТОГОВАЯ СВОДКА");
  console.log("=".repeat(70));
  console.log("\n┌─────────────┬──────────────┬───────────────┬─────────────┬──────────┐");
  console.log("│ Endpoint    │ RPS          │ Latency (avg) │ Error Rate  │ Status   │");
  console.log("├─────────────┼──────────────┼───────────────┼─────────────┼──────────┤");

  summary.forEach((s) => {
    const status = s.errors === 0 ? "✅ PASS" : "❌ FAIL";
    console.log(
      `│ ${s.endpoint.padEnd(11)} │ ${s.rps.toFixed(2).padStart(12)} │ ${s.latency.toFixed(2).padStart(13)} ms │ ${s.errorRate.toFixed(2).padStart(11)}% │ ${status.padEnd(8)} │`
    );
  });

  console.log("└─────────────┴──────────────┴───────────────┴─────────────┴──────────┘");

  // Анализ
  console.log("\n" + "=".repeat(70));
  console.log("💡 АНАЛИЗ");
  console.log("=".repeat(70));

  const avgRPS = summary.reduce((sum, s) => sum + s.rps, 0) / summary.length;
  const avgLatency = summary.reduce((sum, s) => sum + s.latency, 0) / summary.length;
  const totalErrors = summary.reduce((sum, s) => sum + s.errors, 0);

  console.log(`\nСредний RPS: ${avgRPS.toFixed(2)} req/s`);
  console.log(`Средняя задержка: ${avgLatency.toFixed(2)} ms`);
  console.log(`Общее количество ошибок: ${totalErrors}`);

  if (totalErrors === 0) {
    console.log("\n✅ Все тесты прошли успешно без ошибок!");
  }

  if (avgLatency < 100) {
    console.log("✅ Отличная производительность - низкая задержка");
  } else if (avgLatency < 500) {
    console.log("⚠️  Приемлемая производительность");
  } else {
    console.log("❌ Высокая задержка - требуется оптимизация");
  }

  if (avgRPS > 1000) {
    console.log("✅ Отличная пропускная способность");
  } else if (avgRPS > 100) {
    console.log("✅ Хорошая пропускная способность");
  } else {
    console.log("⚠️  Низкая пропускная способность - требуется оптимизация");
  }
}

if (require.main === module) {
  generateSummary().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

module.exports = { generateSummary };


