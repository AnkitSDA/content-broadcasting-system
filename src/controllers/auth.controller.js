const authService = require('../services/auth.service');
const { sendSuccess, sendError, sendCreated } = require('../utils/response');

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return sendError(res, 'name, email, password, role are all required.', 400);
    }
    if (password.length < 6) return sendError(res, 'Password must be at least 6 characters.', 400);

    const user = await authService.register({ name, email, password, role });
    return sendCreated(res, user, 'User registered successfully.');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return sendError(res, 'Email and password are required.', 400);

    const result = await authService.login({ email, password });
    return sendSuccess(res, result, 'Login successful.');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

const getProfile = async (req, res) => {
  return sendSuccess(res, req.user, 'Profile fetched.');
};

module.exports = { register, login, getProfile };
