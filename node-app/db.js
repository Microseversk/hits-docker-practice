const mysql = require("mysql2");
const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "mysql",
  password: process.env.DB_PASSWORD || "mysql",
  database: process.env.DB_NAME || "db",
});

module.exports = { connection };
