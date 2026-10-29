import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import universityService from '../../../services/universityService';
import { useLoadingDelay } from '../../../hooks/useLoadingDelay';
import InlineLoader from '../../../components/InlineLoader';
import LoadingState from '../../../components/LoadingState';
import './University.css';

export default function UniversitySupervisors({ showToast, onActionComplete }) {
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [actionModal, setActionModal] = useState({ open: false, type: '', supervisor: null, notes: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const showActionLoader = useLoadingDelay(actionLoading, 1000);

  const fetchSupervisors = async () => {
    try {
      setLoading(true);
      const res = await universityService.getSupervisors({
        status: statusFilter,
        search: searchQuery,
      });
      if (res.success) {
        setSupervisors(res.supervisors);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load supervisors.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupervisors();
  }, [statusFilter, searchQuery]);

  // Lock background scroll & handle ESC key close when either modal is active
  const isAnyModalOpen = actionModal.open || !!selectedSupervisor;
  useEffect(() => {
    if (isAnyModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          if (actionModal.open) setActionModal({ open: false, type: '', supervisor: null, notes: '' });
          if (selectedSupervisor) setSelectedSupervisor(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isAnyModalOpen, actionModal.open, selectedSupervisor]);

  const handleOpenActionModal = (supervisor, type) => {
    setActionModal({
      open: true,
      type,
      supervisor,
      notes: supervisor.reviewNotes || '',
    });
  };

  const handleConfirmAction = async () => {
    if (!actionModal.supervisor) return;
    try {
      setActionLoading(true);
      const res = await universityService.updateSupervisorStatus(
        actionModal.supervisor._id,
        actionModal.type,
        actionModal.notes
      );
      if (res.success) {
        showToast(
          actionModal.type === 'approved'
            ? `Supervisor ${actionModal.supervisor.fullName} approved successfully!`
            : `Supervisor request marked as ${actionModal.type}.`,
          'success'
        );
        setActionModal({ open: false, type: '', supervisor: null, notes: '' });
        fetchSupervisors();
        if (onActionComplete) onActionComplete();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update supervisor status.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const counts = {
    all: supervisors.length,
    pending: supervisors.filter((s) => s.joinStatus === 'pending').length,
    approved: supervisors.filter((s) => s.joinStatus === 'approved').length,
    rejected: supervisors.filter((s) => s.joinStatus === 'rejected').length,
  };

  return (
    <div className="university-view-container">
      {/* Header Row */}
      <div className="admin-header-row">
        <div>
          <h2 className="admin-section-title">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--blue-primary)' }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Faculty Supervisors & Join Requests
          </h2>
          <p className="admin-section-subtitle">
            Verify institutional staff registration numbers (FR-05, US-03) and authorize departmental supervisors to access student intern data.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-status-tabs">
          <button
            type="button"
            className={`admin-tab-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All Staff
            <span className="admin-tab-count">{counts.all}</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pending Requests
            {counts.pending > 0 && <span className="admin-tab-count" style={{ background: '#fef3c7', color: '#b45309' }}>{counts.pending}</span>}
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${statusFilter === 'approved' ? 'active' : ''}`}
            onClick={() => setStatusFilter('approved')}
          >
            Approved Supervisors
            <span className="admin-tab-count">{counts.approved}</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${statusFilter === 'rejected' ? 'active' : ''}`}
            onClick={() => setStatusFilter('rejected')}
          >
            Rejected
            <span className="admin-tab-count">{counts.rejected}</span>
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
            placeholder="Search by name, email, or staff ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Supervisors Table */}
      <div className="admin-table-container">
        {loading ? (
          <LoadingState text="Loading supervisors..." />
        ) : supervisors.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
            <h4 style={{ margin: '0 0 0.4rem', color: 'var(--navy-dark)' }}>No Supervisors Found</h4>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or filter tabs.'
                : 'No supervisor join requests received yet.'}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th">Supervisor Name</th>
                <th className="admin-th">Staff Reg No (US-03)</th>
                <th className="admin-th">Email Address</th>
                <th className="admin-th">Department</th>
                <th className="admin-th">Status</th>
                <th className="admin-th" style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {supervisors.map((sup) => (
                <tr key={sup._id} className="admin-tr">
                  <td className="admin-td">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="uni-avatar-initials sup">
                        {sup.fullName ? sup.fullName.slice(0, 2).toUpperCase() : 'SP'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--navy-dark)' }}>{sup.fullName}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          Registered {new Date(sup.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="admin-td">
                    <code style={{ background: '#f1f5f9', color: '#1e293b', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.84rem', fontWeight: 600 }}>
                      {sup.staffRegNo}
                    </code>
                  </td>
                  <td className="admin-td">
                    <a href={`mailto:${sup.email}`} style={{ color: 'var(--blue-primary)', textDecoration: 'none', fontWeight: 500 }}>
                      {sup.email}
                    </a>
                  </td>
                  <td className="admin-td" style={{ color: '#475569', fontWeight: 500 }}>
                    {sup.department || 'Faculty of Technology'}
                  </td>
                  <td className="admin-td">
                    <span className={`badge-status badge-${sup.joinStatus}`}>
                      {sup.joinStatus}
                    </span>
                  </td>
                  <td className="admin-td" style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.45rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {sup.joinStatus === 'pending' ? (
                        <>
                          <button
                            type="button"
                            className="btn-action btn-action-approve"
                            onClick={() => handleOpenActionModal(sup, 'approved')}
                            title="Approve Supervisor"
                          >
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Approve
                          </button>
                          <button
                            type="button"
                            className="btn-action btn-action-reject"
                            onClick={() => handleOpenActionModal(sup, 'rejected')}
                            title="Reject Supervisor"
                          >
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="btn-action btn-action-view"
                          onClick={() => setSelectedSupervisor(sup)}
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Action Modal (Approve / Reject) */}
      {actionModal.open && typeof document !== 'undefined' && createPortal(
        <div
          className="uni-modal-overlay"
          onClick={() => setActionModal({ open: false, type: '', supervisor: null, notes: '' })}
          role="dialog"
          aria-modal="true"
        >
          <div className="uni-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="uni-modal-header">
              <h3 className="uni-modal-title">
                {actionModal.type === 'approved' ? 'Approve Supervisor Join Request' : 'Reject Supervisor Join Request'}
              </h3>
              <button
                type="button"
                className="uni-modal-close"
                onClick={() => setActionModal({ open: false, type: '', supervisor: null, notes: '' })}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            <div className="uni-modal-body">
              <p style={{ color: '#475569', fontSize: '0.92rem', margin: 0, lineHeight: 1.5 }}>
                You are about to <strong style={{ color: actionModal.type === 'approved' ? '#059669' : '#b91c1c' }}>{actionModal.type}</strong> faculty supervisor{' '}
                <strong style={{ color: 'var(--navy-dark)' }}>{actionModal.supervisor?.fullName}</strong> (Staff ID:{' '}
                <code>{actionModal.supervisor?.staffRegNo}</code>).
              </p>

              <div>
                <label className="form-label" htmlFor="modalReviewNotes" style={{ fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>
                  Institutional Notes / Justification (Optional)
                </label>
                <textarea
                  id="modalReviewNotes"
                  className="form-input"
                  rows={3}
                  placeholder="e.g. Verified with faculty HR records..."
                  value={actionModal.notes}
                  onChange={(e) => setActionModal((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            <div className="uni-modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActionModal({ open: false, type: '', supervisor: null, notes: '' })}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn btn-sm ${actionModal.type === 'approved' ? 'btn-primary' : 'btn-danger'}`}
                style={actionModal.type === 'approved' ? { background: '#10b981', borderColor: '#10b981' } : {}}
                onClick={handleConfirmAction}
                disabled={actionLoading}
              >
                <span>{actionLoading ? 'Processing' : `Confirm ${actionModal.type === 'approved' ? 'Approval' : 'Rejection'}`}</span>
                {showActionLoader && <InlineLoader />}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Details View Modal */}
      {selectedSupervisor && typeof document !== 'undefined' && createPortal(
        <div
          className="uni-modal-overlay"
          onClick={() => setSelectedSupervisor(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="uni-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="uni-modal-header">
              <h3 className="uni-modal-title">Supervisor Profile</h3>
              <button
                type="button"
                className="uni-modal-close"
                onClick={() => setSelectedSupervisor(null)}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            <div className="uni-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span className="card-label-small">Full Name</span>
                  <div style={{ fontWeight: 700, color: 'var(--navy-dark)', fontSize: '0.98rem' }}>
                    {selectedSupervisor.fullName}
                  </div>
                </div>
                <div>
                  <span className="card-label-small">Staff Registration ID</span>
                  <div>
                    <code style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: 4, fontWeight: 700 }}>
                      {selectedSupervisor.staffRegNo}
                    </code>
                  </div>
                </div>
                <div>
                  <span className="card-label-small">Institutional Email</span>
                  <div style={{ color: '#334155' }}>{selectedSupervisor.email}</div>
                </div>
                <div>
                  <span className="card-label-small">Department</span>
                  <div style={{ color: '#334155' }}>{selectedSupervisor.department || 'Department of Computing'}</div>
                </div>
                <div>
                  <span className="card-label-small">Account Status</span>
                  <div>
                    <span className={`badge-status badge-${selectedSupervisor.joinStatus}`}>
                      {selectedSupervisor.joinStatus}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="card-label-small">Joined Date</span>
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {new Date(selectedSupervisor.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              {selectedSupervisor.reviewNotes && (
                <div style={{ marginTop: '0.5rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <span className="card-label-small" style={{ marginBottom: '2px', display: 'block' }}>Head Review Notes</span>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569' }}>
                    {selectedSupervisor.reviewNotes}
                  </p>
                </div>
              )}
            </div>
            <div className="uni-modal-footer">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedSupervisor(null)}>
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
