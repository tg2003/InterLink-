const Admin = require("../models/Admin");
const University = require("../models/University");
const Employer = require("../models/Employer");
const Student = require("../models/Student");
const Supervisor = require("../models/Supervisor");
const Job = require("../models/Job");
const Application = require("../models/Application");
const AuditLog = require("../models/AuditLog");
const PlatformSetting = require("../models/PlatformSetting");

// Helper to record an audit entry
async function logAdminAction({ action, performedBy, target, targetType, details, status = "info", ipAddress }) {
  try {
    await AuditLog.create({
      action,
      performedBy: performedBy || "Admin",
      target: target || "System",
      targetType: targetType || "System",
      details: details || "",
      status,
      ipAddress: ipAddress || "127.0.0.1",
    });
  } catch (err) {
    console.error("Audit log error:", err.message);
  }
}

// 1. Dashboard Overview Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      uniTotal,
      uniPending,
      uniApproved,
      uniRejected,
      empTotal,
      empPending,
      empApproved,
      empRejected,
      studentTotal,
      supervisorTotal,
      jobTotal,
      appTotal,
      recentLogs,
    ] = await Promise.all([
      University.countDocuments(),
      University.countDocuments({ status: "pending" }),
      University.countDocuments({ status: "approved" }),
      University.countDocuments({ status: "rejected" }),

      Employer.countDocuments(),
      Employer.countDocuments({ status: "pending" }),
      Employer.countDocuments({ status: "approved" }),
      Employer.countDocuments({ status: "rejected" }),

      Student.countDocuments(),
      Supervisor.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
      AuditLog.find().sort({ createdAt: -1 }).limit(6),
    ]);

    // If no audit logs exist yet, let's seed an initial log
    let auditList = recentLogs;
    if (auditList.length === 0) {
      const initialLog = await AuditLog.create({
        action: "SYSTEM_INITIALIZED",
        performedBy: req.user?.email || "admin@interlink.com",
        target: "Interlink Core Infrastructure",
        targetType: "System",
        details: "Administrative governance session initialized and database connected.",
        status: "success",
      });
      auditList = [initialLog];
    }

    res.json({
      success: true,
      stats: {
        universities: {
          total: uniTotal,
          pending: uniPending,
          approved: uniApproved,
          rejected: uniRejected,
        },
        employers: {
          total: empTotal,
          pending: empPending,
          approved: empApproved,
          rejected: empRejected,
        },
        students: {
          total: studentTotal,
        },
        supervisors: {
          total: supervisorTotal,
        },
        jobs: {
          total: jobTotal,
        },
        applications: {
          total: appTotal,
        },
        systemHealth: {
          status: "Operational",
          dbConnected: true,
          serverUptimeSeconds: Math.floor(process.uptime()),
          nodeVersion: process.version,
          activeAdmins: 1,
        },
      },
      recentLogs: auditList,
    });
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    res.status(500).json({ success: false, message: "Failed to retrieve admin stats.", error: err.message });
  }
};

// 2. University Approvals Management
exports.getUniversities = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { universityName: regex },
        { headName: regex },
        { headEmail: regex },
        { address: regex },
      ];
    }

    const [universities, total, pending, approved, rejected] = await Promise.all([
      University.find(filter).sort({ createdAt: -1 }),
      University.countDocuments(),
      University.countDocuments({ status: "pending" }),
      University.countDocuments({ status: "approved" }),
      University.countDocuments({ status: "rejected" }),
    ]);

    res.json({
      success: true,
      universities,
      counts: {
        all: total,
        pending,
        approved,
        rejected,
      },
    });
  } catch (err) {
    console.error("Error fetching universities:", err);
    res.status(500).json({ success: false, message: "Failed to fetch universities.", error: err.message });
  }
};

