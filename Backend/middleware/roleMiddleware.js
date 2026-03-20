// Usage: authorizeRoles('admin') or authorizeRoles('admin', 'staff')
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Allowed roles: ${roles.join(', ')}`,
      });
    }
    next();
  };
};

module.exports = { authorizeRoles };
