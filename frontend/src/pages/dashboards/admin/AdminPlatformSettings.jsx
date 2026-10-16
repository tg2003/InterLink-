import React, { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import { useAuth } from '../../../context/AuthContext';

export default function AdminPlatformSettings({ showToast, onActionComplete }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowUniversityRegistration: true,
    allowEmployerRegistration: true,
    requireEmailVerification: false,
    autoApproveUniversities: false,
    autoApproveEmployers: false,
    systemNotice: '',
    supportEmail: '',
    sessionTimeoutMinutes: 60,
    maxFileSizeMB: 10,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pingResult, setPingResult] = useState(null);
  const [pingLoading, setPingLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await adminService.getSettings();
        if (data.success && data.settings) {
          setSettings({
            maintenanceMode: Boolean(data.settings.maintenanceMode),
            allowUniversityRegistration: Boolean(data.settings.allowUniversityRegistration),
            allowEmployerRegistration: Boolean(data.settings.allowEmployerRegistration),
            requireEmailVerification: Boolean(data.settings.requireEmailVerification),
            autoApproveUniversities: Boolean(data.settings.autoApproveUniversities),
            autoApproveEmployers: Boolean(data.settings.autoApproveEmployers),
            systemNotice: data.settings.systemNotice || '',
            supportEmail: data.settings.supportEmail || 'admin@interlink.com',
            sessionTimeoutMinutes: data.settings.sessionTimeoutMinutes || 60,
            maxFileSizeMB: data.settings.maxFileSizeMB || 10,
          });
        }
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to fetch platform settings.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await adminService.updateSettings(settings);
      if (res.success) {
        showToast('Platform governance settings successfully saved to database.', 'success');
        if (onActionComplete) onActionComplete();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const runDiagnostics = async () => {
    try {
      setPingLoading(true);
      const start = performance.now();
      const res = await adminService.getStats();
      const end = performance.now();
      const latencyMs = Math.round(end - start);

      setPingResult({
        latency: latencyMs,
        dbStatus: res.stats?.systemHealth?.dbConnected ? 'Online (Atlas)' : 'Degraded',
        nodeVersion: res.stats?.systemHealth?.nodeVersion || 'v20',
        activeAdmins: res.stats?.systemHealth?.activeAdmins || 1,
        timestamp: new Date().toLocaleTimeString(),
      });
      showToast(`Diagnostics complete: API latency ${latencyMs}ms.`, 'success');
    } catch {
      showToast('Diagnostics ping failed.', 'error');
    } finally {
      setPingLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        Loading platform governance configuration...
      </div>
    );
  }

  return (
    <div className="admin-settings-view">
      {/* Header */}
      <div className="admin-header-row">
        <div>
          <h2 className="admin-section-title">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--blue-primary)' }}>
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Platform Governance & System Settings
          </h2>
          <p className="admin-section-subtitle">
            Configure system-wide registration gates, security policies, maintenance mode, and administrative broadcast notices.
          </p>
        </div>

        <div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving Changes...' : 'Save Platform Settings'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* Registration & Approval Gates */}
        <div className="settings-section-card">
          <h3 className="settings-card-title">Registration & Verification Policies</h3>
          <p className="settings-card-desc">
            Govern onboarding rules and automatic approval criteria for incoming institution and company applications.
          </p>

          <div className="settings-row">
            <div>
              <div className="settings-label-title">Allow University Faculty Registrations</div>
              <div className="settings-label-sub">
                Permit new university deans and department heads to sign up via the public portal.
              </div>
            </div>
            <label className="admin-switch">
              <input
                type="checkbox"
                checked={settings.allowUniversityRegistration}
                onChange={() => handleToggle('allowUniversityRegistration')}
              />
              <span className="admin-switch-slider"></span>
            </label>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-label-title">Allow Employer Organization Registrations</div>
              <div className="settings-label-sub">
                Enable hiring partners and companies to submit employer profiles for internship postings.
              </div>
            </div>
            <label className="admin-switch">
              <input
                type="checkbox"
                checked={settings.allowEmployerRegistration}
                onChange={() => handleToggle('allowEmployerRegistration')}
              />
              <span className="admin-switch-slider"></span>
            </label>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-label-title">Bypass Queue: Auto-Approve Universities</div>
              <div className="settings-label-sub">
                Automatically mark newly registered university accounts as approved without admin review.
              </div>
            </div>
            <label className="admin-switch">
              <input
                type="checkbox"
                checked={settings.autoApproveUniversities}
                onChange={() => handleToggle('autoApproveUniversities')}
              />
              <span className="admin-switch-slider"></span>
            </label>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-label-title">Bypass Queue: Auto-Approve Employers</div>
              <div className="settings-label-sub">
                Automatically verify companies upon signup without manual vetting.
              </div>
            </div>
            <label className="admin-switch">
              <input
                type="checkbox"
                checked={settings.autoApproveEmployers}
                onChange={() => handleToggle('autoApproveEmployers')}
              />
              <span className="admin-switch-slider"></span>
            </label>
          </div>
        </div>

        {/* Security & Maintenance */}
        <div className="settings-section-card">
          <h3 className="settings-card-title">Security & System Maintenance</h3>
          <p className="settings-card-desc">
            High-privilege platform access gates and operational maintenance controls.
          </p>

          <div className="settings-row">
            <div>
              <div className="settings-label-title" style={{ color: settings.maintenanceMode ? '#ef4444' : undefined }}>
                Platform Maintenance Mode
              </div>
              <div className="settings-label-sub">
                When active, all non-administrative portals display a maintenance notice.
              </div>
            </div>
            <label className="admin-switch">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={() => handleToggle('maintenanceMode')}
              />
              <span className="admin-switch-slider" style={{ backgroundColor: settings.maintenanceMode ? '#ef4444' : undefined }}></span>
            </label>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-label-title">Academic Domain Verification</div>
              <div className="settings-label-sub">
                Enforce .ac.lk or accredited educational email domains during student registration.
              </div>
            </div>
            <label className="admin-switch">
              <input
                type="checkbox"
                checked={settings.requireEmailVerification}
                onChange={() => handleToggle('requireEmailVerification')}
              />
              <span className="admin-switch-slider"></span>
            </label>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-label-title">Admin Session Inactivity Timeout (Minutes)</div>
              <div className="settings-label-sub">
                Automatic logout interval for security token protection.
              </div>
            </div>
            <input
              type="number"
              name="sessionTimeoutMinutes"
              className="form-input"
              style={{ width: '120px', padding: '0.45rem 0.75rem' }}
              value={settings.sessionTimeoutMinutes}
              onChange={handleChange}
              min="15"
              max="480"
            />
          </div>
        </div>

        {/* Portal Broadcast & Support */}
        <div className="settings-section-card">
          <h3 className="settings-card-title">Portal Broadcast & Communications</h3>
          <p className="settings-card-desc">
            Publish system announcements visible across all user dashboards.
          </p>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-dark)', marginBottom: '0.4rem' }}>
              System Notice / Global Announcement
            </label>
            <input
              type="text"
              name="systemNotice"
              className="form-input"
              value={settings.systemNotice}
              onChange={handleChange}
              placeholder="e.g. Interlink Core Infrastructure operating normally..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-dark)', marginBottom: '0.4rem' }}>
                System Support Contact Email
              </label>
              <input
                type="email"
                name="supportEmail"
                className="form-input"
                value={settings.supportEmail}
                onChange={handleChange}
                placeholder="admin@interlink.com"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-dark)', marginBottom: '0.4rem' }}>
                Max Resume / CV Upload Size (MB)
              </label>
              <input
                type="number"
                name="maxFileSizeMB"
                className="form-input"
                value={settings.maxFileSizeMB}
                onChange={handleChange}
                min="2"
                max="50"
              />
            </div>
          </div>
        </div>

        {/* Diagnostics & Active Session */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Diagnostics Card */}
          <div className="settings-section-card" style={{ margin: 0 }}>
            <h3 className="settings-card-title">Infrastructure Health Diagnostics</h3>
            <p className="settings-card-desc">
              Perform real-time round-trip latency ping and MongoDB Atlas handshake.
            </p>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={runDiagnostics}
              disabled={pingLoading}
              style={{ marginBottom: '1rem' }}
            >
              {pingLoading ? 'Testing Gateway...' : '⚡ Run Diagnostics Ping'}
            </button>

            {pingResult && (
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 10, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>API Latency:</span>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>{pingResult.latency} ms</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Atlas Database:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{pingResult.dbStatus}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Node Engine:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{pingResult.nodeVersion}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Last Checked:</span>
                  <span style={{ color: '#64748b' }}>{pingResult.timestamp}</span>
                </div>
              </div>
            )}
          </div>

          {/* Active Admin Session Card */}
          <div className="settings-section-card" style={{ margin: 0 }}>
            <h3 className="settings-card-title">Super Admin Credentials</h3>
            <p className="settings-card-desc">
              Current authenticated administrator session profile.
            </p>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 10, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Admin Name:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{user?.name || 'System Administrator'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Email:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{user?.email || 'admin@interlink.com'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Role Clearance:</span>
                <span style={{ fontWeight: 700, color: '#2563eb' }}>Super Admin (Level 1)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Status:</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>Authorized & Verified</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '2.5rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Platform Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
