import React, { useState, useEffect } from 'react';
import supervisorService from '../../../services/supervisorService';

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

export default function SupervisorProgressLogs({ showToast }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await supervisorService.getAllProgressLogs({
        search: search.trim() || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
      });
      if (res.success) {
        setLogs(res.logs || []);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load progress logs feed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, selectedCategory]);

  return (
    <div className="supervisor-logs-view animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '22px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#8b5cf6' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            Daily Progress Logs Feed (FR-09, US-05)
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
            Read-only chronological monitoring of daily internship tasks, reflective logs, and learning outcomes recorded by your university interns.
          </p>
        </div>

        <span
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            background: '#f3e8ff',
            color: '#7e22ce',
            fontSize: '0.85rem',
            fontWeight: 700,
          }}
        >
          {logs.length} {logs.length === 1 ? 'Logged Entry' : 'Logged Entries'}
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
              placeholder="Search by keywords in student daily descriptions (e.g., React, API, testing)..."
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

      {/* Logs Feed */}
      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#64748b', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div className="dropdown-loading-spinner">Loading student daily progress logs...</div>
        </div>
      ) : logs.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {logs.map((log) => {
            const studentName = log.student?.fullName || 'Student Intern';
            const studentEmail = log.student?.email || '';
            const category = log.student?.mainCategory || 'General';
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
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '18px 22px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: '#e0f2fe',
                        color: '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                      }}
                    >
                      {studentName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.94rem', color: '#0f172a' }}>
                        {studentName}
                      </span>
                      {studentEmail && (
                        <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '8px' }}>
                          ({studentEmail})
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        background: '#f1f5f9',
                        color: '#334155',
                        fontWeight: 600,
                      }}
                    >
                      {category}
                    </span>
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#2563eb',
                        background: '#eff6ff',
                        padding: '3px 10px',
                        borderRadius: '6px',
                      }}
                    >
                      {logDate}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    padding: '12px 16px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    borderLeft: '4px solid #3b82f6',
                    fontSize: '0.92rem',
                    color: '#334155',
                    lineHeight: 1.55,
                  }}
                >
                  {log.description}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: '#94a3b8', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 10px', display: 'block' }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <p style={{ fontSize: '0.95rem', margin: 0, fontWeight: 500, color: '#475569' }}>
            No progress log entries match your search criteria.
          </p>
        </div>
      )}
    </div>
  );
}
