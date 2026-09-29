import React from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from './DashboardLayout';

export default function DashboardSupervisor() {
  const { user } = useAuth();

  const navItems = [
    'Assigned Interns',
    'Logbook Reviews',
    'Mid-term Evaluations',
    'Direct Messaging',
    'Faculty Grading',
  ];

  return (
    <DashboardLayout roleTitle="Supervisor" roleId="Supervisor" navItems={navItems}>
      <div className="dashboard-banner">
        <h1 className="banner-welcome-h1">Welcome, {user?.name || 'Faculty Supervisor'}</h1>
        <p className="banner-desc">
          Academic Supervisor Advisory Workspace. Monitor your assigned student interns, review weekly reflective logbook entries, communicate with company mentors, and certify academic internship requirements.
        </p>
        <span className="banner-status-tag">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Faculty Advisor Session Active
        </span>
      </div>

      <div className="dashboard-cards-grid">
        <div className="dash-info-card">
          <span className="card-label-small">Faculty Standing</span>
          <div className="card-value-large" style={{ color: '#10b981' }}>Approved</div>
          <span className="card-hint">University endorsed supervisor</span>
        </div>
        <div className="dash-info-card">
          <span className="card-label-small">Advisor Contact</span>
          <div className="card-value-large" style={{ fontSize: '1.1rem', wordBreak: 'break-all' }}>
            {user?.email}
          </div>
          <span className="card-hint">Institutional advisor account</span>
        </div>
        <div className="dash-info-card">
          <span className="card-label-small">Review Queue</span>
          <div className="card-value-large">All Clear</div>
          <span className="card-hint">Logbook audits ready for Sprint 2</span>
        </div>
      </div>

      <div className="dashboard-notice-box">
        <div className="notice-icon-box">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <h2 className="notice-title">Sprint 1 Scope: Supervisor Dashboard Shell</h2>
        <p className="notice-text">
          Supervisor authentication is successfully established. Features for evaluating student submissions, tracking milestone completion percentages, and submitting final assessment scores are scheduled for Sprint 2.
        </p>
      </div>
    </DashboardLayout>
  );
}
