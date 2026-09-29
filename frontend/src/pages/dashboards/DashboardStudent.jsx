import React from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from './DashboardLayout';

export default function DashboardStudent() {
  const { user } = useAuth();

  const navItems = [
    'My Student Profile',
    'Search Internships',
    'My Applications',
    'Weekly Logbook',
    'Supervisor Feedback',
  ];

  return (
    <DashboardLayout roleTitle="Intern" roleId="Student" navItems={navItems}>
      <div className="dashboard-banner">
        <h1 className="banner-welcome-h1">Welcome, {user?.name || 'Student'}</h1>
        <p className="banner-desc">
          Your Undergraduate Career Launchpad. Manage your verified academic credentials, explore accredited internships from top employers, and submit weekly progress logs for faculty credit.
        </p>
        <span className="banner-status-tag">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Student Session Active & Verified
        </span>
      </div>

      <div className="dashboard-cards-grid">
        <div className="dash-info-card">
          <span className="card-label-small">Enrollment Status</span>
          <div className="card-value-large" style={{ color: '#10b981' }}>Active</div>
          <span className="card-hint">Ready for internship placement</span>
        </div>
        <div className="dash-info-card">
          <span className="card-label-small">Student Email</span>
          <div className="card-value-large" style={{ fontSize: '1.1rem', wordBreak: 'break-all' }}>
            {user?.email}
          </div>
          <span className="card-hint">University authenticated</span>
        </div>
        <div className="dash-info-card">
          <span className="card-label-small">Sprint Milestone</span>
          <div className="card-value-large">Sprint 1</div>
          <span className="card-hint">Sign up & login flow operational</span>
        </div>
      </div>

      <div className="dashboard-notice-box">
        <div className="notice-icon-box">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <h2 className="notice-title">Sprint 1 Scope: Student Dashboard Shell</h2>
        <p className="notice-text">
          Welcome to your student workspace! You have logged in successfully with your student account. Real-time internship applications, resume uploading, and logbook entries are queued for implementation in Sprint 2.
        </p>
      </div>
    </DashboardLayout>
  );
}
