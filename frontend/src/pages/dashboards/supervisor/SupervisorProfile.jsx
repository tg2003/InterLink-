import React, { useState } from 'react';
import supervisorService from '../../../services/supervisorService';

export default function SupervisorProfile({ supervisor, onProfileUpdated, showToast }) {
  const [formData, setFormData] = useState({
    fullName: supervisor?.fullName || '',
    department: supervisor?.department || '',
    staffRegNo: supervisor?.staffRegNo || '',
    contactNumber: supervisor?.contactNumber || '',
  });

  const [saving, setSaving] = useState(false);
  const universityObj = supervisor?.university && typeof supervisor.university === 'object' ? supervisor.university : null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.staffRegNo.trim()) {
      showToast('Full name and staff registration number are required.', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await supervisorService.updateProfile(formData);
      if (res.success) {
        showToast('Supervisor profile updated successfully!', 'success');
        if (onProfileUpdated) onProfileUpdated();
      } else {
        showToast(res.message || 'Failed to update profile.', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="supervisor-profile-view animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '22px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--blue-primary)' }}>
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          Academic Advisor Profile & Affiliation
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
          Manage your academic credentials, departmental standing, and view verified institutional connection details.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '24px' }}>
        {/* Profile Edit Form */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 18px' }}>
            Personal & Academic Information
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label">Full Name & Academic Title <span className="req-star">*</span></label>
              <input
                type="text"
                name="fullName"
                className="form-input"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                className="form-input"
                value={supervisor?.email || ''}
                disabled
                style={{ background: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
              />
              <span className="form-helper-text">
                Your login email address is anchored to your account credentials.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="form-label">Staff Reg. Number <span className="req-star">*</span></label>
                <input
                  type="text"
                  name="staffRegNo"
                  className="form-input"
                  value={formData.staffRegNo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="form-label">Contact Phone</label>
                <input
                  type="tel"
                  name="contactNumber"
                  className="form-input"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="e.g. 0771234567"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Academic Department / Faculty</label>
              <input
                type="text"
                name="department"
                className="form-input"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Faculty of Technology"
              />
            </div>

            <div style={{ marginTop: '10px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{ minWidth: '140px' }}
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Institutional Affiliation & Status Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>
              Institutional Affiliation (FR-16)
            </h3>

            {universityObj ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block' }}>University Name</span>
                  <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{universityObj.universityName}</strong>
                </div>

                <div>
                  <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Institutional Head</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{universityObj.headName}</span>
                </div>

                <div>
                  <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Head Official Email</span>
                  <span style={{ color: '#2563eb' }}>{universityObj.headEmail}</span>
                </div>

                {universityObj.contactNumber && (
                  <div>
                    <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Campus Contact</span>
                    <span style={{ color: '#1e293b' }}>{universityObj.contactNumber}</span>
                  </div>
                )}

                {universityObj.address && (
                  <div>
                    <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Institutional Address</span>
                    <span style={{ color: '#475569' }}>{universityObj.address}</span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                No university affiliation linked yet.
              </div>
            )}
          </div>

          {/* Academic Standing Status */}
          <div
            style={{
              background: supervisor?.joinStatus === 'approved' ? '#ecfdf5' : '#fffbeb',
              border: supervisor?.joinStatus === 'approved' ? '1px solid #a7f3d0' : '1px solid #fde68a',
              borderRadius: '12px',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: supervisor?.joinStatus === 'approved' ? '#10b981' : '#f59e0b',
                }}
              ></span>
              <strong style={{ color: supervisor?.joinStatus === 'approved' ? '#065f46' : '#92400e', textTransform: 'capitalize' }}>
                Join Status: {supervisor?.joinStatus || 'Pending'}
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.84rem', color: supervisor?.joinStatus === 'approved' ? '#047857' : '#b45309', lineHeight: 1.45 }}>
              {supervisor?.joinStatus === 'approved'
                ? 'Your faculty supervisor credentials are fully approved by your University Head. You have authorization to access enrolled student rosters and logbooks.'
                : 'Your join request is awaiting endorsement from the University Head. Student logbooks remain protected until verified.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
