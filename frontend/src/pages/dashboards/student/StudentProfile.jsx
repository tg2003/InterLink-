import React, { useState, useEffect, useRef } from 'react';
import studentService from '../../../services/studentService';

// ── Helpers ────────────────────────────────────────────────────────────────

/** Returns true when cvUrl is a server-uploaded PDF (not an external link). */
const isServerCv = (url) => typeof url === 'string' && url.startsWith('/uploads/cv/');

/** Extracts a human-readable filename from a /uploads/cv/… path. */
const cvDisplayName = (url) => {
  if (!url) return '';
  // Strip the path prefix; result: "cv-<id>-<ts>.pdf"
  const base = url.split('/').pop();
  // Compact display: drop the internal id/timestamp portion → "cv.pdf"
  return base.replace(/^cv-[^-]+-\d+\.pdf$/, 'cv.pdf') || base;
};

// ──────────────────────────────────────────────────────────────────────────

export default function StudentProfile({ showToast }) {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Text-field form state (cv is now a file, not a text field)
  const [form, setForm] = useState({
    fullName: '',
    contactNumber: '',
    bio: '',
    password: '',
  });

  // CV-specific state
  const [cvFile, setCvFile] = useState(null);       // File object chosen by user
  const [clearCv, setClearCv] = useState(false);    // Whether user clicked "Remove CV"
  const fileInputRef = useRef(null);

  // ── Data loading ─────────────────────────────────────────────────────────

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await studentService.getMyProfile();
      if (data.success) {
        setProfile(data.student);
        setForm({
          fullName: data.student.fullName || '',
          contactNumber: data.student.contactNumber || '',
          bio: data.student.bio || '',
          password: '',
        });
      }
    } catch {
      showToast('Failed to load profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side validation (Multer will enforce server-side too)
    if (file.type !== 'application/pdf') {
      showToast('Only PDF files are accepted for CV uploads.', 'error');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('CV file must be smaller than 5 MB.', 'error');
      e.target.value = '';
      return;
    }

    setCvFile(file);
    setClearCv(false); // A new file cancels any pending "remove" action
  };

  const handleRemoveCv = () => {
    setClearCv(true);
    setCvFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setCvFile(null);
    setClearCv(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setForm({
      fullName: profile?.fullName || '',
      contactNumber: profile?.contactNumber || '',
      bio: profile?.bio || '',
      password: '',
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.fullName.trim()) {
      showToast('Full name cannot be empty.', 'error');
      return;
    }

    setSaving(true);
    try {
      // Build FormData — multer on the backend expects multipart/form-data
      const fd = new FormData();
      fd.append('fullName', form.fullName.trim());
      fd.append('contactNumber', form.contactNumber.trim());
      fd.append('bio', form.bio.trim());
      if (form.password.trim()) fd.append('password', form.password.trim());

      // CV: send the file OR a clearCv flag OR nothing (keep existing)
      if (cvFile) {
        fd.append('cvFile', cvFile);           // Field name matches upload.js
      } else if (clearCv) {
        fd.append('clearCv', 'true');
      }

      const data = await studentService.updateMyProfile(fd);
      if (data.success) {
        setProfile(data.student);
        setEditing(false);
        setCvFile(null);
        setClearCv(false);
        setForm((prev) => ({ ...prev, password: '' }));
        showToast('Profile updated successfully!');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to update profile.';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        Loading profile…
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in">

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-dark)', marginBottom: '0.2rem' }}>
            My Student Profile
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
            Manage your personal information and upload your CV (PDF)
          </p>
        </div>
        {!editing && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setEditing(true)}
            id="student-edit-profile-btn"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Profile
          </button>
        )}
      </div>

      {/* ── Identity banner ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--navy-main) 0%, #1e40af 100%)',
          borderRadius: '20px',
          padding: '2rem',
          color: '#fff',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', fontWeight: 800, flexShrink: 0,
          }}
        >
          {(profile?.fullName || 'S').charAt(0).toUpperCase()}
        </div>

        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.3rem' }}>{profile?.fullName}</div>
          <div style={{ color: '#93c5fd', fontSize: '0.9rem', marginBottom: '0.4rem' }}>{profile?.email}</div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '9999px', padding: '0.2rem 0.7rem', fontSize: '0.78rem', fontWeight: 700 }}>
              {profile?.mainCategory}
            </span>
            <span style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#a7f3d0', borderRadius: '9999px', padding: '0.2rem 0.7rem', fontSize: '0.78rem', fontWeight: 700 }}>
              ✓ Active
            </span>
          </div>
        </div>

        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: '0.78rem', color: '#93c5fd', marginBottom: '0.2rem' }}>University</div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            {profile?.university?.universityName || '—'}
          </div>
        </div>
      </div>

      {/* ── View mode ── */}
      {!editing ? (
        <div style={{ background: '#fff', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-dark)', marginBottom: '1.25rem' }}>
            Profile Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {[
              { label: 'Full Name',       value: profile?.fullName },
              { label: 'Email Address',   value: profile?.email },
              { label: 'Contact Number',  value: profile?.contactNumber || '—' },
              { label: 'Main Category',   value: profile?.mainCategory },
              { label: 'University',      value: profile?.university?.universityName || '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  {label}
                </div>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Bio */}
          <div style={{ marginTop: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              Bio / About
            </div>
            <div style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {profile?.bio || 'No bio provided.'}
            </div>
          </div>

          {/* CV – view */}
          <div style={{ marginTop: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              CV / Resume
            </div>

            {profile?.cvUrl ? (
              <a
                href={profile.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={isServerCv(profile.cvUrl) ? cvDisplayName(profile.cvUrl) : undefined}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--blue-primary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'underline', textUnderlineOffset: '3px' }}
              >
                {/* PDF icon */}
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
                {isServerCv(profile.cvUrl) ? cvDisplayName(profile.cvUrl) : 'View CV'}
                {/* Download arrow for server files */}
                {isServerCv(profile.cvUrl) && (
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.7 }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                )}
              </a>
            ) : (
              <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic' }}>
                No CV uploaded yet. Click "Edit Profile" to upload a PDF.
              </span>
            )}
          </div>
        </div>

      ) : (
        /* ── Edit form ── */
        <form
          onSubmit={handleSave}
          encType="multipart/form-data"
          style={{ background: '#fff', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-dark)', marginBottom: '1.4rem' }}>
            Edit Profile
          </h3>

          {/* Text fields grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.2rem' }}>

            {/* Full Name */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="sp-fullName">
                Full Name <span className="required">*</span>
              </label>
              <input
                id="sp-fullName"
                name="fullName"
                className="form-input"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />
            </div>

            {/* Email (read-only) */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                value={profile?.email}
                disabled
                style={{ background: '#f8fafc', color: 'var(--text-subtle)', cursor: 'not-allowed' }}
              />
              <small style={{ color: 'var(--text-subtle)', fontSize: '0.78rem' }}>Email cannot be changed.</small>
            </div>

            {/* Contact */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="sp-contact">Contact Number</label>
              <input
                id="sp-contact"
                name="contactNumber"
                className="form-input"
                value={form.contactNumber}
                onChange={handleChange}
                placeholder="e.g. 077 123 4567"
              />
            </div>

            {/* Password */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="sp-password">New Password</label>
              <input
                id="sp-password"
                name="password"
                className="form-input"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current password"
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="form-group" style={{ marginTop: '1.2rem', marginBottom: 0 }}>
            <label className="form-label" htmlFor="sp-bio">Bio / About</label>
            <textarea
              id="sp-bio"
              name="bio"
              className="form-textarea"
              value={form.bio}
              onChange={handleChange}
              placeholder="Brief description about yourself, your skills, and goals…"
              rows={4}
            />
          </div>

          {/* ── CV / Resume upload field ── */}
          <div
            style={{
              marginTop: '1.4rem',
              background: 'var(--bg-alt)',
              border: '1.5px dashed var(--border-light)',
              borderRadius: '12px',
              padding: '1.25rem 1.4rem',
            }}
          >
            <label className="form-label" style={{ marginBottom: '0.65rem', display: 'block' }}>
              CV / Resume
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-subtle)', marginLeft: '0.5rem' }}>
                (PDF only, max 5 MB)
              </span>
            </label>

            {/* Current CV status */}
            {profile?.cvUrl && !clearCv && !cvFile && (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  background: '#ecfdf5', border: '1px solid #a7f3d0',
                  borderRadius: '8px', padding: '0.5rem 0.85rem',
                  marginBottom: '0.85rem',
                }}
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#047857" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span style={{ fontSize: '0.85rem', color: '#047857', fontWeight: 600, flex: 1 }}>
                  Current CV: {isServerCv(profile.cvUrl) ? cvDisplayName(profile.cvUrl) : 'Linked CV'}
                </span>
                <button
                  type="button"
                  onClick={handleRemoveCv}
                  title="Remove current CV"
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: '#b91c1c', fontSize: '0.78rem', fontWeight: 700, padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                  }}
                >
                  ✕ Remove
                </button>
              </div>
            )}

            {/* "Will be removed" notice */}
            {clearCv && !cvFile && (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  background: '#fef2f2', border: '1px solid #fecaca',
                  borderRadius: '8px', padding: '0.5rem 0.85rem', marginBottom: '0.85rem',
                }}
              >
                <span style={{ fontSize: '0.85rem', color: '#b91c1c', fontWeight: 600, flex: 1 }}>
                  ✕ CV will be removed on save
                </span>
                <button
                  type="button"
                  onClick={() => setClearCv(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.78rem', fontWeight: 700 }}
                >
                  Undo
                </button>
              </div>
            )}

            {/* Selected file preview */}
            {cvFile && (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  background: '#eff6ff', border: '1px solid #bfdbfe',
                  borderRadius: '8px', padding: '0.5rem 0.85rem', marginBottom: '0.85rem',
                }}
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#1d4ed8" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span style={{ fontSize: '0.85rem', color: '#1d4ed8', fontWeight: 600, flex: 1 }}>
                  {cvFile.name}
                  <span style={{ fontWeight: 400, color: 'var(--text-subtle)', marginLeft: '0.5rem' }}>
                    ({(cvFile.size / 1024).toFixed(0)} KB)
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => { setCvFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.78rem', fontWeight: 700 }}
                >
                  ✕
                </button>
              </div>
            )}

            {/* File input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <label
                htmlFor="sp-cvFile"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  cursor: 'pointer', background: '#ffffff',
                  border: '1.5px solid var(--border-light)', borderRadius: '9px',
                  padding: '0.55rem 1rem', fontSize: '0.85rem', fontWeight: 600,
                  color: 'var(--navy-dark)', transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--blue-primary)'; e.currentTarget.style.color = 'var(--blue-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--navy-dark)'; }}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {cvFile ? 'Change PDF' : (profile?.cvUrl && !clearCv ? 'Replace PDF' : 'Upload PDF')}
              </label>
              <input
                id="sp-cvFile"
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                Accepted: .pdf · Max size: 5 MB
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={saving}
              id="student-save-profile-btn"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
