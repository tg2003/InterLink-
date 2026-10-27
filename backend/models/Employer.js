const mongoose = require("mongoose");

const employerSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  companyCategory: { type: String, required: true }, // matches student mainCategory
  brNumber: { type: String, required: true },
  websiteUrl: { type: String, default: "" },
  linkedinUrl: { type: String, default: "" },
  industryMemberships: [{ type: String }],
  companySize: {
    type: String,
    enum: ["1-10 employees", "11-50 employees", "51-200 employees", "200+ employees"],
    required: true,
  },
  contactPersonName: { type: String, required: true },
  contactPersonDesignation: { type: String, required: true },
  contactNumber: { type: String },
  address: { type: String },
  profilePicture: { type: String, default: "" },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
}, { timestamps: true });

module.exports = mongoose.model("Employer", employerSchema);