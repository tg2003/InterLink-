const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const studentAuth = require("../middleware/studentAuth");
const authMiddleware = require("../middleware/auth");
const { handleCvUpload } = require("../middleware/upload");

// ─── Student-only Protected Routes (require valid student JWT) ──────────────

// Profile
router.get("/profile", studentAuth, studentController.getMyProfile);
// handleCvUpload parses multipart/form-data and attaches req.file for the PDF
router.put("/profile", studentAuth, handleCvUpload, studentController.updateMyProfile);

// Progress Logs
router.post("/progress-logs", studentAuth, studentController.addProgressLog);
router.get("/progress-logs", studentAuth, studentController.getMyProgressLogs);
router.delete("/progress-logs/:logId", studentAuth, studentController.deleteProgressLog);

// Job Applications
router.post("/apply/:jobId", studentAuth, studentController.applyForJob);
router.get("/applications", studentAuth, studentController.getMyApplications);
router.delete("/applications/:appId", studentAuth, studentController.withdrawApplication);

// ─── Shared Read-only Route (accessible by university, supervisor, employer, admin) ──
// Reads a student's progress logs by studentId for authorized viewers
router.get("/:studentId/progress-logs", authMiddleware, studentController.getStudentProgressLogs);

module.exports = router;
