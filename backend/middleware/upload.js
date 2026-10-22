const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ── Ensure upload directories exist at startup ─────────────────────────────
const CV_UPLOAD_DIR = path.join(__dirname, "..", "uploads", "cv");
const AVATAR_UPLOAD_DIR = path.join(__dirname, "..", "uploads", "avatars");

if (!fs.existsSync(CV_UPLOAD_DIR)) {
  fs.mkdirSync(CV_UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(AVATAR_UPLOAD_DIR)) {
  fs.mkdirSync(AVATAR_UPLOAD_DIR, { recursive: true });
}

// ── Disk storage configuration for CVs ─────────────────────────────────────
const cvStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, CV_UPLOAD_DIR);
  },
  filename: (req, _file, cb) => {
    const studentId = req.user?.id || req.student?._id || "unknown";
    const timestamp = Date.now();
    cb(null, `cv-${studentId}-${timestamp}.pdf`);
  },
});

// ── Disk storage configuration for Avatars ─────────────────────────────────
const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, AVATAR_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const userId = req.user?.id || req.student?._id || "user";
    const ext = path.extname(file.originalname).toLowerCase() || ".png";
    const timestamp = Date.now();
    cb(null, `avatar-${userId}-${timestamp}${ext}`);
  },
});

// ── Combined storage configuration for Student Profile (CV + Avatar) ───────
const studentDocStorage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.fieldname === "cvFile") {
      cb(null, CV_UPLOAD_DIR);
    } else {
      cb(null, AVATAR_UPLOAD_DIR);
    }
  },
  filename: (req, file, cb) => {
    const studentId = req.user?.id || req.student?._id || "student";
    const timestamp = Date.now();
    if (file.fieldname === "cvFile") {
      cb(null, `cv-${studentId}-${timestamp}.pdf`);
    } else {
      const ext = path.extname(file.originalname).toLowerCase() || ".png";
      cb(null, `avatar-${studentId}-${timestamp}${ext}`);
    }
  },
});

// ── PDF-only file filter ───────────────────────────────────────────────────
const pdfFilter = (_req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(
      new Error("Only PDF files are accepted for CV uploads. Please select a .pdf file."),
      false
    );
  }
};

// ── Image-only file filter ─────────────────────────────────────────────────
const imageFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
  if (allowed.includes(file.mimetype) || file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(
      new Error("Only image files (JPG, PNG, WebP, GIF) are accepted for profile pictures."),
      false
    );
  }
};

// ── Combined Student filter ────────────────────────────────────────────────
const studentDocFilter = (_req, file, cb) => {
  if (file.fieldname === "cvFile") {
    return pdfFilter(_req, file, cb);
  }
  return imageFilter(_req, file, cb);
};

// ── Raw multer instances ───────────────────────────────────────────────────
const uploadCv = multer({
  storage: cvStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

const uploadStudentDocs = multer({
  storage: studentDocStorage,
  fileFilter: studentDocFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ── Safe Express middleware wrappers ───────────────────────────────────────
const handleCvUpload = (req, res, next) => {
  uploadCv.single("cvFile")(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      const msg =
        err.code === "LIMIT_FILE_SIZE"
          ? "CV file is too large. Maximum allowed size is 5 MB."
          : `File upload error: ${err.message}`;
      return res.status(400).json({ success: false, message: msg });
    }
    return res.status(400).json({ success: false, message: err.message });
  });
};

const handleAvatarUpload = (req, res, next) => {
  uploadAvatar.single("profilePictureFile")(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      const msg =
        err.code === "LIMIT_FILE_SIZE"
          ? "Profile picture is too large. Maximum allowed size is 5 MB."
          : `File upload error: ${err.message}`;
      return res.status(400).json({ success: false, message: msg });
    }
    return res.status(400).json({ success: false, message: err.message });
  });
};

const handleStudentProfileUpload = (req, res, next) => {
  uploadStudentDocs.fields([
    { name: "cvFile", maxCount: 1 },
    { name: "profilePictureFile", maxCount: 1 },
  ])(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      const msg =
        err.code === "LIMIT_FILE_SIZE"
          ? "Uploaded file is too large. Maximum allowed size is 5 MB."
          : `File upload error: ${err.message}`;
      return res.status(400).json({ success: false, message: msg });
    }
    return res.status(400).json({ success: false, message: err.message });
  });
};

module.exports = {
  uploadCv,
  handleCvUpload,
  uploadAvatar,
  handleAvatarUpload,
  handleStudentProfileUpload,
  CV_UPLOAD_DIR,
  AVATAR_UPLOAD_DIR,
};
