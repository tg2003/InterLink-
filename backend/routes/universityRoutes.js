const express = require("express");
const router = express.Router();
const universityController = require("../controllers/universityController");
const universityAuth = require("../middleware/universityAuth");

// Public route: Master list of universities (PB-21)
router.get("/master-list", universityController.getMasterList);

// Protected routes: University Head only (US-10, FR-16, NFR-02)
router.use(universityAuth);

router.get("/stats", universityController.getStats);
router.get("/supervisors", universityController.getSupervisors);
router.patch("/supervisors/:id/status", universityController.updateSupervisorStatus);
router.get("/students", universityController.getEnrolledStudents);
router.get("/students/:studentId/progress", universityController.getStudentProgressLogs);
router.get("/progress-logs", universityController.getAllProgressLogs);
router.get("/profile", universityController.getProfile);
router.put("/profile", universityController.updateProfile);

module.exports = router;
