const authMiddleware = require("./auth");

module.exports = function universityAuth(req, res, next) {
  authMiddleware(req, res, () => {
    if (!req.user || req.user.role !== "university") {
      return res.status(403).json({
        success: false,
        message: "Access restricted. Authorized University Head credentials required.",
      });
    }
    next();
  });
};
