const mongoose = require("mongoose");

const platformSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "global_settings",
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    allowUniversityRegistration: {
      type: Boolean,
      default: true,
    },
    allowEmployerRegistration: {
      type: Boolean,
      default: true,
    },
    requireEmailVerification: {
      type: Boolean,
      default: false,
    },
    autoApproveUniversities: {
      type: Boolean,
      default: false,
    },
    autoApproveEmployers: {
      type: Boolean,
      default: false,
    },
    systemNotice: {
      type: String,
      default: "Interlink Core Infrastructure operating normally. All services are active.",
    },
    supportEmail: {
      type: String,
      default: "admin@interlink.com",
    },
    sessionTimeoutMinutes: {
      type: Number,
      default: 60,
    },
    maxFileSizeMB: {
      type: Number,
      default: 10,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlatformSetting", platformSettingSchema);
