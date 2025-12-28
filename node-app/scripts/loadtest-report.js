const { LoadTester } = require("./loadtest");
const fs = require("fs");
const path = require("path");

/**
 * Генерирует HTML отчет по результатам нагрузочного тестирования
 */
async function generateHTMLReport() {
  const tester = new LoadTester();
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";

  console.log("Генерация отчета...\n");

  // Запускаем основные тесты
  await tester.runTest("GET / (Low)", {
    url: `${baseUrl}/`,
    connections: 10,
    duration: 10,
  });

  await tester.runTest("GET /all (Low)", {
    url: `${baseUrl}/all`,
    connections: 10,
    duration: 10,
  });

  await tester.runTest("GET /new", {
    url: `${baseUrl}/new`,
    connections: 10,
    duration: 10,
  });

  // Генерируем HTML
  const html = generateHTML(tester.results);
  
  const reportPath = path.join(__dirname, "../loadtest-report.html");
  fs.writeFileSync(reportPath, html);
  
  console.log(`\n✅ Отчет сохранен: ${reportPath}`);
}

function generateHTML(results) {
  const rows = results.map((r) => {
    const errorRate = ((r.errors / r.requests.total) * 100).toFixed(2);
    return `
      <tr>
        <td>${r.name}</td>
        <td>${r.requests.average.toFixed(2)}</td>
        <td>${r.latency.average.toFixed(2)} ms</td>
        <td>${r.latency.min.toFixed(2)} ms</td>
        <td>${r.latency.max.toFixed(2)} ms</td>
        <td>${r.latency.p99.toFixed(2)} ms</td>
        <td>${r.requests.total}</td>
        <td>${r.errors}</td>
        <td>${errorRate}%</td>
        <td>${r.errors === 0 ? "✅ PASS" : "❌ FAIL"}</td>
      </tr>
    `;
  }).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Load Test Report - PhotoGallery</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #4CAF50; color: white; }
    tr:hover { background-color: #f5f5f5; }
    .pass { color: green; }
    .fail { color: red; }
    .summary { background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Отчет по нагрузочному тестированию</h1>
    <p><strong>Дата:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Приложение:</strong> PhotoGallery v0.1.0</p>
    
    <div class="summary">
      <h2>Сводка</h2>
      <p><strong>Всего тестов:</strong> ${results.length}</p>
      <p><strong>Успешных:</strong> ${results.filter(r => r.errors === 0).length}</p>
      <p><strong>С ошибками:</strong> ${results.filter(r => r.errors > 0).length}</p>
    </div>

    <h2>Детальные результаты</h2>
    <table>
      <thead>
        <tr>
          <th>Тест</th>
          <th>RPS</th>
          <th>Latency (avg)</th>
          <th>Latency (min)</th>
          <th>Latency (max)</th>
          <th>Latency (p99)</th>
          <th>Total Requests</th>
          <th>Errors</th>
          <th>Error Rate</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>
</body>
</html>`;
}

if (require.main === module) {
  generateHTMLReport().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

module.exports = { generateHTMLReport };


