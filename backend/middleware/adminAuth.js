const authMiddleware = require("./auth");

module.exports = function adminAuth(req, res, next) {
  authMiddleware(req, res, () => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access restricted. Super Administrator privileges required.",
      });
    }
    next();
  });
};
