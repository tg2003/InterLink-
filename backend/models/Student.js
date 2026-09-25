const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "University",
    required: true,
  },
  mainCategory: { type: String, required: true }, // e.g. "IT", "Business"
  contactNumber: { type: String },
  cvUrl: { type: String },
  bio: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);