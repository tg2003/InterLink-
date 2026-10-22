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

// Protected profile routes (Any authenticated user)
const { handleAvatarUpload } = require("../middleware/upload");

router.get("/me", authMiddleware, authController.getCurrentUser);
router.post("/profile-picture", authMiddleware, handleAvatarUpload, authController.uploadProfilePicture);
router.delete("/profile-picture", authMiddleware, authController.deleteProfilePicture);

// Employer Profile routes
router.get("/employer/profile", authMiddleware, authController.getEmployerProfile);
router.put("/employer/profile", authMiddleware, handleAvatarUpload, authController.updateEmployerProfile);

// Admin Profile routes
router.get("/admin/profile", authMiddleware, authController.getAdminProfile);
router.put("/admin/profile", authMiddleware, handleAvatarUpload, authController.updateAdminProfile);

module.exports = router;
