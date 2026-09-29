import React from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from './DashboardLayout';

export default function DashboardEmployer() {
  const { user } = useAuth();

  const navItems = [
    'Post Internship Vacancy',
    'Talent Applicant Pool',
    'Active Interns',
    'Supervisor Coordination',
    'Company Profile',
  ];

  return (
    <DashboardLayout roleTitle="Employer" roleId="Employer" navItems={navItems}>
      <div className="dashboard-banner">
        <h1 className="banner-welcome-h1">Welcome, {user?.name || 'Enterprise Recruiter'}</h1>
        <p className="banner-desc">
          Employer Talent Acquisition & Internship Management Hub. Connect with accredited university partner institutions, publish internship vacancies, screen qualified undergraduate candidates, and review intern contributions.
        </p>
        <span className="banner-status-tag">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Enterprise Recruiter Session Active
        </span>
      </div>

      <div className="dashboard-cards-grid">
        <div className="dash-info-card">
          <span className="card-label-small">Company Account</span>
          <div className="card-value-large" style={{ color: '#10b981' }}>Approved</div>
          <span className="card-hint">Verified corporate partner</span>
        </div>
        <div className="dash-info-card">
          <span className="card-label-small">HR Email</span>
          <div className="card-value-large" style={{ fontSize: '1.1rem', wordBreak: 'break-all' }}>
            {user?.email}
          </div>
          <span className="card-hint">Recruitment correspondence</span>
        </div>
        <div className="dash-info-card">
          <span className="card-label-small">Hiring Pipeline</span>
          <div className="card-value-large">Ready</div>
          <span className="card-hint">Vacancy listings ready for Sprint 2</span>
        </div>
      </div>

      <div className="dashboard-notice-box">
        <div className="notice-icon-box">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
        </div>
        <h2 className="notice-title">Sprint 1 Scope: Employer Dashboard Shell</h2>
        <p className="notice-text">
          Employer credentials authenticated successfully. In Sprint 2, you will be able to publish internship listings, filter candidate applications by university criteria, and coordinate internship contracts directly with academic supervisors.
        </p>
      </div>
    </DashboardLayout>
  );
}
