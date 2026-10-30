const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const Admin = require("../models/Admin");
const University = require("../models/University");
const Supervisor = require("../models/Supervisor");
const Student = require("../models/Student");
const Employer = require("../models/Employer");

// Helper to check if an email already exists in any collection (optimized parallel query)
async function isEmailTaken(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const rawEmail = email.trim();

  // Fast parallel indexed lookup
  const [admin, uni, sup, stu, emp] = await Promise.all([
    Admin.findOne({ email: { $in: [normalizedEmail, rawEmail] } }).select("_id").lean(),
    University.findOne({ headEmail: { $in: [normalizedEmail, rawEmail] } }).select("_id").lean(),
    Supervisor.findOne({ email: { $in: [normalizedEmail, rawEmail] } }).select("_id").lean(),
    Student.findOne({ email: { $in: [normalizedEmail, rawEmail] } }).select("_id").lean(),
    Employer.findOne({ email: { $in: [normalizedEmail, rawEmail] } }).select("_id").lean(),
  ]);

  if (admin || uni || sup || stu || emp) return true;

  // Fallback case-insensitive search if mixed casing exists
  const regex = new RegExp(`^${normalizedEmail}$`, "i");
  const [rAdmin, rUni, rSup, rStu, rEmp] = await Promise.all([
    Admin.findOne({ email: regex }).select("_id").lean(),
    University.findOne({ headEmail: regex }).select("_id").lean(),
    Supervisor.findOne({ email: regex }).select("_id").lean(),
    Student.findOne({ email: regex }).select("_id").lean(),
    Employer.findOne({ email: regex }).select("_id").lean(),
  ]);

  return Boolean(rAdmin || rUni || rSup || rStu || rEmp);
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
      profilePicture: user.profilePicture || "",
    },
    secret,
    { expiresIn: "7d" }
  );
}

