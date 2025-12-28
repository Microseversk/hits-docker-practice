const { LoadTester } = require("./loadtest");

/**
 * Комплексное нагрузочное тестирование всех endpoints
 */
async function runComprehensiveTests() {
  const tester = new LoadTester();
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";

  console.log("=".repeat(60));
  console.log("🔥 КОМПЛЕКСНОЕ НАГРУЗОЧНОЕ ТЕСТИРОВАНИЕ");
  console.log("=".repeat(60));
  console.log(`Base URL: ${baseUrl}\n`);

  const testScenarios = [
    // Сценарий 1: Низкая нагрузка (обычная работа)
    {
      name: "Scenario 1: Low Load (Normal Usage)",
      tests: [
        {
          name: "GET /",
          options: {
            url: `${baseUrl}/`,
            connections: 10,
            duration: 10,
          },
        },
        {
          name: "GET /all",
          options: {
            url: `${baseUrl}/all`,
            connections: 10,
            duration: 10,
          },
        },
      ],
    },
    // Сценарий 2: Средняя нагрузка (пиковая нагрузка)
    {
      name: "Scenario 2: Medium Load (Peak Usage)",
      tests: [
        {
          name: "GET /",
          options: {
            url: `${baseUrl}/`,
            connections: 50,
            duration: 30,
          },
        },
        {
          name: "GET /all",
          options: {
            url: `${baseUrl}/all`,
            connections: 50,
            duration: 30,
          },
        },
      ],
    },
    // Сценарий 3: Высокая нагрузка (стресс-тест)
    {
      name: "Scenario 3: High Load (Stress Test)",
      tests: [
        {
          name: "GET /",
          options: {
            url: `${baseUrl}/`,
            connections: 100,
            duration: 60,
          },
        },
        {
          name: "GET /all",
          options: {
            url: `${baseUrl}/all`,
            connections: 100,
            duration: 60,
          },
        },
      ],
    },
    // Сценарий 4: Очень высокая нагрузка (предельный тест)
    {
      name: "Scenario 4: Very High Load (Limit Test)",
      tests: [
        {
          name: "GET /",
          options: {
            url: `${baseUrl}/`,
            connections: 200,
            duration: 60,
          },
        },
        {
          name: "GET /all",
          options: {
            url: `${baseUrl}/all`,
            connections: 200,
            duration: 60,
          },
        },
      ],
    },
  ];

  for (const scenario of testScenarios) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📋 ${scenario.name}`);
    console.log("=".repeat(60));

    for (const test of scenario.tests) {
      await tester.runTest(test.name, test.options);
      // Небольшая пауза между тестами
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // Генерация итогового отчета
  tester.generateReport();

  // Анализ результатов
  console.log("\n" + "=".repeat(60));
  console.log("📈 АНАЛИЗ РЕЗУЛЬТАТОВ");
  console.log("=".repeat(60));

  const avgRPS = tester.results.reduce(
    (sum, r) => sum + r.requests.average,
    0
  ) / tester.results.length;

  const avgLatency = tester.results.reduce(
    (sum, r) => sum + r.latency.average,
    0
  ) / tester.results.length;

  const totalErrors = tester.results.reduce((sum, r) => sum + r.errors, 0);
  const totalRequests = tester.results.reduce(
    (sum, r) => sum + r.requests.total,
    0
  );

  console.log(`\nСредний RPS: ${avgRPS.toFixed(2)}`);
  console.log(`Средняя задержка: ${avgLatency.toFixed(2)} ms`);
  console.log(`Общее количество ошибок: ${totalErrors}`);
  console.log(`Общее количество запросов: ${totalRequests}`);
  console.log(
    `Общий процент ошибок: ${((totalErrors / totalRequests) * 100).toFixed(2)}%`
  );

  // Рекомендации
  console.log("\n" + "=".repeat(60));
  console.log("💡 РЕКОМЕНДАЦИИ");
  console.log("=".repeat(60));

  if (avgLatency > 1000) {
    console.log("⚠️  Высокая задержка (>1000ms). Рекомендуется:");
    console.log("   - Оптимизация запросов к БД");
    console.log("   - Добавление кэширования");
    console.log("   - Масштабирование БД");
  }

  if (totalErrors > 0) {
    console.log("⚠️  Обнаружены ошибки. Рекомендуется:");
    console.log("   - Проверка логирования");
    console.log("   - Увеличение лимитов соединений БД");
    console.log("   - Мониторинг ресурсов сервера");
  }

  if (avgRPS < 50) {
    console.log("⚠️  Низкий RPS. Рекомендуется:");
    console.log("   - Оптимизация кода");
    console.log("   - Использование кластеризации Node.js");
    console.log("   - Горизонтальное масштабирование");
  }

  if (avgLatency < 100 && avgRPS > 100 && totalErrors === 0) {
    console.log("✅ Отличные показатели производительности!");
  }
}

if (require.main === module) {
  runComprehensiveTests().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}


