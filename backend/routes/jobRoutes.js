const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const authMiddleware = require("../middleware/auth");

// Public routes (Students and guests can browse vacancies)
router.get("/", jobController.getAllPublicJobs);
router.get("/detail/:id", jobController.getJobById);

// Protected routes (Employers)
router.post("/", authMiddleware, jobController.createJob);
router.get("/my-jobs", authMiddleware, jobController.getEmployerJobs);
router.get("/:id", authMiddleware, jobController.getJobById);
router.put("/:id", authMiddleware, jobController.updateJob);
router.patch("/:id/toggle-availability", authMiddleware, jobController.toggleJobAvailability);
router.delete("/:id", authMiddleware, jobController.deleteJob);

module.exports = router;
