import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from './DashboardLayout';
import StudentProfile from './student/StudentProfile';
import StudentJobSearch from './student/StudentJobSearch';
import StudentApplications from './student/StudentApplications';
import StudentProgressLog from './student/StudentProgressLog';
import studentService from '../../services/studentService';

export default function DashboardStudent() {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState('Overview');
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({ applications: 0, logs: 0, pending: 0 });

  const navItems = [
    'My Student Profile',
    'Search Internships',
    'My Applications',
    'Daily Progress Logbook',
  ];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Load summary stats for the overview dashboard
  const loadStats = async () => {
    try {
      const [appsRes, logsRes] = await Promise.all([
        studentService.getMyApplications(),
        studentService.getMyProgressLogs(),
      ]);
      setStats({
        applications: appsRes.success ? appsRes.count : 0,
        logs: logsRes.success ? logsRes.count : 0,
        pending: appsRes.success
          ? appsRes.applications.filter((a) => a.status === 'pending').length
          : 0,
      });
    } catch {
      // Non-blocking, silently fail
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Re-load stats whenever user navigates back to Overview
  const handleNavSelect = (nav) => {
    setActiveNav(nav);
    if (nav === 'Overview') loadStats();
  };

  const navBadges = {
    'My Applications': stats.pending || undefined,
  };

  const renderContent = () => {
    switch (activeNav) {
      case 'My Student Profile':
        return <StudentProfile showToast={showToast} />;

      case 'Search Internships':
        return <StudentJobSearch showToast={showToast} />;

      case 'My Applications':
        return <StudentApplications showToast={showToast} />;

      case 'Daily Progress Logbook':
        return <StudentProgressLog showToast={showToast} />;

      case 'Overview':
      default:
        return (
          <div className="animate-fade-in">
            {/* Welcome Banner */}
            <div className="dashboard-banner">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
                <div style={{ maxWidth: '680px' }}>
                  <h1 className="banner-welcome-h1">Welcome, {user?.name || 'Student'} 👋</h1>
                  <p className="banner-desc">
                    Your Undergraduate Career Launchpad. Browse accredited internships from verified employers, manage your profile and CV, submit daily progress logs, and track your applications — all in one place.
                  </p>
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                    <span className="banner-status-tag">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Student Session Active &amp; Verified
                    </span>
                    {user?.university?.universityName && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(56,189,248,0.18)', border: '1px solid rgba(56,189,248,0.35)', color: '#bae6fd', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 700, padding: '0.25rem 0.75rem' }}>
                        🎓 {user.university.universityName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Primary CTA */}
                <div style={{ alignSelf: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-outline-white"
                    style={{ padding: '0.85rem 1.6rem', fontWeight: 700 }}
                    onClick={() => setActiveNav('Search Internships')}
                    id="student-browse-jobs-btn"
                  >
                    Browse Internships →
                  </button>
                </div>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="dashboard-cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              <div
                className="dash-info-card"
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveNav('My Applications')}
              >
                <span className="card-label-small">Total Applications</span>
                <div className="card-value-large" style={{ color: 'var(--blue-primary)' }}>
                  {stats.applications}
                </div>
                <span className="card-hint">Click to view all ↗</span>
              </div>

              <div
                className="dash-info-card"
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveNav('My Applications')}
              >
                <span className="card-label-small">Pending Review</span>
                <div className="card-value-large" style={{ color: '#f59e0b' }}>
                  {stats.pending}
                </div>
                <span className="card-hint">Awaiting employer decision</span>
              </div>

              <div
                className="dash-info-card"
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveNav('Daily Progress Logbook')}
              >
                <span className="card-label-small">Progress Log Entries</span>
                <div className="card-value-large" style={{ color: '#10b981' }}>
                  {stats.logs}
                </div>
                <span className="card-hint">Click to add entries ↗</span>
              </div>

              <div className="dash-info-card">
                <span className="card-label-small">Enrollment Status</span>
                <div className="card-value-large" style={{ color: '#10b981', fontSize: '1.2rem' }}>
                  Active
                </div>
                <span className="card-hint">Ready for internship placement</span>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1e3a8a, #0f2b48)',
                borderRadius: '20px',
                padding: '2rem 2.25rem',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.5rem',
                marginBottom: '1.75rem',
                boxShadow: '0 10px 30px -5px rgba(15,43,72,0.2)',
              }}
            >
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                  Ready to find your internship?
                </h3>
                <p style={{ color: '#93c5fd', fontSize: '0.92rem', margin: 0, maxWidth: '560px', lineHeight: 1.5 }}>
                  Browse vacancies from verified employers across IT, Business, Engineering, and more. Apply with a single click and track your application status in real-time.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-outline-white"
                  style={{ fontWeight: 700 }}
                  onClick={() => setActiveNav('Search Internships')}
                >
                  Search Internships
                </button>
                <button
                  type="button"
                  className="btn btn-outline-white"
                  style={{ fontWeight: 700 }}
                  onClick={() => setActiveNav('Daily Progress Logbook')}
                >
                  Add Progress Log
                </button>
              </div>
            </div>

            {/* Feature Highlight Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {[
                {
                  icon: (
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  ),
                  title: 'My Profile & CV',
                  desc: 'Keep your personal info and CV link up to date for employers.',
                  action: 'My Student Profile',
                  color: '#2563eb',
                  bg: '#eff6ff',
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  ),
                  title: 'Browse Vacancies',
                  desc: 'Explore internship openings filtered by category and workplace type.',
                  action: 'Search Internships',
                  color: '#7c3aed',
                  bg: '#f5f3ff',
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  ),
                  title: 'Progress Logbook',
                  desc: 'Record daily activities for your university and supervisors to review.',
                  action: 'Daily Progress Logbook',
                  color: '#059669',
                  bg: '#ecfdf5',
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" />
                    </svg>
                  ),
                  title: 'Track Applications',
                  desc: 'Monitor pending, accepted, or rejected applications in one view.',
                  action: 'My Applications',
                  color: '#d97706',
                  bg: '#fffbeb',
                },
              ].map(({ icon, title, desc, action, color, bg }) => (
                <div
                  key={title}
                  className="dash-info-card"
                  style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onClick={() => setActiveNav(action)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
                    {icon}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy-dark)', marginBottom: '0.3rem' }}>{title}</div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout
      roleTitle="Intern"
      roleId="Student"
      navItems={navItems}
      activeNav={activeNav}
      onNavSelect={handleNavSelect}
      navBadges={navBadges}
    >
      {/* Toast Alert */}
      {toast && (
        <div
          className={`alert-box ${toast.type === 'error' ? 'alert-error' : 'alert-success'}`}
          style={{
            position: 'fixed',
            top: '85px',
            right: '25px',
            zIndex: 9999,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            maxWidth: '420px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <span>{toast.message}</span>
        </div>
      )}

      {renderContent()}
    </DashboardLayout>
  );
}
