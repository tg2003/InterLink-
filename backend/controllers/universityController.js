const path = require("path");
const fs = require("fs");
const University = require("../models/University");
const Supervisor = require("../models/Supervisor");
const Student = require("../models/Student");
const ProgressLog = require("../models/ProgressLog");

// Predefined accredited Sri Lankan universities master list (PB-21)
const MASTER_UNIVERSITIES = [
  { id: "ruh", name: "University of Ruhuna", type: "State University", location: "Matara" },
  { id: "cmb", name: "University of Colombo", type: "State University", location: "Colombo" },
  { id: "mrt", name: "University of Moratuwa", type: "State University", location: "Moratuwa" },
  { id: "pdn", name: "University of Peradeniya", type: "State University", location: "Peradeniya" },
  { id: "sjp", name: "University of Sri Jayewardenepura", type: "State University", location: "Nugegoda" },
  { id: "kln", name: "University of Kelaniya", type: "State University", location: "Kelaniya" },
  { id: "jfn", name: "University of Jaffna", type: "State University", location: "Jaffna" },
  { id: "uwu", name: "Uva Wellassa University", type: "State University", location: "Badulla" },
  { id: "wyb", name: "Wayamba University of Sri Lanka", type: "State University", location: "Kuliyapitiya" },
  { id: "rjr", name: "Rajarata University of Sri Lanka", type: "State University", location: "Mihintale" },
  { id: "sab", name: "Sabaragamuwa University of Sri Lanka", type: "State University", location: "Belihuloya" },
  { id: "seu", name: "South Eastern University of Sri Lanka", type: "State University", location: "Oluvil" },
  { id: "eusl", name: "Eastern University, Sri Lanka", type: "State University", location: "Chenkalady" },
  { id: "ousl", name: "The Open University of Sri Lanka", type: "State University", location: "Nawala" },
  { id: "kdu", name: "General Sir John Kotelawala Defence University (KDU)", type: "State-Affiliated", location: "Ratmalana" },
  { id: "sliit", name: "Sri Lanka Institute of Information Technology (SLIIT)", type: "Recognized Degree Awarding", location: "Malabe" },
  { id: "nibm", name: "National Institute of Business Management (NIBM)", type: "State Institute", location: "Colombo" },
  { id: "iit", name: "Informatics Institute of Technology (IIT)", type: "Private Higher Education", location: "Colombo" },
  { id: "horizon", name: "Horizon Campus", type: "Recognized Degree Awarding", location: "Malabe" },
];

// 1. Get Static Master List of Universities (PB-21 / FR-01)
exports.getMasterList = (req, res) => {
  return res.json({
    success: true,
    count: MASTER_UNIVERSITIES.length,
    universities: MASTER_UNIVERSITIES,
  });
};

// 2. Get University Dashboard Overview Statistics (US-10)
exports.getStats = async (req, res) => {
  try {
    const universityId = req.user.id;

    const [
      totalStudents,
      approvedSupervisors,
      pendingSupervisors,
      rejectedSupervisors,
      studentsList,
    ] = await Promise.all([
      Student.countDocuments({ university: universityId }),
      Supervisor.countDocuments({ university: universityId, joinStatus: "approved" }),
      Supervisor.countDocuments({ university: universityId, joinStatus: "pending" }),
      Supervisor.countDocuments({ university: universityId, joinStatus: "rejected" }),
      Student.find({ university: universityId }).select("_id"),
    ]);

    const studentIds = studentsList.map((s) => s._id);

    const totalProgressLogs = await ProgressLog.countDocuments({
      student: { $in: studentIds },
    });

    // Recent 5 supervisor join requests
    const recentSupervisorRequests = await Supervisor.find({ university: universityId })
      .select("fullName email staffRegNo joinStatus department createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent 5 progress logs
    const recentLogs = await ProgressLog.find({ student: { $in: studentIds } })
      .populate("student", "fullName email mainCategory")
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    return res.json({
      success: true,
      stats: {
        totalStudents,
        totalSupervisors: approvedSupervisors + pendingSupervisors + rejectedSupervisors,
        approvedSupervisors,
        pendingSupervisors,
        rejectedSupervisors,
        totalProgressLogs,
      },
      recentSupervisorRequests,
      recentLogs,
    });
  } catch (err) {
    console.error("Error fetching university stats:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve institutional statistics.",
      error: err.message,
    });
  }
};

// 3. Get Supervisors under this University (FR-05, US-03, US-10, FR-16)
exports.getSupervisors = async (req, res) => {
  try {
    const universityId = req.user.id;
    const { status, search } = req.query;

    const query = { university: universityId };

    if (status && status !== "all") {
      query.joinStatus = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ fullName: regex }, { email: regex }, { staffRegNo: regex }, { department: regex }];
    }

    const supervisors = await Supervisor.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: supervisors.length,
      supervisors,
    });
  } catch (err) {
    console.error("Error fetching supervisors:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load supervisors.",
      error: err.message,
    });
  }
};

