import React, { useEffect, useState } from 'react';
import jobService from '../../../services/jobService';

export default function EmployerActiveInterns({ showToast }) {
  const [positions, setPositions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await jobService.getActiveInterns();
        if (res.success) {
          setPositions(res.positions);
          setTotal(res.total);
        }
      } catch (err) {
        showToast?.(err.response?.data?.message || 'Failed to load active interns.', 'error');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Active Interns</h2>
        <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.92rem' }}>
          {total} intern{total === 1 ? '' : 's'} currently working at your company, grouped by internship position.
        </p>
      </div>

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading active interns…</p>
      ) : positions.length === 0 ? (
        <div className="dashboard-notice-box">
          <h3 className="notice-title">No active interns yet</h3>
          <p className="notice-text">
            Students you accept under <strong>Vacancy Applicants</strong> will appear here under their internship position.
          </p>
        </div>
      ) : (
        positions.map((pos) => (
          <section key={pos.jobId} style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{pos.title}</h3>
              <span className="badge-category" style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}>{pos.category}</span>
              <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
                {pos.interns.length} intern{pos.interns.length === 1 ? '' : 's'} · {pos.duration}
              </span>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {pos.interns.map((i) => (
                <div
                  key={i.applicationId}
                  style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1rem 1.15rem', boxShadow: '0 2px 8px rgba(15,43,72,0.05)' }}
                >
                  <div style={{ fontWeight: 800 }}>{i.student.fullName}</div>
                  <div style={{ color: '#475569', fontSize: '0.85rem' }}>{i.student.email}</div>
                  {i.student.contactNumber && (
                    <div style={{ color: '#475569', fontSize: '0.85rem' }}>{i.student.contactNumber}</div>
                  )}
                  <div style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                    {i.student.university?.universityName || 'University n/a'} · {i.student.mainCategory}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '0.4rem' }}>
                    Accepted {new Date(i.startedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
