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
  type: { type: String, enum: ["Full-time", "Part-time", "Internship"], required: true },
  availability: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);