exports.updateUniversityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    const university = await University.findById(id);
    if (!university) {
      return res.status(404).json({ success: false, message: "University not found." });
    }

    const prevStatus = university.status;
    university.status = status;
    await university.save();

    const actionText = status === "approved" ? "UNIVERSITY_APPROVED" : status === "rejected" ? "UNIVERSITY_REJECTED" : "UNIVERSITY_STATUS_UPDATED";
    await logAdminAction({
      action: actionText,
      performedBy: req.user?.email || "admin@interlink.com",
      target: university.universityName,
      targetType: "University",
      details: `Status transitioned from '${prevStatus}' to '${status}'. ${note ? `Note: ${note}` : ""}`,
      status: status === "approved" ? "success" : status === "rejected" ? "danger" : "info",
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `University '${university.universityName}' status updated to ${status}.`,
      university,
    });
  } catch (err) {
    console.error("Error updating university status:", err);
    res.status(500).json({ success: false, message: "Failed to update university status.", error: err.message });
  }
};

exports.deleteUniversity = async (req, res) => {
  try {
    const { id } = req.params;
    const university = await University.findByIdAndDelete(id);
    if (!university) {
      return res.status(404).json({ success: false, message: "University not found." });
    }

    await logAdminAction({
      action: "UNIVERSITY_DELETED",
      performedBy: req.user?.email || "admin@interlink.com",
      target: university.universityName,
      targetType: "University",
      details: `Institution profile and credentials removed by administrator.`,
      status: "warning",
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `University '${university.universityName}' permanently removed.`,
    });
  } catch (err) {
    console.error("Error deleting university:", err);
    res.status(500).json({ success: false, message: "Failed to delete university.", error: err.message });
  }
};

// 3. Employer Verification Management
exports.getEmployers = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { companyName: regex },
        { email: regex },
        { companyCategory: regex },
        { address: regex },
        { brNumber: regex },
        { contactPersonName: regex },
      ];
    }

    const [employers, total, pending, approved, rejected] = await Promise.all([
      Employer.find(filter).select("-password").sort({ createdAt: -1 }),
      Employer.countDocuments(),
      Employer.countDocuments({ status: "pending" }),
      Employer.countDocuments({ status: "approved" }),
      Employer.countDocuments({ status: "rejected" }),
    ]);

    res.json({
      success: true,
      employers,
      counts: {
        all: total,
        pending,
        approved,
        rejected,
      },
    });
  } catch (err) {
    console.error("Error fetching employers:", err);
    res.status(500).json({ success: false, message: "Failed to fetch employers.", error: err.message });
  }
};

exports.updateEmployerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    const employer = await Employer.findById(id);
    if (!employer) {
      return res.status(404).json({ success: false, message: "Employer not found." });
    }

    const prevStatus = employer.status;
    employer.status = status;
    await employer.save();

    const actionText = status === "approved" ? "EMPLOYER_VERIFIED" : status === "rejected" ? "EMPLOYER_REJECTED" : "EMPLOYER_STATUS_UPDATED";
    await logAdminAction({
      action: actionText,
      performedBy: req.user?.email || "admin@interlink.com",
      target: employer.companyName,
      targetType: "Employer",
      details: `Status changed from '${prevStatus}' to '${status}'. ${note ? `Note: ${note}` : ""}`,
      status: status === "approved" ? "success" : status === "rejected" ? "danger" : "info",
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Employer '${employer.companyName}' has been marked as ${status}.`,
      employer,
    });
  } catch (err) {
    console.error("Error updating employer status:", err);
    res.status(500).json({ success: false, message: "Failed to update employer status.", error: err.message });
  }
};

exports.deleteEmployer = async (req, res) => {
  try {
    const { id } = req.params;
    const employer = await Employer.findByIdAndDelete(id);
    if (!employer) {
      return res.status(404).json({ success: false, message: "Employer not found." });
    }

    await logAdminAction({
      action: "EMPLOYER_DELETED",
      performedBy: req.user?.email || "admin@interlink.com",
      target: employer.companyName,
      targetType: "Employer",
      details: `Company profile and login access deleted.`,
      status: "warning",
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Employer '${employer.companyName}' removed.`,
    });
  } catch (err) {
    console.error("Error deleting employer:", err);
    res.status(500).json({ success: false, message: "Failed to delete employer.", error: err.message });
  }
};

