const express = require("express");
const router = express.Router();
const supervisorController = require("../controllers/supervisorController");
const supervisorAuth = require("../middleware/supervisorAuth");

// All routes require authenticated Academic Supervisor session (NFR-02)
router.use(supervisorAuth);

// Account status and join-request workflows (US-02, FR-03, FR-04)
router.get("/status", supervisorController.getStatusAndProfile);
router.post("/join-request", supervisorController.sendJoinRequest);

// Statistics for approved supervisor's university (FR-16)
router.get("/stats", supervisorController.getStats);

// Enrolled students under supervisor's university only (PB-09, FR-16)
router.get("/students", supervisorController.getUniversityStudents);
router.get("/students/:studentId/progress", supervisorController.getStudentProgressLogs);

// Student daily progress logs feed (FR-09, US-05, FR-16)
router.get("/progress-logs", supervisorController.getAllProgressLogs);

// Profile management
const { handleAvatarUpload } = require("../middleware/upload");
router.get("/profile", supervisorController.getStatusAndProfile);
router.put("/profile", handleAvatarUpload, supervisorController.updateProfile);

module.exports = router;
