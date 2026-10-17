const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employer",
    required: true,
  },
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ["Full-time", "Part-time", "Internship"],
    default: "Internship",
    required: true,
  },
  workplaceType: {
    type: String,
    enum: ["On-site", "Hybrid", "Remote"],
    default: "On-site",
  },
  location: { type: String, default: "Colombo, Sri Lanka" },
  duration: { type: String, default: "6 Months" },
  stipend: { type: String, default: "Competitive / Negotiable" },
  openings: { type: Number, default: 1 },
  requirements: [{ type: String }],
  responsibilities: [{ type: String }],
  deadline: { type: Date },
  availability: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ["active", "closed", "draft"],
    default: "active",
  },
}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);