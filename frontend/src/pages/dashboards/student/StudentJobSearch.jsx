import React, { useState, useEffect } from 'react';
import jobService from '../../../services/jobService';
import studentService from '../../../services/studentService';
import LoadingState from '../../../components/LoadingState';

export default function StudentJobSearch({ showToast }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState({});
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [workplaceFilter, setWorkplaceFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load all jobs and my applications in parallel
      const [jobsRes, appsRes] = await Promise.all([
        jobService.getAllJobs(),
        studentService.getMyApplications(),
      ]);

      if (jobsRes.success) setJobs(jobsRes.jobs);

      if (appsRes.success) {
        const ids = new Set(appsRes.applications.map((a) => a.job?._id || a.job));
        setAppliedIds(ids);
      }
    } catch {
      showToast('Failed to load internship vacancies.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApply = async (jobId, jobTitle) => {
    setApplying((prev) => ({ ...prev, [jobId]: true }));
    try {
      const data = await studentService.applyForJob(jobId);
      if (data.success) {
        showToast(`Application submitted for "${jobTitle}"!`);
        setAppliedIds((prev) => new Set([...prev, jobId]));
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to submit application.';
      showToast(msg, 'error');
    } finally {
      setApplying((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  // Filter logic
  const categories = ['all', ...new Set(jobs.map((j) => j.category).filter(Boolean))];
  const workplaceTypes = ['all', 'On-site', 'Hybrid', 'Remote'];

  const filtered = jobs.filter((job) => {
    const s = search.toLowerCase();
    const matchSearch =
      !s ||
      job.title?.toLowerCase().includes(s) ||
      job.description?.toLowerCase().includes(s) ||
      job.location?.toLowerCase().includes(s) ||
      job.employer?.companyName?.toLowerCase().includes(s);
    const matchCat = categoryFilter === 'all' || job.category === categoryFilter;
    const matchWork = workplaceFilter === 'all' || job.workplaceType === workplaceFilter;
    return matchSearch && matchCat && matchWork;
  });

  const workplaceBadgeColor = (type) => {
    if (type === 'Remote') return { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
    if (type === 'Hybrid') return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
    return { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-dark)', marginBottom: '0.2rem' }}>
          Search Internships
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
          Browse available internship vacancies from verified employers and apply directly.
        </p>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          background: '#fff',
          border: '1px solid var(--border-light)',
          borderRadius: '14px',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--bg-alt)',
            border: '1px solid var(--border-light)',
            borderRadius: '10px',
            padding: '0.45rem 0.85rem',
            flexGrow: 1,
            maxWidth: '380px',
          }}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.88rem', width: '100%', color: 'var(--text-main)' }}
            placeholder="Search by title, company, location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="job-search-input"
          />
        </div>

        {/* Category filter */}
        <select
          className="form-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ width: 'auto', padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
          id="job-category-filter"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
          ))}
        </select>

        {/* Workplace filter */}
        <select
          className="form-select"
          value={workplaceFilter}
          onChange={(e) => setWorkplaceFilter(e.target.value)}
          style={{ width: 'auto', padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
          id="job-workplace-filter"
        >
          {workplaceTypes.map((t) => (
            <option key={t} value={t}>{t === 'all' ? 'All Workplace Types' : t}</option>
          ))}
        </select>

        <span style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', marginLeft: 'auto' }}>
          {filtered.length} {filtered.length === 1 ? 'vacancy' : 'vacancies'} found
        </span>
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
          }}
          onClick={() => setSelectedJob(null)}
        >
          <div
            style={{
              background: '#fff', borderRadius: '20px', padding: '2.25rem',
              maxWidth: '680px', width: '100%', maxHeight: '80vh', overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-dark)', marginBottom: '0.3rem' }}>
                  {selectedJob.title}
                </h2>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {selectedJob.employer?.companyName} • {selectedJob.location}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '0.45rem 0.7rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {['type', 'workplaceType', 'duration', 'stipend'].map((k) => (
                selectedJob[k] && (
                  <span key={k} className="badge-category" style={{ fontSize: '0.78rem' }}>
                    {selectedJob[k]}
                  </span>
                )
              ))}
            </div>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              {selectedJob.description}
            </p>

            {selectedJob.requirements?.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--navy-dark)', marginBottom: '0.5rem' }}>Requirements</div>
                <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {selectedJob.requirements.map((r, i) => (
                    <li key={i} style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedJob.responsibilities?.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--navy-dark)', marginBottom: '0.5rem' }}>Responsibilities</div>
                <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {selectedJob.responsibilities.map((r, i) => (
                    <li key={i} style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
              {appliedIds.has(selectedJob._id) ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#047857', fontWeight: 700, fontSize: '0.9rem' }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Applied
                </span>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={applying[selectedJob._id]}
                  onClick={() => handleApply(selectedJob._id, selectedJob.title)}
                  id={`apply-btn-modal-${selectedJob._id}`}
                >
                  {applying[selectedJob._id] ? 'Applying…' : 'Apply Now'}
                </button>
              )}
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedJob(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jobs Grid */}
      {loading ? (
        <LoadingState text="Loading vacancies..." />
      ) : filtered.length === 0 ? (
        <div className="dashboard-notice-box">
          <div className="notice-icon-box" style={{ background: '#eff6ff', color: 'var(--blue-primary)' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h2 className="notice-title">No internships found</h2>
          <p className="notice-text">Try adjusting your search filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((job) => {
            const hasApplied = appliedIds.has(job._id);
            const wp = workplaceBadgeColor(job.workplaceType);
            return (
              <div
                key={job._id}
                style={{
                  background: '#fff',
                  border: hasApplied ? '1.5px solid #a7f3d0' : '1px solid var(--border-light)',
                  borderRadius: '16px',
                  padding: '1.4rem',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                onClick={() => setSelectedJob(job)}
              >
                {/* Company avatar + title */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, var(--blue-primary), #1e40af)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      flexShrink: 0,
                    }}
                  >
                    {(job.employer?.companyName || 'C').charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--navy-dark)', marginBottom: '0.15rem', lineHeight: 1.3 }}>
                      {job.title}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {job.employer?.companyName}
                    </div>
                  </div>
                  {hasApplied && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: '9999px', padding: '0.15rem 0.55rem', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
                      ✓ Applied
                    </span>
                  )}
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.72rem', fontWeight: 600 }}>
                    {job.category}
                  </span>
                  <span style={{ background: wp.bg, color: wp.color, border: `1px solid ${wp.border}`, borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.72rem', fontWeight: 600 }}>
                    {job.workplaceType}
                  </span>
                  <span style={{ background: '#f8fafc', color: 'var(--text-subtle)', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.72rem', fontWeight: 600 }}>
                    {job.type}
                  </span>
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', gap: '1.2rem', fontSize: '0.8rem', color: 'var(--text-subtle)', flexWrap: 'wrap' }}>
                  <span>📍 {job.location || '—'}</span>
                  <span>⏱ {job.duration || '—'}</span>
                  <span>💰 {job.stipend || 'Negotiable'}</span>
                </div>

                {/* Action */}
                <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                  <button
                    type="button"
                    className={hasApplied ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
                    disabled={hasApplied || applying[job._id]}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!hasApplied) handleApply(job._id, job.title);
                    }}
                    style={{ width: '100%' }}
                    id={`apply-btn-${job._id}`}
                  >
                    {hasApplied ? '✓ Applied' : applying[job._id] ? 'Applying…' : 'Apply Now'}
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
