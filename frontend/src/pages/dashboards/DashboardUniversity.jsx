import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from './DashboardLayout';
import universityService from '../../services/universityService';

// University Sub-Views
import UniversityOverview from './university/UniversityOverview';
import UniversitySupervisors from './university/UniversitySupervisors';
import UniversityStudents from './university/UniversityStudents';
import UniversityProgressLogs from './university/UniversityProgressLogs';
import UniversityProfileSettings from './university/UniversityProfileSettings';

export default function DashboardUniversity() {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState('Overview');
  const [statsData, setStatsData] = useState({
    stats: {
      totalStudents: 0,
      totalSupervisors: 0,
      approvedSupervisors: 0,
      pendingSupervisors: 0,
      rejectedSupervisors: 0,
      totalProgressLogs: 0,
    },
    recentSupervisorRequests: [],
    recentLogs: [],
  });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const navItems = [
    'Faculty Supervisors',
    'Enrolled Students',
    'Student Progress Logs',
    'Institutional Profile',
  ];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const loadStats = async () => {
    try {
      const data = await universityService.getStats();
      if (data.success) {
        setStatsData({
          stats: data.stats || {},
          recentSupervisorRequests: data.recentSupervisorRequests || [],
          recentLogs: data.recentLogs || [],
        });
      }
    } catch (err) {
      console.error('Failed to load university stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleApproveFromOverview = async (id, name) => {
    try {
      const res = await universityService.updateSupervisorStatus(id, 'approved', 'Approved from Overview');
      if (res.success) {
        showToast(`Supervisor "${name}" approved successfully!`, 'success');
        loadStats();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to approve supervisor.', 'error');
    }
  };

  const handleRejectFromOverview = async (id, name) => {
    try {
      const res = await universityService.updateSupervisorStatus(id, 'rejected', 'Declined from Overview');
      if (res.success) {
        showToast(`Supervisor "${name}" marked as rejected.`, 'info');
        loadStats();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reject supervisor.', 'error');
    }
  };

  const navBadges = {
    'Faculty Supervisors': statsData.stats.pendingSupervisors || 0,
  };

  const renderActiveView = () => {
    switch (activeNav) {
      case 'Faculty Supervisors':
        return (
          <UniversitySupervisors
            showToast={showToast}
            onActionComplete={loadStats}
          />
        );
      case 'Enrolled Students':
        return <UniversityStudents showToast={showToast} />;
      case 'Student Progress Logs':
        return <UniversityProgressLogs showToast={showToast} />;
      case 'Institutional Profile':
        return (
          <UniversityProfileSettings
            showToast={showToast}
            onProfileUpdate={loadStats}
          />
        );
      case 'Overview':
      default:
        return (
          <UniversityOverview
            stats={statsData.stats}
            recentSupervisors={statsData.recentSupervisorRequests}
            recentLogs={statsData.recentLogs}
            onNavigate={(tab) => setActiveNav(tab)}
            onApproveSupervisor={handleApproveFromOverview}
            onRejectSupervisor={handleRejectFromOverview}
          />
        );
    }
  };

  return (
    <DashboardLayout
      roleTitle="University"
      roleId="University"
      navItems={navItems}
      activeNav={activeNav}
      onNavSelect={(nav) => setActiveNav(nav)}
      navBadges={navBadges}
    >
      {/* Toast Notification Container */}
      {toast && (
        <div
          className={`toast toast-${toast.type} animate-slide-in`}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            borderRadius: '8px',
            background: toast.type === 'error' ? '#ef4444' : toast.type === 'info' ? '#3b82f6' : '#10b981',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            fontWeight: 500,
            fontSize: '0.9rem',
          }}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1.1rem',
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>
      )}

      {renderActiveView()}
    </DashboardLayout>
  );
}
