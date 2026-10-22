const path = require("path");
const fs = require("fs");
const Supervisor = require("../models/Supervisor");
const Student = require("../models/Student");
const ProgressLog = require("../models/ProgressLog");
const University = require("../models/University");

// 1. Get Supervisor Account Status & Profile
exports.getStatusAndProfile = async (req, res) => {
  try {
    const supervisor = await Supervisor.findById(req.supervisor._id)
      .select("-password")
      .populate("university", "universityName headName headEmail contactNumber address status");

    if (!supervisor) {
      return res.status(404).json({
        success: false,
        message: "Supervisor profile not found.",
      });
    }

    return res.json({
      success: true,
      supervisor,
    });
  } catch (err) {
    console.error("Error fetching supervisor profile:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load supervisor profile.",
      error: err.message,
    });
  }
};

// 2. Submit / Re-submit Join Request to University Head (FR-04, US-02, UC-02)
exports.sendJoinRequest = async (req, res) => {
  try {
    const { universityId, staffRegNo, department, contactNumber } = req.body;
    const supervisor = req.supervisor;

    const targetUniversityId = universityId || supervisor.university;

    if (!targetUniversityId) {
      return res.status(400).json({
        success: false,
        message: "Please select an affiliated university.",
      });
    }

    // Verify university exists
    const university = await University.findById(targetUniversityId);
    if (!university) {
      return res.status(400).json({
        success: false,
        message: "Selected university not found.",
      });
    }

    supervisor.university = targetUniversityId;
    if (staffRegNo && staffRegNo.trim()) {
      supervisor.staffRegNo = staffRegNo.trim();
    }
    if (department !== undefined) {
      supervisor.department = department.trim();
    }
    if (contactNumber !== undefined) {
      supervisor.contactNumber = contactNumber.trim();
    }

    // Set join request to pending
    supervisor.joinStatus = "pending";
    supervisor.reviewNotes = ""; // Clear any previous rejection notes

    await supervisor.save();

    const populatedSupervisor = await Supervisor.findById(supervisor._id)
      .select("-password")
      .populate("university", "universityName headName headEmail contactNumber address");

    return res.json({
      success: true,
      message: "Join request submitted successfully. The University Head will review your credentials.",
      supervisor: populatedSupervisor,
    });
  } catch (err) {
    console.error("Error sending join request:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to submit join request.",
      error: err.message,
    });
  }
};

// 3. Get Supervisor Dashboard Overview Statistics (US-02, US-03, FR-16)
exports.getStats = async (req, res) => {
  try {
    const supervisor = req.supervisor;

    if (supervisor.joinStatus !== "approved") {
      return res.json({
        success: true,
        isApproved: false,
        joinStatus: supervisor.joinStatus,
        reviewNotes: supervisor.reviewNotes || "",
        stats: {
          totalStudents: 0,
          totalProgressLogs: 0,
          activeLoggers: 0,
          categoriesCount: 0,
        },
        categoryBreakdown: [],
        recentLogs: [],
      });
    }

    const universityId = supervisor.university;

    // Enrolled students under supervisor's university (FR-16)
    const students = await Student.find({ university: universityId }).select("_id mainCategory");
    const totalStudents = students.length;
    const studentIds = students.map((s) => s._id);

    // Progress logs from this university's students
    const totalProgressLogs = await ProgressLog.countDocuments({
      student: { $in: studentIds },
    });

    // Unique active students with logs
    const activeStudentLoggers = await ProgressLog.distinct("student", {
      student: { $in: studentIds },
    });

    // Category breakdown
    const categoryMap = {};
    students.forEach((s) => {
      const cat = s.mainCategory || "General";
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });

    const categoryBreakdown = Object.keys(categoryMap).map((name) => ({
      name,
      count: categoryMap[name],
    }));

    // Recent 6 logs
    const recentLogs = await ProgressLog.find({ student: { $in: studentIds } })
      .populate("student", "fullName email mainCategory")
      .sort({ date: -1, createdAt: -1 })
      .limit(6);

    return res.json({
      success: true,
      isApproved: true,
      joinStatus: "approved",
      stats: {
        totalStudents,
        totalProgressLogs,
        activeLoggers: activeStudentLoggers.length,
        categoriesCount: categoryBreakdown.length,
      },
      categoryBreakdown,
      recentLogs,
    });
  } catch (err) {
    console.error("Error loading supervisor stats:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve supervisor statistics.",
      error: err.message,
    });
  }
};

