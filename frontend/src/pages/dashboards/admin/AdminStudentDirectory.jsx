import React, { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';

export default function AdminStudentDirectory({ showToast, onActionComplete }) {
  const [students, setStudents] = useState([]);
  const [universitiesList, setUniversitiesList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUni, setSelectedUni] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await adminService.getStudents({
        search: searchQuery,
        university: selectedUni,
        category: selectedCategory,
      });
      if (data.success) {
        setStudents(data.students);
        if (data.universitiesList) {
          setUniversitiesList(data.universitiesList);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch student directory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [searchQuery, selectedUni, selectedCategory]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await adminService.deleteStudent(deleteTarget._id);
      if (res.success) {
        showToast(`Student record "${deleteTarget.fullName}" deleted.`, 'success');
        setDeleteTarget(null);
        fetchStudents();
        if (onActionComplete) onActionComplete();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete student.', 'error');
    }
  };

  const handleExportCSV = () => {
    if (students.length === 0) {
      showToast('No student records to export.', 'error');
      return;
    }

    const headers = ['Full Name', 'Email', 'University', 'Field / Category', 'Contact Phone', 'Joined Date'];
    const rows = students.map((s) => [
      `"${s.fullName || ''}"`,
      `"${s.email || ''}"`,
      `"${s.university?.universityName || 'Unassigned'}"`,
      `"${s.mainCategory || 'General'}"`,
      `"${s.contactNumber || ''}"`,
      `"${new Date(s.createdAt).toLocaleDateString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `interlink_students_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Student directory exported to CSV!', 'success');
  };

  return (
    <div className="admin-students-view">
      {/* Header */}
      <div className="admin-header-row">
        <div>
          <h2 className="admin-section-title">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#7c3aed' }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Student Talent Directory
          </h2>
          <p className="admin-section-subtitle">
            Central repository of all registered students, university affiliations, and internship readiness status.
          </p>
        </div>

        <div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleExportCSV}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export Directory (CSV)
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-filter-bar">
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flexGrow: 1 }}>
          {/* Search */}
          <div className="admin-search-wrapper" style={{ maxWidth: '320px' }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#94a3b8" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search students, emails..."
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

          {/* University Dropdown Filter */}
          <select
            className="form-input"
            style={{ padding: '0.45rem 0.85rem', width: 'auto', minWidth: '180px', fontSize: '0.85rem' }}
            value={selectedUni}
            onChange={(e) => setSelectedUni(e.target.value)}
          >
            <option value="all">All Universities</option>
            {universitiesList.map((uni) => (
              <option key={uni._id} value={uni._id}>
                {uni.universityName}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            className="form-input"
            style={{ padding: '0.45rem 0.85rem', width: 'auto', minWidth: '150px', fontSize: '0.85rem' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Disciplines</option>
            <option value="IT">IT & Software</option>
            <option value="Business">Business & Management</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design & Media</option>
          </select>
        </div>

        <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
          {students.length} {students.length === 1 ? 'Student' : 'Students'}
        </span>
      </div>

      {/* Students Table */}
      <div className="admin-table-container">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Loading student directory...
          </div>
        ) : students.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
            <h4 style={{ margin: '0 0 0.4rem', color: 'var(--navy-dark)' }}>No Students Found</h4>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              {searchQuery || selectedUni !== 'all' || selectedCategory !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'No student accounts registered yet.'}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th">Student Name</th>
                <th className="admin-th">Email Address</th>
                <th className="admin-th">University</th>
                <th className="admin-th">Category</th>
                <th className="admin-th">Contact</th>
                <th className="admin-th">Registered</th>
                <th className="admin-th" style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id} className="admin-tr">
                  <td className="admin-td" style={{ fontWeight: 700, color: 'var(--navy-dark)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{ width: 34, height: 34, borderRadius: 50, background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.82rem' }}>
                        {student.fullName ? student.fullName.slice(0, 2).toUpperCase() : 'ST'}
                      </div>
                      <div>
                        <div>{student.fullName}</div>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          ID: {student._id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="admin-td">
                    <span style={{ color: '#334155' }}>{student.email}</span>
                  </td>
                  <td className="admin-td">
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>
                      {student.university?.universityName || 'External Student'}
                    </span>
                  </td>
                  <td className="admin-td">
                    <span className="badge-category">{student.mainCategory || 'IT'}</span>
                  </td>
                  <td className="admin-td">
                    <span style={{ color: '#64748b' }}>{student.contactNumber || 'N/A'}</span>
                  </td>
                  <td className="admin-td" style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {new Date(student.createdAt || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="admin-td" style={{ textAlign: 'right' }}>
                    <div className="admin-actions-cell" style={{ justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn-action btn-action-view"
                        onClick={() => setViewingStudent(student)}
                        title="View Student Dossier"
                      >
                        Profile
                      </button>
                      <button
                        type="button"
                        className="btn-action btn-action-delete"
                        onClick={() => setDeleteTarget(student)}
                        title="Delete Student"
                      >
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Student Profile Modal */}
      {viewingStudent && (
        <div className="admin-modal-backdrop" onClick={() => setViewingStudent(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Student Profile Dossier</h3>
              <button type="button" className="admin-modal-close" onClick={() => setViewingStudent(null)}>
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="modal-details-grid">
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Full Name</span>
                  <span className="modal-detail-val">{viewingStudent.fullName}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Enrolled Institution</span>
                  <span className="modal-detail-val">{viewingStudent.university?.universityName || 'External'}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Email Address</span>
                  <span className="modal-detail-val">{viewingStudent.email}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Major Discipline</span>
                  <span className="modal-detail-val">
                    <span className="badge-category">{viewingStudent.mainCategory}</span>
                  </span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Contact Number</span>
                  <span className="modal-detail-val">{viewingStudent.contactNumber || 'N/A'}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Curriculum Vitae (CV)</span>
                  <span className="modal-detail-val">
                    {viewingStudent.cvUrl ? (
                      <a
                        href={viewingStudent.cvUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--blue-primary)', textDecoration: 'underline' }}
                      >
                        View CV Document ↗
                      </a>
                    ) : (
                      'No CV uploaded'
                    )}
                  </span>
                </div>
              </div>

              {viewingStudent.bio && (
                <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#f8fafc', borderRadius: '10px' }}>
                  <span className="modal-detail-label" style={{ display: 'block', marginBottom: '0.4rem' }}>
                    Student Bio / Objectives
                  </span>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                    {viewingStudent.bio}
                  </p>
                </div>
              )}
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setViewingStudent(null)}>
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
              <h3 className="admin-modal-title" style={{ color: '#ef4444' }}>Delete Student Account</h3>
              <button type="button" className="admin-modal-close" onClick={() => setDeleteTarget(null)}>
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#334155', lineHeight: 1.5 }}>
                Are you sure you want to permanently delete student <strong>{deleteTarget.fullName}</strong> ({deleteTarget.email})?
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