// 1. Get approved universities for student registration dropdown
exports.getApprovedUniversities = async (req, res) => {
  try {
    const universities = await University.find({ status: "approved" })
      .select("_id universityName profilePicture")
      .sort({ universityName: 1 });

    // Fallback: If no universities are explicitly approved yet, return all universities
    if (universities.length === 0) {
      const allUniversities = await University.find()
        .select("_id universityName profilePicture")
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
    const {
      companyName,
      email,
      password,
      companyCategory,
      company_category,
      brNumber,
      websiteUrl,
      linkedinUrl,
      industryMemberships,
      companySize,
      contactPersonName,
      contactPersonDesignation,
      contactNumber,
      address,
    } = req.body;

    const resolvedCategory = companyCategory || company_category;

    if (
      !companyName ||
      !email ||
      !password ||
      !resolvedCategory ||
      !brNumber ||
      !companySize ||
      !contactPersonName ||
      !contactPersonDesignation
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: company name, email, password, industry category, BR/eROC number, company size, and authorized HR contact details.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // Optional website URL check
    if (websiteUrl && websiteUrl.trim()) {
      const cleanWeb = websiteUrl.trim();
      if (!/^https?:\/\//i.test(cleanWeb)) {
        return res.status(400).json({
          success: false,
          message: "Official Website URL must start with http:// or https://",
        });
      }
    }

    // Optional LinkedIn URL check
    if (linkedinUrl && linkedinUrl.trim()) {
      const cleanLi = linkedinUrl.trim();
      if (!cleanLi.toLowerCase().includes("linkedin.com/company/") && !cleanLi.toLowerCase().includes("linkedin.com/in/")) {
        return res.status(400).json({
          success: false,
          message: "LinkedIn profile URL must contain 'linkedin.com/company/' or 'linkedin.com/in/'.",
        });
      }
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

    // Sanitize industry memberships as array
    let membershipsArray = [];
    if (Array.isArray(industryMemberships)) {
      membershipsArray = industryMemberships.filter(Boolean).map((m) => String(m).trim());
    } else if (typeof industryMemberships === "string" && industryMemberships.trim()) {
      membershipsArray = [industryMemberships.trim()];
    }

    const employer = await Employer.create({
      companyName: companyName.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      companyCategory: resolvedCategory.trim(),
      brNumber: brNumber.trim(),
      websiteUrl: websiteUrl ? websiteUrl.trim() : "",
      linkedinUrl: linkedinUrl ? linkedinUrl.trim() : "",
      industryMemberships: membershipsArray,
      companySize: companySize.trim(),
      contactPersonName: contactPersonName.trim(),
      contactPersonDesignation: contactPersonDesignation.trim(),
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
        brNumber: employer.brNumber,
        companyCategory: employer.companyCategory,
        status: employer.status,
      },
    });
  } catch (err) {
    console.error("Employer registration error:", err);
    res.status(500).json({ success: false, message: "Failed to register employer.", error: err.message });
  }
};

// 4b. Register Supervisor (PB-06, FR-03, US-02)
exports.registerSupervisor = async (req, res) => {
  try {
    const { fullName, email, password, staffRegNo, university, department, contactNumber, autoSendRequest } = req.body;

    if (!fullName || !email || !password || !staffRegNo || !university) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: fullName, email, password, staffRegNo, and university.",
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

    const validUni = await University.findById(university);
    if (!validUni) {
      return res.status(400).json({
        success: false,
        message: "Selected university does not exist.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // US-02: "Send join request automatically" checkbox
    // If false, status is "draft". If true or omitted, status is "pending".
    const joinStatus = autoSendRequest === false ? "draft" : "pending";

    const supervisor = await Supervisor.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      staffRegNo: staffRegNo.trim(),
      university,
      department: department ? department.trim() : undefined,
      contactNumber: contactNumber ? contactNumber.trim() : undefined,
      joinStatus,
    });

    const token = generateToken(supervisor, "supervisor", supervisor.fullName, supervisor.email);

    return res.status(201).json({
      success: true,
      message: joinStatus === "pending"
        ? "Supervisor account registered successfully and join request submitted to the University Head."
        : "Supervisor account registered successfully. You can submit your join request from your dashboard.",
      token,
      user: {
        id: supervisor._id,
        role: "supervisor",
        name: supervisor.fullName,
        email: supervisor.email,
        staffRegNo: supervisor.staffRegNo,
        department: supervisor.department,
        university: supervisor.university,
        joinStatus: supervisor.joinStatus,
      },
    });
  } catch (err) {
    console.error("Supervisor registration error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to register supervisor.",
      error: err.message,
    });
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

// 5. Unified Login Endpoint (Auto-detects role across all 5 models - optimized parallel lookup)
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
    const rawEmail = email.trim();

    // 1. Parallel indexed query across all collections for speed (<600ms)
    const [admin, uni, sup, stu, emp] = await Promise.all([
      Admin.findOne({ email: { $in: [normalizedEmail, rawEmail] } }),
      University.findOne({ headEmail: { $in: [normalizedEmail, rawEmail] } }),
      Supervisor.findOne({ email: { $in: [normalizedEmail, rawEmail] } }),
      Student.findOne({ email: { $in: [normalizedEmail, rawEmail] } }).populate("university", "universityName profilePicture"),
      Employer.findOne({ email: { $in: [normalizedEmail, rawEmail] } }),
    ]);

    let user = null;
    let role = null;
    let displayName = null;
    let userEmail = null;

    if (admin) {
      user = admin;
      role = "admin";
      displayName = admin.fullName;
      userEmail = admin.email;
    } else if (uni) {
      user = uni;
      role = "university";
      displayName = uni.universityName;
      userEmail = uni.headEmail;
    } else if (sup) {
      user = sup;
      role = "supervisor";
      displayName = sup.fullName;
      userEmail = sup.email;
    } else if (stu) {
      user = stu;
      role = "student";
      displayName = stu.fullName;
      userEmail = stu.email;
    } else if (emp) {
      user = emp;
      role = "employer";
      displayName = emp.companyName;
      userEmail = emp.email;
    }

    // 2. Parallel case-insensitive fallback if not found with exact match
    if (!user) {
      const regex = new RegExp(`^${normalizedEmail}$`, "i");
      const [rAdmin, rUni, rSup, rStu, rEmp] = await Promise.all([
        Admin.findOne({ email: regex }),
        University.findOne({ headEmail: regex }),
        Supervisor.findOne({ email: regex }),
        Student.findOne({ email: regex }).populate("university", "universityName profilePicture"),
        Employer.findOne({ email: regex }),
      ]);

      if (rAdmin) {
        user = rAdmin;
        role = "admin";
        displayName = rAdmin.fullName;
        userEmail = rAdmin.email;
      } else if (rUni) {
        user = rUni;
        role = "university";
        displayName = rUni.universityName;
        userEmail = rUni.headEmail;
      } else if (rSup) {
        user = rSup;
        role = "supervisor";
        displayName = rSup.fullName;
        userEmail = rSup.email;
      } else if (rStu) {
        user = rStu;
        role = "student";
        displayName = rStu.fullName;
        userEmail = rStu.email;
      } else if (rEmp) {
        user = rEmp;
        role = "employer";
        displayName = rEmp.companyName;
        userEmail = rEmp.email;
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
        profilePicture: user.profilePicture || "",
        status: user.status || user.joinStatus || "active",
        joinStatus: user.joinStatus,
        university: user.university,
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
    let userData = { ...req.user };

    if (req.user && req.user.role === "student") {
      const student = await Student.findById(req.user.id).select("-password").populate("university", "universityName profilePicture");
      if (student) {
        userData = {
          ...userData,
          name: student.fullName,
          email: student.email,
          profilePicture: student.profilePicture || "",
          mainCategory: student.mainCategory,
          university: student.university,
          contactNumber: student.contactNumber,
          bio: student.bio,
          cvUrl: student.cvUrl,
        };
      }
    }

    if (req.user && req.user.role === "employer") {
      const employer = await Employer.findById(req.user.id).select("-password");
      if (employer) {
        userData = {
          ...userData,
          name: employer.companyName,
          status: employer.status,
          companyName: employer.companyName,
          companyCategory: employer.companyCategory,
          profilePicture: employer.profilePicture || "",
          brNumber: employer.brNumber,
          address: employer.address,
          contactNumber: employer.contactNumber,
          websiteUrl: employer.websiteUrl,
          linkedinUrl: employer.linkedinUrl,
          contactPersonName: employer.contactPersonName,
          contactPersonDesignation: employer.contactPersonDesignation,
          companySize: employer.companySize,
        };
      }
    }

    if (req.user && req.user.role === "supervisor") {
      const supervisor = await Supervisor.findById(req.user.id)
        .select("-password")
        .populate("university", "universityName headName headEmail contactNumber address profilePicture status");
      if (supervisor) {
        userData = {
          ...userData,
          name: supervisor.fullName,
          profilePicture: supervisor.profilePicture || "",
          status: supervisor.joinStatus,
          joinStatus: supervisor.joinStatus,
          staffRegNo: supervisor.staffRegNo,
          department: supervisor.department,
          contactNumber: supervisor.contactNumber,
          university: supervisor.university,
          reviewNotes: supervisor.reviewNotes,
        };
      }
    }

    if (req.user && req.user.role === "university") {
      const uni = await University.findById(req.user.id).select("-password");
      if (uni) {
        userData = {
          ...userData,
          name: uni.universityName,
          universityName: uni.universityName,
          headName: uni.headName,
          headEmail: uni.headEmail,
          profilePicture: uni.profilePicture || "",
          status: uni.status,
          contactNumber: uni.contactNumber,
          address: uni.address,
        };
      }
    }

    if (req.user && req.user.role === "admin") {
      const admin = await Admin.findById(req.user.id).select("-password");
      if (admin) {
        userData = {
          ...userData,
          name: admin.fullName,
          email: admin.email,
          profilePicture: admin.profilePicture || "",
        };
      }
    }

    res.json({
      success: true,
      user: userData,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching user profile.", error: err.message });
  }
};

// 7. Upload Profile Picture (Works for all 5 roles)
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please select an image file to upload." });
    }

    const userId = req.user.id;
    const role = req.user.role;
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    let userDoc = null;
    if (role === "student") userDoc = await Student.findById(userId);
    else if (role === "supervisor") userDoc = await Supervisor.findById(userId);
    else if (role === "employer") userDoc = await Employer.findById(userId);
    else if (role === "university") userDoc = await University.findById(userId);
    else if (role === "admin") userDoc = await Admin.findById(userId);

    if (!userDoc) {
      const orphanPath = path.join(__dirname, "..", "uploads", "avatars", req.file.filename);
      if (fs.existsSync(orphanPath)) fs.unlinkSync(orphanPath);
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    const oldPicture = userDoc.profilePicture;
    userDoc.profilePicture = avatarUrl;
    await userDoc.save();

    // Clean up previous uploaded avatar file
    if (oldPicture && oldPicture.startsWith("/uploads/avatars/")) {
      const oldPath = path.join(__dirname, "..", "uploads", "avatars", path.basename(oldPicture));
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch {}
      }
    }

    return res.json({
      success: true,
      message: "Profile picture uploaded successfully.",
      profilePicture: avatarUrl,
      user: {
        id: userDoc._id,
        role,
        name: userDoc.fullName || userDoc.universityName || userDoc.companyName,
        email: userDoc.email || userDoc.headEmail,
        profilePicture: avatarUrl,
      },
    });
  } catch (err) {
    console.error("uploadProfilePicture error:", err);
    if (req.file) {
      const orphanPath = path.join(__dirname, "..", "uploads", "avatars", req.file.filename);
      if (fs.existsSync(orphanPath)) {
        try { fs.unlinkSync(orphanPath); } catch {}
      }
    }
    return res.status(500).json({ success: false, message: "Failed to upload profile picture.", error: err.message });
  }
};

// 8. Delete Profile Picture (Works for all 5 roles)
exports.deleteProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let userDoc = null;
    if (role === "student") userDoc = await Student.findById(userId);
    else if (role === "supervisor") userDoc = await Supervisor.findById(userId);
    else if (role === "employer") userDoc = await Employer.findById(userId);
    else if (role === "university") userDoc = await University.findById(userId);
    else if (role === "admin") userDoc = await Admin.findById(userId);

    if (!userDoc) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    const oldPicture = userDoc.profilePicture;
    userDoc.profilePicture = "";
    await userDoc.save();

    if (oldPicture && oldPicture.startsWith("/uploads/avatars/")) {
      const oldPath = path.join(__dirname, "..", "uploads", "avatars", path.basename(oldPicture));
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch {}
      }
    }

    return res.json({
      success: true,
      message: "Profile picture removed successfully.",
      profilePicture: "",
    });
  } catch (err) {
    console.error("deleteProfilePicture error:", err);
    return res.status(500).json({ success: false, message: "Failed to remove profile picture.", error: err.message });
  }
};

