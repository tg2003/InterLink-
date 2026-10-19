const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const jobRoutes = require("./routes/jobRoutes");
const universityRoutes = require("./routes/universityRoutes");

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/interlink")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/university", universityRoutes);

app.get("/", (req, res) => res.send("Interlink API running"));

const PORT = process.env.PORT || 5000;

//test code to create the db
const Admin = require("./models/Admin");

app.get("/test-db", async (req, res) => {
  try {
    const testAdmin = await Admin.create({
      fullName: "Test Admin",
      email: "test@interlink.com",
      password: "test123",
    });
    res.json({ success: true, data: testAdmin });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));