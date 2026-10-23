import React, { useState, useEffect } from 'react';
import supervisorService from '../../../services/supervisorService';
import LoadingState from '../../../components/LoadingState';

const CATEGORIES = [
  'All',
  'Information Technology (IT)',
  'Software Engineering & Computer Science',
  'Business Administration & Management',
  'Finance & Accounting',
  'Civil & Mechanical Engineering',
  'Data Science & Artificial Intelligence',
  'Marketing & Digital Media',
  'UI/UX & Product Design',
];

export default function SupervisorStudents({ showToast }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Selected student for detailed modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentLogs, setStudentLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await supervisorService.getStudents({
        search: search.trim() || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
      });
      if (res.success) {
        setStudents(res.students || []);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load students directory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedCategory, search]);

  const handleOpenStudentDetails = async (student) => {
    setSelectedStudent(student);
    try {
      setLoadingLogs(true);
      const res = await supervisorService.getStudentProgress(student._id);
      if (res.success) {
        setStudentLogs(res.progressLogs || []);
      }
    } catch (err) {
      showToast('Failed to load student progress logs.', 'error');
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedStudent(null);
    setStudentLogs([]);
  };

  return (
    <div className="supervisor-students-view animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '22px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--blue-primary)' }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Enrolled University Interns (PB-09, FR-16)
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
            Directory of students enrolled under your university institution. Review student specialization profiles and daily progress logs.
          </p>
        </div>

        <span
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            background: '#e0f2fe',
            color: '#0369a1',
            fontSize: '0.85rem',
            fontWeight: 700,
          }}
        >
          {students.length} {students.length === 1 ? 'Student Intern' : 'Student Interns'}
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: '1 1 320px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            >
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search by student name, email, or contact number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 38px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
            Category:
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '0.88rem',
              color: '#1e293b',
              background: '#ffffff',
              cursor: 'pointer',
            }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}
      >
        {loading ? (
          <LoadingState text="Loading enrolled student interns..." />
        ) : students.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '14px 18px' }}>Student Intern</th>
                  <th style={{ padding: '14px 18px' }}>Specialization</th>
                  <th style={{ padding: '14px 18px' }}>Contact</th>
                  <th style={{ padding: '14px 18px', textAlign: 'center' }}>Progress Logs</th>
                  <th style={{ padding: '14px 18px' }}>Last Activity</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const logCount = student.progressLogCount || 0;
                  const lastDate = student.lastProgressDate
                    ? new Date(student.lastProgressDate).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'No logs yet';

                  return (
                    <tr
                      key={student._id}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              background: '#e0f2fe',
                              color: '#0284c7',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.9rem',
                            }}
                          >
                            {student.fullName ? student.fullName.slice(0, 2).toUpperCase() : 'ST'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.92rem' }}>
                              {student.fullName}
                            </div>
                            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            background: '#f1f5f9',
                            color: '#334155',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                          }}
                        >
                          {student.mainCategory}
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: '#475569' }}>
                        {student.contactNumber || 'Not provided'}
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            background: logCount > 0 ? '#dcfce7' : '#f1f5f9',
                            color: logCount > 0 ? '#15803d' : '#64748b',
                          }}
                        >
                          {logCount} {logCount === 1 ? 'entry' : 'entries'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: '#64748b' }}>
                        {lastDate}
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenStudentDetails(student)}
                          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                        >
                          Inspect Logbook
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#94a3b8' }}>
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 10px', display: 'block' }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <p style={{ fontSize: '0.95rem', margin: 0, fontWeight: 500, color: '#475569' }}>
              No enrolled students matched your search criteria.
            </p>
          </div>
        )}
      </div>

      {/* Student Details & Progress Log Modal */}
      {selectedStudent && (
        <div
          className="modal-overlay"
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              maxWidth: '740px',
              width: '100%',
              maxHeight: '88vh',
              overflowY: 'auto',
              padding: '28px',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              style={{
                position: 'absolute',
                top: '18px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                fontSize: '1.4rem',
                cursor: 'pointer',
                color: '#64748b',
                lineHeight: 1,
              }}
              aria-label="Close"
            >
              &times;
            </button>

            {/* Modal Header */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.3rem',
                }}
              >
                {selectedStudent.fullName ? selectedStudent.fullName.slice(0, 2).toUpperCase() : 'ST'}
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                  {selectedStudent.fullName}
                </h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', padding: '3px 10px', borderRadius: '12px', background: '#f1f5f9', color: '#334155', fontWeight: 600 }}>
                    {selectedStudent.mainCategory}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {selectedStudent.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Student Profile Info Grid */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '24px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '14px',
                fontSize: '0.86rem',
              }}
            >
              <div>
                <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Phone:</span>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>
                  {selectedStudent.contactNumber || 'Not specified'}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Curriculum Vitae (CV):</span>
                {selectedStudent.cvUrl ? (
                  <a
                    href={selectedStudent.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }}
                  >
                    View Student CV
                  </a>
                ) : (
                  <span style={{ color: '#94a3b8' }}>No CV uploaded</span>
                )}
              </div>
              {selectedStudent.bio && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Bio / Objective:</span>
                  <p style={{ margin: 0, color: '#334155', lineHeight: 1.45 }}>{selectedStudent.bio}</p>
                </div>
              )}
            </div>

            {/* Daily Progress Logs Section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  Daily Progress Logs ({studentLogs.length})
                </h4>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Chronological Order (US-05, FR-09)
                </span>
              </div>

              {loadingLogs ? (
                <LoadingState text="Loading progress log entries..." padding="30px" />
              ) : studentLogs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {studentLogs.map((log) => {
                    const logDate = log.date ? new Date(log.date).toLocaleDateString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    }) : 'Recorded Date';

                    return (
                      <div
                        key={log._id}
                        style={{
                          padding: '14px 16px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          background: '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                            {logDate}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            Logged: {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', lineHeight: 1.5 }}>
                          {log.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 16px', background: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
                  This student has not submitted any daily progress log entries yet.
                </div>
              )}
            </div>

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleCloseModal}
              >
                Close Logbook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
