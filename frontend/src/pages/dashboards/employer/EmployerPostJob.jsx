import React, { useState, useEffect } from 'react';
import jobService from '../../../services/jobService';
import LoadingState from '../../../components/LoadingState';
import InlineLoader from '../../../components/InlineLoader';
import './EmployerPostJob.css';

const INDUSTRY_CATEGORIES = [
  'Information Technology (IT)',
  'Software Engineering & Computer Science',
  'Business Administration & Management',
  'Finance & Accounting',
  'Civil & Mechanical Engineering',
  'Data Science & Artificial Intelligence',
  'Marketing & Digital Media',
  'UI/UX & Product Design',
];

const JOB_SUGGESTIONS = [
  'Software Engineering Intern',
  'Full Stack Web Development Intern',
  'Data Science & Machine Learning Intern',
  'UI/UX & Product Design Intern',
  'Cloud & DevOps Engineering Intern',
  'Quality Assurance (QA) Intern',
  'Business Analyst Intern',
];

const DURATION_OPTIONS = [
  '3 Months',
  '6 Months',
  '9 Months',
  '1 Year',
  'Negotiable',
];

export default function EmployerPostJob({ user, showToast, onJobCreated }) {
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'manage'
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [myJobs, setMyJobs] = useState([]);
  const [previewJob, setPreviewJob] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: user?.companyCategory || INDUSTRY_CATEGORIES[0],
    type: 'Internship',
    workplaceType: 'On-site',
    location: user?.address || 'Colombo, Sri Lanka',
    duration: '6 Months',
    stipend: 'LKR 45,000 / month',
    openings: 2,
    deadline: '',
    description: '',
    responsibilities: '',
    requirements: '',
  });

  const isVerified = user?.status === 'approved';

  // Load posted vacancies
  const fetchMyJobs = async () => {
    try {
      setFetchLoading(true);
      const res = await jobService.getMyJobs();
      if (res.success) {
        setMyJobs(res.jobs || []);
      }
    } catch (err) {
      console.error('Error loading posted jobs:', err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSuggestionClick = (title) => {
    setFormData((prev) => ({ ...prev, title }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isVerified) {
      showToast('Your account is currently pending verification. Only approved employers can post vacancies.', 'error');
      return;
    }

    if (!formData.title.trim() || !formData.category || !formData.description.trim()) {
      showToast('Please fill in all required fields: Title, Category, and Description.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await jobService.createJob(formData);
      if (res.success) {
        showToast(`Vacancy "${res.job.title}" has been published! Students are now able to apply.`, 'success');
        
        // Reset form
        setFormData({
          title: '',
          category: user?.companyCategory || INDUSTRY_CATEGORIES[0],
          type: 'Internship',
          workplaceType: 'On-site',
          location: user?.address || 'Colombo, Sri Lanka',
          duration: '6 Months',
          stipend: 'LKR 45,000 / month',
          openings: 2,
          deadline: '',
          description: '',
          responsibilities: '',
          requirements: '',
        });

        // Refresh list and switch to manage tab
        await fetchMyJobs();
        setActiveTab('manage');
        if (onJobCreated) onJobCreated();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to publish vacancy.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (job) => {
    try {
      setActionLoadingId(job._id);
      const res = await jobService.toggleAvailability(job._id);
      if (res.success) {
        showToast(res.message, 'success');
        fetchMyJobs();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to toggle vacancy status.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteJob = async () => {
    if (!deleteTarget) return;
    try {
      const res = await jobService.deleteJob(deleteTarget._id);
      if (res.success) {
        showToast(res.message, 'success');
        setDeleteTarget(null);
        fetchMyJobs();
        if (onJobCreated) onJobCreated();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete vacancy.', 'error');
    }
  };

  return (
    <div className="employer-post-job-view">
      {/* Header Row */}
      <div className="job-header-row">
        <div>
          <h2 className="job-section-title">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#2563eb' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            Internship Vacancy Publishing
          </h2>
          <p className="job-section-subtitle">
            Publish accredited internship positions for automated category matching with undergraduate applicants from partner Sri Lankan universities (PB-02, FR-15).
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="job-tabs-wrap">
          <button
            type="button"
            className={`job-tab-btn ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Post New Vacancy
          </button>
          <button
            type="button"
            className={`job-tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1.5"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5"/>
            </svg>
            My Posted Vacancies
            <span className="job-tab-count-badge">{myJobs.length}</span>
          </button>
        </div>
      </div>

      {/* Verification Gate Notice if Employer is NOT approved */}
      {!isVerified && (
        <div className="unverified-gate-banner">
          <div className="unverified-gate-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div>
            <div className="unverified-gate-title">Corporate Verification Pending Review (eROC)</div>
            <p className="unverified-gate-desc">
              Your organization account is currently in <strong>{user?.status || 'pending'}</strong> status awaiting administrator approval per Sri Lankan Registrar of Companies vetting (FR-10, NFR-04). You can prepare and preview vacancy drafts below, but publishing to students will unlock immediately once approved.
            </p>
          </div>
        </div>
      )}

      {/* TAB 1: CREATE VACANCY */}
      {activeTab === 'create' && (
        <div className="job-editor-layout">
          {/* Main Form */}
          <form className="job-form-card" onSubmit={handleSubmit} noValidate>
            {/* Section 1: Role Overview */}
            <div className="job-form-section">
              <h3 className="job-section-legend">
                <span className="form-section-badge">1</span>
                Internship Role & Domain
              </h3>
              <p className="job-section-hint">
                Define the primary specialization for automated algorithm matching with student candidates.
              </p>

              {/* Title */}
              <div className="form-group">
                <label className="form-label" htmlFor="title">
                  Vacancy Title <span className="required">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Software Engineering Intern"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />

                {/* Suggestions */}
                <div className="job-quick-suggestions">
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', alignSelf: 'center' }}>Popular:</span>
                  {JOB_SUGGESTIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="suggestion-pill"
                      onClick={() => handleSuggestionClick(item)}
                    >
                      + {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid 2 cols */}
              <div className="auth-form-grid" style={{ marginTop: '1rem' }}>
                {/* Industry Category */}
                <div className="form-group">
                  <label className="form-label" htmlFor="category">
                    Industry Category <span className="required">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    {INDUSTRY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Classification */}
                <div className="form-group">
                  <label className="form-label" htmlFor="type">
                    Position Type <span className="required">*</span>
                  </label>
                  <select
                    id="type"
                    name="type"
                    className="form-select"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="Internship">Internship (Undergraduate)</option>
                    <option value="Full-time">Graduate Trainee / Full-time</option>
                    <option value="Part-time">Part-time Trainee</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Workplace & Duration */}
            <div className="job-form-section">
              <h3 className="job-section-legend">
                <span className="form-section-badge">2</span>
                Workplace Mode, Location & Compensation
              </h3>
              <p className="job-section-hint">
                Specify working arrangements, office location, and internship allowance for undergraduate applicants.
              </p>

              {/* Workplace Mode */}
              <div className="form-group">
                <label className="form-label">Workplace Mode</label>
                <div className="workplace-mode-group">
                  {['On-site', 'Hybrid', 'Remote'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={`mode-toggle-btn ${formData.workplaceType === mode ? 'active' : ''}`}
                      onClick={() => setFormData((prev) => ({ ...prev, workplaceType: mode }))}
                    >
                      {mode === 'On-site' && '🏢 On-site'}
                      {mode === 'Hybrid' && '⚡ Hybrid'}
                      {mode === 'Remote' && '🌐 Remote'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="auth-form-grid" style={{ marginTop: '1rem' }}>
                {/* Location */}
                <div className="form-group">
                  <label className="form-label" htmlFor="location">
                    Office Location / City
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Colombo 03, Sri Lanka"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>

                {/* Duration */}
                <div className="form-group">
                  <label className="form-label" htmlFor="duration">
                    Internship Duration
                  </label>
                  <select
                    id="duration"
                    name="duration"
                    className="form-select"
                    value={formData.duration}
                    onChange={handleChange}
                  >
                    {DURATION_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stipend */}
                <div className="form-group">
                  <label className="form-label" htmlFor="stipend">
                    Monthly Allowance / Stipend
                  </label>
                  <input
                    id="stipend"
                    name="stipend"
                    type="text"
                    className="form-input"
                    placeholder="e.g. LKR 45,000 / month"
                    value={formData.stipend}
                    onChange={handleChange}
                  />
                </div>

                {/* Openings */}
                <div className="form-group">
                  <label className="form-label" htmlFor="openings">
                    Available Openings
                  </label>
                  <input
                    id="openings"
                    name="openings"
                    type="number"
                    min="1"
                    className="form-input"
                    value={formData.openings}
                    onChange={handleChange}
                  />
                </div>

                {/* Application Deadline */}
                <div className="form-group form-full-width">
                  <label className="form-label" htmlFor="deadline">
                    Application Deadline <span style={{ fontWeight: 400, color: 'var(--text-subtle)' }}>(Optional)</span>
                  </label>
                  <input
                    id="deadline"
                    name="deadline"
                    type="date"
                    className="form-input"
                    value={formData.deadline}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Description, Responsibilities & Skills */}
            <div className="job-form-section">
              <h3 className="job-section-legend">
                <span className="form-section-badge">3</span>
                Role Description & Requirements
              </h3>
              <p className="job-section-hint">
                Provide clear project descriptions and expectations to attract top-tier undergraduate applicants.
              </p>

              {/* Description */}
              <div className="form-group">
                <label className="form-label" htmlFor="description">
                  Role Overview & About the Internship <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="form-textarea"
                  rows={4}
                  placeholder="Describe the projects the intern will contribute to, mentorship opportunities, and team culture..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Responsibilities */}
              <div className="form-group">
                <label className="form-label" htmlFor="responsibilities">
                  Key Responsibilities <span style={{ fontWeight: 400, color: 'var(--text-subtle)' }}>(One per line)</span>
                </label>
                <textarea
                  id="responsibilities"
                  name="responsibilities"
                  className="form-textarea"
                  rows={3}
                  placeholder="• Collaborate with senior software engineers on modern React applications&#10;• Assist in backend API integration and automated unit testing&#10;• Participate in weekly Agile sprint ceremonies"
                  value={formData.responsibilities}
                  onChange={handleChange}
                />
              </div>

              {/* Requirements */}
              <div className="form-group">
                <label className="form-label" htmlFor="requirements">
                  Candidate Requirements & Desired Skills <span style={{ fontWeight: 400, color: 'var(--text-subtle)' }}>(One per line)</span>
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  className="form-textarea"
                  rows={3}
                  placeholder="• Undergraduate currently pursuing Bachelor's in CS, SE, or IT&#10;• Familiarity with JavaScript, React, and RESTful APIs&#10;• Strong communication and collaborative mindset"
                  value={formData.requirements}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading || !isVerified}
            >
              {loading ? (
                <>
                  <span>Publishing Vacancy...</span>
                  <InlineLoader />
                </>
              ) : !isVerified ? (
                'Publishing Locked (Pending Admin Verification)'
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Publish Internship Vacancy
                </>
              )}
            </button>
          </form>

          {/* Right Column: Live Student Preview */}
          <aside className="job-preview-panel">
            <div className="job-preview-card">
              <div className="preview-badge-header">
                <span className="preview-badge-tag">Student View Preview</span>
                <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>● Live Sync</span>
              </div>

              <div className="preview-company-row">
                <div className="preview-company-logo">
                  {(user?.name || 'CO').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="preview-company-name">{user?.name || 'Your Company Name'}</div>
                  <div className="preview-company-loc">{formData.location || 'Colombo, Sri Lanka'}</div>
                </div>
              </div>

              <div className="preview-job-title">
                {formData.title || 'Software Engineering Intern'}
              </div>

              <div className="preview-pills-row">
                <span className="preview-pill category">{formData.category}</span>
                <span className="preview-pill">{formData.workplaceType}</span>
                <span className="preview-pill">{formData.duration}</span>
                {formData.stipend && (
                  <span className="preview-pill stipend">{formData.stipend}</span>
                )}
                <span className="preview-pill">{formData.openings} Openings</span>
              </div>

              <div className="preview-divider" />

              <div className="preview-section-title">About the Role</div>
              <p className="preview-desc-text">
                {formData.description || 'Provide an overview of your internship vacancy to preview the description seen by students across partner universities.'}
              </p>

              {formData.responsibilities && (
                <>
                  <div className="preview-divider" />
                  <div className="preview-section-title">Key Responsibilities</div>
                  <p className="preview-desc-text">{formData.responsibilities}</p>
                </>
              )}

              {formData.requirements && (
                <>
                  <div className="preview-divider" />
                  <div className="preview-section-title">Requirements & Skills</div>
                  <p className="preview-desc-text">{formData.requirements}</p>
                </>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* TAB 2: MANAGE POSTED VACANCIES */}
      {activeTab === 'manage' && (
        <div className="posted-jobs-container">
          {fetchLoading ? (
            <LoadingState text="Loading your posted vacancies..." />
          ) : myJobs.length === 0 ? (
            <div className="admin-empty-state">
              <div className="admin-empty-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <h4 style={{ margin: '0 0 0.4rem', color: 'var(--navy-dark)' }}>No Vacancies Published Yet</h4>
              <p style={{ margin: '0 0 1.25rem', fontSize: '0.88rem' }}>
                Create your first internship vacancy to connect with accredited undergraduate students.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setActiveTab('create')}
              >
                + Post Your First Vacancy
              </button>
            </div>
          ) : (
            <div>
              {myJobs.map((job) => {
                const isActionLoading = actionLoadingId === job._id;
                return (
                  <div key={job._id} className="job-card-row">
                    <div className="job-card-left">
                      <div className={`job-status-indicator ${job.availability ? 'active' : 'closed'}`} />
                      <div>
                        <div className="job-title-row">
                          <span>{job.title}</span>
                          <span
                            className={`badge-status ${
                              job.availability ? 'badge-approved' : 'badge-rejected'
                            }`}
                            style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}
                          >
                            {job.availability ? 'Active / Open' : 'Closed'}
                          </span>
                          <span className="applicant-count-pill">
                            👥 {job.applicantCount || 0} Student Applicants
                          </span>
                        </div>
                        <div className="job-meta-line">
                          <span><strong>Domain:</strong> {job.category}</span>
                          <span>•</span>
                          <span><strong>Mode:</strong> {job.workplaceType || 'On-site'}</span>
                          <span>•</span>
                          <span><strong>Location:</strong> {job.location}</span>
                          <span>•</span>
                          <span><strong>Duration:</strong> {job.duration}</span>
                          <span>•</span>
                          <span><strong>Stipend:</strong> {job.stipend}</span>
                          <span>•</span>
                          <span><strong>Posted:</strong> {new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="job-card-actions">
                      <button
                        type="button"
                        className={`btn-toggle-availability ${job.availability ? 'close' : 'open'}`}
                        disabled={isActionLoading}
                        onClick={() => handleToggleAvailability(job)}
                        title={job.availability ? 'Close Applications' : 'Re-open Applications'}
                      >
                        <span>{job.availability ? 'Pause / Close' : 'Re-open'}</span>
                        {isActionLoading && <InlineLoader size={12} variant="dark" />}
                      </button>

                      <button
                        type="button"
                        className="btn-action btn-action-view"
                        onClick={() => setPreviewJob(job)}
                      >
                        Details
                      </button>

                      <button
                        type="button"
                        className="btn-action btn-action-delete"
                        onClick={() => setDeleteTarget(job)}
                        title="Delete Vacancy"
                      >
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Vacancy Details Modal */}
      {previewJob && (
        <div className="admin-modal-backdrop" onClick={() => setPreviewJob(null)}>
          <div className="admin-modal-card" style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{previewJob.title}</h3>
              <button type="button" className="admin-modal-close" onClick={() => setPreviewJob(null)}>
                ✕
              </button>
            </div>
            <div className="admin-modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
              <div className="modal-details-grid">
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Status</span>
                  <span className={`badge-status ${previewJob.availability ? 'badge-approved' : 'badge-rejected'}`} style={{ alignSelf: 'flex-start' }}>
                    {previewJob.availability ? 'Active / Open' : 'Closed'}
                  </span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Domain</span>
                  <span className="modal-detail-val">{previewJob.category}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Workplace</span>
                  <span className="modal-detail-val">{previewJob.workplaceType} ({previewJob.location})</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Stipend & Duration</span>
                  <span className="modal-detail-val">{previewJob.stipend} • {previewJob.duration}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Openings</span>
                  <span className="modal-detail-val">{previewJob.openings} positions</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Applicants Inflow</span>
                  <span className="modal-detail-val" style={{ color: 'var(--blue-primary)', fontWeight: 700 }}>
                    {previewJob.applicantCount || 0} Undergraduate Candidates
                  </span>
                </div>
                <div className="modal-detail-item" style={{ gridColumn: '1 / -1' }}>
                  <span className="modal-detail-label">Role Overview</span>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                    {previewJob.description}
                  </p>
                </div>
                {previewJob.responsibilities && previewJob.responsibilities.length > 0 && (
                  <div className="modal-detail-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="modal-detail-label">Key Responsibilities</span>
                    <ul style={{ margin: '0.25rem 0 0 1.2rem', padding: 0, fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                      {previewJob.responsibilities.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {previewJob.requirements && previewJob.requirements.length > 0 && (
                  <div className="modal-detail-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="modal-detail-label">Requirements & Skills</span>
                    <ul style={{ margin: '0.25rem 0 0 1.2rem', padding: 0, fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                      {previewJob.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPreviewJob(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="admin-modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="admin-modal-card" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title" style={{ color: '#ef4444' }}>Delete Internship Vacancy</h3>
              <button type="button" className="admin-modal-close" onClick={() => setDeleteTarget(null)}>
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#334155', lineHeight: 1.5 }}>
                Are you sure you want to delete <strong>{deleteTarget.title}</strong>? Any student applications submitted for this vacancy will also be permanently removed.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: '#ef4444', color: '#fff', border: 'none' }}
                onClick={handleDeleteJob}
              >
                Delete Vacancy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
