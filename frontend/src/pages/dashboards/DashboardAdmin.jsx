import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from './DashboardLayout';
import adminService from '../../services/adminService';

// Admin Sub-Views
import AdminOverview from './admin/AdminOverview';
import AdminUniversityApprovals from './admin/AdminUniversityApprovals';
import AdminEmployerVerification from './admin/AdminEmployerVerification';
import AdminStudentDirectory from './admin/AdminStudentDirectory';
import AdminSystemAuditLogs from './admin/AdminSystemAuditLogs';
import AdminPlatformSettings from './admin/AdminPlatformSettings';
import AdminProfile from './admin/AdminProfile';

export default function DashboardAdmin() {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [toast, setToast] = useState(null);

  const navItems = [
    'University Approvals',
    'Employer Verification',
    'Student Directory',
    'System Audit Logs',
    'Platform Settings',
    'Admin Profile',
  ];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loadStats = async () => {
    try {
      const data = await adminService.getStats();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const navBadges = {
    'University Approvals': stats?.universities?.pending || 0,
    'Employer Verification': stats?.employers?.pending || 0,
  };

  const renderActiveView = () => {
    switch (activeNav) {
      case 'University Approvals':
        return (
          <AdminUniversityApprovals
            showToast={showToast}
            onActionComplete={loadStats}
          />
        );
      case 'Employer Verification':
        return (
          <AdminEmployerVerification
            showToast={showToast}
            onActionComplete={loadStats}
          />
        );
      case 'Student Directory':
        return (
          <AdminStudentDirectory
            showToast={showToast}
            onActionComplete={loadStats}
          />
        );
      case 'System Audit Logs':
        return (
          <AdminSystemAuditLogs
            showToast={showToast}
          />
        );
      case 'Platform Settings':
        return (
          <AdminPlatformSettings
            showToast={showToast}
            onActionComplete={loadStats}
          />
        );
      case 'Admin Profile':
        return (
          <AdminProfile
            showToast={showToast}
          />
        );
      case 'Overview':
      default:
        return (
          <AdminOverview
            stats={stats}
            onNavigate={(nav) => setActiveNav(nav)}
            user={user}
          />
        );
    }
  };

  return (
    <DashboardLayout
      roleTitle="Administrator"
      roleId="Admin"
      navItems={navItems}
      activeNav={activeNav}
      onNavSelect={(nav) => setActiveNav(nav)}
      navBadges={navBadges}
    >
      {/* Toast Notification Alert */}
      {toast && (
        <div
          className={`admin-toast-banner ${
            toast.type === 'error' ? 'toast-error' : 'toast-success'
          }`}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {toast.type === 'error' ? (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Render selected view */}
      {renderActiveView()}
    </DashboardLayout>
  );
}
