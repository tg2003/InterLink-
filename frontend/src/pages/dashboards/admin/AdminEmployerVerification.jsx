import React, { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';

export default function AdminEmployerVerification({ showToast, onActionComplete }) {
  const [employers, setEmployers] = useState([]);
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchEmployers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getEmployers({
        status: activeTab,
        search: searchQuery,
      });
      if (data.success) {
        setEmployers(data.employers);
        setCounts(data.counts);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch employers.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployers();
  }, [activeTab, searchQuery]);

  const handleStatusChange = async (id, newStatus, companyName) => {
    try {
      setActionLoadingId(id);
      const res = await adminService.updateEmployerStatus(id, newStatus);
      if (res.success) {
        showToast(
          newStatus === 'approved'
            ? `Employer "${companyName}" verified! Organization can now post internships.`
            : `Employer "${companyName}" marked as ${newStatus}.`,
          'success'
        );
        fetchEmployers();
        if (onActionComplete) onActionComplete();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update employer status.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await adminService.deleteEmployer(deleteTarget._id);
      if (res.success) {
        showToast(`Employer "${deleteTarget.companyName}" successfully removed.`, 'success');
        setDeleteTarget(null);
        fetchEmployers();
        if (onActionComplete) onActionComplete();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete employer.', 'error');
    }
  };

  return (
    <div className="admin-employers-view">
      {/* Header */}
      <div className="admin-header-row">
        <div>
          <h2 className="admin-section-title">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#16a34a' }}>
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
            Employer Verification & Partner Vetting
          </h2>
          <p className="admin-section-subtitle">
            Inspect corporate registrations, verify industry legitimacy, and authorize companies to hire student interns.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-filter-bar">
        {/* Status Tabs */}
        <div className="admin-status-tabs">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Companies <span className="admin-tab-count">{counts.all}</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Verification{' '}
            <span
              className="admin-tab-count"
              style={{
                background: activeTab === 'pending' ? undefined : '#fef3c7',
                color: activeTab === 'pending' ? undefined : '#92400e',
              }}
            >
              {counts.pending}
            </span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            Verified Partners <span className="admin-tab-count">{counts.approved}</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'rejected' ? 'active' : ''}`}
            onClick={() => setActiveTab('rejected')}
          >
            Rejected <span className="admin-tab-count">{counts.rejected}</span>
          </button>
        </div>

        {/* Search */}
        <div className="admin-search-wrapper">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#94a3b8" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search company, category, HR email..."
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

      {/* Employers Table */}
      <div className="admin-table-container">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Loading employer records...
          </div>
        ) : employers.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <h4 style={{ margin: '0 0 0.4rem', color: 'var(--navy-dark)' }}>No Employers Found</h4>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              {searchQuery ? 'Try adjusting your search filter.' : `No employers with status "${activeTab}".`}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th">Company Name</th>
                <th className="admin-th">Industry Category</th>
                <th className="admin-th">HR / Contact Email</th>
                <th className="admin-th">Contact & Location</th>
                <th className="admin-th">Verification</th>
                <th className="admin-th" style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employers.map((emp) => {
                const isActionLoading = actionLoadingId === emp._id;
                return (
                  <tr key={emp._id} className="admin-tr">
                    <td className="admin-td" style={{ fontWeight: 700, color: 'var(--navy-dark)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                          {emp.companyName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div>{emp.companyName}</div>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            ID: {emp._id.slice(-6).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="admin-td">
                      <span className="badge-category">{emp.companyCategory || 'General'}</span>
                    </td>
                    <td className="admin-td">
                      <div>{emp.email}</div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>HR Portal Auth</span>
                    </td>
                    <td className="admin-td">
                      <div>{emp.contactNumber || 'No phone'}</div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{emp.address || 'Colombo, Sri Lanka'}</span>
                    </td>
                    <td className="admin-td">
                      <span
                        className={`badge-status ${
                          emp.status === 'approved'
                            ? 'badge-approved'
                            : emp.status === 'rejected'
                            ? 'badge-rejected'
                            : 'badge-pending'
                        }`}
                      >
                        {emp.status === 'approved' ? 'Verified' : emp.status}
                      </span>
                    </td>
                    <td className="admin-td" style={{ textAlign: 'right' }}>
                      <div className="admin-actions-cell" style={{ justifyContent: 'flex-end' }}>
                        {emp.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              className="btn-action btn-action-approve"
                              disabled={isActionLoading}
                              onClick={() => handleStatusChange(emp._id, 'approved', emp.companyName)}
                              title="Verify Employer"
                            >
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              Verify
                            </button>
                            <button
                              type="button"
                              className="btn-action btn-action-reject"
                              disabled={isActionLoading}
                              onClick={() => handleStatusChange(emp._id, 'rejected', emp.companyName)}
                              title="Reject Application"
                            >
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                              Reject
                            </button>
                          </>
                        )}

                        {emp.status === 'approved' && (
                          <button
                            type="button"
                            className="btn-action btn-action-reject"
                            disabled={isActionLoading}
                            onClick={() => handleStatusChange(emp._id, 'rejected', emp.companyName)}
                            title="Revoke Verification"
                          >
                            Revoke
                          </button>
                        )}

                        {emp.status === 'rejected' && (
                          <button
                            type="button"
                            className="btn-action btn-action-approve"
                            disabled={isActionLoading}
                            onClick={() => handleStatusChange(emp._id, 'approved', emp.companyName)}
                            title="Re-verify Employer"
                          >
                            Re-verify
                          </button>
                        )}

                        {/* View modal */}
                        <button
                          type="button"
                          className="btn-action btn-action-view"
                          onClick={() => setSelectedEmp(emp)}
                          title="View Profile"
                        >
                          View
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          className="btn-action btn-action-delete"
                          onClick={() => setDeleteTarget(emp)}
                          title="Delete Employer"
                        >
                          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Employer Detail Modal */}
      {selectedEmp && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedEmp(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Employer Organization Profile</h3>
              <button type="button" className="admin-modal-close" onClick={() => setSelectedEmp(null)}>
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="modal-details-grid">
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Company Name</span>
                  <span className="modal-detail-val">{selectedEmp.companyName}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Industry Category</span>
                  <span className="modal-detail-val">
                    <span className="badge-category">{selectedEmp.companyCategory}</span>
                  </span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Verification Status</span>
                  <span
                    className={`badge-status ${
                      selectedEmp.status === 'approved'
                        ? 'badge-approved'
                        : selectedEmp.status === 'rejected'
                        ? 'badge-rejected'
                        : 'badge-pending'
                    }`}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    {selectedEmp.status}
                  </span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">HR / Corporate Email</span>
                  <span className="modal-detail-val">{selectedEmp.email}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Phone Contact</span>
                  <span className="modal-detail-val">{selectedEmp.contactNumber || 'N/A'}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Headquarters / Office Address</span>
                  <span className="modal-detail-val">{selectedEmp.address || 'Sri Lanka'}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Application Date</span>
                  <span className="modal-detail-val">
                    {new Date(selectedEmp.createdAt || Date.now()).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Record Identifier</span>
                  <span className="modal-detail-val" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {selectedEmp._id}
                  </span>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              {selectedEmp.status !== 'approved' && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    handleStatusChange(selectedEmp._id, 'approved', selectedEmp.companyName);
                    setSelectedEmp(null);
                  }}
                >
                  Verify Company
                </button>
              )}
              {selectedEmp.status !== 'rejected' && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#ef4444' }}
                  onClick={() => {
                    handleStatusChange(selectedEmp._id, 'rejected', selectedEmp.companyName);
                    setSelectedEmp(null);
                  }}
                >
                  Reject Company
                </button>
              )}
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedEmp(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="admin-modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="admin-modal-card" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title" style={{ color: '#ef4444' }}>Delete Employer</h3>
              <button type="button" className="admin-modal-close" onClick={() => setDeleteTarget(null)}>
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#334155', lineHeight: 1.5 }}>
                Are you sure you want to permanently delete <strong>{deleteTarget.companyName}</strong>? All job postings, applicant logs, and access credentials will be purged.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: '#ef4444', color: '#fff', border: 'none' }}
                onClick={handleDelete}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
