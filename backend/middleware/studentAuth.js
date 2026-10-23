const authMiddleware = require("./auth");
const Student = require("../models/Student");

/**
 * studentAuth - composed middleware:
 *  1. Verifies JWT (via existing auth.js)
 *  2. Confirms the token holder is a "student"
 *  3. Attaches the full Student document to req.student
 */
module.exports = function studentAuth(req, res, next) {
  authMiddleware(req, res, async () => {
    if (!req.user || req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Access restricted. Valid student credentials required.",
      });
    }

    try {
      const student = await Student.findById(req.user.id).populate(
        "university",
        "universityName headName headEmail contactNumber address"
      );
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found.",
        });
      }
      req.student = student;
      next();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to verify student account.",
        error: err.message,
      });
    }
  });
};
