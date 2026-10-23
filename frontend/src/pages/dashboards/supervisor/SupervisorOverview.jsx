import React from 'react';
import SupervisorJoinStatusCard from './SupervisorJoinStatusCard';

export default function SupervisorOverview({
  supervisor,
  stats,
  categoryBreakdown = [],
  recentLogs = [],
  onNavigate,
  onStatusUpdated,
  showToast,
}) {
  const isApproved = supervisor?.joinStatus === 'approved';
  const universityName = supervisor?.university?.universityName || 'Affiliated University';

  return (
    <div className="supervisor-overview-container animate-fade-in">
      {/* Banner */}
      <div className="dashboard-banner">
        <h1 className="banner-welcome-h1">
          Welcome, {supervisor?.fullName || 'Academic Supervisor'}
        </h1>
        <p className="banner-desc">
          Academic Faculty Advisory Workspace. Monitor your university's undergraduate interns, review daily reflective progress logs, track internship milestones, and ensure academic compliance.
        </p>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginTop: '14px' }}>
          <span
            className="banner-status-tag"
            style={{
              background: isApproved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.18)',
              color: isApproved ? '#10b981' : '#eab308',
              borderColor: isApproved ? 'rgba(16, 185, 129, 0.3)' : 'rgba(234, 179, 8, 0.35)',
            }}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
              {isApproved ? (
                <polyline points="20 6 9 17 4 12"></polyline>
              ) : (
                <circle cx="12" cy="12" r="10"></circle>
              )}
            </svg>
            {isApproved ? 'Faculty Advisor Session Active' : `Join Status: ${supervisor?.joinStatus || 'Pending'}`}
          </span>

          <span
            className="banner-status-tag"
            style={{
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#60a5fa',
              borderColor: 'rgba(59, 130, 246, 0.3)',
            }}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            {universityName}
          </span>

          {supervisor?.staffRegNo && (
            <span
              className="banner-status-tag"
              style={{
                background: 'rgba(148, 163, 184, 0.15)',
                color: '#cbd5e1',
                borderColor: 'rgba(148, 163, 184, 0.25)',
              }}
            >
              ID: {supervisor.staffRegNo}
            </span>
          )}
        </div>
      </div>

      {/* Join Status Alert (shown when not approved) */}
      {!isApproved && (
        <SupervisorJoinStatusCard
          supervisor={supervisor}
          onStatusUpdated={onStatusUpdated}
          showToast={showToast}
        />
      )}

      {/* Metrics Cards Grid */}
      <div className="dashboard-cards-grid">
        <div className="dash-info-card">
          <span className="card-label-small">Enrolled Interns</span>
          <div className="card-value-large" style={{ color: 'var(--blue-primary)' }}>
            {isApproved ? stats?.totalStudents ?? 0 : '--'}
          </div>
          <span className="card-hint">
            {isApproved ? `Students under ${universityName}` : 'Locked until approval'}
          </span>
        </div>

        <div className="dash-info-card">
          <span className="card-label-small">Daily Progress Logs</span>
          <div className="card-value-large" style={{ color: '#8b5cf6' }}>
            {isApproved ? stats?.totalProgressLogs ?? 0 : '--'}
          </div>
          <span className="card-hint">Total submitted log entries</span>
        </div>

        <div className="dash-info-card">
          <span className="card-label-small">Active Student Loggers</span>
          <div className="card-value-large" style={{ color: '#10b981' }}>
            {isApproved ? stats?.activeLoggers ?? 0 : '--'}
          </div>
          <span className="card-hint">Interns actively posting entries</span>
        </div>

        <div className="dash-info-card">
          <span className="card-label-small">Academic Categories</span>
          <div className="card-value-large" style={{ color: '#f59e0b' }}>
            {isApproved ? stats?.categoriesCount ?? 0 : '--'}
          </div>
          <span className="card-hint">Represented study specializations</span>
        </div>
      </div>

      {/* Main Content Rows */}
      {isApproved ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: '24px', marginTop: '24px' }}>
          {/* Left Column: Recent Student Daily Progress Feed */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '22px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                  Latest Student Progress Logs
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                  Real-time entries logged by enrolled students (FR-09, US-05)
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigate && onNavigate('Student Progress Logs')}
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              >
                View All Logs
              </button>
            </div>

            {recentLogs && recentLogs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentLogs.map((log) => {
                  const studentName = log.student?.fullName || 'Student Intern';
                  const category = log.student?.mainCategory || 'General';
                  const logDate = log.date ? new Date(log.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  }) : 'Recent';

                  return (
                    <div
                      key={log._id}
                      style={{
                        padding: '14px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.92rem', color: '#1e293b' }}>
                            {studentName}
                          </span>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              background: '#e0f2fe',
                              color: '#0369a1',
                              fontWeight: 600,
                            }}
                          >
                            {category}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {logDate}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                        {log.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '36px 12px', color: '#94a3b8' }}>
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 8px', display: 'block' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span>No student daily progress entries logged yet.</span>
              </div>
            )}
          </div>

          {/* Right Column: Specialization Breakdown & Quick Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Category Breakdown */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '22px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              }}
            >
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                Interns by Specialization
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 16px' }}>
                Disciplines across your university
              </p>

              {categoryBreakdown && categoryBreakdown.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {categoryBreakdown.map((cat, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: '#f8fafc',
                        border: '1px solid #edf2f7',
                        borderRadius: '8px',
                      }}
                    >
                      <span style={{ fontSize: '0.86rem', color: '#334155', fontWeight: 500 }}>
                        {cat.name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: '#e2e8f0',
                          color: '#1e293b',
                        }}
                      >
                        {cat.count} {cat.count === 1 ? 'intern' : 'interns'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#94a3b8', fontSize: '0.88rem', textAlign: 'center', padding: '18px 0' }}>
                  No students enrolled yet.
                </div>
              )}
            </div>

            {/* Quick Actions Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: '#ffffff',
                borderRadius: '12px',
                padding: '22px',
              }}
            >
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 8px' }}>
                Faculty Supervisor Guidance
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 16px' }}>
                Review student logbook submissions weekly. Check that students accurately record tasks, reflect on learning outcomes, and meet university internship prerequisites.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => onNavigate && onNavigate('Enrolled Interns')}
                  style={{ background: '#3b82f6', borderColor: '#3b82f6' }}
                >
                  Browse Intern Directory
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="dashboard-notice-box" style={{ marginTop: '24px' }}>
          <div className="notice-icon-box">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h2 className="notice-title">Institutional Data Protected</h2>
          <p className="notice-text">
            Under university data privacy guidelines (FR-16), enrolled student directories and daily logbook records are strictly visible only to approved academic supervisors of this university. Once your University Head approves your staff credentials, access will unlock automatically.
          </p>
        </div>
      )}
    </div>
  );
}
