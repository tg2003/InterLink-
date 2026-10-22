import React, { useState, useEffect } from 'react';
import studentService from '../../../services/studentService';
import LoadingState from '../../../components/LoadingState';

export default function StudentApplications({ showToast }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await studentService.getMyApplications();
      if (data.success) setApplications(data.applications);
    } catch {
      showToast('Failed to load applications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleWithdraw = async (appId, jobTitle) => {
    if (!window.confirm(`Withdraw your application for "${jobTitle}"?`)) return;
    setWithdrawing((prev) => ({ ...prev, [appId]: true }));
    try {
      const data = await studentService.withdrawApplication(appId);
      if (data.success) {
        showToast(`Application for "${jobTitle}" withdrawn.`);
        setApplications((prev) => prev.filter((a) => a._id !== appId));
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to withdraw application.';
      showToast(msg, 'error');
    } finally {
      setWithdrawing((prev) => ({ ...prev, [appId]: false }));
    }
  };

  const filtered = filterStatus === 'all'
    ? applications
    : applications.filter((a) => a.status === filterStatus);

  const statusConfig = {
    pending:  { bg: '#fffbeb', color: '#b45309', border: '#fde68a', label: 'Pending Review', dot: '#f59e0b' },
    accepted: { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0', label: 'Accepted', dot: '#10b981' },
    rejected: { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', label: 'Rejected', dot: '#ef4444' },
  };

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-dark)', marginBottom: '0.2rem' }}>
          My Applications
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
          Track the status of your internship applications in real-time.
        </p>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { key: 'all', label: 'Total', color: 'var(--blue-primary)' },
          { key: 'pending', label: 'Pending', color: '#f59e0b' },
          { key: 'accepted', label: 'Accepted', color: '#10b981' },
          { key: 'rejected', label: 'Rejected', color: '#ef4444' },
        ].map(({ key, label, color }) => (
          <div
            key={key}
            className="dash-info-card"
            style={{ cursor: 'pointer', borderColor: filterStatus === key ? color : undefined, borderWidth: filterStatus === key ? '2px' : undefined }}
            onClick={() => setFilterStatus(key)}
          >
            <span className="card-label-small">{label}</span>
            <div className="card-value-large" style={{ color }}>
              {counts[key]}
            </div>
          </div>
        ))}
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {['all', 'pending', 'accepted', 'rejected'].map((s) => (
          <button
            key={s}
            type="button"
            className={`admin-tab-btn${filterStatus === s ? ' active' : ''}`}
            onClick={() => setFilterStatus(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="admin-tab-count">{counts[s]}</span>
          </button>
        ))}
      </div>

      {/* Applications list */}
      {loading ? (
        <LoadingState text="Loading applications..." />
      ) : filtered.length === 0 ? (
        <div className="dashboard-notice-box">
          <div className="notice-icon-box" style={{ background: '#eff6ff', color: 'var(--blue-primary)' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <h2 className="notice-title">
            {filterStatus === 'all' ? 'No applications yet' : `No ${filterStatus} applications`}
          </h2>
          <p className="notice-text">
            {filterStatus === 'all'
              ? 'Browse internship vacancies in the "Search Internships" section to get started.'
              : 'Try selecting a different filter.'}
          </p>
        </div>
      ) : (
        <div
          style={{
            background: '#fff',
            border: '1px solid var(--border-light)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {filtered.map((app, idx) => {
            const cfg = statusConfig[app.status] || statusConfig.pending;
            const job = app.job;
            return (
              <div
                key={app._id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1.25rem',
                  padding: '1.25rem 1.5rem',
                  borderBottom: idx < filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
                  flexWrap: 'wrap',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#fafbfd')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Company icon */}
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, var(--blue-primary), #1e40af)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    flexShrink: 0,
                  }}
                >
                  {(job?.employer?.companyName || 'C').charAt(0)}
                </div>

                {/* Job info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--navy-dark)', marginBottom: '0.2rem' }}>
                    {job?.title || 'Internship Position'}
                  </div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    {job?.employer?.companyName} • {job?.location || '—'} • {job?.type}
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: '6px', padding: '0.15rem 0.5rem', fontSize: '0.72rem', fontWeight: 600 }}>
                      {job?.category}
                    </span>
                    <span style={{ background: '#f8fafc', color: 'var(--text-subtle)', borderRadius: '6px', padding: '0.15rem 0.5rem', fontSize: '0.72rem', fontWeight: 600 }}>
                      {job?.workplaceType}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginLeft: '0.25rem' }}>
                      Applied {formatDate(app.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Status + Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: cfg.bg,
                      color: cfg.color,
                      border: `1px solid ${cfg.border}`,
                      borderRadius: '9999px',
                      padding: '0.25rem 0.75rem',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
                    {cfg.label}
                  </span>

                  {app.status === 'pending' && (
                    <button
                      type="button"
                      className="btn-action-reject"
                      style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}
                      disabled={withdrawing[app._id]}
                      onClick={() => handleWithdraw(app._id, job?.title)}
                      id={`withdraw-btn-${app._id}`}
                    >
                      {withdrawing[app._id] ? 'Withdrawing…' : 'Withdraw'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