// 4. Student Directory Management
exports.getStudents = async (req, res) => {
  try {
    const { search, university, category } = req.query;
    const filter = {};

    if (university && university !== "all") {
      filter.university = university;
    }

    if (category && category !== "all") {
      filter.mainCategory = category;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { fullName: regex },
        { email: regex },
        { mainCategory: regex },
        { contactNumber: regex },
      ];
    }

    const students = await Student.find(filter)
      .populate("university", "universityName profilePicture")
      .sort({ createdAt: -1 });

    const totalStudents = await Student.countDocuments();
    const universitiesList = await University.find().select("_id universityName profilePicture").sort({ universityName: 1 });

    res.json({
      success: true,
      students,
      totalCount: totalStudents,
      universitiesList,
    });
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ success: false, message: "Failed to fetch student directory.", error: err.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    await logAdminAction({
      action: "STUDENT_RECORD_DELETED",
      performedBy: req.user?.email || "admin@interlink.com",
      target: student.fullName,
      targetType: "Student",
      details: `Student account ${student.email} deleted from directory.`,
      status: "warning",
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Student '${student.fullName}' profile deleted.`,
    });
  } catch (err) {
    console.error("Error deleting student:", err);
    res.status(500).json({ success: false, message: "Failed to delete student.", error: err.message });
  }
};

// 5. System Audit Logs Management
exports.getAuditLogs = async (req, res) => {
  try {
    const { search, type } = req.query;
    const filter = {};

    if (type && type !== "all") {
      if (type === "approvals") {
        filter.action = { $in: ["UNIVERSITY_APPROVED", "EMPLOYER_VERIFIED"] };
      } else if (type === "rejections") {
        filter.action = { $in: ["UNIVERSITY_REJECTED", "EMPLOYER_REJECTED"] };
      } else if (type === "deletions") {
        filter.action = { $regex: /DELETED/i };
      } else if (type === "settings") {
        filter.action = { $regex: /SETTING/i };
      }
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { action: regex },
        { performedBy: regex },
        { target: regex },
        { details: regex },
      ];
    }

    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(150);
    const totalCount = await AuditLog.countDocuments();

    res.json({
      success: true,
      logs,
      totalCount,
    });
  } catch (err) {
    console.error("Error fetching audit logs:", err);
    res.status(500).json({ success: false, message: "Failed to retrieve audit logs.", error: err.message });
  }
};

exports.clearAuditLogs = async (req, res) => {
  try {
    await AuditLog.deleteMany({});

    // Record the clearance event
    await logAdminAction({
      action: "AUDIT_LOGS_PURGED",
      performedBy: req.user?.email || "admin@interlink.com",
      target: "System Audit Repository",
      targetType: "System",
      details: "Audit history cleared by super administrator.",
      status: "warning",
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: "Audit logs have been archived and cleared.",
    });
  } catch (err) {
    console.error("Error clearing audit logs:", err);
    res.status(500).json({ success: false, message: "Failed to clear audit logs.", error: err.message });
  }
};

// 6. Platform Settings Management
exports.getPlatformSettings = async (req, res) => {
  try {
    let settings = await PlatformSetting.findOne({ key: "global_settings" });
    if (!settings) {
      settings = await PlatformSetting.create({
        key: "global_settings",
      });
    }

    res.json({
      success: true,
      settings,
    });
  } catch (err) {
    console.error("Error fetching platform settings:", err);
    res.status(500).json({ success: false, message: "Failed to load platform settings.", error: err.message });
  }
};

exports.updatePlatformSettings = async (req, res) => {
  try {
    const updateData = req.body;
    let settings = await PlatformSetting.findOneAndUpdate(
      { key: "global_settings" },
      { $set: updateData },
      { new: true, upsert: true }
    );

    await logAdminAction({
      action: "PLATFORM_SETTINGS_UPDATED",
      performedBy: req.user?.email || "admin@interlink.com",
      target: "Global System Configuration",
      targetType: "Setting",
      details: "Updated platform governance parameters, security flags, and system notice.",
      status: "info",
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: "Platform governance settings successfully saved.",
      settings,
    });
  } catch (err) {
    console.error("Error updating platform settings:", err);
    res.status(500).json({ success: false, message: "Failed to save platform settings.", error: err.message });
  }
};
