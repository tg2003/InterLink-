import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from './DashboardLayout';
import supervisorService from '../../services/supervisorService';

// Sub-Views
import SupervisorOverview from './supervisor/SupervisorOverview';
import SupervisorStudents from './supervisor/SupervisorStudents';
import SupervisorProgressLogs from './supervisor/SupervisorProgressLogs';
import SupervisorProfile from './supervisor/SupervisorProfile';

export default function DashboardSupervisor() {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState('Overview');
  const [supervisor, setSupervisor] = useState(null);
  const [statsData, setStatsData] = useState({
    stats: {
      totalStudents: 0,
      totalProgressLogs: 0,
      activeLoggers: 0,
      categoriesCount: 0,
    },
    categoryBreakdown: [],
    recentLogs: [],
  });

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const navItems = [
    'Enrolled Interns',
    'Student Progress Logs',
    'Advisor Profile',
  ];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const loadSupervisorData = async () => {
    try {
      setLoading(true);
      const [statusRes, statsRes] = await Promise.allSettled([
        supervisorService.getStatus(),
        supervisorService.getStats(),
      ]);

      if (statusRes.status === 'fulfilled' && statusRes.value?.success) {
        setSupervisor(statusRes.value.supervisor);
      }

      if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
        setStatsData({
          stats: statsRes.value.stats || {},
          categoryBreakdown: statsRes.value.categoryBreakdown || [],
          recentLogs: statsRes.value.recentLogs || [],
        });
      }
    } catch (err) {
      console.error('Failed to load supervisor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupervisorData();
  }, []);

  const isApproved = supervisor?.joinStatus === 'approved';

  const navBadges = {
    'Enrolled Interns': isApproved ? statsData.stats.totalStudents || 0 : 0,
    'Student Progress Logs': isApproved ? statsData.stats.totalProgressLogs || 0 : 0,
  };

  const renderActiveView = () => {
    switch (activeNav) {
      case 'Enrolled Interns':
        return (
          <SupervisorStudents
            showToast={showToast}
          />
        );
      case 'Student Progress Logs':
        return (
          <SupervisorProgressLogs
            showToast={showToast}
          />
        );
      case 'Advisor Profile':
        return (
          <SupervisorProfile
            supervisor={supervisor}
            onProfileUpdated={loadSupervisorData}
            showToast={showToast}
          />
        );
      case 'Overview':
      default:
        return (
          <SupervisorOverview
            supervisor={supervisor}
            stats={statsData.stats}
            categoryBreakdown={statsData.categoryBreakdown}
            recentLogs={statsData.recentLogs}
            onNavigate={(tab) => setActiveNav(tab)}
            onStatusUpdated={loadSupervisorData}
            showToast={showToast}
          />
        );
    }
  };

  return (
    <DashboardLayout
      roleTitle="Supervisor"
      roleId="Supervisor"
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
