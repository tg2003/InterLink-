const authMiddleware = require("./auth");
const Supervisor = require("../models/Supervisor");

module.exports = function supervisorAuth(req, res, next) {
  authMiddleware(req, res, async () => {
    if (!req.user || req.user.role !== "supervisor") {
      return res.status(403).json({
        success: false,
        message: "Access restricted. Authorized Academic Supervisor credentials required.",
      });
    }

    try {
      const supervisor = await Supervisor.findById(req.user.id);
      if (!supervisor) {
        return res.status(404).json({
          success: false,
          message: "Supervisor profile not found.",
        });
      }
      req.supervisor = supervisor;
      next();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to verify supervisor account.",
        error: err.message,
      });
    }
  });
};
