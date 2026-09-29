import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

export default function DashboardLayout({ roleTitle, roleId, navItems = [], children }) {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar Shell */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800' }}>
              IL
            </div>
            <span className="sidebar-brand-name">Interlink</span>
          </Link>
          <span className="sidebar-portal-tag">{roleId}</span>
        </div>

        <div className="sidebar-nav">
          <span className="sidebar-nav-title">Navigation (Sprint 2)</span>
          <div className="sidebar-nav-item active">
            <span>Overview</span>
            <span className="sidebar-pill-sprint">Current</span>
          </div>

          {navItems.map((item, index) => (
            <div key={index} className="sidebar-nav-item">
              <span>{item}</span>
              <span className="sidebar-pill-sprint">Sprint 2</span>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <Link to="/" className="sidebar-home-link">
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
            <span className="topbar-greeting">{roleTitle} Portal</span>
            <span className="topbar-role-badge">{roleId}</span>
          </div>

          <div className="topbar-user-section">
            <div className="user-profile-badge">
              <div className="user-avatar-circle">
                {getInitials(user?.name)}
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