// 9. Employer Profile: Get & Update
exports.getEmployerProfile = async (req, res) => {
  try {
    const employer = await Employer.findById(req.user.id).select("-password");
    if (!employer) {
      return res.status(404).json({ success: false, message: "Employer not found." });
    }
    return res.json({ success: true, employer });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching employer profile.", error: err.message });
  }
};

exports.updateEmployerProfile = async (req, res) => {
  try {
    const employer = await Employer.findById(req.user.id);
    if (!employer) {
      return res.status(404).json({ success: false, message: "Employer not found." });
    }

    const {
      companyName,
      companyCategory,
      contactPersonName,
      contactPersonDesignation,
      contactNumber,
      address,
      websiteUrl,
      linkedinUrl,
      companySize,
      clearProfilePicture,
    } = req.body;

    if (companyName && companyName.trim()) employer.companyName = companyName.trim();
    if (companyCategory && companyCategory.trim()) employer.companyCategory = companyCategory.trim();
    if (contactPersonName && contactPersonName.trim()) employer.contactPersonName = contactPersonName.trim();
    if (contactPersonDesignation && contactPersonDesignation.trim()) employer.contactPersonDesignation = contactPersonDesignation.trim();
    if (contactNumber !== undefined) employer.contactNumber = contactNumber.trim();
    if (address !== undefined) employer.address = address.trim();
    if (websiteUrl !== undefined) employer.websiteUrl = websiteUrl.trim();
    if (linkedinUrl !== undefined) employer.linkedinUrl = linkedinUrl.trim();
    if (companySize && companySize.trim()) employer.companySize = companySize.trim();

    if (req.file) {
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      if (employer.profilePicture && employer.profilePicture.startsWith("/uploads/avatars/")) {
        const oldPath = path.join(__dirname, "..", "uploads", "avatars", path.basename(employer.profilePicture));
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch {}
        }
      }
      employer.profilePicture = avatarUrl;
    } else if (clearProfilePicture === "true") {
      if (employer.profilePicture && employer.profilePicture.startsWith("/uploads/avatars/")) {
        const oldPath = path.join(__dirname, "..", "uploads", "avatars", path.basename(employer.profilePicture));
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch {}
        }
      }
      employer.profilePicture = "";
    }

    await employer.save();

    return res.json({
      success: true,
      message: "Employer profile updated successfully.",
      employer,
    });
  } catch (err) {
    console.error("updateEmployerProfile error:", err);
    return res.status(500).json({ success: false, message: "Error updating employer profile.", error: err.message });
  }
};

