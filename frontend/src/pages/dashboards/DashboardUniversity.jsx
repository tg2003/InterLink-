import React from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from './DashboardLayout';

export default function DashboardUniversity() {
  const { user } = useAuth();

  const navItems = [
    'Assigned Supervisors',
    'Enrolled Students',
    'Partner Employers',
    'Credit Validations',
    'Institutional Settings',
  ];

  return (
    <DashboardLayout roleTitle="University" roleId="University" navItems={navItems}>
      <div className="dashboard-banner">
        <h1 className="banner-welcome-h1">Welcome, {user?.name || 'Academic Institution'}</h1>
        <p className="banner-desc">
          University Faculty Oversight & Supervision Portal. Coordinate departmental internship programs, assign faculty supervisors to students, and monitor academic compliance across partner organizations.
        </p>
        <span className="banner-status-tag">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Accredited Institution Session Verified
        </span>
      </div>

      <div className="dashboard-cards-grid">
        <div className="dash-info-card">
          <span className="card-label-small">Approval Status</span>
          <div className="card-value-large" style={{ color: '#10b981' }}>Approved</div>
          <span className="card-hint">Accredited university partner</span>
        </div>
        <div className="dash-info-card">
          <span className="card-label-small">Institution Email</span>
          <div className="card-value-large" style={{ fontSize: '1.1rem', wordBreak: 'break-all' }}>
            {user?.email}
          </div>
          <span className="card-hint">Dean / Head of Dept contact</span>
        </div>
        <div className="dash-info-card">
          <span className="card-label-small">Faculty Supervision</span>
          <div className="card-value-large">Ready</div>
          <span className="card-hint">Supervisor assignment ready</span>
        </div>
      </div>

      <div className="dashboard-notice-box">
        <div className="notice-icon-box">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </div>
        <h2 className="notice-title">Sprint 1 Scope: University Dashboard Shell</h2>
        <p className="notice-text">
          Your university administrative session is verified. Features for onboarding faculty supervisors, reviewing student placement requests, and generating academic credit transcripts will be active in upcoming sprints.
        </p>
      </div>
    </DashboardLayout>
  );
}
