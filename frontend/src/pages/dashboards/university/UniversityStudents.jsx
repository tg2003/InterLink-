import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import universityService from '../../../services/universityService';
import LoadingState from '../../../components/LoadingState';
import './University.css';

export default function UniversityStudents({ showToast }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedStudentLogs, setSelectedStudentLogs] = useState(null);
  const [logsLoading, setLogsLoading] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await universityService.getStudents({
        search: searchQuery,
        category: categoryFilter,
      });
      if (res.success) {
        setStudents(res.students);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch enrolled students.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [searchQuery, categoryFilter]);

  // Lock background scroll & enable ESC key close when progress logs modal is active
  useEffect(() => {
    if (selectedStudentLogs) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setSelectedStudentLogs(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedStudentLogs]);

  const handleOpenStudentLogs = async (student) => {
    try {
      setLogsLoading(true);
      setSelectedStudentLogs({ student, logs: [] });
      const res = await universityService.getStudentProgress(student._id);
      if (res.success) {
        setSelectedStudentLogs({ student: res.student, logs: res.progressLogs });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load student progress logs.', 'error');
    } finally {
      setLogsLoading(false);
    }
  };

  return (
    <div className="university-view-container">
      {/* Header */}
      <div className="admin-header-row">
        <div>
          <h2 className="admin-section-title">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--blue-primary)' }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Enrolled Student Interns Directory
          </h2>
          <p className="admin-section-subtitle">
            Directly monitor all undergraduate students registered under your institution (PB-05, US-10) and audit their daily logbooks without relying on intermediate supervisors.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-wrapper">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#94a3b8" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by student name, email, or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-subtle)' }}>Category:</span>
          <select
            className="university-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Study Categories</option>
            <option value="IT">Information Technology (IT)</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Information Systems">Information Systems</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Engineering">Engineering</option>
          </select>
        </div>

        <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
          {students.length} {students.length === 1 ? 'Student' : 'Students'}
        </span>
      </div>

      {/* Students Table */}
      <div className="admin-table-container">
        {loading ? (
          <LoadingState text="Loading enrolled students..." />
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
              {searchQuery || categoryFilter !== 'all'
                ? 'Try adjusting your search query or category filter.'
                : 'No student accounts registered under your university yet.'}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th">Student Intern</th>
                <th className="admin-th">Category / Degree</th>
                <th className="admin-th">Contact</th>
                <th className="admin-th">Daily Logs Recorded</th>
                <th className="admin-th">CV Document</th>
                <th className="admin-th" style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id} className="admin-tr">
                  <td className="admin-td">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="uni-avatar-initials">
                        {student.fullName ? student.fullName.slice(0, 2).toUpperCase() : 'ST'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--navy-dark)' }}>{student.fullName}</div>
                        <a href={`mailto:${student.email}`} style={{ color: '#64748b', fontSize: '0.78rem', textDecoration: 'none' }}>
                          {student.email}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="admin-td">
                    <span className="badge-category">
                      {student.mainCategory}
                    </span>
                  </td>
                  <td className="admin-td" style={{ color: '#475569', fontWeight: 500 }}>
                    {student.contactNumber || '—'}
                  </td>
                  <td className="admin-td">
                    <span style={{ fontWeight: 700, color: student.progressLogCount > 0 ? '#059669' : '#64748b' }}>
                      {student.progressLogCount} {student.progressLogCount === 1 ? 'entry' : 'entries'}
                    </span>
                    {student.lastProgressDate && (
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        Latest: {new Date(student.lastProgressDate).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="admin-td">
                    {student.cvUrl ? (
                      <a
                        href={student.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-action btn-action-view"
                        style={{ textDecoration: 'none' }}
                      >
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        View CV
                      </a>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Not uploaded</span>
                    )}
                  </td>
                  <td className="admin-td" style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                      onClick={() => handleOpenStudentLogs(student)}
                    >
                      Audit Progress Logs
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Progress Logs Modal for Selected Student */}
      {selectedStudentLogs && typeof document !== 'undefined' && createPortal(
        <div
          className="uni-modal-overlay"
          onClick={() => setSelectedStudentLogs(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="uni-modal-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="uni-modal-header">
              <div>
                <h3 className="uni-modal-title">
                  Daily Progress Logs: {selectedStudentLogs.student?.fullName}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                  {selectedStudentLogs.student?.email} • <span className="badge-category">{selectedStudentLogs.student?.mainCategory}</span>
                </span>
              </div>
              <button
                type="button"
                className="uni-modal-close"
                onClick={() => setSelectedStudentLogs(null)}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            <div className="uni-modal-body" style={{ maxHeight: '62vh' }}>
              {logsLoading ? (
                <LoadingState text="Loading student logs..." padding="2rem" />
              ) : selectedStudentLogs.logs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  <p>This student has not submitted any daily progress logs yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {selectedStudentLogs.logs.map((log, idx) => (
                    <div key={log._id || idx} className="uni-log-card" style={{ borderLeftColor: '#0ea5e9' }}>
                      <div className="uni-log-header">
                        <span className="uni-date-badge">
                          📅 {new Date(log.date || log.createdAt).toLocaleDateString()}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                          Recorded {new Date(log.createdAt || log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="uni-log-body">
                        {log.description}
                      </p>
                      {log.supervisorFeedback && (
                        <div className="uni-log-feedback">
                          <strong>Supervisor Feedback:</strong> {log.supervisorFeedback}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="uni-modal-footer">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedStudentLogs(null)}>
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
