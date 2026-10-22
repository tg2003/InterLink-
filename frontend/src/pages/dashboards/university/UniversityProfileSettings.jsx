import React, { useState, useEffect } from 'react';
import universityService from '../../../services/universityService';
import ProfilePictureUpload from '../../../components/ProfilePictureUpload';
import { useLoadingDelay } from '../../../hooks/useLoadingDelay';
import InlineLoader from '../../../components/InlineLoader';
import './University.css';

export default function UniversityProfileSettings({ showToast, onProfileUpdate }) {
  const [formData, setFormData] = useState({
    universityName: '',
    headName: '',
    headEmail: '',
    contactNumber: '',
    address: '',
    profilePicture: '',
    status: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const showLoader = useLoadingDelay(saving, 1000);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await universityService.getProfile();
        if (res.success && res.university) {
          setFormData({
            universityName: res.university.universityName || '',
            headName: res.university.headName || '',
            headEmail: res.university.headEmail || '',
            contactNumber: res.university.contactNumber || '',
            address: res.university.address || '',
            profilePicture: res.university.profilePicture || '',
            status: res.university.status || 'pending',
          });
        }
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to load university profile.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await universityService.updateProfile({
        universityName: formData.universityName,
        headName: formData.headName,
        contactNumber: formData.contactNumber,
        address: formData.address,
      });
      if (res.success) {
        showToast('University profile details updated successfully!', 'success');
        if (onProfileUpdate) onProfileUpdate(res.university);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
        <p>Loading university profile...</p>
      </div>
    );
  }

  return (
    <div className="university-view-container" style={{ maxWidth: '850px' }}>
      {/* Header */}
      <div className="admin-header-row">
        <div>
          <h2 className="admin-section-title">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--blue-primary)' }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Institutional Profile & Settings
          </h2>
          <p className="admin-section-subtitle">
            Manage your faculty contact credentials, administrative authority, and main campus communication channels.
          </p>
        </div>
      </div>

      <div className="admin-table-container" style={{ padding: '1.75rem 2rem', margin: 0 }}>
        {/* Institutional Logo / Seal Upload */}
        <div style={{ marginBottom: '1.75rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <ProfilePictureUpload
            currentPicture={formData.profilePicture}
            name={formData.universityName || 'University'}
            label="Institutional Logo / Seal"
            subtitle="Upload official crest, university emblem, or institutional seal."
            showToast={showToast}
            onPictureChanged={(newPic) => {
              setFormData((prev) => ({ ...prev, profilePicture: newPic }));
              if (onProfileUpdate) onProfileUpdate({ ...formData, profilePicture: newPic });
            }}
          />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-form-grid" style={{ gap: '1.25rem' }}>
            {/* University Name */}
            <div className="form-group form-full-width">
              <label className="form-label" htmlFor="uniProfileName">
                University / Institution Name
              </label>
              <input
                id="uniProfileName"
                name="universityName"
                type="text"
                className="form-input"
                value={formData.universityName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Dean / Head Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="uniHeadName">
                Head of Department / Dean Name
              </label>
              <input
                id="uniHeadName"
                name="headName"
                type="text"
                className="form-input"
                value={formData.headName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Official Email (Read-only) */}
            <div className="form-group">
              <label className="form-label" htmlFor="uniHeadEmail">
                Official Head Email (System ID)
              </label>
              <input
                id="uniHeadEmail"
                name="headEmail"
                type="email"
                className="form-input"
                value={formData.headEmail}
                readOnly
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed', background: '#f1f5f9' }}
              />
              <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '3px', display: 'block' }}>
                Institutional authentication identifier cannot be modified directly.
              </small>
            </div>

            {/* Contact Number */}
            <div className="form-group">
              <label className="form-label" htmlFor="uniContact">
                Campus Contact Phone
              </label>
              <input
                id="uniContact"
                name="contactNumber"
                type="text"
                className="form-input"
                placeholder="e.g. 0912345678"
                value={formData.contactNumber}
                onChange={handleChange}
              />
            </div>

            {/* Campus Address */}
            <div className="form-group">
              <label className="form-label" htmlFor="uniAddress">
                Campus Location / Address
              </label>
              <input
                id="uniAddress"
                name="address"
                type="text"
                className="form-input"
                placeholder="e.g. Matara, Sri Lanka"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            {/* Status Info */}
            <div className="form-group form-full-width" style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0.85rem 1.1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span className="card-label-small" style={{ margin: 0 }}>Accreditation Standing:</span>
                <span className={`badge-status badge-${formData.status === 'approved' ? 'approved' : 'pending'}`}>
                  {formData.status.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Platform-wide institutional partnership verified.
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ minWidth: '170px' }}
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
