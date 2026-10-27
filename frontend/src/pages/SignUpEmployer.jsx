import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { useLoadingDelay } from '../hooks/useLoadingDelay';
import InlineLoader from '../components/InlineLoader';
import './AuthPages.css';

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

const COMPANY_SIZES = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '200+ employees',
];

const MEMBERSHIP_OPTIONS = [
  'SLASSCOM',
  'FITIS',
  'CSSL',
  'ICTA / StartupSL',
  'ISO/IEC 27001',
  'TechCERT / SL CERT',
];

const FREE_EMAIL_PROVIDERS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'icloud.com',
  'aol.com',
];

const isFreeDomain = (email) => {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1]?.toLowerCase().trim();
  return FREE_EMAIL_PROVIDERS.includes(domain);
};

export default function SignUpEmployer() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Section 1: Account & Category
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyCategory: '',
    companySize: '',
    // Section 2: Legitimacy & Verification
    brNumber: '',
    websiteUrl: '',
    linkedinUrl: '',
    industryMemberships: [],
    // Section 3: HR Representative & Location
    contactPersonName: '',
    contactPersonDesignation: '',
    contactNumber: '',
    address: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const showLoader = useLoadingDelay(isSubmitting, 1000);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  const toggleMembership = (item) => {
    setFormData((prev) => {
      const exists = prev.industryMemberships.includes(item);
      return {
        ...prev,
        industryMemberships: exists
          ? prev.industryMemberships.filter((m) => m !== item)
          : [...prev.industryMemberships, item],
      };
    });
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Required fields check
    if (
      !formData.companyName.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.companyCategory ||
      !formData.companySize ||
      !formData.brNumber.trim() ||
      !formData.contactPersonName.trim() ||
      !formData.contactPersonDesignation.trim()
    ) {
      setErrorMsg('Please complete all required fields marked with an asterisk (*).');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters in length.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your password entry.');
      return;
    }

    // Official website URL check
    if (formData.websiteUrl.trim()) {
      const webUrl = formData.websiteUrl.trim();
      if (!/^https?:\/\/.+/i.test(webUrl)) {
        setErrorMsg('Official Website URL must start with http:// or https://');
        return;
      }
    }

    // LinkedIn URL check
    if (formData.linkedinUrl.trim()) {
      const liUrl = formData.linkedinUrl.trim();
      if (!/^https?:\/\//i.test(liUrl)) {
        setErrorMsg('Company LinkedIn Profile URL must start with http:// or https://');
        return;
      }
      if (
        !liUrl.toLowerCase().includes('linkedin.com/company/') &&
        !liUrl.toLowerCase().includes('linkedin.com/in/')
      ) {
        setErrorMsg('Company LinkedIn URL must contain "linkedin.com/company/" or "linkedin.com/in/".');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        companyName: formData.companyName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        companyCategory: formData.companyCategory,
        companySize: formData.companySize,
        brNumber: formData.brNumber.trim(),
        websiteUrl: formData.websiteUrl.trim() || undefined,
        linkedinUrl: formData.linkedinUrl.trim() || undefined,
        industryMemberships: formData.industryMemberships,
        contactPersonName: formData.contactPersonName.trim(),
        contactPersonDesignation: formData.contactPersonDesignation.trim(),
        contactNumber: formData.contactNumber.trim() || undefined,
        address: formData.address.trim() || undefined,
      };

      const res = await authService.registerEmployer(payload);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMsg(res.message || 'Failed to submit employer registration.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Server error occurred during employer registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <header className="auth-header-bar">
        <Link to="/" className="auth-back-link">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>Back to Home</span>
        </Link>
        <Link to="/" className="brand-title" style={{ fontSize: '1.25rem' }}>
          Interlink
        </Link>
      </header>

      <main className="auth-main-container">
        <div className="auth-card-layout wide animate-fade-in">
          {isSuccess ? (
            <div className="auth-success-screen">
              <div className="success-badge-icon pending">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <h2 className="success-screen-title">Registration Submitted!</h2>
              <p className="success-screen-desc">
                Your enterprise account has been created and is currently <strong>awaiting administrator approval (PB-02, FR-10)</strong>. Interlink Administrators will verify your corporate registration with the Registrar of Companies (eROC). Once verified, you can sign in to post vacancies and access talent pools.
              </p>
              <div className="success-actions-group">
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={() => navigate('/login')}
                >
                  Go to Sign In
                </button>
                <Link to="/" className="btn btn-secondary btn-lg">
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="auth-card-header">
                <span className="auth-role-tag">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                  Enterprise Partner Vetting
                </span>
                <h1 className="auth-card-title">Employer Registration</h1>
                <p className="auth-card-subtitle">
                  Join Interlink to recruit accredited undergraduate talent from top Sri Lankan universities. Complete your corporate profile below for expedited Administrator verification.
                </p>
              </div>

              {errorMsg && (
                <div className="alert-box alert-error" role="alert">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* SECTION 1: Account & Category Details */}
                <div className="form-section-block">
                  <div className="form-section-header">
                    <div className="form-section-badge">1</div>
                    <div className="form-section-title-wrap">
                      <h2 className="form-section-title">Account & Category Details</h2>
                      <p className="form-section-subtitle">
                        Basic organization profile, recruitment domain, and secure portal access credentials.
                      </p>
                    </div>
                  </div>

                  <div className="auth-form-grid">
                    {/* Company Name */}
                    <div className="form-group form-full-width">
                      <label className="form-label" htmlFor="companyName">
                        Company / Organization Name <span className="required">*</span>
                      </label>
                      <input
                        id="companyName"
                        name="companyName"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Tech Solutions Pvt Ltd"
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* Corporate Work Email */}
                    <div className="form-group form-full-width">
                      <label className="form-label" htmlFor="email">
                        Corporate Work Email <span className="required">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className="form-input"
                        placeholder="e.g. hr@techsolutions.lk"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                      {isFreeDomain(formData.email) && (
                        <div className="email-domain-warning">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          <span>
                            Using an official corporate domain email matching your website speeds up Admin approval.
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Primary Industry Category */}
                    <div className="form-group">
                      <label className="form-label" htmlFor="companyCategory">
                        Primary Industry Category <span className="required">*</span>
                      </label>
                      <select
                        id="companyCategory"
                        name="companyCategory"
                        className="form-select"
                        value={formData.companyCategory}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select industry domain</option>
                        {INDUSTRY_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <div className="form-helper-text">
                        Used for auto-matching with students' specialization.
                      </div>
                    </div>

                    {/* Company Size */}
                    <div className="form-group">
                      <label className="form-label" htmlFor="companySize">
                        Company Size (Headcount) <span className="required">*</span>
                      </label>
                      <select
                        id="companySize"
                        name="companySize"
                        className="form-select"
                        value={formData.companySize}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select headcount range</option>
                        {COMPANY_SIZES.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Password */}
                    <div className="form-group">
                      <label className="form-label" htmlFor="password">
                        Account Password <span className="required">*</span>
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        className="form-input"
                        placeholder="Min 6 characters"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group">
                      <label className="form-label" htmlFor="confirmPassword">
                        Confirm Password <span className="required">*</span>
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        className="form-input"
                        placeholder="Re-type password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Legitimacy & Verification Details */}
                <div className="form-section-block">
                  <div className="form-section-header">
                    <div className="form-section-badge verification">2</div>
                    <div className="form-section-title-wrap">
                      <h2 className="form-section-title">Legitimacy & Verification Details</h2>
                      <p className="form-section-subtitle">
                        Sri Lankan Registrar of Companies (eROC) data and digital footprint for manual Administrator vetting.
                      </p>
                    </div>
                  </div>

                  <div className="auth-form-grid">
                    {/* BR / eROC Number */}
                    <div className="form-group form-full-width">
                      <label className="form-label" htmlFor="brNumber">
                        Business Registration / eROC Number <span className="required">*</span>
                      </label>
                      <input
                        id="brNumber"
                        name="brNumber"
                        type="text"
                        className="form-input"
                        placeholder="e.g., PV 00123456 or BR Number"
                        value={formData.brNumber}
                        onChange={handleChange}
                        required
                      />
                      <div className="form-helper-text">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="16" x2="12" y2="12"/>
                          <line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                        Used by Interlink Admins to verify your organization with the Registrar of Companies (eROC).
                      </div>
                    </div>

                    {/* Official Website URL */}
                    <div className="form-group">
                      <label className="form-label" htmlFor="websiteUrl">
                        Official Website URL
                      </label>
                      <input
                        id="websiteUrl"
                        name="websiteUrl"
                        type="url"
                        className="form-input"
                        placeholder="https://yourcompany.lk"
                        value={formData.websiteUrl}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Company LinkedIn Profile */}
                    <div className="form-group">
                      <label className="form-label" htmlFor="linkedinUrl">
                        Company LinkedIn Profile URL
                      </label>
                      <input
                        id="linkedinUrl"
                        name="linkedinUrl"
                        type="url"
                        className="form-input"
                        placeholder="https://www.linkedin.com/company/your-company"
                        value={formData.linkedinUrl}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Industry Affiliations & Certifications */}
                    <div className="form-group form-full-width">
                      <label className="form-label">
                        Industry Affiliations & Certifications <span style={{ fontWeight: 400, color: 'var(--text-subtle)' }}>(Optional)</span>
                      </label>
                      <div className="membership-pills-grid">
                        {MEMBERSHIP_OPTIONS.map((item) => {
                          const isSelected = formData.industryMemberships.includes(item);
                          return (
                            <button
                              key={item}
                              type="button"
                              className={`membership-pill-btn ${isSelected ? 'active' : ''}`}
                              onClick={() => toggleMembership(item)}
                            >
                              {isSelected ? (
                                <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              ) : (
                                <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>+</span>
                              )}
                              <span>{item}</span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="form-helper-text">
                        Select applicable corporate certifications or trade affiliations to build trust with partner universities.
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Authorized Recruiter / HR Representative Details */}
                <div className="form-section-block">
                  <div className="form-section-header">
                    <div className="form-section-badge hr">3</div>
                    <div className="form-section-title-wrap">
                      <h2 className="form-section-title">HR Contact & Location Details</h2>
                      <p className="form-section-subtitle">
                        Authorized representative credentials for internship agreements and faculty supervisor coordination.
                      </p>
                    </div>
                  </div>

                  <div className="auth-form-grid">
                    {/* Contact Person Name */}
                    <div className="form-group">
                      <label className="form-label" htmlFor="contactPersonName">
                        Representative Full Name <span className="required">*</span>
                      </label>
                      <input
                        id="contactPersonName"
                        name="contactPersonName"
                        type="text"
                        className="form-input"
                        placeholder="e.g., Nimal Perera"
                        value={formData.contactPersonName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* Contact Person Designation */}
                    <div className="form-group">
                      <label className="form-label" htmlFor="contactPersonDesignation">
                        Role / Job Title <span className="required">*</span>
                      </label>
                      <input
                        id="contactPersonDesignation"
                        name="contactPersonDesignation"
                        type="text"
                        className="form-input"
                        placeholder="e.g., HR Manager / Talent Acquisition Lead / CTO"
                        value={formData.contactPersonDesignation}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* HR Contact Phone Number */}
                    <div className="form-group">
                      <label className="form-label" htmlFor="contactNumber">
                        HR / Contact Phone Number
                      </label>
                      <input
                        id="contactNumber"
                        name="contactNumber"
                        type="tel"
                        className="form-input"
                        placeholder="e.g. +94 11 222 3344"
                        value={formData.contactNumber}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Office / Headquarters Address */}
                    <div className="form-group">
                      <label className="form-label" htmlFor="address">
                        Office / Headquarters Address
                      </label>
                      <input
                        id="address"
                        name="address"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Colombo, Sri Lanka"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary auth-submit-btn"
                  disabled={isSubmitting}
                >
                  <span>{isSubmitting ? 'Submitting Company Profile' : 'Submit Employer Registration for Approval'}</span>
                  {showLoader && <InlineLoader />}
                </button>
              </form>

              <div className="auth-footer-links">
                <div>
                  Already have an employer account? <Link to="/login">Sign in here</Link>
                </div>
                <div className="role-switcher-links">
                  <span>Register as a different role:</span>
                  <Link to="/signup/student" className="role-switch-pill">
                    Intern (Student)
                  </Link>
                  <Link to="/signup/university" className="role-switch-pill">
                    University
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

