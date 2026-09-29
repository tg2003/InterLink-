import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
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

export default function SignUpEmployer() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyCategory: '',
    contactNumber: '',
    address: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.companyName || !formData.email || !formData.password || !formData.companyCategory) {
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
        companyName: formData.companyName,
        email: formData.email,
        password: formData.password,
        companyCategory: formData.companyCategory,
        contactNumber: formData.contactNumber || undefined,
        address: formData.address || undefined,
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
        <div className="auth-card-layout animate-fade-in">
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
                Your enterprise account has been created and is currently <strong>awaiting administrator approval</strong>. Once verified, you will be able to sign in, post internships, and access university-endorsed candidate pools.
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
                  Enterprise Partner
                </span>
                <h1 className="auth-card-title">Employer Registration</h1>
                <p className="auth-card-subtitle">
                  Join the Interlink network to discover and recruit top university internship talent.
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

                  {/* Work Email */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">
                      Corporate Work Email <span className="required">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="form-input"
                      placeholder="e.g. hr@techsolutions.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Industry Category */}
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

                  {/* Contact Number */}
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

                  {/* Corporate Office Address */}
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

                <button
                  type="submit"
                  className="btn btn-primary auth-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting Company Profile...' : 'Complete Employer Registration'}
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
