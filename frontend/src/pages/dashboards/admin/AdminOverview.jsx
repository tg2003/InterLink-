import React from 'react';

export default function AdminOverview({ stats, onNavigate, user }) {
  const pendingUniCount = stats?.universities?.pending || 0;
  const pendingEmpCount = stats?.employers?.pending || 0;
  const totalPending = pendingUniCount + pendingEmpCount;

  const formatUptime = (seconds) => {
    if (!seconds) return 'Active';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="admin-overview-view">
      {/* Banner */}
      <div className="dashboard-banner">
        <h1 className="banner-welcome-h1">Welcome, {user?.name || 'Administrator'}</h1>
        <p className="banner-desc">
          Interlink System Administration & Governance Center. Manage academic institution approvals, verify partner employers, supervise student directories, and enforce portal compliance.
        </p>
        <span className="banner-status-tag">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Super Admin Session Active • Full Governance
        </span>
      </div>

      {/* Action Banner for Pending Items */}
      {totalPending > 0 && (
        <div className="admin-action-banner animate-fade-in">
          <div className="action-banner-info">
            <div className="action-banner-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0,color:'white' }}>
                Verification Queue: {totalPending} Pending {totalPending === 1 ? 'Request' : 'Requests'}
              </h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.84rem', color: '#cbd5e1' }}>
                {pendingUniCount > 0 && `${pendingUniCount} University ${pendingUniCount === 1 ? 'Faculty' : 'Faculties'}`}
                {pendingUniCount > 0 && pendingEmpCount > 0 && ' and '}
                {pendingEmpCount > 0 && `${pendingEmpCount} Employer ${pendingEmpCount === 1 ? 'Account' : 'Accounts'}`} awaiting validation.
              </p>
            </div>
          </div>
          <div className="action-banner-buttons">
            {pendingUniCount > 0 && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onNavigate('University Approvals')}
              >
                Review Universities ({pendingUniCount})
              </button>
            )}
            {pendingEmpCount > 0 && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}
                onClick={() => onNavigate('Employer Verification')}
              >
                Review Employers ({pendingEmpCount})
              </button>
            )}
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="admin-kpi-grid">
        {/* Universities */}
        <div
          className="admin-kpi-card"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('University Approvals')}
        >
          <div className="kpi-header">
            <span className="kpi-title">Universities</span>
            <div className="kpi-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">{stats?.universities?.total ?? 0}</span>
            {pendingUniCount > 0 ? (
              <span className="kpi-pending-tag tag-amber">{pendingUniCount} Pending</span>
            ) : (
              <span className="kpi-pending-tag tag-emerald">All Verified</span>
            )}
          </div>
          <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
            <span>Approved: {stats?.universities?.approved ?? 0}</span>
            <span>Rejected: {stats?.universities?.rejected ?? 0}</span>
          </div>
        </div>

        {/* Employers */}
        <div
          className="admin-kpi-card"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('Employer Verification')}
        >
          <div className="kpi-header">
            <span className="kpi-title">Partner Employers</span>
            <div className="kpi-icon-wrap" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">{stats?.employers?.total ?? 0}</span>
            {pendingEmpCount > 0 ? (
              <span className="kpi-pending-tag tag-amber">{pendingEmpCount} Pending</span>
            ) : (
              <span className="kpi-pending-tag tag-emerald">All Verified</span>
            )}
          </div>
          <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
            <span>Approved: {stats?.employers?.approved ?? 0}</span>
            <span>Rejected: {stats?.employers?.rejected ?? 0}</span>
          </div>
        </div>

        {/* Students */}
        <div
          className="admin-kpi-card"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('Student Directory')}
        >
          <div className="kpi-header">
            <span className="kpi-title">Enrolled Students</span>
            <div className="kpi-icon-wrap" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">{stats?.students?.total ?? 0}</span>
            <span className="kpi-pending-tag tag-blue">Active Talent</span>
          </div>
          <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: '#64748b' }}>
            Faculty Supervisors: {stats?.supervisors?.total ?? 0}
          </div>
        </div>

        {/* Jobs & Applications */}
        <div className="admin-kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Job Placements</span>
            <div className="kpi-icon-wrap" style={{ background: '#fff7ed', color: '#ea580c' }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 14 14"/>
              </svg>
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">{stats?.jobs?.total ?? 0}</span>
            <span className="kpi-pending-tag tag-blue">Active Postings</span>
          </div>
          <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: '#64748b' }}>
            Student Applications: {stats?.applications?.total ?? 0}
          </div>
        </div>
      </div>

      {/* Two-Column Lower Content */}
      <div className="admin-overview-columns">
        {/* Left: Recent Activity Stream */}
        <div className="dash-info-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-dark)', margin: 0 }}>
              Recent Audit Activity
            </h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('System Audit Logs')}
            >
              View All Logs
            </button>
          </div>

          <div className="audit-timeline">
            {stats?.recentLogs && stats.recentLogs.length > 0 ? (
              stats.recentLogs.map((log, idx) => (
                <div key={log._id || idx} className="audit-entry-card">
                  <div className="audit-entry-left">
                    <span
                      className={`audit-status-dot ${
                        log.status === 'success'
                          ? 'dot-success'
                          : log.status === 'danger'
                          ? 'dot-danger'
                          : log.status === 'warning'
                          ? 'dot-warning'
                          : 'dot-info'
                      }`}
                    />
                    <div>
                      <div className="audit-action-name">{log.action?.replace(/_/g, ' ')}</div>
                      <div className="audit-details-text">{log.details || `Action performed on ${log.target}`}</div>
                      <div className="audit-meta-text">
                        Actor: {log.performedBy} • Target: {log.target}
                      </div>
                    </div>
                  </div>
                  <span className="audit-time-badge">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8' }}>
                No recent activity recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Right: System Health & Governance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="dash-info-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-dark)', marginBottom: '1rem' }}>
              System Status & Health
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748b' }}>MongoDB Atlas Cluster</span>
                <span style={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                  Connected (Active)
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748b' }}>API Server Runtime</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>Node {stats?.systemHealth?.nodeVersion || 'v20+'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748b' }}>Service Uptime</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>{formatUptime(stats?.systemHealth?.serverUptimeSeconds)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748b' }}>JWT Authentication</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>256-bit Secure</span>
              </div>
            </div>
          </div>

          <div className="dash-info-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-dark)', marginBottom: '0.65rem' }}>
              Governance Shortcuts
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
              Quick administrative navigation to manage entities and security controls.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => onNavigate('Student Directory')}
              >
                🎓 Browse Student Directory
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => onNavigate('Platform Settings')}
              >
                ⚙️ Configure Platform Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
