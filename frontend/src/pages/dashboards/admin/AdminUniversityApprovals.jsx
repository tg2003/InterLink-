import React, { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';

export default function AdminUniversityApprovals({ showToast, onActionComplete }) {
  const [universities, setUniversities] = useState([]);
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUni, setSelectedUni] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUniversities({
        status: activeTab,
        search: searchQuery,
      });
      if (data.success) {
        setUniversities(data.universities);
        setCounts(data.counts);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch universities.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, [activeTab, searchQuery]);

  const handleStatusChange = async (id, newStatus, uniName) => {
    try {
      setActionLoadingId(id);
      const res = await adminService.updateUniversityStatus(id, newStatus);
      if (res.success) {
        showToast(
          newStatus === 'approved'
            ? `University "${uniName}" approved! Portal access activated.`
            : `University "${uniName}" marked as ${newStatus}.`,
          'success'
        );
        fetchUniversities();
        if (onActionComplete) onActionComplete();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update university status.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await adminService.deleteUniversity(deleteTarget._id);
      if (res.success) {
        showToast(`University "${deleteTarget.universityName}" successfully deleted.`, 'success');
        setDeleteTarget(null);
        fetchUniversities();
        if (onActionComplete) onActionComplete();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete university.', 'error');
    }
  };

  return (
    <div className="admin-universities-view">
      {/* Header */}
      <div className="admin-header-row">
        <div>
          <h2 className="admin-section-title">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--blue-primary)' }}>
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            University Accreditation & Approvals
          </h2>
          <p className="admin-section-subtitle">
            Validate faculty credentials, approve new academic institutions, and manage university partnerships.
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
            All Institutions <span className="admin-tab-count">{counts.all}</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Approvals <span className="admin-tab-count" style={{ background: activeTab === 'pending' ? undefined : '#fef3c7', color: activeTab === 'pending' ? undefined : '#92400e' }}>{counts.pending}</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            Approved <span className="admin-tab-count">{counts.approved}</span>
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
            placeholder="Search universities, deans, emails..."
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

      {/* Universities Table */}
      <div className="admin-table-container">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Loading university records...
          </div>
        ) : universities.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h4 style={{ margin: '0 0 0.4rem', color: 'var(--navy-dark)' }}>No Universities Found</h4>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              {searchQuery ? 'Try adjusting your search query or clear the filter.' : `No universities with status "${activeTab}".`}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th">Institution Name</th>
                <th className="admin-th">Faculty / Dean Head</th>
                <th className="admin-th">Official Contact</th>
                <th className="admin-th">Address / Location</th>
                <th className="admin-th">Status</th>
                <th className="admin-th" style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {universities.map((uni) => {
                const isActionLoading = actionLoadingId === uni._id;
                return (
                  <tr key={uni._id} className="admin-tr">
                    <td className="admin-td" style={{ fontWeight: 700, color: 'var(--navy-dark)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                          {uni.universityName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div>{uni.universityName}</div>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            ID: {uni._id.slice(-6).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="admin-td">
                      <div style={{ fontWeight: 600 }}>{uni.headName}</div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Head of Department</span>
                    </td>
                    <td className="admin-td">
                      <div>{uni.headEmail}</div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{uni.contactNumber || 'No phone recorded'}</span>
                    </td>
                    <td className="admin-td">
                      <span style={{ color: '#475569' }}>{uni.address || 'Sri Lanka'}</span>
                    </td>
                    <td className="admin-td">
                      <span
                        className={`badge-status ${
                          uni.status === 'approved'
                            ? 'badge-approved'
                            : uni.status === 'rejected'
                            ? 'badge-rejected'
                            : 'badge-pending'
                        }`}
                      >
                        {uni.status}
                      </span>
                    </td>
                    <td className="admin-td" style={{ textAlign: 'right' }}>
                      <div className="admin-actions-cell" style={{ justifyContent: 'flex-end' }}>
                        {uni.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              className="btn-action btn-action-approve"
                              disabled={isActionLoading}
                              onClick={() => handleStatusChange(uni._id, 'approved', uni.universityName)}
                              title="Approve University"
                            >
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn-action btn-action-reject"
                              disabled={isActionLoading}
                              onClick={() => handleStatusChange(uni._id, 'rejected', uni.universityName)}
                              title="Reject Registration"
                            >
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                              Reject
                            </button>
                          </>
                        )}

                        {uni.status === 'approved' && (
                          <button
                            type="button"
                            className="btn-action btn-action-reject"
                            disabled={isActionLoading}
                            onClick={() => handleStatusChange(uni._id, 'rejected', uni.universityName)}
                            title="Revoke Approval"
                          >
                            Revoke
                          </button>
                        )}

                        {uni.status === 'rejected' && (
                          <button
                            type="button"
                            className="btn-action btn-action-approve"
                            disabled={isActionLoading}
                            onClick={() => handleStatusChange(uni._id, 'approved', uni.universityName)}
                            title="Restore & Approve"
                          >
                            Re-approve
                          </button>
                        )}

                        {/* View modal */}
                        <button
                          type="button"
                          className="btn-action btn-action-view"
                          onClick={() => setSelectedUni(uni)}
                          title="View Dossier"
                        >
                          View
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          className="btn-action btn-action-delete"
                          onClick={() => setDeleteTarget(uni)}
                          title="Delete University"
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

      {/* University Detail Modal */}
      {selectedUni && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedUni(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">University Dossier</h3>
              <button type="button" className="admin-modal-close" onClick={() => setSelectedUni(null)}>
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="modal-details-grid">
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Institution Name</span>
                  <span className="modal-detail-val">{selectedUni.universityName}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Accreditation Status</span>
                  <span
                    className={`badge-status ${
                      selectedUni.status === 'approved'
                        ? 'badge-approved'
                        : selectedUni.status === 'rejected'
                        ? 'badge-rejected'
                        : 'badge-pending'
                    }`}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    {selectedUni.status}
                  </span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Dean / Head of Faculty</span>
                  <span className="modal-detail-val">{selectedUni.headName}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Official Email</span>
                  <span className="modal-detail-val">{selectedUni.headEmail}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Contact Phone</span>
                  <span className="modal-detail-val">{selectedUni.contactNumber || 'N/A'}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Campus Address</span>
                  <span className="modal-detail-val">{selectedUni.address || 'Sri Lanka'}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Registered Date</span>
                  <span className="modal-detail-val">
                    {new Date(selectedUni.createdAt || Date.now()).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">System Record ID</span>
                  <span className="modal-detail-val" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {selectedUni._id}
                  </span>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              {selectedUni.status !== 'approved' && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    handleStatusChange(selectedUni._id, 'approved', selectedUni.universityName);
                    setSelectedUni(null);
                  }}
                >
                  Approve Institution
                </button>
              )}
              {selectedUni.status !== 'rejected' && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#ef4444' }}
                  onClick={() => {
                    handleStatusChange(selectedUni._id, 'rejected', selectedUni.universityName);
                    setSelectedUni(null);
                  }}
                >
                  Reject Institution
                </button>
              )}
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedUni(null)}>
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
              <h3 className="admin-modal-title" style={{ color: '#ef4444' }}>Delete University</h3>
              <button type="button" className="admin-modal-close" onClick={() => setDeleteTarget(null)}>
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#334155', lineHeight: 1.5 }}>
                Are you sure you want to permanently delete <strong>{deleteTarget.universityName}</strong>? All institutional associations and portal credentials will be removed.
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
