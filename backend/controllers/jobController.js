const mongoose = require("mongoose");
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

    // Attach applicant counts to each job (total + still-pending)
    const jobsWithStats = await Promise.all(
      jobs.map(async (job) => {
        const [applicantCount, pendingCount, acceptedCount] = await Promise.all([
          Application.countDocuments({ job: job._id }),
          Application.countDocuments({ job: job._id, status: "pending" }),
          Application.countDocuments({ job: job._id, status: "accepted" }),
        ]);
        return {
          ...job.toObject(),
          applicantCount,
          pendingCount,
          acceptedCount,
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

// 10. Active interns (accepted applications) of the employer, grouped by internship position
exports.getActiveInterns = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "employer") {
      return res.status(403).json({ success: false, message: "Access restricted to employers." });
    }

    const jobs = await Job.find({ employer: req.user.id }).select("title category duration");
    const jobIds = jobs.map((j) => j._id);

    const accepted = await Application.find({ job: { $in: jobIds }, status: "accepted" })
      .populate({
        path: "student",
        select: "fullName email contactNumber mainCategory cvUrl profilePicture university",
        populate: { path: "university", select: "universityName" },
      })
      .sort({ updatedAt: -1 });

    const positions = jobs
      .map((job) => ({
        jobId: job._id,
        title: job.title,
        category: job.category,
        duration: job.duration,
        interns: accepted
          .filter((a) => a.student && String(a.job) === String(job._id))
          .map((a) => ({ applicationId: a._id, startedAt: a.updatedAt, student: a.student })),
      }))
      .filter((p) => p.interns.length > 0);

    res.json({
      success: true,
      total: positions.reduce((n, p) => n + p.interns.length, 0),
      positions,
    });
  } catch (err) {
    console.error("Error fetching active interns:", err);
    res.status(500).json({ success: false, message: "Failed to load active interns.", error: err.message });
  }
};

// 8. Get applicants for all vacancies posted by the logged-in employer
exports.getEmployerApplicants = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "employer") {
      return res.status(403).json({ success: false, message: "Access restricted to employers." });
    }

    const jobs = await Job.find({ employer: req.user.id }).select("_id");
    const jobIds = jobs.map((j) => j._id);

    const applications = await Application.find({ job: { $in: jobIds }, status: "pending" })
      .populate({
        path: "student",
        select: "fullName email contactNumber mainCategory cvUrl bio profilePicture university",
        populate: { path: "university", select: "universityName" },
      })
      .populate("job", "title category")
      .sort({ createdAt: -1 });

    const valid = applications.filter((a) => a.student && a.job);

    res.json({
      success: true,
      count: valid.length,
      applications: valid,
    });
  } catch (err) {
    console.error("Error fetching applicants:", err);
    res.status(500).json({ success: false, message: "Failed to load applicants.", error: err.message });
  }
};

// 9. Accept / reject an application for one of the employer's vacancies
exports.updateApplicationStatus = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "employer") {
      return res.status(403).json({ success: false, message: "Access restricted to employers." });
    }
    const { status } = req.body;
    if (!["pending", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid application id." });
    }

    const application = await Application.findById(req.params.id).populate("job", "employer title openings");
    if (!application || !application.job || String(application.job.employer) !== String(req.user.id)) {
      return res.status(404).json({ success: false, message: "Application not found or unauthorized." });
    }

    if (application.status === status) {
      return res.json({ success: true, message: `Application is already ${status}.`, status, autoClosedIds: [] });
    }

    let autoClosedIds = [];

    if (status === "accepted") {
      // Guard 1: a student can only hold one active internship (across all companies)
      const otherAccepted = await Application.findOne({
        student: application.student,
        status: "accepted",
        _id: { $ne: application._id },
      }).populate({ path: "job", select: "title employer", populate: { path: "employer", select: "companyName" } });

      if (otherAccepted) {
        const sameCompany = otherAccepted.job && String(otherAccepted.job.employer?._id) === String(req.user.id);
        return res.status(409).json({
          success: false,
          message: sameCompany
            ? `This student is already an active intern at your company (${otherAccepted.job.title}).`
            : "This student has already been hired as an intern by another company.",
        });
      }

      // Guard 2: respect the vacancy's openings limit
      const openings = application.job.openings || 1;
      const filled = await Application.countDocuments({ job: application.job._id, status: "accepted" });
      if (filled >= openings) {
        return res.status(409).json({
          success: false,
          message: `All ${openings} opening${openings === 1 ? "" : "s"} for "${application.job.title}" are already filled.`,
        });
      }

      application.status = "accepted";
      await application.save();

      // Auto-close the student's other pending applications (any company)
      const others = await Application.find({
        student: application.student,
        status: "pending",
        _id: { $ne: application._id },
      }).select("_id");
      autoClosedIds = others.map((o) => o._id);
      if (autoClosedIds.length) {
        await Application.updateMany({ _id: { $in: autoClosedIds } }, { $set: { status: "rejected" } });
      }
    } else {
      application.status = status;
      await application.save();
    }

    const extra = autoClosedIds.length
      ? ` ${autoClosedIds.length} other pending application${autoClosedIds.length === 1 ? " was" : "s were"} closed automatically.`
      : "";
    res.json({ success: true, message: `Application marked as ${status}.${extra}`, status, autoClosedIds });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update application.", error: err.message });
  }
};
