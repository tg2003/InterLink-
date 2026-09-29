import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './AuthPages.css';

const CATEGORIES = [
  'Information Technology (IT)',
  'Software Engineering & Computer Science',
  'Business Administration & Management',
  'Finance & Accounting',
  'Civil & Mechanical Engineering',
  'Data Science & Artificial Intelligence',
  'Marketing & Digital Media',
  'UI/UX & Product Design',
];

export default function SignUpStudent() {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState([]);
  const [loadingUnis, setLoadingUnis] = useState(true);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
    mainCategory: '',
    contactNumber: '',
    cvUrl: '',
    bio: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch approved universities for dropdown
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Client-side validations
    if (!formData.fullName || !formData.email || !formData.password || !formData.university || !formData.mainCategory) {
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
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        university: formData.university,
        mainCategory: formData.mainCategory,
        contactNumber: formData.contactNumber || undefined,
        cvUrl: formData.cvUrl || undefined,
        bio: formData.bio || undefined,
      };

      const res = await authService.registerStudent(payload);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMsg(res.message || 'Failed to create student account.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Server error occurred during student registration.');
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

      <main className="auth-main-container">
        <div className="auth-card-layout animate-fade-in">
          {isSuccess ? (
            <div className="auth-success-screen">
              <div className="success-badge-icon">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h2 className="success-screen-title">Account Created Successfully!</h2>
              <p className="success-screen-desc">
                Your student profile is active. You can now sign in to your Interlink dashboard, search accredited internship vacancies, and coordinate with your faculty supervisor.
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
              <div className="auth-card-header">
                <span className="auth-role-tag">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="7" r="4"/>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  </svg>
                  Intern Registration
                </span>
                <h1 className="auth-card-title">Student Registration</h1>
                <p className="auth-card-subtitle">
                  Create your verified student profile to connect with leading industry employers.
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
                  {/* Full Name */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="fullName">
                      Full Name <span className="required">*</span>
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Kasun Fernando"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">
                      Student Email Address <span className="required">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="form-input"
                      placeholder="e.g. student@university.edu"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="password">
                      Password <span className="required">*</span>
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

                  {/* University Dropdown */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="university">
                      Enrolled University <span className="required">*</span>
                    </label>
                    <select
                      id="university"
                      name="university"
                      className="form-select"
                      value={formData.university}
                      onChange={handleChange}
                      disabled={loadingUnis}
                      required
                    >
                      {loadingUnis ? (
                        <option value="">Loading accredited institutions...</option>
                      ) : (
                        <>
                          <option value="">Select your university</option>
                          {universities.map((uni) => (
                            <option key={uni._id} value={uni._id}>
                              {uni.universityName}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>

                  {/* Main Category */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="mainCategory">
                      Specialization / Main Category <span className="required">*</span>
                    </label>
                    <select
                      id="mainCategory"
                      name="mainCategory"
                      className="form-select"
                      value={formData.mainCategory}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select primary field</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Contact Number */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="contactNumber">
                      Contact Mobile Number
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

                  {/* CV / Portfolio Link */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="cvUrl">
                      Portfolio / CV Link (URL)
                    </label>
                    <input
                      id="cvUrl"
                      name="cvUrl"
                      type="url"
                      className="form-input"
                      placeholder="https://linkedin.com/in/... or drive link"
                      value={formData.cvUrl}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Bio */}
                  <div className="form-group form-full-width">
                    <label className="form-label" htmlFor="bio">
                      Short Bio / Academic Objective
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      className="form-textarea"
                      placeholder="Briefly describe your career goals, key technical/business skills, or academic year..."
                      value={formData.bio}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary auth-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Student Account...' : 'Complete Student Registration'}
                </button>
              </form>

              <div className="auth-footer-links">
                <div>
                  Already have an account? <Link to="/login">Sign in here</Link>
                </div>
                <div className="role-switcher-links">
                  <span>Register as a different role:</span>
                  <Link to="/signup/university" className="role-switch-pill">
                    University
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
