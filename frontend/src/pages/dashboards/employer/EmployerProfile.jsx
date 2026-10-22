import React, { useState, useEffect } from 'react';
import authService from '../../../services/authService';
import { useAuth } from '../../../context/AuthContext';
import ProfilePictureUpload from '../../../components/ProfilePictureUpload';
import { useLoadingDelay } from '../../../hooks/useLoadingDelay';
import InlineLoader from '../../../components/InlineLoader';
import LoadingState from '../../../components/LoadingState';

export default function EmployerProfile({ showToast = () => {} }) {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const showLoader = useLoadingDelay(saving, 1000);

  const [form, setForm] = useState({
    companyName: '',
    companyCategory: '',
    contactPersonName: '',
    contactPersonDesignation: '',
    contactNumber: '',
    address: '',
    websiteUrl: '',
    linkedinUrl: '',
    companySize: '11-50 employees',
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await authService.getEmployerProfile();
      if (res.success && res.employer) {
        setProfile(res.employer);
        setForm({
          companyName: res.employer.companyName || '',
          companyCategory: res.employer.companyCategory || '',
          contactPersonName: res.employer.contactPersonName || '',
          contactPersonDesignation: res.employer.contactPersonDesignation || '',
          contactNumber: res.employer.contactNumber || '',
          address: res.employer.address || '',
          websiteUrl: res.employer.websiteUrl || '',
          linkedinUrl: res.employer.linkedinUrl || '',
          companySize: res.employer.companySize || '11-50 employees',
        });
      }
    } catch {
      showToast('Failed to load employer profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyName.trim() || !form.contactPersonName.trim()) {
      showToast('Company name and authorized contact person are required.', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await authService.updateEmployerProfile(form);
      if (res.success) {
        setProfile(res.employer);
        updateUser({
          name: res.employer.companyName,
          companyName: res.employer.companyName,
          companyCategory: res.employer.companyCategory,
          profilePicture: res.employer.profilePicture || '',
        });
        showToast('Company profile details saved successfully!', 'success');
      } else {
        showToast(res.message || 'Failed to update profile.', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState text="Loading company profile..." />;
  }

  const isVerified = profile?.status === 'approved';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-dark)', margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--blue-primary)' }}>
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
          Company Profile & Corporate Identity
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
          Manage your enterprise verification data, corporate logo, and university recruitment contact details.
        </p>
      </div>

      {/* Corporate Identity Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--navy-dark) 0%, var(--navy-main) 50%, #1e3a8a 100%)',
          borderRadius: '20px',
          padding: '2rem',
          color: '#ffffff',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            fontWeight: 800,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {profile?.profilePicture ? (
            <img
              src={profile.profilePicture}
              alt={profile.companyName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            (profile?.companyName || 'C').charAt(0).toUpperCase()
          )}
        </div>

        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.3rem' }}>
            {profile?.companyName}
          </div>
          <div style={{ color: '#93c5fd', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            {profile?.email} · BR: <strong>{profile?.brNumber}</strong>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '9999px', padding: '0.2rem 0.75rem', fontSize: '0.78rem', fontWeight: 700 }}>
              {profile?.companyCategory}
            </span>
            <span
              style={{
                background: isVerified ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                border: isVerified ? '1px solid #10b981' : '1px solid #f59e0b',
                color: isVerified ? '#a7f3d0' : '#fde68a',
                borderRadius: '9999px',
                padding: '0.2rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 700,
              }}
            >
              {isVerified ? '✓ Verified Partner (eROC)' : 'Pending Admin Verification'}
            </span>
          </div>
        </div>
      </div>

      {/* Corporate Logo Upload Card */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--border-light)',
          borderRadius: '16px',
          padding: '1.5rem 1.75rem',
          marginBottom: '1.75rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <ProfilePictureUpload
          currentPicture={profile?.profilePicture}
          name={profile?.companyName || 'Company'}
          label="Corporate Logo & Brand Avatar"
          subtitle="Upload official enterprise logo or recruitment badge. Appears on published vacancy listings."
          showToast={showToast}
          onPictureChanged={(newPic) => {
            setProfile((prev) => ({ ...prev, profilePicture: newPic }));
          }}
        />
      </div>

      {/* Edit Form */}
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
          Enterprise & Contact Credentials
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.3rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                Company Legal Name <span className="required">*</span>
              </label>
              <input
                name="companyName"
                className="form-input"
                value={form.companyName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                Industry Category <span className="required">*</span>
              </label>
              <input
                name="companyCategory"
                className="form-input"
                value={form.companyCategory}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                Authorized HR Contact Name <span className="required">*</span>
              </label>
              <input
                name="contactPersonName"
                className="form-input"
                value={form.contactPersonName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">HR Contact Designation</label>
              <input
                name="contactPersonDesignation"
                className="form-input"
                value={form.contactPersonDesignation}
                onChange={handleChange}
                placeholder="e.g. Lead Technical Recruiter"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Contact Phone</label>
              <input
                name="contactNumber"
                className="form-input"
                value={form.contactNumber}
                onChange={handleChange}
                placeholder="e.g. 011 234 5678"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Company Size</label>
              <select
                name="companySize"
                className="form-select"
                value={form.companySize}
                onChange={handleChange}
              >
                <option value="1-10 employees">1-10 employees</option>
                <option value="11-50 employees">11-50 employees</option>
                <option value="51-200 employees">51-200 employees</option>
                <option value="200+ employees">200+ employees</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Official Website URL</label>
              <input
                name="websiteUrl"
                className="form-input"
                value={form.websiteUrl}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">LinkedIn Company URL</label>
              <input
                name="linkedinUrl"
                className="form-input"
                value={form.linkedinUrl}
                onChange={handleChange}
                placeholder="https://linkedin.com/company/..."
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.3rem', marginBottom: 0 }}>
            <label className="form-label">Headquarters / Physical Office Address</label>
            <input
              name="address"
              className="form-input"
              value={form.address}
              onChange={handleChange}
              placeholder="e.g. Colombo, Sri Lanka"
            />
          </div>

          <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ minWidth: '160px' }}
            >
              <span>{saving ? 'Saving' : 'Save Profile Changes'}</span>
              {showLoader && <InlineLoader />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
