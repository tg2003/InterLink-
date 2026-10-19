import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function Login() {
  const navigate = useNavigate();
  const { loginUser, getDashboardPath } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.email || !formData.password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      if (data.success && data.user) {
        const dest = getDashboardPath(data.user.role);
        navigate(dest);
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Please verify your credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for quick testing of seeded accounts
  const handleQuickFill = (email, password) => {
    setFormData({ email, password });
    setErrorMsg('');
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
        <div className="auth-card-layout compact animate-fade-in">
          <div className="auth-card-header">
            <span className="auth-role-tag">Unified Access</span>
            <h1 className="auth-card-title">Welcome Back</h1>
            <p className="auth-card-subtitle">
              Sign in with your registered email and password to access your role dashboard.
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
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                placeholder="name@institution.edu or company.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="password">
                  Password
                </label>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                placeholder="Enter your account password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.5rem' }}>
              Quick Demo Accounts:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              <button
                type="button"
                className="role-switch-pill"
                style={{ border: 'none', cursor: 'pointer' }}
                onClick={() => handleQuickFill('admin@interlink.com', 'admin123')}
              >
                Admin
              </button>
              <button
                type="button"
                className="role-switch-pill"
                style={{ border: 'none', cursor: 'pointer' }}
                onClick={() => handleQuickFill('head@ruh.ac.lk', 'head123')}
              >
                University
              </button>
              <button
                type="button"
                className="role-switch-pill"
                style={{ border: 'none', cursor: 'pointer' }}
                onClick={() => handleQuickFill('kasun@student.ruh.ac.lk', 'stu123')}
              >
                Student
              </button>
              <button
                type="button"
                className="role-switch-pill"
                style={{ border: 'none', cursor: 'pointer' }}
                onClick={() => handleQuickFill('hr@techsolutions.com', 'emp123')}
              >
                Employer
              </button>
              <button
                type="button"
                className="role-switch-pill"
                style={{ border: 'none', cursor: 'pointer' }}
                onClick={() => handleQuickFill('supervisor@ruh.ac.lk', 'sup123')}
              >
                Supervisor
              </button>
            </div>
          </div>

          <div className="auth-footer-links">
            <div>
              Don't have an account yet? <Link to="/?signup=true">Register here</Link>
            </div>
            <div className="role-switcher-links">
              <span>Direct registration portals:</span>
              <Link to="/signup/student" className="role-switch-pill">
                Student
              </Link>
              <Link to="/signup/university" className="role-switch-pill">
                University
              </Link>
              <Link to="/signup/supervisor" className="role-switch-pill">
                Supervisor
              </Link>
              <Link to="/signup/employer" className="role-switch-pill">
                Employer
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
