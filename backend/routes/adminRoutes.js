const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const adminController = require("../controllers/adminController");

// Apply admin protection to all admin routes
router.use(adminAuth);

// 1. Overview & Stats
router.get("/stats", adminController.getDashboardStats);

// 2. University Approvals
router.get("/universities", adminController.getUniversities);
router.patch("/universities/:id/status", adminController.updateUniversityStatus);
router.delete("/universities/:id", adminController.deleteUniversity);

// 3. Employer Verification
router.get("/employers", adminController.getEmployers);
router.patch("/employers/:id/status", adminController.updateEmployerStatus);
router.delete("/employers/:id", adminController.deleteEmployer);

// 4. Student Directory
router.get("/students", adminController.getStudents);
router.delete("/students/:id", adminController.deleteStudent);

// 5. System Audit Logs
router.get("/audit-logs", adminController.getAuditLogs);
router.post("/audit-logs/clear", adminController.clearAuditLogs);

// 6. Platform Settings
router.get("/settings", adminController.getPlatformSettings);
router.put("/settings", adminController.updatePlatformSettings);

module.exports = router;
