const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ── Ensure the upload directory exists at startup ─────────────────────────
const CV_UPLOAD_DIR = path.join(__dirname, "..", "uploads", "cv");
if (!fs.existsSync(CV_UPLOAD_DIR)) {
  fs.mkdirSync(CV_UPLOAD_DIR, { recursive: true });
}

// ── Disk storage configuration ─────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, CV_UPLOAD_DIR);
  },
  filename: (req, _file, cb) => {
    // Use the student's JWT id so the filename is traceable
    const studentId = req.user?.id || "unknown";
    const timestamp = Date.now();
    cb(null, `cv-${studentId}-${timestamp}.pdf`);
  },
});

// ── PDF-only file filter ───────────────────────────────────────────────────
const fileFilter = (_req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(
      new Error("Only PDF files are accepted for CV uploads. Please select a .pdf file."),
      false
    );
  }
};

// ── Raw multer instance (exported for re-use if needed) ───────────────────
const uploadCv = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB hard cap
});

// ── Safe Express middleware wrapper ───────────────────────────────────────
// Converts multer errors (file-size, wrong type, etc.) into clean JSON
// 400 responses instead of crashing the request.
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

    // Custom fileFilter rejection or any other error
    return res.status(400).json({ success: false, message: err.message });
  });
};

module.exports = { uploadCv, handleCvUpload, CV_UPLOAD_DIR };