// 4. Get Enrolled Students under Supervisor's University (PB-09, FR-16)
exports.getUniversityStudents = async (req, res) => {
  try {
    const supervisor = req.supervisor;

    if (supervisor.joinStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "University-level student access is restricted until your join request is approved by the University Head.",
        joinStatus: supervisor.joinStatus,
      });
    }

    const { category, search } = req.query;
    const universityId = supervisor.university;

    const query = { university: universityId };

    if (category && category !== "all") {
      query.mainCategory = category;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ fullName: regex }, { email: regex }, { contactNumber: regex }];
    }

    const students = await Student.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    // Aggregate progress log counts for each student
    const studentIds = students.map((s) => s._id);
    const logCounts = await ProgressLog.aggregate([
      { $match: { student: { $in: studentIds } } },
      { $group: { _id: "$student", count: { $sum: 1 }, latestDate: { $max: "$date" } } },
    ]);

    const countMap = {};
    logCounts.forEach((item) => {
      countMap[String(item._id)] = {
        count: item.count,
        latestDate: item.latestDate,
      };
    });

    const enrichedStudents = students.map((student) => {
      const obj = student.toObject();
      const meta = countMap[String(student._id)] || { count: 0, latestDate: null };
      obj.progressLogCount = meta.count;
      obj.lastProgressDate = meta.latestDate;
      return obj;
    });

    return res.json({
      success: true,
      count: enrichedStudents.length,
      students: enrichedStudents,
    });
  } catch (err) {
    console.error("Error fetching university students:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve student directory.",
      error: err.message,
    });
  }
};

// 5. Get Daily Progress Logs for an Individual Student (FR-09, US-05, FR-16)
exports.getStudentProgressLogs = async (req, res) => {
  try {
    const supervisor = req.supervisor;

    if (supervisor.joinStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Access restricted until your supervisor account is approved.",
      });
    }

    const { studentId } = req.params;
    const universityId = supervisor.university;

    // Verify student belongs strictly to supervisor's university (FR-16)
    const student = await Student.findOne({ _id: studentId, university: universityId }).select("-password");
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student record not found in your institution.",
      });
    }

    const progressLogs = await ProgressLog.find({ student: studentId })
      .sort({ date: -1, createdAt: -1 });

    return res.json({
      success: true,
      student: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        mainCategory: student.mainCategory,
        contactNumber: student.contactNumber,
        cvUrl: student.cvUrl,
        bio: student.bio,
      },
      count: progressLogs.length,
      progressLogs,
    });
  } catch (err) {
    console.error("Error fetching student progress:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve student progress logs.",
      error: err.message,
    });
  }
};

// 6. Get All University Student Progress Logs Feed (FR-09, FR-16)
exports.getAllProgressLogs = async (req, res) => {
  try {
    const supervisor = req.supervisor;

    if (supervisor.joinStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Access restricted until your supervisor account is approved.",
      });
    }

    const { search, category } = req.query;
    const universityId = supervisor.university;

    // Filter students by category if requested
    const studentQuery = { university: universityId };
    if (category && category !== "all") {
      studentQuery.mainCategory = category;
    }

    const students = await Student.find(studentQuery).select("_id fullName email mainCategory");
    const studentIds = students.map((s) => s._id);

    const logsQuery = { student: { $in: studentIds } };
    if (search && search.trim()) {
      logsQuery.description = { $regex: new RegExp(search.trim(), "i") };
    }

    const logs = await ProgressLog.find(logsQuery)
      .populate("student", "fullName email mainCategory")
      .sort({ date: -1, createdAt: -1 })
      .limit(100);

    return res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (err) {
    console.error("Error fetching university progress logs:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve daily progress logs feed.",
      error: err.message,
    });
  }
};

// 7. Update Supervisor Profile
exports.updateProfile = async (req, res) => {
  try {
    const supervisor = req.supervisor;
    const { fullName, department, staffRegNo, contactNumber, clearProfilePicture } = req.body;

    if (fullName && fullName.trim()) supervisor.fullName = fullName.trim();
    if (department !== undefined) supervisor.department = department.trim();
    if (staffRegNo && staffRegNo.trim()) supervisor.staffRegNo = staffRegNo.trim();
    if (contactNumber !== undefined) supervisor.contactNumber = contactNumber.trim();

    if (req.file) {
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      if (supervisor.profilePicture && supervisor.profilePicture.startsWith("/uploads/avatars/")) {
        const oldPath = path.join(__dirname, "..", "uploads", "avatars", path.basename(supervisor.profilePicture));
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch {}
        }
      }
      supervisor.profilePicture = avatarUrl;
    } else if (clearProfilePicture === "true") {
      if (supervisor.profilePicture && supervisor.profilePicture.startsWith("/uploads/avatars/")) {
        const oldPath = path.join(__dirname, "..", "uploads", "avatars", path.basename(supervisor.profilePicture));
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch {}
        }
      }
      supervisor.profilePicture = "";
    }

    await supervisor.save();

    const updated = await Supervisor.findById(supervisor._id)
      .select("-password")
      .populate("university", "universityName headName headEmail contactNumber address");

    return res.json({
      success: true,
      message: "Supervisor profile updated successfully.",
      supervisor: updated,
    });
  } catch (err) {
    console.error("Error updating supervisor profile:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
      error: err.message,
    });
  }
};
