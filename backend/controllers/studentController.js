const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const Student = require("../models/Student");
const ProgressLog = require("../models/ProgressLog");
const Application = require("../models/Application");
const Job = require("../models/Job");
const { CV_UPLOAD_DIR, AVATAR_UPLOAD_DIR } = require("../middleware/upload");

// ============================================================
// 1. GET My Profile (student only — sees only their own data)
// ============================================================
exports.getMyProfile = async (req, res) => {
  try {
    // req.student is populated by studentAuth middleware
    const student = req.student;

    res.json({
      success: true,
      student: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        university: student.university,
        mainCategory: student.mainCategory,
        contactNumber: student.contactNumber,
        cvUrl: student.cvUrl,
        profilePicture: student.profilePicture || "",
        bio: student.bio,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
      },
    });
  } catch (err) {
    console.error("getMyProfile error:", err);
    res.status(500).json({ success: false, message: "Failed to load profile.", error: err.message });
  }
};

// ============================================================
// 2. UPDATE My Profile — accepts multipart/form-data.
//    Supports cvFile and profilePictureFile; text fields in req.body.
//    Students cannot change their own email or university.
// ============================================================
exports.updateMyProfile = async (req, res) => {
  try {
    const { fullName, contactNumber, bio, password, clearCv, clearProfilePicture } = req.body;
    const student = req.student;

    if (fullName && fullName.trim()) {
      student.fullName = fullName.trim();
    }
    if (contactNumber !== undefined) {
      student.contactNumber = contactNumber ? contactNumber.trim() : undefined;
    }
    if (bio !== undefined) {
      student.bio = bio ? bio.trim() : undefined;
    }

    const cvFile = req.files?.["cvFile"]?.[0] || (req.file?.fieldname === "cvFile" ? req.file : null);
    const avatarFile = req.files?.["profilePictureFile"]?.[0] || (req.file?.fieldname === "profilePictureFile" ? req.file : null);

    // ── CV file handling ──────────────────────────────────────────────────
    if (cvFile) {
      if (student.cvUrl && student.cvUrl.startsWith("/uploads/cv/")) {
        const oldFilePath = path.join(CV_UPLOAD_DIR, path.basename(student.cvUrl));
        if (fs.existsSync(oldFilePath)) try { fs.unlinkSync(oldFilePath); } catch {}
      }
      student.cvUrl = `/uploads/cv/${cvFile.filename}`;
    } else if (clearCv === "true") {
      if (student.cvUrl && student.cvUrl.startsWith("/uploads/cv/")) {
        const oldFilePath = path.join(CV_UPLOAD_DIR, path.basename(student.cvUrl));
        if (fs.existsSync(oldFilePath)) try { fs.unlinkSync(oldFilePath); } catch {}
      }
      student.cvUrl = undefined;
    }

    // ── Profile Picture handling ──────────────────────────────────────────
    if (avatarFile) {
      if (student.profilePicture && student.profilePicture.startsWith("/uploads/avatars/")) {
        const oldAvatarPath = path.join(AVATAR_UPLOAD_DIR, path.basename(student.profilePicture));
        if (fs.existsSync(oldAvatarPath)) try { fs.unlinkSync(oldAvatarPath); } catch {}
      }
      student.profilePicture = `/uploads/avatars/${avatarFile.filename}`;
    } else if (clearProfilePicture === "true") {
      if (student.profilePicture && student.profilePicture.startsWith("/uploads/avatars/")) {
        const oldAvatarPath = path.join(AVATAR_UPLOAD_DIR, path.basename(student.profilePicture));
        if (fs.existsSync(oldAvatarPath)) try { fs.unlinkSync(oldAvatarPath); } catch {}
      }
      student.profilePicture = "";
    }

    // Allow password change with proper hashing
    if (password && password.trim()) {
      if (password.trim().length < 6) {
        if (cvFile) {
          const newFilePath = path.join(CV_UPLOAD_DIR, cvFile.filename);
          if (fs.existsSync(newFilePath)) try { fs.unlinkSync(newFilePath); } catch {}
        }
        if (avatarFile) {
          const newAvatarPath = path.join(AVATAR_UPLOAD_DIR, avatarFile.filename);
          if (fs.existsSync(newAvatarPath)) try { fs.unlinkSync(newAvatarPath); } catch {}
        }
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters long.",
        });
      }
      const salt = await bcrypt.genSalt(10);
      student.password = await bcrypt.hash(password.trim(), salt);
    }

    await student.save();

    res.json({
      success: true,
      message: "Profile updated successfully.",
      student: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        university: student.university,
        mainCategory: student.mainCategory,
        contactNumber: student.contactNumber,
        cvUrl: student.cvUrl,
        profilePicture: student.profilePicture || "",
        bio: student.bio,
        updatedAt: student.updatedAt,
      },
    });
  } catch (err) {
    console.error("updateMyProfile error:", err);
    res.status(500).json({ success: false, message: "Failed to update profile.", error: err.message });
  }
};

