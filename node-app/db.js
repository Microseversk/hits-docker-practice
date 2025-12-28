const mysql = require("mysql2");

/**
 * Создает пул соединений с базой данных MySQL
 * Использование пула более эффективно, чем одиночное соединение
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "mysql",
  password: process.env.DB_PASSWORD || "mysql",
  database: process.env.DB_NAME || "db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

/**
 * Выполняет SQL запрос с использованием промисов
 * @param {string} sql - SQL запрос
 * @param {Array} params - Параметры запроса
 * @returns {Promise} - Промис с результатом запроса
 */
function query(sql, params) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results, fields) => {
      if (err) {
        reject(err);
      } else {
        resolve({ results, fields });
      }
    });
  });
}

/**
 * Получает одно соединение из пула
 * @returns {Promise} - Промис с соединением
 */
function getConnection() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      } else {
        resolve(connection);
      }
    });
  });
}

module.exports = {
  pool,
  query,
  getConnection,
  // Для обратной совместимости
  connection: pool,
};
