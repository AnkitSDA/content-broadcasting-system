const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const register = async ({ name, email, password, role }) => {
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) throw { status: 400, message: 'Email already registered.' };

  if (!['principal', 'teacher'].includes(role)) {
    throw { status: 400, message: 'Invalid role. Must be principal or teacher.' };
  }

  const password_hash = await bcrypt.hash(password, 10);

  await pool.query(
    'INSERT INTO users (id, name, email, password_hash, role) VALUES (UUID(), ?, ?, ?, ?)',
    [name, email, password_hash, role]
  );

  const [rows] = await pool.query(
    'SELECT id, name, email, role, created_at FROM users WHERE email = ?',
    [email]
  );
  return rows[0];
};

const login = async ({ email, password }) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, password_hash, role FROM users WHERE email = ?',
    [email]
  );

  if (rows.length === 0) throw { status: 401, message: 'Invalid email or password.' };

  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw { status: 401, message: 'Invalid email or password.' };

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};

module.exports = { register, login };