// ============================================================
// 3. ADD Progress Log Entry
// ============================================================
exports.addProgressLog = async (req, res) => {
  try {
    const { date, description } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required for a progress log entry." });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: "Description cannot be empty." });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid date format. Please use YYYY-MM-DD." });
    }

    const log = await ProgressLog.create({
      student: req.student._id,
      date: parsedDate,
      description: description.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Progress log entry added successfully.",
      log,
    });
  } catch (err) {
    console.error("addProgressLog error:", err);
    res.status(500).json({ success: false, message: "Failed to add progress log.", error: err.message });
  }
};

// ============================================================
// 4. GET My Progress Logs (chronological order, oldest first)
// ============================================================
exports.getMyProgressLogs = async (req, res) => {
  try {
    const logs = await ProgressLog.find({ student: req.student._id }).sort({ date: 1 });

    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    console.error("getMyProgressLogs error:", err);
    res.status(500).json({ success: false, message: "Failed to load progress logs.", error: err.message });
  }
};

// ============================================================
// 5. DELETE Progress Log Entry (own entry only)
// ============================================================
exports.deleteProgressLog = async (req, res) => {
  try {
    const log = await ProgressLog.findOneAndDelete({
      _id: req.params.logId,
      student: req.student._id,
    });

    if (!log) {
      return res.status(404).json({ success: false, message: "Progress log entry not found or unauthorized." });
    }

    res.json({ success: true, message: "Progress log entry deleted." });
  } catch (err) {
    console.error("deleteProgressLog error:", err);
    res.status(500).json({ success: false, message: "Failed to delete progress log.", error: err.message });
  }
};

// ============================================================
// 6. APPLY for a Job Vacancy
// ============================================================
exports.applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Confirm job exists and is available
    const job = await Job.findById(jobId).populate("employer", "companyName email status");
    if (!job) {
      return res.status(404).json({ success: false, message: "Internship vacancy not found." });
    }
    if (!job.availability) {
      return res.status(400).json({ success: false, message: "This internship vacancy is no longer accepting applications." });
    }

    // A student who already holds an active internship cannot apply elsewhere
    const hired = await Application.exists({ student: req.student._id, status: "accepted" });
    if (hired) {
      return res.status(409).json({
        success: false,
        message: "You already have an active internship, so you can't apply for other vacancies.",
      });
    }

    // Check for duplicate application (unique index on job+student also guards this)
    const existing = await Application.findOne({ job: jobId, student: req.student._id });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this internship vacancy.",
      });
    }

    const application = await Application.create({
      job: jobId,
      student: req.student._id,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: `Application submitted successfully for "${job.title}". Status: Pending review.`,
      application: {
        id: application._id,
        job: {
          id: job._id,
          title: job.title,
          company: job.employer?.companyName,
        },
        status: application.status,
        appliedAt: application.createdAt,
      },
    });
  } catch (err) {
    // Handle duplicate key error from MongoDB unique index
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this internship vacancy.",
      });
    }
    console.error("applyForJob error:", err);
    res.status(500).json({ success: false, message: "Failed to submit application.", error: err.message });
  }
};

// ============================================================
// 7. GET My Applications (with full job details)
// ============================================================
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.student._id })
      .populate({
        path: "job",
        select: "title category type workplaceType location duration stipend availability status employer",
        populate: {
          path: "employer",
          select: "companyName email address companyCategory websiteUrl",
        },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (err) {
    console.error("getMyApplications error:", err);
    res.status(500).json({ success: false, message: "Failed to load applications.", error: err.message });
  }
};

// ============================================================
// 8. WITHDRAW (delete) Application — only if still pending
// ============================================================
exports.withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.appId,
      student: req.student._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found or unauthorized." });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw an application that has already been ${application.status}.`,
      });
    }

    await application.deleteOne();

    res.json({ success: true, message: "Application withdrawn successfully." });
  } catch (err) {
    console.error("withdrawApplication error:", err);
    res.status(500).json({ success: false, message: "Failed to withdraw application.", error: err.message });
  }
};

// ============================================================
// 9. GET Progress Logs for a specific student (read-only)
//    Accessible by the student's university head, assigned
//    academic supervisors, and approved employers.
// ============================================================
exports.getStudentProgressLogs = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Caller must be authenticated (auth middleware already verified JWT)
    const callerRole = req.user?.role;
    const allowedRoles = ["university", "supervisor", "employer", "admin"];

    if (!allowedRoles.includes(callerRole)) {
      return res.status(403).json({
        success: false,
        message: "Access restricted. Only university heads, supervisors, and approved employers may view student progress logs.",
      });
    }

    const student = await Student.findById(studentId).select("fullName email university mainCategory").populate("university", "universityName profilePicture");
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    const logs = await ProgressLog.find({ student: studentId }).sort({ date: 1 });

    res.json({
      success: true,
      student: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        university: student.university,
        mainCategory: student.mainCategory,
      },
      count: logs.length,
      logs,
    });
  } catch (err) {
    console.error("getStudentProgressLogs error:", err);
    res.status(500).json({ success: false, message: "Failed to load student progress logs.", error: err.message });
  }
};
