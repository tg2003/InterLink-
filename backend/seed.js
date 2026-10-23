const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Admin = require("./models/Admin");
const University = require("./models/University");
const Supervisor = require("./models/Supervisor");
const Student = require("./models/Student");
const Employer = require("./models/Employer");
const Job = require("./models/Job");
const Application = require("./models/Application");
const ProgressLog = require("./models/ProgressLog");
const PlatformSetting = require("./models/PlatformSetting");
const AuditLog = require("./models/AuditLog");

// Anith universities dummy widihata passe danna ona nam meka true karanna
const INSERT_DUMMY_UNIVERSITIES = false;

const hash = (pw) => bcrypt.hashSync(pw, 10);
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[randInt(0, arr.length - 1)];
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// [companyName, email, city, contactPersonName, designation, companySize]
const EMPLOYERS = [
  ["Tech Solutions Pvt Ltd", "hr@techsolutions.com", "Colombo", "Ruwan Jayawardena", "HR Manager", "51-200 employees"],
  ["NextGen Software", "hr@nextgen.lk", "Galle", "Anushka Perera", "Talent Acquisition Lead", "11-50 employees"],
  ["CodeCraft Lanka", "hr@codecraft.lk", "Colombo", "Dinesh Kumara", "HR Executive", "11-50 employees"],
  ["Pixel Labs", "hr@pixellabs.lk", "Kandy", "Madhavi Silva", "People & Culture Manager", "1-10 employees"],
  ["CloudNine Systems", "hr@cloudnine.lk", "Colombo", "Chamara Fernando", "Head of HR", "200+ employees"],
  ["DataBridge Analytics", "hr@databridge.lk", "Colombo", "Sanduni Wijesinghe", "HR Manager", "51-200 employees"],
  ["Nimbus Technologies", "hr@nimbus.lk", "Matara", "Lakmal Rathnayake", "Recruitment Officer", "11-50 employees"],
  ["ByteWorks Pvt Ltd", "hr@byteworks.lk", "Galle", "Hiruni Gunasekara", "HR Executive", "1-10 employees"],
  ["Orion Digital", "hr@oriondigital.lk", "Colombo", "Nuwan Bandara", "Talent Manager", "200+ employees"],
  ["Zenith Softwares", "hr@zenith.lk", "Kandy", "Thilini Amarasinghe", "HR Manager", "51-200 employees"],
];

const JOB_TEMPLATES = [
  { title: "Software Engineering Intern", description: "Work on MERN stack web applications with our dev team.",
    requirements: ["Basic JavaScript knowledge", "Familiarity with React or Node.js", "Good problem solving skills"],
    responsibilities: ["Develop new features", "Fix bugs", "Participate in code reviews"] },
  { title: "QA Intern", description: "Manual and automated testing of web applications.",
    requirements: ["Understanding of testing concepts", "Attention to detail"],
    responsibilities: ["Write test cases", "Report and track bugs", "Assist in test automation"] },
  { title: "UI/UX Design Intern", description: "Design interfaces and prototypes using Figma.",
    requirements: ["Basic Figma skills", "Understanding of UI principles"],
    responsibilities: ["Create wireframes", "Design mockups", "Support usability testing"] },
  { title: "Web Development Intern", description: "Build responsive websites using React and Node.js.",
    requirements: ["HTML, CSS, JavaScript", "Git basics"],
    responsibilities: ["Build responsive pages", "Integrate REST APIs"] },
  { title: "Mobile App Developer Intern", description: "Develop cross-platform mobile apps with React Native.",
    requirements: ["JavaScript or Dart basics", "Interest in mobile development"],
    responsibilities: ["Build app screens", "Test on devices"] },
  { title: "DevOps Intern", description: "Assist with CI/CD pipelines and cloud deployments.",
    requirements: ["Linux basics", "Git knowledge"],
    responsibilities: ["Maintain CI/CD pipelines", "Monitor deployments"] },
  { title: "Data Analyst Intern", description: "Clean, analyse and visualise business data.",
    requirements: ["Excel or Python basics", "Statistics fundamentals"],
    responsibilities: ["Clean datasets", "Build dashboards and reports"] },
  { title: "Cyber Security Intern", description: "Support vulnerability assessments and security audits.",
    requirements: ["Networking basics", "Interest in security"],
    responsibilities: ["Assist in vulnerability scans", "Document security findings"] },
  { title: "Database Administration Intern", description: "Help manage and optimise SQL and NoSQL databases.",
    requirements: ["SQL basics", "Database design knowledge"],
    responsibilities: ["Monitor database performance", "Assist with backups"] },
  { title: "Business Analyst Intern", description: "Gather requirements and write user stories.",
    requirements: ["Good communication skills", "Basic knowledge of SDLC"],
    responsibilities: ["Document requirements", "Write user stories", "Coordinate with developers"] },
  { title: "Network Engineer Intern", description: "Assist in network setup, monitoring and support.",
    requirements: ["Networking fundamentals", "Cisco or similar exposure is a plus"],
    responsibilities: ["Assist in network setup", "Monitor network health"] },
  { title: "Machine Learning Intern", description: "Work on data preprocessing and model training tasks.",
    requirements: ["Python basics", "Interest in ML"],
    responsibilities: ["Prepare datasets", "Train and evaluate models"] },
];

