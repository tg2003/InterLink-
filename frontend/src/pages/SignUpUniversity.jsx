import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './AuthPages.css';

export default function SignUpUniversity() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    universityName: '',
    headName: '',
    headEmail: '',
    password: '',
    confirmPassword: '',
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

    if (!formData.universityName || !formData.headName || !formData.headEmail || !formData.password) {
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
        universityName: formData.universityName,
        headName: formData.headName,
        headEmail: formData.headEmail,
        password: formData.password,
        contactNumber: formData.contactNumber || undefined,
        address: formData.address || undefined,
      };

      const res = await authService.registerUniversity(payload);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMsg(res.message || 'Failed to submit university registration.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Server error occurred during university registration.');
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
                Your university registration has been received and is currently <strong>awaiting administrator approval</strong>. Our team will verify your institutional credentials and notify you via email once approved.
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
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                  Institutional Partner
                </span>
                <h1 className="auth-card-title">University Registration</h1>
                <p className="auth-card-subtitle">
                  Enroll your academic institution to manage faculty supervisors and audit student internships.
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
                  {/* University Name */}
                  <div className="form-group form-full-width">
                    <label className="form-label" htmlFor="universityName">
                      University / Institution Name <span className="required">*</span>
                    </label>
                    <input
                      id="universityName"
                      name="universityName"
                      type="text"
                      className="form-input"
                      placeholder="e.g. University of Ruhuna"
                      value={formData.universityName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Dean / Head Name */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="headName">
                      Head of Department / Dean Name <span className="required">*</span>
                    </label>
                    <input
                      id="headName"
                      name="headName"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Prof. / Dr. K. Silva"
                      value={formData.headName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Official Head Email */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="headEmail">
                      Official Institutional Email <span className="required">*</span>
                    </label>
                    <input
                      id="headEmail"
                      name="headEmail"
                      type="email"
                      className="form-input"
                      placeholder="e.g. head@university.ac.lk"
                      value={formData.headEmail}
                      onChange={handleChange}
                      required
                    />
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
                      Institutional Contact Number
                    </label>
                    <input
                      id="contactNumber"
                      name="contactNumber"
                      type="tel"
                      className="form-input"
                      placeholder="e.g. +94 11 234 5678"
                      value={formData.contactNumber}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Campus Address */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="address">
                      Campus Main Address
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Matara, Sri Lanka"
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
                  {isSubmitting ? 'Submitting Application...' : 'Submit University Registration'}
                </button>
              </form>

              <div className="auth-footer-links">
                <div>
                  Already have an institutional account? <Link to="/login">Sign in here</Link>
                </div>
                <div className="role-switcher-links">
                  <span>Register as a different role:</span>
                  <Link to="/signup/student" className="role-switch-pill">
                    Intern (Student)
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
