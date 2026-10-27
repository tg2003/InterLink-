import React, { useEffect, useMemo, useState } from 'react';
import jobService from '../../../services/jobService';

const STATUS_STYLES = {
  pending: { background: '#fef3c7', color: '#b45309' },
  accepted: { background: '#d1fae5', color: '#047857' },
  rejected: { background: '#fee2e2', color: '#b91c1c' },
};

export default function EmployerApplicants({ showToast, onChanged }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobFilter, setJobFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await jobService.getApplicants();
      if (res.success) setApplications(res.applications);
    } catch (err) {
      showToast?.(err.response?.data?.message || 'Failed to load applicants.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const jobs = useMemo(() => {
    const map = new Map();
    applications.forEach((a) => map.set(a.job._id, a.job.title));
    return [...map.entries()];
  }, [applications]);

  const visible =
    jobFilter === 'all' ? applications : applications.filter((a) => a.job._id === jobFilter);

  const setStatus = async (id, status) => {
    try {
      setBusyId(id);
      const res = await jobService.updateApplicationStatus(id, status);
      if (res.success) {
        const closed = new Set((res.autoClosedIds || []).map(String));
        setApplications((prev) =>
          status === 'pending'
            ? prev.map((a) => (a._id === id ? { ...a, status } : a))
            : prev.filter((a) => a._id !== id && !closed.has(String(a._id)))
        );
        showToast?.(res.message);
        onChanged?.();
      }
    } catch (err) {
      showToast?.(err.response?.data?.message || 'Failed to update application.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Vacancy Applicants</h2>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.92rem' }}>
            Students who applied to the internship vacancies posted by your company.
          </p>
        </div>
        <select
          value={jobFilter}
          onChange={(e) => setJobFilter(e.target.value)}
          style={{ padding: '0.55rem 0.8rem', borderRadius: '10px', border: '1px solid #cbd5e1', minWidth: '220px' }}
        >
          <option value="all">All vacancies ({applications.length})</option>
          {jobs.map(([id, title]) => (
            <option key={id} value={id}>{title}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading applicants…</p>
      ) : visible.length === 0 ? (
        <div className="dashboard-notice-box">
          <h3 className="notice-title">No applicants yet</h3>
          <p className="notice-text">
            When students apply to your published vacancies, they will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {visible.map((app) => {
            const s = app.student;
            const style = STATUS_STYLES[app.status] || STATUS_STYLES.pending;
            return (
              <div
                key={app._id}
                style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem 1.4rem', boxShadow: '0 2px 8px rgba(15,43,72,0.05)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{s.fullName}</div>
                    <div style={{ color: '#475569', fontSize: '0.88rem' }}>{s.email}{s.contactNumber ? ` · ${s.contactNumber}` : ''}</div>
                    <div style={{ color: '#475569', fontSize: '0.88rem', marginTop: '0.2rem' }}>
                      {s.university?.universityName || 'University n/a'} · {s.mainCategory}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ ...style, padding: '0.25rem 0.7rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize' }}>
                      {app.status}
                    </span>
                    <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '0.4rem' }}>
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '0.8rem', fontSize: '0.9rem' }}>
                  <strong>Applied for:</strong> {app.job.title}
                  <span style={{ color: '#64748b' }}> ({app.job.category})</span>
                </div>
                {s.bio && <p style={{ margin: '0.5rem 0 0', color: '#475569', fontSize: '0.88rem' }}>{s.bio}</p>}

                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  {s.cvUrl && (
                    <a className="btn btn-secondary btn-sm" href={s.cvUrl} target="_blank" rel="noreferrer">
                      View CV
                    </a>
                  )}
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={busyId === app._id || app.status === 'accepted'}
                    onClick={() => setStatus(app._id, 'accepted')}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={busyId === app._id || app.status === 'rejected'}
                    onClick={() => setStatus(app._id, 'rejected')}
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
