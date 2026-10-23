import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { useLoadingDelay } from '../hooks/useLoadingDelay';
import InlineLoader from '../components/InlineLoader';
import './AuthPages.css';

export default function SignUpSupervisor() {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState([]);
  const [loadingUnis, setLoadingUnis] = useState(true);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    staffRegNo: '',
    department: '',
    university: '',
    contactNumber: '',
    autoSendRequest: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const showLoader = useLoadingDelay(isSubmitting, 1000);
  const [submittedStatus, setSubmittedStatus] = useState('pending');

  // Fetch approved universities for dropdown (FR-03)
  useEffect(() => {
    const fetchUnis = async () => {
      try {
        const res = await authService.getApprovedUniversities();
        if (res.success && res.universities) {
          setUniversities(res.universities);
          if (res.universities.length > 0) {
            setFormData((prev) => ({ ...prev, university: res.universities[0]._id }));
          }
        }
      } catch (err) {
        console.error('Failed to load universities:', err);
      } finally {
        setLoadingUnis(false);
      }
    };

    fetchUnis();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations (FR-03, US-02)
    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.staffRegNo.trim() ||
      !formData.university
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

    setIsSubmitting(true);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        staffRegNo: formData.staffRegNo.trim(),
        university: formData.university,
        department: formData.department.trim() || undefined,
        contactNumber: formData.contactNumber.trim() || undefined,
        autoSendRequest: Boolean(formData.autoSendRequest),
      };

      const res = await authService.registerSupervisor(payload);
      if (res.success) {
        setSubmittedStatus(res.user?.joinStatus || (formData.autoSendRequest ? 'pending' : 'draft'));
        setIsSuccess(true);
      } else {
        setErrorMsg(res.message || 'Failed to submit supervisor registration.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Server error occurred during supervisor registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* Top Header Bar */}
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

      {/* Main Container */}
      <main className="auth-main-container">
        <div className="auth-card-layout wide animate-fade-in">
          {isSuccess ? (
            <div className="auth-success-screen">
              <div className={`success-badge-icon ${submittedStatus === 'pending' ? 'pending' : ''}`}>
                {submittedStatus === 'pending' ? (
                  <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>

              <h2 className="success-screen-title">
                {submittedStatus === 'pending'
                  ? 'Registration & Join Request Submitted!'
                  : 'Supervisor Account Created!'}
              </h2>

              <p className="success-screen-desc">
                {submittedStatus === 'pending' ? (
                  <>
                    Your supervisor account has been registered and an official join request has been dispatched to your <strong>University Head's approval queue</strong>. Once verified, your access to student intern rosters and progress logs will unlock automatically.
                  </>
                ) : (
                  <>
                    Your supervisor account is ready. Sign in to access your advisor dashboard, view institutional affiliation options, and submit your join request when ready.
                  </>
                )}
              </p>

              <div className="success-actions-group">
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={() => navigate('/login')}
                >
                  Proceed to Sign In
                </button>
                <Link to="/" className="btn btn-secondary btn-lg">
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Card Header */}
              <div className="auth-card-header">
                <span className="auth-role-tag">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  Academic Supervisor
                </span>
                <h1 className="auth-card-title">Supervisor Registration</h1>
                <p className="auth-card-subtitle">
                  Register as faculty staff to monitor undergraduate interns, audit daily logbook entries, and coordinate with your University Head.
                </p>
              </div>

              {/* Error Alert */}
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

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate>
                {/* SECTION 1: Academic Identity */}
                <div className="form-section-block">
                  <div className="form-section-header">
                    <div className="form-section-badge">1</div>
                    <div className="form-section-title-wrap">
                      <h3 className="form-section-title">Academic Identity & Contact</h3>
                      <p className="form-section-subtitle">
                        Official staff credentials verified by your degree-awarding university (FR-03).
                      </p>
                    </div>
                  </div>

                  <div className="auth-form-grid">
                    <div className="form-group form-full-width">
                      <label className="form-label" htmlFor="fullName">
                        Full Name & Academic Title <span className="required">*</span>
                      </label>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Dr. Kasun Jayawardena / Prof. M. Perera"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="email">
                        Institutional Email Address <span className="required">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className="form-input"
                        placeholder="e.g. kasun@ruh.ac.lk"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                      <span className="form-helper-text">
                        Use your active university or faculty email address.
                      </span>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="staffRegNo">
                        Staff Registration Number <span className="required">*</span>
                      </label>
                      <input
                        id="staffRegNo"
                        name="staffRegNo"
                        type="text"
                        className="form-input"
                        placeholder="e.g. STF-2023-088"
                        value={formData.staffRegNo}
                        onChange={handleChange}
                        required
                      />
                      <span className="form-helper-text">
                        Required for your University Head to verify staff identity.
                      </span>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="department">
                        Academic Department / Faculty
                      </label>
                      <input
                        id="department"
                        name="department"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Dept. of Information & Communication Tech"
                        value={formData.department}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="contactNumber">
                        Contact Phone Number
                      </label>
                      <input
                        id="contactNumber"
                        name="contactNumber"
                        type="tel"
                        className="form-input"
                        placeholder="e.g. +94 77 123 4567"
                        value={formData.contactNumber}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: University Affiliation & Join Request */}
                <div className="form-section-block">
                  <div className="form-section-header">
                    <div className="form-section-badge verification">2</div>
                    <div className="form-section-title-wrap">
                      <h3 className="form-section-title">Institutional Affiliation & Join Request</h3>
                      <p className="form-section-subtitle">
                        Select your institution and configure your supervisor onboarding workflow (US-02, FR-04).
                      </p>
                    </div>
                  </div>

                  <div className="auth-form-grid">
                    <div className="form-group form-full-width">
                      <label className="form-label" htmlFor="university">
                        Affiliated University Institution <span className="required">*</span>
                      </label>
                      {loadingUnis ? (
                        <div style={{ color: '#64748b', fontSize: '0.9rem', padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>Loading recognized institutions...</span>
                          <InlineLoader size={14} variant="dark" />
                        </div>
                      ) : (
                        <select
                          id="university"
                          name="university"
                          className="form-input"
                          value={formData.university}
                          onChange={handleChange}
                          required
                        >
                          {universities.map((uni) => (
                            <option key={uni._id} value={uni._id}>
                              {uni.universityName}
                            </option>
                          ))}
                        </select>
                      )}
                      <span className="form-helper-text">
                        Select the accredited higher education institution you supervise for.
                      </span>
                    </div>

                    {/* US-02 Auto-send Join Request Card */}
                    <div className="form-group form-full-width" style={{ marginTop: '0.25rem' }}>
                      <label
                        htmlFor="autoSendRequest"
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.85rem',
                          cursor: 'pointer',
                          background: '#f8fafc',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '1rem 1.15rem',
                          transition: 'border-color 0.2s ease, background 0.2s ease',
                        }}
                      >
                        <input
                          id="autoSendRequest"
                          name="autoSendRequest"
                          type="checkbox"
                          checked={formData.autoSendRequest}
                          onChange={handleChange}
                          style={{
                            marginTop: '0.2rem',
                            width: '18px',
                            height: '18px',
                            accentColor: 'var(--blue-primary)',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--navy-dark)', display: 'block' }}>
                            Send join request automatically to University Head upon registration
                          </span>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', lineHeight: 1.45, display: 'block', marginTop: '0.2rem' }}>
                            If checked, your request is submitted immediately to your University Head's approval queue (US-02).
                            If unchecked, you can search and submit the request manually later from your supervisor dashboard.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Account Security */}
                <div className="form-section-block">
                  <div className="form-section-header">
                    <div className="form-section-badge hr">3</div>
                    <div className="form-section-title-wrap">
                      <h3 className="form-section-title">Account Security</h3>
                      <p className="form-section-subtitle">
                        Create credentials for logging in to your faculty advisory portal.
                      </p>
                    </div>
                  </div>

                  <div className="auth-form-grid">
                    <div className="form-group">
                      <label className="form-label" htmlFor="password">
                        Account Password <span className="required">*</span>
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        className="form-input"
                        placeholder="At least 6 characters"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="confirmPassword">
                        Confirm Password <span className="required">*</span>
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        className="form-input"
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary btn-lg auth-submit-btn"
                  disabled={isSubmitting}
                >
                  <span>{isSubmitting ? 'Submitting Registration' : 'Complete Supervisor Registration'}</span>
                  {showLoader && <InlineLoader />}
                </button>
              </form>

              {/* Footer Links & Direct Role Switcher */}
              <div className="auth-footer-links">
                <div>
                  Already registered as a faculty advisor?{' '}
                  <Link to="/login">Sign in here</Link>
                </div>

                <div className="role-switcher-links">
                  <span>Explore other registration portals:</span>
                  <Link to="/signup/student" className="role-switch-pill">
                    Intern (Student)
                  </Link>
                  <Link to="/signup/university" className="role-switch-pill">
                    University Head
                  </Link>
                  <Link to="/signup/employer" className="role-switch-pill">
                    Employer
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