// 4. Update Supervisor Join Status - Approve or Reject (FR-05, US-03, UC-02)
exports.updateSupervisorStatus = async (req, res) => {
  try {
    const universityId = req.user.id;
    const { id } = req.params;
    const { status, reviewNotes } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'approved', 'rejected', or 'pending'.",
      });
    }

    // Verify supervisor belongs strictly to this university (FR-16)
    const supervisor = await Supervisor.findOne({ _id: id, university: universityId });
    if (!supervisor) {
      return res.status(404).json({
        success: false,
        message: "Supervisor record not found under your university.",
      });
    }

    supervisor.joinStatus = status;
    if (reviewNotes !== undefined) {
      supervisor.reviewNotes = reviewNotes.trim();
    }
    await supervisor.save();

    return res.json({
      success: true,
      message: `Supervisor join request has been ${status}.`,
      supervisor: {
        id: supervisor._id,
        fullName: supervisor.fullName,
        email: supervisor.email,
        staffRegNo: supervisor.staffRegNo,
        joinStatus: supervisor.joinStatus,
        reviewNotes: supervisor.reviewNotes,
      },
    });
  } catch (err) {
    console.error("Error updating supervisor status:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update supervisor status.",
      error: err.message,
    });
  }
};

// 5. Get Enrolled Students under this University (PB-05, US-10, FR-16)
exports.getEnrolledStudents = async (req, res) => {
  try {
    const universityId = req.user.id;
    const { category, search } = req.query;

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

    // Attach progress log counts for each student
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
      const studentObj = student.toObject();
      const meta = countMap[String(student._id)] || { count: 0, latestDate: null };
      studentObj.progressLogCount = meta.count;
      studentObj.lastProgressDate = meta.latestDate;
      return studentObj;
    });

    return res.json({
      success: true,
      count: enrichedStudents.length,
      students: enrichedStudents,
    });
  } catch (err) {
    console.error("Error fetching enrolled students:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve student directory.",
      error: err.message,
    });
  }
};

// 6. Get Daily Progress Logs for a Specific Student (FR-09, US-10)
exports.getStudentProgressLogs = async (req, res) => {
  try {
    const universityId = req.user.id;
    const { studentId } = req.params;

    // Verify student belongs to this university (FR-16)
    const student = await Student.findOne({ _id: studentId, university: universityId }).select("-password");
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found under your institution.",
      });
    }

    const progressLogs = await ProgressLog.find({ student: studentId }).sort({ date: -1, createdAt: -1 });

    return res.json({
      success: true,
      student: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        mainCategory: student.mainCategory,
        contactNumber: student.contactNumber,
        cvUrl: student.cvUrl,
      },
      count: progressLogs.length,
      progressLogs,
    });
  } catch (err) {
    console.error("Error fetching student progress logs:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student progress logs.",
      error: err.message,
    });
  }
};

// 7. Get All University Student Progress Logs Feed (FR-09, US-10)
exports.getAllProgressLogs = async (req, res) => {
  try {
    const universityId = req.user.id;
    const { search } = req.query;

    const students = await Student.find({ university: universityId }).select("_id fullName email mainCategory");
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
      message: "Failed to fetch student daily progress logs.",
      error: err.message,
    });
  }
};

// 8. Get University Profile (Protected)
exports.getProfile = async (req, res) => {
  try {
    const universityId = req.user.id;
    const university = await University.findById(universityId).select("-password");

    if (!university) {
      return res.status(404).json({
        success: false,
        message: "University record not found.",
      });
    }

    return res.json({
      success: true,
      university,
    });
  } catch (err) {
    console.error("Error fetching university profile:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch university profile.",
      error: err.message,
    });
  }
};

// 9. Update University Profile (Protected)
exports.updateProfile = async (req, res) => {
  try {
    const universityId = req.user.id;
    const { headName, contactNumber, address, universityName, clearProfilePicture } = req.body;

    const university = await University.findById(universityId);
    if (!university) {
      return res.status(404).json({
        success: false,
        message: "University record not found.",
      });
    }

    if (headName) university.headName = headName.trim();
    if (contactNumber !== undefined) university.contactNumber = contactNumber.trim();
    if (address !== undefined) university.address = address.trim();
    if (universityName) university.universityName = universityName.trim();

    if (req.file) {
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      if (university.profilePicture && university.profilePicture.startsWith("/uploads/avatars/")) {
        const oldPath = path.join(__dirname, "..", "uploads", "avatars", path.basename(university.profilePicture));
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch {}
        }
      }
      university.profilePicture = avatarUrl;
    } else if (clearProfilePicture === "true") {
      if (university.profilePicture && university.profilePicture.startsWith("/uploads/avatars/")) {
        const oldPath = path.join(__dirname, "..", "uploads", "avatars", path.basename(university.profilePicture));
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch {}
        }
      }
      university.profilePicture = "";
    }

    await university.save();

    return res.json({
      success: true,
      message: "University profile updated successfully.",
      university: {
        id: university._id,
        universityName: university.universityName,
        headName: university.headName,
        headEmail: university.headEmail,
        contactNumber: university.contactNumber,
        address: university.address,
        profilePicture: university.profilePicture || "",
        status: university.status,
      },
    });
  } catch (err) {
    console.error("Error updating university profile:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update university profile.",
      error: err.message,
    });
  }
};
