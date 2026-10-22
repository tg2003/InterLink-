import React, { useState, useEffect } from 'react';
import authService from '../../../services/authService';
import { useAuth } from '../../../context/AuthContext';
import ProfilePictureUpload from '../../../components/ProfilePictureUpload';
import { useLoadingDelay } from '../../../hooks/useLoadingDelay';
import InlineLoader from '../../../components/InlineLoader';

export default function AdminProfile({ showToast = () => {} }) {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const showLoader = useLoadingDelay(saving, 1000);
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await authService.getAdminProfile();
      if (res.success && res.admin) {
        setProfile(res.admin);
        setFullName(res.admin.fullName || '');
      }
    } catch {
      showToast('Failed to load administrator profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Full name cannot be empty.', 'error');
      return;
    }

    if (password && password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    if (password && password !== confirmPassword) {
      showToast('Password confirmation does not match.', 'error');
      return;
    }

    try {
      setSaving(true);
      const payload = { fullName: fullName.trim() };
      if (password.trim()) payload.password = password.trim();

      const res = await authService.updateAdminProfile(payload);
      if (res.success) {
        setProfile(res.admin);
        updateUser({
          name: res.admin.fullName,
          profilePicture: res.admin.profilePicture || '',
        });
        setPassword('');
        setConfirmPassword('');
        showToast('Administrator profile updated successfully!', 'success');
      } else {
        showToast(res.message || 'Failed to update profile.', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating administrator profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
        <div className="loader" style={{ margin: '0 auto 1rem' }}></div>
        <p>Loading administrator profile...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-dark)', margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--blue-primary)' }}>
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          System Administrator Profile
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
          Manage your master administrative authority credentials and avatar representation.
        </p>
      </div>

      {/* Avatar Card */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--border-light)',
          borderRadius: '16px',
          padding: '1.75rem',
          marginBottom: '1.75rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <ProfilePictureUpload
          currentPicture={profile?.profilePicture}
          name={profile?.fullName || 'Admin'}
          label="Administrator Profile Avatar"
          subtitle="Upload official system administrator photo or avatar. Appears in audit trail logs and topbar."
          showToast={showToast}
          onPictureChanged={(newPic) => {
            setProfile((prev) => ({ ...prev, profilePicture: newPic }));
          }}
        />
      </div>

      {/* Profile Form */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--border-light)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-dark)', marginBottom: '1.5rem' }}>
          Credentials & Security
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">
              Full Administrator Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Super Admin Email (System ID)</label>
            <input
              type="email"
              className="form-input"
              value={profile?.email || ''}
              disabled
              style={{ background: '#f8fafc', color: 'var(--text-subtle)', cursor: 'not-allowed' }}
            />
            <small style={{ color: 'var(--text-subtle)', fontSize: '0.78rem' }}>
              Root administrator email address is protected.
            </small>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep unchanged"
                autoComplete="new-password"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ minWidth: '160px' }}
            >
              <span>{saving ? 'Saving' : 'Save Admin Details'}</span>
              {showLoader && <InlineLoader />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
