const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

// Public routes
router.get("/universities", authController.getApprovedUniversities);
router.post("/register/student", authController.registerStudent);
router.post("/register/university", authController.registerUniversity);
router.post("/register/employer", authController.registerEmployer);
router.post("/register/supervisor", authController.registerSupervisor);

// General register route that routes by role
router.post("/register", (req, res, next) => {
  const role = req.body.role ? req.body.role.toLowerCase() : "";
  if (role === "student" || role === "intern") {
    return authController.registerStudent(req, res, next);
  } else if (role === "university") {
    return authController.registerUniversity(req, res, next);
  } else if (role === "employer") {
    return authController.registerEmployer(req, res, next);
  } else if (role === "supervisor") {
    return authController.registerSupervisor(req, res, next);
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid or missing role for registration. Supported roles: student, university, employer, supervisor.",
    });
  }
});

// Single unified login
router.post("/login", authController.login);

// Protected profile route
router.get("/me", authMiddleware, authController.getCurrentUser);

module.exports = router;
