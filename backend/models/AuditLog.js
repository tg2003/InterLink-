const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    performedBy: {
      type: String,
      default: "System Admin",
      trim: true,
    },
    target: {
      type: String,
      default: "System",
      trim: true,
    },
    targetType: {
      type: String,
      enum: ["University", "Employer", "Student", "Supervisor", "Job", "System", "Setting"],
      default: "System",
    },
    details: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["success", "warning", "info", "danger"],
      default: "info",
    },
    ipAddress: {
      type: String,
      default: "127.0.0.1",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