const JOB_TYPES = ["Internship", "Internship", "Internship", "Part-time", "Full-time"];
const WORKPLACE_TYPES = ["On-site", "Hybrid", "Remote"];
const DURATIONS = ["3 Months", "6 Months", "6 Months", "12 Months"];
const STIPENDS = ["Rs. 25,000 / month", "Rs. 35,000 / month", "Rs. 50,000 / month", "Competitive / Negotiable"];

const STUDENTS = [
  ["Kasun Fernando", "kasun@student.ruh.ac.lk"],
  ["Nimali Silva", "nimali@student.ruh.ac.lk"],
  ["Tharindu Bandara", "tharindu@student.ruh.ac.lk"],
  ["Sachini Perera", "sachini@student.ruh.ac.lk"],
  ["Dilshan Rajapaksha", "dilshan@student.ruh.ac.lk"],
];

const SUPERVISORS = [
  ["Mr. Perera", "supervisor@ruh.ac.lk", "STF001", "Computer Science"],
  ["Ms. Fernando", "fernando@ruh.ac.lk", "STF002", "Software Engineering"],
  ["Dr. Wickramasinghe", "wickrama@ruh.ac.lk", "STF003", "Information Technology"],
];

const LOG_TEXTS = [
  "Completed React component training",
  "Set up MongoDB Atlas and Express server",
  "Built login page UI",
  "Fixed API integration bugs",
  "Attended team stand-up and sprint planning",
  "Wrote unit tests for the auth module",
];

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding...");

    await Promise.all([
      Admin.deleteMany(), University.deleteMany(), Supervisor.deleteMany(),
      Student.deleteMany(), Employer.deleteMany(), Job.deleteMany(),
      Application.deleteMany(), ProgressLog.deleteMany(),
      PlatformSetting.deleteMany(), AuditLog.deleteMany(),
    ]);

    // 1. Admin
    await Admin.create({
      fullName: "System Admin",
      email: "admin@interlink.com",
      password: hash("admin123"),
    });

    // 2. Platform settings (default values)
    await PlatformSetting.create({ key: "global_settings" });

    // 3. University of Ruhuna
    const ruhuna = await University.create({
      universityName: "University of Ruhuna",
      headName: "Dr. Silva",
      headEmail: "head@ruh.ac.lk",
      password: hash("head123"),
      contactNumber: "0412222681",
      address: "Matara, Sri Lanka",
      status: "approved",
    });

    if (INSERT_DUMMY_UNIVERSITIES) {
      await University.insertMany([
        { universityName: "University of Moratuwa", headName: "Prof. Jayasinghe", headEmail: "head@mrt.ac.lk",
          password: hash("head123"), contactNumber: "0112650301", address: "Moratuwa", status: "approved" },
        { universityName: "University of Colombo", headName: "Prof. Gunawardena", headEmail: "head@cmb.ac.lk",
          password: hash("head123"), contactNumber: "0112581835", address: "Colombo", status: "approved" },
        { universityName: "University of Kelaniya", headName: "Prof. Dissanayake", headEmail: "head@kln.ac.lk",
          password: hash("head123"), contactNumber: "0112903903", address: "Kelaniya", status: "approved" },
      ]);
    }

    // 4. Supervisors (3, Ruhuna)
    await Supervisor.insertMany(SUPERVISORS.map(([fullName, email, staffRegNo, department]) => ({
      fullName, email, staffRegNo, department,
      password: hash("sup123"),
      university: ruhuna._id,
      contactNumber: "0712345678",
      joinStatus: "approved",
    })));

    // 5. Students (5, Ruhuna)
    const students = await Student.insertMany(STUDENTS.map(([fullName, email]) => ({
      fullName, email,
      password: hash("stu123"),
      university: ruhuna._id,
      mainCategory: "IT",
      contactNumber: "0771234567",
      bio: "Undergraduate student, ICT, University of Ruhuna",
    })));

    // 6. Employers (10, all approved)
    const employers = await Employer.insertMany(EMPLOYERS.map(
      ([companyName, email, city, contactPersonName, contactPersonDesignation, companySize], i) => ({
        companyName, email,
        password: hash("emp123"),
        companyCategory: "IT",
        brNumber: "PV" + (10000 + i * 137),
        websiteUrl: "https://www." + email.split("@")[1],
        linkedinUrl: "",
        industryMemberships: ["SLASSCOM"],
        companySize,
        contactPersonName,
        contactPersonDesignation,
        contactNumber: "0112" + randInt(100000, 999999),
        address: city + ", Sri Lanka",
        status: "approved",
      })
    ));

    // 7. Jobs (each employer gets random 2-5 jobs)
    const jobDocs = [];
    for (const emp of employers) {
      const count = randInt(2, 5);
      const city = emp.address.split(",")[0];
      for (const t of shuffle(JOB_TEMPLATES).slice(0, count)) {
        const open = Math.random() > 0.2;
        jobDocs.push({
          employer: emp._id,
          title: t.title,
          category: "IT",
          description: t.description,
          type: pick(JOB_TYPES),
          workplaceType: pick(WORKPLACE_TYPES),
          location: city + ", Sri Lanka",
          duration: pick(DURATIONS),
          stipend: pick(STIPENDS),
          openings: randInt(1, 4),
          requirements: t.requirements,
          responsibilities: t.responsibilities,
          deadline: new Date(Date.now() + randInt(10, 60) * 86400000),
          availability: open,
          status: open ? "active" : "closed",
        });
      }
    }
    const jobs = await Job.insertMany(jobDocs);

    // 8. Applications (each student applies to 2 different jobs)
    const appDocs = [];
    for (const s of students) {
      for (const j of shuffle(jobs).slice(0, 2)) {
        appDocs.push({ job: j._id, student: s._id, status: pick(["pending", "accepted", "rejected"]) });
      }
    }
    await Application.insertMany(appDocs);

    // 9. Progress logs (3 per student)
    const logDocs = [];
    for (const s of students) {
      for (let i = 0; i < 3; i++) {
        logDocs.push({
          student: s._id,
          date: new Date(Date.now() - i * 86400000),
          description: pick(LOG_TEXTS),
        });
      }
    }
    await ProgressLog.insertMany(logDocs);

    // 10. Audit logs (sample)
    await AuditLog.insertMany([
      { action: "University approved", target: "University of Ruhuna", targetType: "University",
        details: "Registration approved by admin", status: "success" },
      { action: "Employers approved", target: "10 employers", targetType: "Employer",
        details: "Seed data: all sample employers approved", status: "success" },
      { action: "Platform settings initialised", target: "global_settings", targetType: "Setting",
        details: "Default settings created", status: "info" },
    ]);

    console.log("Sample data inserted successfully!");
    console.log(`Employers: ${employers.length}, Jobs: ${jobs.length}, Students: ${students.length}, Supervisors: ${SUPERVISORS.length}`);
    process.exit();
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seedData();