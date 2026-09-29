const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const University = require("../models/University");
const Supervisor = require("../models/Supervisor");
const Student = require("../models/Student");
const Employer = require("../models/Employer");

// Helper to check if an email already exists in any collection
async function isEmailTaken(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const [admin, uni, sup, stu, emp] = await Promise.all([
    Admin.findOne({ email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } }),
    University.findOne({ headEmail: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } }),
    Supervisor.findOne({ email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } }),
    Student.findOne({ email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } }),
    Employer.findOne({ email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } }),
  ]);

  return Boolean(admin || uni || sup || stu || emp);
}

// Generate JWT token
function generateToken(user, role, displayName, userEmail) {
  const secret = process.env.JWT_SECRET || "interlink_jwt_secret_fallback_key";
  return jwt.sign(
    {
      id: user._id,
      role,
      name: displayName,
      email: userEmail,
    },
    secret,
    { expiresIn: "7d" }
  );
}

// 1. Get approved universities for student registration dropdown
exports.getApprovedUniversities = async (req, res) => {
  try {
    const universities = await University.find({ status: "approved" })
      .select("_id universityName")
      .sort({ universityName: 1 });

    // Fallback: If no universities are explicitly approved yet, return all universities
    if (universities.length === 0) {
      const allUniversities = await University.find()
        .select("_id universityName")
        .sort({ universityName: 1 });
      return res.json({ success: true, universities: allUniversities });
    }

    res.json({ success: true, universities });
  } catch (err) {
    console.error("Error fetching universities:", err);
    res.status(500).json({ success: false, message: "Failed to fetch universities.", error: err.message });
  }
};

// 2. Register Student
exports.registerStudent = async (req, res) => {
  try {
    const { fullName, email, password, university, mainCategory, contactNumber, cvUrl, bio } = req.body;

    if (!fullName || !email || !password || !university || !mainCategory) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: fullName, email, password, university, and mainCategory.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const emailInUse = await isEmailTaken(email);
    if (emailInUse) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists.",
      });
    }

    // Verify university exists
    const validUni = await University.findById(university);
    if (!validUni) {
      return res.status(400).json({
        success: false,
        message: "Selected university does not exist.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const student = await Student.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      university,
      mainCategory: mainCategory.trim(),
      contactNumber: contactNumber ? contactNumber.trim() : undefined,
      cvUrl: cvUrl ? cvUrl.trim() : undefined,
      bio: bio ? bio.trim() : undefined,
    });

    const token = generateToken(student, "student", student.fullName, student.email);

    res.status(201).json({
      success: true,
      message: "Student account created successfully. Please sign in to continue.",
      token,
      user: {
        id: student._id,
        role: "student",
        name: student.fullName,
        email: student.email,
        mainCategory: student.mainCategory,
        university: student.university,
      },
    });
  } catch (err) {
    console.error("Student registration error:", err);
    res.status(500).json({ success: false, message: "Failed to register student.", error: err.message });
  }
};

// 3. Register University
exports.registerUniversity = async (req, res) => {
  try {
    const { universityName, headName, headEmail, password, contactNumber, address } = req.body;

    if (!universityName || !headName || !headEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: universityName, headName, headEmail, and password.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const emailInUse = await isEmailTaken(headEmail);
    if (emailInUse) {
      return res.status(409).json({
        success: false,
        message: "An account with this head email address already exists.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const university = await University.create({
      universityName: universityName.trim(),
      headName: headName.trim(),
      headEmail: headEmail.trim().toLowerCase(),
      password: hashedPassword,
      contactNumber: contactNumber ? contactNumber.trim() : undefined,
      address: address ? address.trim() : undefined,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "University registration submitted successfully. Your account is pending administrator approval.",
      data: {
        id: university._id,
        role: "university",
        universityName: university.universityName,
        headEmail: university.headEmail,
        status: university.status,
      },
    });
  } catch (err) {
    console.error("University registration error:", err);
    res.status(500).json({ success: false, message: "Failed to register university.", error: err.message });
  }
};

// 4. Register Employer
exports.registerEmployer = async (req, res) => {
  try {
    const { companyName, email, password, companyCategory, contactNumber, address } = req.body;

    if (!companyName || !email || !password || !companyCategory) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: companyName, email, password, and companyCategory.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const emailInUse = await isEmailTaken(email);
    if (emailInUse) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const employer = await Employer.create({
      companyName: companyName.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      companyCategory: companyCategory.trim(),
      contactNumber: contactNumber ? contactNumber.trim() : undefined,
      address: address ? address.trim() : undefined,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Employer registration submitted successfully. Your account is pending administrator approval.",
      data: {
        id: employer._id,
        role: "employer",
        companyName: employer.companyName,
        email: employer.email,
        status: employer.status,
      },
    });
  } catch (err) {
    console.error("Employer registration error:", err);
    res.status(500).json({ success: false, message: "Failed to register employer.", error: err.message });
  }
};

// Helper to verify password (supports bcrypt as well as legacy/seed plain passwords)
async function verifyPassword(inputPassword, storedPassword) {
  if (!inputPassword || !storedPassword) return false;
  // If storedPassword looks like a bcrypt hash (starts with $2a$ or $2b$)
  if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$")) {
    return await bcrypt.compare(inputPassword, storedPassword);
  }
  // Plain text fallback (for test/seed accounts)
  return inputPassword === storedPassword;
}

// 5. Unified Login Endpoint (Auto-detects role across all 5 models)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter both email and password.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check Admin
    let user = await Admin.findOne({ email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } });
    let role = null;
    let displayName = null;
    let userEmail = null;

    if (user) {
      role = "admin";
      displayName = user.fullName;
      userEmail = user.email;
    }

    // 2. Check University
    if (!user) {
      user = await University.findOne({ headEmail: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } });
      if (user) {
        role = "university";
        displayName = user.universityName;
        userEmail = user.headEmail;
      }
    }

    // 3. Check Supervisor
    if (!user) {
      user = await Supervisor.findOne({ email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } });
      if (user) {
        role = "supervisor";
        displayName = user.fullName;
        userEmail = user.email;
      }
    }

    // 4. Check Student
    if (!user) {
      user = await Student.findOne({ email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } }).populate("university", "universityName");
      if (user) {
        role = "student";
        displayName = user.fullName;
        userEmail = user.email;
      }
    }

    // 5. Check Employer
    if (!user) {
      user = await Employer.findOne({ email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } });
      if (user) {
        role = "employer";
        displayName = user.companyName;
        userEmail = user.email;
      }
    }

    // If user not found in any collection
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password. Please check your credentials.",
      });
    }

    // Check account status if applicable
    if (role === "university" || role === "employer") {
      if (user.status === "pending") {
        return res.status(403).json({
          success: false,
          message: "Your registration is currently pending admin approval. You will receive access once verified.",
        });
      }
      if (user.status === "rejected") {
        return res.status(403).json({
          success: false,
          message: "Your account registration was not approved. Please contact Interlink administration.",
        });
      }
    }

    if (role === "supervisor" && user.joinStatus === "pending") {
      return res.status(403).json({
        success: false,
        message: "Your supervisor account is pending university approval.",
      });
    }

    // Verify Password
    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password. Please check your credentials.",
      });
    }

    const token = generateToken(user, role, displayName, userEmail);

    res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        role,
        name: displayName,
        email: userEmail,
        status: user.status || user.joinStatus || "active",
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "An error occurred during login.", error: err.message });
  }
};

// 6. Get Current User info (Protected route)
exports.getCurrentUser = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching user profile.", error: err.message });
  }
};
