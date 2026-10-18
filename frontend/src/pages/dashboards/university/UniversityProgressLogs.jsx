import React, { useState, useEffect } from 'react';
import universityService from '../../../services/universityService';
import './University.css';

export default function UniversityProgressLogs({ showToast }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await universityService.getAllProgressLogs({ search: searchQuery });
      if (res.success) {
        setLogs(res.logs);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch student progress logs feed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [searchQuery]);

  return (
    <div className="university-view-container">
      {/* Header Row */}
      <div className="admin-header-row">
        <div>
          <h2 className="admin-section-title">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--blue-primary)' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Student Daily Progress Logs Audit Feed
          </h2>
          <p className="admin-section-subtitle">
            Continuous, read-only institutional audit trail (FR-09, US-05, US-10) of daily activities submitted by students across all partner internship placements.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-wrapper" style={{ maxWidth: '480px' }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#94a3b8" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search within daily log descriptions or student names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
          {logs.length} {logs.length === 1 ? 'Log Recorded' : 'Logs Recorded'}
        </span>
      </div>

      {/* Progress Logs Feed */}
      {loading ? (
        <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          Loading daily progress feed...
        </div>
      ) : logs.length === 0 ? (
        <div className="admin-empty-state">
          <div className="admin-empty-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            </svg>
          </div>
          <h4 style={{ margin: '0 0 0.4rem', color: 'var(--navy-dark)' }}>No Progress Logs Found</h4>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>
            {searchQuery
              ? 'No progress entries matched your search keywords.'
              : 'No student progress entries have been recorded yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {logs.map((log) => (
            <div key={log._id} className="uni-log-card">
              <div className="uni-log-header">
                <div className="uni-log-student-info">
                  <div className="uni-avatar-initials">
                    {log.student?.fullName ? log.student.fullName.slice(0, 2).toUpperCase() : 'ST'}
                  </div>
                  <div>
                    <span className="uni-log-student-name">
                      {log.student?.fullName || 'Student Intern'}
                    </span>
                    <span className="uni-log-student-email">
                      ({log.student?.email})
                    </span>
                    {log.student?.mainCategory && (
                      <span className="badge-category" style={{ marginLeft: '0.5rem' }}>
                        {log.student.mainCategory}
                      </span>
                    )}
                  </div>
                </div>

                <div className="uni-log-badges">
                  <span className="uni-date-badge">
                    📅 Activity Date: <strong>{new Date(log.date || log.createdAt).toLocaleDateString()}</strong>
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                    Logged {new Date(log.createdAt || log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <p className="uni-log-body">
                {log.description}
              </p>

              {log.supervisorFeedback && (
                <div className="uni-log-feedback">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <div>
                    <strong>Supervisor Feedback:</strong> {log.supervisorFeedback}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
