const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'content_broadcasting',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 20,
});

pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL Connected!');
    conn.release();
  })
  .catch(err => console.error('❌ DB Connection failed:', err.message));

module.exports = pool;
