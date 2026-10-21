import React, { useState, useEffect } from 'react';
import studentService from '../../../services/studentService';

export default function StudentProgressLog({ showToast }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ date: '', description: '' });
  const [showForm, setShowForm] = useState(false);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await studentService.getMyProgressLogs();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch {
      showToast('Failed to load progress logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date) {
      showToast('Please select a date for the log entry.', 'error');
      return;
    }
    if (!form.description.trim()) {
      showToast('Description cannot be empty.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const data = await studentService.addProgressLog({
        date: form.date,
        description: form.description,
      });
      if (data.success) {
        showToast('Progress log entry added!');
        setForm({ date: '', description: '' });
        setShowForm(false);
        loadLogs();
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to add log entry.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (logId) => {
    if (!window.confirm('Delete this progress log entry?')) return;
    try {
      const data = await studentService.deleteProgressLog(logId);
      if (data.success) {
        showToast('Log entry deleted.');
        setLogs((prev) => prev.filter((l) => l._id !== logId));
      }
    } catch (err) {
      showToast('Failed to delete log entry.', 'error');
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="animate-fade-in">
      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-dark)', marginBottom: '0.2rem' }}>
            Daily Progress Logbook
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
            Record your daily internship progress — visible to your university head, supervisors, and employers.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setShowForm((v) => !v)}
          id="student-add-log-btn"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {showForm ? 'Cancel' : 'Add Entry'}
        </button>
      </div>

      {/* Add Entry Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="animate-fade-in"
          style={{
            background: '#fff',
            border: '1.5px solid var(--blue-primary)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 0 0 4px rgba(37,99,235,0.06)',
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-dark)', marginBottom: '1.2rem' }}>
            New Progress Log Entry
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1rem', alignItems: 'start' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="log-date">
                Date <span className="required">*</span>
              </label>
              <input
                id="log-date"
                name="date"
                className="form-input"
                type="date"
                value={form.date}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                required
                style={{ width: '180px' }}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="log-description">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="log-description"
                name="description"
                className="form-textarea"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your activities, learnings, or achievements today…"
                rows={3}
                required
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={submitting}
              id="student-submit-log-btn"
            >
              {submitting ? 'Saving…' : 'Save Entry'}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setShowForm(false);
                setForm({ date: '', description: '' });
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Log Entries List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading logs…</div>
      ) : logs.length === 0 ? (
        <div className="dashboard-notice-box">
          <div className="notice-icon-box" style={{ background: '#eff6ff', color: 'var(--blue-primary)' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <h2 className="notice-title">No progress logs yet</h2>
          <p className="notice-text">Start recording your daily internship activities by clicking "Add Entry" above.</p>
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
          {/* Stats bar */}
          <div
            style={{
              background: '#f8fafc',
              borderBottom: '1px solid var(--border-light)',
              padding: '0.85rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-subtle)' }}>
              TOTAL ENTRIES
            </span>
            <span
              style={{
                background: 'var(--blue-primary)',
                color: '#fff',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.15rem 0.55rem',
              }}
            >
              {logs.length}
            </span>
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
              Sorted chronologically (oldest first)
            </span>
          </div>

          {/* Timeline */}
          <div style={{ padding: '0.5rem 0' }}>
            {logs.map((log, idx) => (
              <div
                key={log._id}
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  padding: '1.1rem 1.5rem',
                  borderBottom: idx < logs.length - 1 ? '1px solid #f1f5f9' : 'none',
                  alignItems: 'flex-start',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#fafbfd')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Day number bubble */}
                <div
                  style={{
                    flexShrink: 0,
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'var(--blue-tint)',
                    color: 'var(--blue-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                  }}
                >
                  {idx + 1}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--blue-primary)', marginBottom: '0.3rem' }}>
                    {formatDate(log.date)}
                  </div>
                  <div style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                    {log.description}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-action-delete"
                  title="Delete this log entry"
                  onClick={() => handleDelete(log._id)}
                  style={{ flexShrink: 0 }}
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
