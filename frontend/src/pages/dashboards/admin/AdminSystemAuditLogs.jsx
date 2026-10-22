import React, { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import LoadingState from '../../../components/LoadingState';

export default function AdminSystemAuditLogs({ showToast }) {
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showClearModal, setShowClearModal] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAuditLogs({
        type: filterType,
        search: searchQuery,
      });
      if (data.success) {
        setLogs(data.logs);
        setTotalCount(data.totalCount);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch audit logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterType, searchQuery]);

  const handleClearLogs = async () => {
    try {
      const res = await adminService.clearAuditLogs();
      if (res.success) {
        showToast('Audit trail archived and cleared.', 'success');
        setShowClearModal(false);
        fetchLogs();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to clear audit logs.', 'error');
    }
  };

  const handleExportJSON = () => {
    if (logs.length === 0) {
      showToast('No logs to export.', 'error');
      return;
    }
    const jsonStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interlink_audit_logs_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Audit logs exported as JSON file.', 'success');
  };

  return (
    <div className="admin-audit-view">
      {/* Header */}
      <div className="admin-header-row">
        <div>
          <h2 className="admin-section-title">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--blue-primary)' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            System Audit & Compliance Logs
          </h2>
          <p className="admin-section-subtitle">
            Tamper-evident activity trail recording all administrator actions, accreditation approvals, and security modifications.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleExportJSON}
          >
            Export JSON
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ color: '#ef4444' }}
            onClick={() => setShowClearModal(true)}
          >
            Clear Logs
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-status-tabs">
          <button
            type="button"
            className={`admin-tab-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All Events
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${filterType === 'approvals' ? 'active' : ''}`}
            onClick={() => setFilterType('approvals')}
          >
            Approvals
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${filterType === 'rejections' ? 'active' : ''}`}
            onClick={() => setFilterType('rejections')}
          >
            Rejections
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${filterType === 'deletions' ? 'active' : ''}`}
            onClick={() => setFilterType('deletions')}
          >
            Deletions
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${filterType === 'settings' ? 'active' : ''}`}
            onClick={() => setFilterType('settings')}
          >
            Governance & Settings
          </button>
        </div>

        <div className="admin-search-wrapper">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#94a3b8" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search action, actor, target..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Audit Log Stream */}
      <div style={{ marginBottom: '2rem' }}>
        {loading ? (
          <LoadingState text="Fetching system audit logs..." />
        ) : logs.length === 0 ? (
          <div className="admin-empty-state" style={{ background: '#ffffff', borderRadius: 16, border: '1px solid var(--border-light)' }}>
            <div className="admin-empty-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h4 style={{ margin: '0 0 0.4rem', color: 'var(--navy-dark)' }}>No Audit Logs Found</h4>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              No audit events matched your search criteria.
            </p>
          </div>
        ) : (
          <div className="audit-timeline">
            {logs.map((log) => (
              <div key={log._id} className="audit-entry-card">
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <span className="audit-action-name">{log.action?.replace(/_/g, ' ')}</span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.1rem 0.5rem',
                          borderRadius: 4,
                          background: '#f1f5f9',
                          color: '#475569',
                          fontWeight: 600,
                        }}
                      >
                        {log.targetType || 'System'}
                      </span>
                    </div>

                    <div className="audit-details-text">
                      {log.details || `Performed administrative action targeting ${log.target}`}
                    </div>

                    <div className="audit-meta-text">
                      Actor: <strong>{log.performedBy}</strong> • Target: <strong>{log.target}</strong> • IP: {log.ipAddress || '127.0.0.1'}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className="audit-time-badge" style={{ fontWeight: 600 }}>
                    {new Date(log.createdAt).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowClearModal(false)}>
          <div className="admin-modal-card" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title" style={{ color: '#ef4444' }}>Clear System Audit Trail</h3>
              <button type="button" className="admin-modal-close" onClick={() => setShowClearModal(false)}>
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#334155', lineHeight: 1.5 }}>
                Are you sure you want to purge the current audit logs? An administrative record of this action will be created.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowClearModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: '#ef4444', color: '#fff', border: 'none' }}
                onClick={handleClearLogs}
              >
                Clear All Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
