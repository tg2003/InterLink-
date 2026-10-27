import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

export default function DashboardLayout({
  roleTitle,
  roleId,
  navItems = [],
  activeNav,
  onNavSelect,
  navBadges = {},
  children,
}) {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer when resizing up to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const isCurrent = (itemName) => {
    if (activeNav) {
      return activeNav.toLowerCase() === itemName.toLowerCase();
    }
    return itemName === 'Overview';
  };

  const handleNavClick = (itemName) => {
    if (onNavSelect) {
      onNavSelect(itemName);
    }
    setMobileMenuOpen(false);
  };

  // Nav icons helper
  const renderNavIcon = (name) => {
    const key = name.toLowerCase();
    if (key.includes('overview')) {
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1.5"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5"/>
        </svg>
      );
    }
    if (key.includes('university') || key.includes('approv')) {
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      );
    }
    if (key.includes('employer') || key.includes('verif') || key.includes('partner')) {
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      );
    }
    if (key.includes('student') || key.includes('director') || key.includes('enrolled')) {
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      );
    }
    if (key.includes('audit') || key.includes('log')) {
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      );
    }
    if (key.includes('setting')) {
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      );
    }
    if (key.includes('vacancy') || key.includes('job') || key.includes('post') || key.includes('internship')) {
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      );
    }
    if (key.includes('applicant') || key.includes('candidate')) {
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="8.5" cy="7" r="4"/>
          <line x1="20" y1="8" x2="20" y2="14"/>
          <line x1="23" y1="11" x2="17" y2="11"/>
        </svg>
      );
    }
    if (key.includes('coord') || key.includes('faculty')) {
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
      );
    }
    if (key.includes('profile') || key.includes('company')) {
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="8"/>
      </svg>
    );
  };

  return (
    <div className="dashboard-wrapper">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Shell */}
      <aside className={`dashboard-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }} onClick={() => setMobileMenuOpen(false)}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800' }}>
              IL
            </div>
            <span className="sidebar-brand-name">Interlink</span>
          </Link>
          <span className="sidebar-portal-tag">{roleId}</span>

          {/* Close button inside sidebar on mobile */}
          <button
            type="button"
            className="sidebar-mobile-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            ✕
          </button>
        </div>

        <div className="sidebar-nav">
          <span className="sidebar-nav-title">Navigation</span>
          
          {/* Overview item */}
          <div
            className={`sidebar-nav-item ${isCurrent('Overview') ? 'active' : ''}`}
            onClick={() => handleNavClick('Overview')}
            role="button"
            tabIndex={0}
          >
            <div className="sidebar-nav-left">
              <span className="sidebar-nav-icon">{renderNavIcon('Overview')}</span>
              <span>Overview</span>
            </div>
            {isCurrent('Overview') ? (
              <span className="sidebar-pill-sprint active-pill">Current</span>
            ) : null}
          </div>

          {/* Dynamic Nav Items */}
          {navItems.map((item, index) => {
            const active = isCurrent(item);
            const badgeCount = navBadges[item];
            return (
              <div
                key={index}
                className={`sidebar-nav-item ${active ? 'active' : ''}`}
                onClick={() => handleNavClick(item)}
                role="button"
                tabIndex={0}
              >
                <div className="sidebar-nav-left">
                  <span className="sidebar-nav-icon">{renderNavIcon(item)}</span>
                  <span>{item}</span>
                </div>
                {badgeCount !== undefined && badgeCount > 0 && (
                  <span className="sidebar-pill-badge">{badgeCount}</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <Link to="/" className="sidebar-home-link" onClick={() => setMobileMenuOpen(false)}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>Return to Landing Page</span>
          </Link>
        </div>
      </aside>

      {/* Main Container */}
      <div className="dashboard-main">
        {/* Topbar Shell */}
        <header className="dashboard-topbar">
          <div className="topbar-title-section">
            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              className="dashboard-hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>

            <span className="topbar-greeting">{roleTitle} Portal</span>
            <span className="topbar-role-badge">{roleId}</span>
            {activeNav && activeNav !== 'Overview' && (
              <div className="topbar-breadcrumb">
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-current">{activeNav}</span>
              </div>
            )}
          </div>

          <div className="topbar-user-section">
            <div className="user-profile-badge">
              <div className="user-avatar-circle" style={{ overflow: 'hidden', padding: 0 }}>
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user?.name || 'User'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  />
                ) : (
                  getInitials(user?.name)
                )}
              </div>
              <div className="user-details-text">
                <span className="user-name-bold">{user?.name || 'Verified User'}</span>
                <span className="user-email-small">{user?.email || 'user@interlink.com'}</span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Dashboard Dynamic View */}
        <main className="dashboard-content animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
