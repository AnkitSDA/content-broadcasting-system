const { sendError } = require('../utils/response');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return sendError(res, 'Authentication required.', 401);
    if (!roles.includes(req.user.role)) {
      return sendError(res, `Access denied. Only ${roles.join(' or ')} can do this.`, 403);
    }
    next();
  };
};

module.exports = { authorize };
