const Job = require("../models/Job");
const Employer = require("../models/Employer");
const Application = require("../models/Application");

// 1. Create Job / Internship Vacancy (Only for approved/verified employers)
exports.createJob = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "employer") {
      return res.status(403).json({
        success: false,
        message: "Access restricted. Only corporate employer accounts can publish job vacancies.",
      });
    }

    // Verify employer in database and ensure verified/approved status
    const employer = await Employer.findById(req.user.id);
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: "Employer organization profile not found.",
      });
    }

    if (employer.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your organization account is currently pending verification. Only approved employers can publish internship vacancies.",
      });
    }

    const {
      title,
      category,
      description,
      type = "Internship",
      workplaceType = "On-site",
      location,
      duration = "6 Months",
      stipend,
      openings = 1,
      requirements,
      responsibilities,
      deadline,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Internship vacancy title is required." });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: "Industry category is required for student matching." });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: "Vacancy description is required." });
    }

    // Helper to sanitize array of bullet points or text strings
    const parseList = (item) => {
      if (!item) return [];
      if (Array.isArray(item)) {
        return item.map((s) => String(s).trim()).filter(Boolean);
      }
      if (typeof item === "string") {
        return item
          .split("\n")
          .map((line) => line.replace(/^[-•*]\s*/, "").trim())
          .filter(Boolean);
      }
      return [];
    };

    const newJob = await Job.create({
      employer: employer._id,
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      type: ["Full-time", "Part-time", "Internship"].includes(type) ? type : "Internship",
      workplaceType: ["On-site", "Hybrid", "Remote"].includes(workplaceType) ? workplaceType : "On-site",
      location: location && location.trim() ? location.trim() : (employer.address || "Colombo, Sri Lanka"),
      duration: duration && duration.trim() ? duration.trim() : "6 Months",
      stipend: stipend && stipend.trim() ? stipend.trim() : "Competitive / Negotiable",
      openings: Number(openings) > 0 ? Number(openings) : 1,
      requirements: parseList(requirements),
      responsibilities: parseList(responsibilities),
      deadline: deadline ? new Date(deadline) : undefined,
      availability: true,
      status: "active",
    });

    res.status(201).json({
      success: true,
      message: `Internship vacancy "${newJob.title}" has been published successfully!`,
      job: newJob,
    });
  } catch (err) {
    console.error("Error creating job:", err);
    res.status(500).json({ success: false, message: "Failed to publish internship vacancy.", error: err.message });
  }
};

// 2. Get all vacancies posted by the logged-in employer
exports.getEmployerJobs = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "employer") {
      return res.status(403).json({ success: false, message: "Access restricted to employers." });
    }

    const jobs = await Job.find({ employer: req.user.id })
      .populate("employer", "companyName email address companyCategory websiteUrl status")
      .sort({ createdAt: -1 });

    // Attach applicant count to each job
    const jobsWithStats = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await Application.countDocuments({ job: job._id });
        return {
          ...job.toObject(),
          applicantCount,
        };
      })
    );

    res.json({
      success: true,
      count: jobsWithStats.length,
      jobs: jobsWithStats,
    });
  } catch (err) {
    console.error("Error fetching employer jobs:", err);
    res.status(500).json({ success: false, message: "Failed to load internship vacancies.", error: err.message });
  }
};

// 3. Get single job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "employer",
      "companyName email address companyCategory websiteUrl contactPersonName"
    );
    if (!job) {
      return res.status(404).json({ success: false, message: "Vacancy not found." });
    }

    const applicantCount = await Application.countDocuments({ job: job._id });

    res.json({
      success: true,
      job: {
        ...job.toObject(),
        applicantCount,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load vacancy.", error: err.message });
  }
};

// 4. Update job
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, employer: req.user.id });
    if (!job) {
      return res.status(404).json({ success: false, message: "Vacancy not found or unauthorized." });
    }

    const updatable = [
      "title",
      "category",
      "description",
      "type",
      "workplaceType",
      "location",
      "duration",
      "stipend",
      "openings",
      "requirements",
      "responsibilities",
      "deadline",
      "availability",
      "status",
    ];

    updatable.forEach((field) => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    await job.save();

    res.json({
      success: true,
      message: "Vacancy updated successfully.",
      job,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update vacancy.", error: err.message });
  }
};

// 5. Toggle job availability (Open / Close applications)
exports.toggleJobAvailability = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, employer: req.user.id });
    if (!job) {
      return res.status(404).json({ success: false, message: "Vacancy not found or unauthorized." });
    }

    job.availability = !job.availability;
    job.status = job.availability ? "active" : "closed";
    await job.save();

    res.json({
      success: true,
      message: `Vacancy "${job.title}" is now ${job.availability ? "Open for applications" : "Closed"}.`,
      job,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to toggle vacancy status.", error: err.message });
  }
};

// 6. Delete job
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, employer: req.user.id });
    if (!job) {
      return res.status(404).json({ success: false, message: "Vacancy not found or unauthorized." });
    }

    // Clean up applications for this job
    await Application.deleteMany({ job: job._id });

    res.json({
      success: true,
      message: `Vacancy "${job.title}" has been deleted.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete vacancy.", error: err.message });
  }
};

// 7. Get all public active vacancies
exports.getAllPublicJobs = async (req, res) => {
  try {
    const { category, workplaceType, search } = req.query;
    const filter = { availability: true };

    if (category && category !== "all") {
      filter.category = category;
    }
    if (workplaceType && workplaceType !== "all") {
      filter.workplaceType = workplaceType;
    }
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ title: regex }, { description: regex }, { location: regex }];
    }

    const jobs = await Job.find(filter)
      .populate("employer", "companyName email address companyCategory websiteUrl status")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: jobs.length, jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch vacancies.", error: err.message });
  }
};
