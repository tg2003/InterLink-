import React from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from './DashboardLayout';

export default function DashboardAdmin() {
  const { user } = useAuth();

  const navItems = [
    'University Approvals',
    'Employer Verification',
    'Student Directory',
    'System Audit Logs',
    'Platform Settings',
  ];

  return (
    <DashboardLayout roleTitle="Administrator" roleId="Admin" navItems={navItems}>
      {/* Banner */}
      <div className="dashboard-banner">
        <h1 className="banner-welcome-h1">Welcome, {user?.name || 'Administrator'}</h1>
        <p className="banner-desc">
          System Administration & Portal Governance Center. You have supreme authority to approve new university faculties, verify employer profiles, and inspect system audit trails.
        </p>
        <span className="banner-status-tag">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Sprint 1 Admin Session Active
        </span>
      </div>

      {/* Info Cards */}
      <div className="dashboard-cards-grid">
        <div className="dash-info-card">
          <span className="card-label-small">Governance Level</span>
          <div className="card-value-large">Super Admin</div>
          <span className="card-hint">Full read & write database access</span>
        </div>
        <div className="dash-info-card">
          <span className="card-label-small">Active User Email</span>
          <div className="card-value-large" style={{ fontSize: '1.1rem', wordBreak: 'break-all' }}>
            {user?.email}
          </div>
          <span className="card-hint">Verified administrator credentials</span>
        </div>
        <div className="dash-info-card">
          <span className="card-label-small">System Health</span>
          <div className="card-value-large" style={{ color: '#10b981' }}>Operational</div>
          <span className="card-hint">MongoDB Atlas & API connected</span>
        </div>
      </div>

      {/* Notice Panel */}
      <div className="dashboard-notice-box">
        <div className="notice-icon-box">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="9" x2="15" y2="9"/>
            <line x1="9" y1="13" x2="15" y2="13"/>
            <line x1="9" y1="17" x2="11" y2="17"/>
          </svg>
        </div>
        <h2 className="notice-title">Sprint 1 Scope: Authentication Shell</h2>
        <p className="notice-text">
          Congratulations! The Sprint 1 authentication and landing architecture has successfully verified your administrator credentials. Full administrative approval queues, bulk user imports, and analytics widgets will be implemented in subsequent sprints.
        </p>
      </div>
    </DashboardLayout>
  );
}
