import React from 'react';
import './University.css';

export default function UniversityOverview({
  stats,
  recentSupervisors = [],
  recentLogs = [],
  onNavigate,
  onApproveSupervisor,
  onRejectSupervisor,
}) {
  return (
    <div className="university-view-container">
      {/* Top Welcome / Institution Banner */}
      <div className="dashboard-banner">
        <h1 className="banner-welcome-h1">Academic Faculty Oversight & Administration</h1>
        <p className="banner-desc">
          Monitor your university's internship cohort, review faculty supervisor join credentials, and audit daily student logbooks in real-time.
        </p>
        <span className="banner-status-tag" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Accredited University Head Session Verified
        </span>
      </div>

      {/* KPI Stats Grid */}
      <div className="dashboard-cards-grid">
        {/* Enrolled Students */}
        <div
          className="dash-info-card"
          onClick={() => onNavigate('Enrolled Students')}
          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
        >
          <span className="card-label-small">Enrolled Student Interns</span>
          <div className="card-value-large" style={{ color: '#0284c7' }}>
            {stats.totalStudents ?? 0}
          </div>
          <span className="card-hint">Undergraduate interns from your institution</span>
        </div>

        {/* Approved Supervisors */}
        <div
          className="dash-info-card"
          onClick={() => onNavigate('Faculty Supervisors')}
          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
        >
          <span className="card-label-small">Active Faculty Supervisors</span>
          <div className="card-value-large" style={{ color: '#059669' }}>
            {stats.approvedSupervisors ?? 0}
          </div>
          <span className="card-hint">Endorsed departmental advisors</span>
        </div>

        {/* Pending Requests */}
        <div
          className="dash-info-card"
          onClick={() => onNavigate('Faculty Supervisors')}
          style={{
            cursor: 'pointer',
            borderColor: stats.pendingSupervisors > 0 ? '#fde68a' : undefined,
            background: stats.pendingSupervisors > 0 ? '#fffbeb' : undefined,
          }}
        >
          <span className="card-label-small">Pending Supervisor Requests</span>
          <div
            className="card-value-large"
            style={{ color: stats.pendingSupervisors > 0 ? '#b45309' : 'var(--navy-dark)' }}
          >
            {stats.pendingSupervisors ?? 0}
          </div>
          <span className="card-hint">
            {stats.pendingSupervisors > 0 ? 'Requires your institutional approval' : 'All staff requests processed'}
          </span>
        </div>

        {/* Total Progress Logs */}
        <div
          className="dash-info-card"
          onClick={() => onNavigate('Student Progress Logs')}
          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
        >
          <span className="card-label-small">Total Daily Progress Logs</span>
          <div className="card-value-large" style={{ color: '#7c3aed' }}>
            {stats.totalProgressLogs ?? 0}
          </div>
          <span className="card-hint">Daily activity log entries recorded</span>
        </div>
      </div>

      {/* Two Column Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* Pending / Recent Supervisor Requests */}
        <div className="admin-table-container" style={{ padding: '1.5rem', margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy-dark)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#b45309' }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Recent Supervisor Onboarding
            </h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('Faculty Supervisors')}
            >
              View All ({stats.totalSupervisors ?? 0})
            </button>
          </div>

          {recentSupervisors.length === 0 ? (
            <div className="admin-empty-state" style={{ padding: '2rem 1rem' }}>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>No supervisor join requests received yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentSupervisors.map((sup) => (
                <div
                  key={sup._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1.1rem',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div className="uni-avatar-initials sup" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                      {sup.fullName ? sup.fullName.slice(0, 2).toUpperCase() : 'SP'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--navy-dark)', fontSize: '0.92rem' }}>
                        {sup.fullName}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                        ID: <strong>{sup.staffRegNo}</strong> • {sup.email}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge-status badge-${sup.joinStatus}`}>
                      {sup.joinStatus}
                    </span>

                    {sup.joinStatus === 'pending' && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          className="btn-action-approve"
                          onClick={() => onApproveSupervisor(sup._id, sup.fullName)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn-action-reject"
                          onClick={() => onRejectSupervisor(sup._id, sup.fullName)}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Daily Progress Submissions */}
        <div className="admin-table-container" style={{ padding: '1.5rem', margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy-dark)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#7c3aed' }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              Recent Student Daily Logs (Read-Only)
            </h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('Student Progress Logs')}
            >
              View Feed
            </button>
          </div>

          {recentLogs.length === 0 ? (
            <div className="admin-empty-state" style={{ padding: '2rem 1rem' }}>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>No student daily logs recorded yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentLogs.map((log) => (
                <div
                  key={log._id}
                  style={{
                    padding: '0.85rem 1.1rem',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--navy-dark)', fontSize: '0.9rem' }}>
                      {log.student?.fullName || 'Student Intern'}
                    </span>
                    <span className="uni-date-badge" style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem' }}>
                      {new Date(log.date || log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#334155', margin: 0, lineHeight: 1.45 }}>
                    {log.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
