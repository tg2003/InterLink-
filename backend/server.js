const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

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