// 10. Admin Profile: Get & Update
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found." });
    }
    return res.json({ success: true, admin });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching admin profile.", error: err.message });
  }
};

exports.updateAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found." });
    }

    const { fullName, password, clearProfilePicture } = req.body;
    if (fullName && fullName.trim()) admin.fullName = fullName.trim();
    if (password && password.trim()) {
      if (password.trim().length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
      }
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(password.trim(), salt);
    }

    if (req.file) {
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      if (admin.profilePicture && admin.profilePicture.startsWith("/uploads/avatars/")) {
        const oldPath = path.join(__dirname, "..", "uploads", "avatars", path.basename(admin.profilePicture));
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch {}
        }
      }
      admin.profilePicture = avatarUrl;
    } else if (clearProfilePicture === "true") {
      if (admin.profilePicture && admin.profilePicture.startsWith("/uploads/avatars/")) {
        const oldPath = path.join(__dirname, "..", "uploads", "avatars", path.basename(admin.profilePicture));
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch {}
        }
      }
      admin.profilePicture = "";
    }

    await admin.save();

    return res.json({
      success: true,
      message: "Admin profile updated successfully.",
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        profilePicture: admin.profilePicture || "",
      },
    });
  } catch (err) {
    console.error("updateAdminProfile error:", err);
    return res.status(500).json({ success: false, message: "Error updating admin profile.", error: err.message });
  }
};
