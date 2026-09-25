const mongoose = require("mongoose");

const progressLogSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  date: { type: Date, required: true },
  description: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("ProgressLog", progressLogSchema);