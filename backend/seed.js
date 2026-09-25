//sample data goes here

const mongoose = require("mongoose");
require("dotenv").config();

const Admin = require("./models/Admin");
const University = require("./models/University");
const Supervisor = require("./models/Supervisor");
const Student = require("./models/Student");
const Employer = require("./models/Employer");
const Job = require("./models/Job");
const Application = require("./models/Application");
const ProgressLog = require("./models/ProgressLog");

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding...");

    //for a fresh start
    await Admin.deleteMany();
    await University.deleteMany();
    await Supervisor.deleteMany();
    await Student.deleteMany();
    await Employer.deleteMany();
    await Job.deleteMany();
    await Application.deleteMany();
    await ProgressLog.deleteMany();

    // 1. Admin
    const admin = await Admin.create({
      fullName: "System Admin",
      email: "admin@interlink.com",
      password: "admin123",
    });

    // 2. University
    const university = await University.create({
      universityName: "University of Ruhuna",
      headName: "Dr. Silva",
      headEmail: "head@ruh.ac.lk",
      password: "head123",
      contactNumber: "0912345678",
      address: "Matara, Sri Lanka",
      status: "approved",
    });

    // 3. Supervisor
    const supervisor = await Supervisor.create({
      fullName: "Mr. Perera",
      email: "supervisor@ruh.ac.lk",
      password: "sup123",
      staffRegNo: "STF001",
      university: university._id,
      joinStatus: "approved",
    });

    // 4. Student
    const student = await Student.create({
      fullName: "Kasun Fernando",
      email: "kasun@student.ruh.ac.lk",
      password: "stu123",
      university: university._id,
      mainCategory: "IT",
      contactNumber: "0771234567",
      bio: "Undergraduate student, 3rd year",
    });

    // 5. Employer
    const employer = await Employer.create({
      companyName: "Tech Solutions Pvt Ltd",
      email: "hr@techsolutions.com",
      password: "emp123",
      companyCategory: "IT",
      contactNumber: "0112223344",
      address: "Colombo, Sri Lanka",
      status: "approved",
    });

    // 6. Job
    const job = await Job.create({
      employer: employer._id,
      title: "Software Engineering Intern",
      category: "IT",
      description: "6-month internship in web development",
      type: "Internship",
      availability: true,
    });

    // 7. Application
    await Application.create({
      job: job._id,
      student: student._id,
      status: "pending",
    });

    // 8. Progress Log
    await ProgressLog.create({
      student: student._id,
      date: new Date(),
      description: "Completed React component training",
    });

    console.log("✅ Sample data inserted successfully!");
    process.exit();
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seedData();