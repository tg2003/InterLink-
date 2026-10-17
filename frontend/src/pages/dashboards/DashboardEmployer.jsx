import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from './DashboardLayout';
import EmployerPostJob from './employer/EmployerPostJob';
import jobService from '../../services/jobService';

export default function DashboardEmployer() {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState('Overview');
  const [toast, setToast] = useState(null);
  const [vacancyCount, setVacancyCount] = useState(0);
  const [applicantCount, setApplicantCount] = useState(0);

  const navItems = [
    'Post Internship Vacancy',
    'Talent Applicant Pool',
    'Active Interns',
    'Supervisor Coordination',
    'Company Profile',
  ];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const loadJobStats = async () => {
    try {
      const res = await jobService.getMyJobs();
      if (res.success) {
        setVacancyCount(res.jobs.length);
        const totalApplicants = res.jobs.reduce((acc, j) => acc + (j.applicantCount || 0), 0);
        setApplicantCount(totalApplicants);
      }
    } catch {
      // Non-blocking if offline
    }
  };

  useEffect(() => {
    loadJobStats();
  }, []);

  const isVerified = user?.status === 'approved';

  const navBadges = {
    'Post Internship Vacancy': vacancyCount,
    'Talent Applicant Pool': applicantCount,
  };

  const renderContent = () => {
    switch (activeNav) {
      case 'Post Internship Vacancy':
        return (
          <EmployerPostJob
            user={user}
            showToast={showToast}
            onJobCreated={loadJobStats}
          />
        );

      case 'Talent Applicant Pool':
        return (
          <div className="dashboard-notice-box animate-fade-in">
            <div className="notice-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
            </div>
            <h2 className="notice-title">Talent Applicant Pool Management</h2>
            <p className="notice-text">
              Review and screen verified undergraduate candidates matched with your industry domain. Once students apply to your published internship vacancies, candidate profiles, GPA, CV dossiers, and university endorsements will appear here.
            </p>
            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setActiveNav('Post Internship Vacancy')}
              >
                Publish New Vacancy
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveNav('Overview')}
              >
                Back to Overview
              </button>
            </div>
          </div>
        );

      case 'Active Interns':
      case 'Supervisor Coordination':
      case 'Company Profile':
        return (
          <div className="dashboard-notice-box animate-fade-in">
            <div className="notice-icon-box">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <h2 className="notice-title">{activeNav}</h2>
            <p className="notice-text">
              This module is scheduled for full deployment in upcoming releases. Current Sprint priority: <strong>Employer Corporate Registration Verification (PB-02)</strong> and <strong>Internship Vacancy Publishing (FR-15)</strong>.
            </p>
            <div style={{ marginTop: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveNav('Overview')}
              >
                Back to Overview
              </button>
            </div>
          </div>
        );

      case 'Overview':
      default:
        return (
          <div className="animate-fade-in">
            {/* Top Banner with direct CTA */}
            <div className="dashboard-banner">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
                <div style={{ maxWidth: '680px' }}>
                  <h1 className="banner-welcome-h1">Welcome, {user?.name || 'Enterprise Recruiter'}</h1>
                  <p className="banner-desc">
                    Enterprise Talent Acquisition & Internship Management Hub. Connect with accredited university partner institutions, publish internship vacancies, screen qualified undergraduate candidates, and coordinate faculty supervision.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span className="banner-status-tag">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      {isVerified ? 'Verified Corporate Partner (eROC)' : 'Corporate Account Active'}
                    </span>
                    {user?.companyCategory && (
                      <span className="badge-category" style={{ fontSize: '0.75rem', padding: '0.2rem 0.65rem' }}>
                        {user.companyCategory}
                      </span>
                    )}
                  </div>
                </div>

                {/* Prominent CTA button */}
                <div style={{ alignSelf: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    style={{
                      boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
                      padding: '0.85rem 1.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                    }}
                    onClick={() => setActiveNav('Post Internship Vacancy')}
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Post Internship Vacancy
                  </button>
                </div>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="dashboard-cards-grid">
              <div className="dash-info-card">
                <span className="card-label-small">Verification Status</span>
                <div
                  className="card-value-large"
                  style={{ color: isVerified ? '#10b981' : '#f59e0b', fontSize: '1.35rem' }}
                >
                  {isVerified ? 'Verified & Approved' : user?.status || 'Pending Review'}
                </div>
                <span className="card-hint">
                  {isVerified ? 'Full vacancy publishing authorized' : 'Undergoing Admin vetting'}
                </span>
              </div>

              <div
                className="dash-info-card"
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveNav('Post Internship Vacancy')}
              >
                <span className="card-label-small">Published Vacancies</span>
                <div className="card-value-large" style={{ color: '#2563eb' }}>
                  {vacancyCount}
                </div>
                <span className="card-hint">Click to manage vacancies ↗</span>
              </div>

              <div
                className="dash-info-card"
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveNav('Talent Applicant Pool')}
              >
                <span className="card-label-small">Student Applicants</span>
                <div className="card-value-large">
                  {applicantCount}
                </div>
                <span className="card-hint">Undergraduate candidate pool</span>
              </div>

              <div className="dash-info-card">
                <span className="card-label-small">HR Portal Account</span>
                <div className="card-value-large" style={{ fontSize: '1rem', wordBreak: 'break-all' }}>
                  {user?.email}
                </div>
                <span className="card-hint">{user?.address || 'Sri Lanka'}</span>
              </div>
            </div>

            {/* Quick Action Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1e3a8a, #0f2b48)',
                borderRadius: '20px',
                padding: '2rem 2.25rem',
                color: '#ffffff',
                marginBottom: '1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.5rem',
                boxShadow: '0 10px 30px -5px rgba(15, 43, 72, 0.2)',
              }}
            >
              <div>
                <h3 style={{ color: '#ffffff', fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                  Recruit Top Undergraduate Interns in {user?.companyCategory || 'Your Industry'}
                </h3>
                <p style={{ color: '#93c5fd', fontSize: '0.92rem', margin: 0, maxWidth: '620px', lineHeight: 1.5 }}>
                  Publish vacancies with structured requirements, duration, and monthly stipend. Interlink automatically surfaces your vacancy to qualified students with endorsed academic credentials.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-outline-white"
                style={{ padding: '0.75rem 1.4rem', fontWeight: 700 }}
                onClick={() => setActiveNav('Post Internship Vacancy')}
              >
                + Create Vacancy Now
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout
      roleTitle="Employer"
      roleId="Employer"
      navItems={navItems}
      activeNav={activeNav}
      onNavSelect={(nav) => setActiveNav(nav)}
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

