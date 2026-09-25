const mongoose = require("mongoose");

const universitySchema = new mongoose.Schema({
  universityName: { type: String, required: true },
  headName: { type: String, required: true },
  headEmail: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contactNumber: { type: String },
  address: { type: String },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
}, { timestamps: true });

module.exports = mongoose.model("University", universitySchema);