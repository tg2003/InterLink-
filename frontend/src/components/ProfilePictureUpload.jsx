import React, { useState, useRef } from 'react';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';

export default function ProfilePictureUpload({
  currentPicture,
  name = 'User',
  label = 'Profile Picture',
  subtitle = 'JPG, PNG, or WebP. Max size: 5 MB.',
  onPictureChanged,
  showToast = () => {},
  size = 96,
}) {
  const { updateUser } = useAuth();
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return str.slice(0, 2).toUpperCase();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WebP).', 'error');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size must be less than 5 MB.', 'error');
      e.target.value = '';
      return;
    }

    // Set preview immediately
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload directly to server
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('profilePictureFile', file);

      const res = await authService.uploadProfilePicture(fd);
      if (res.success) {
        showToast('Profile picture updated successfully!', 'success');
        updateUser({ profilePicture: res.profilePicture });
        if (onPictureChanged) onPictureChanged(res.profilePicture);
      } else {
        showToast(res.message || 'Failed to upload profile picture.', 'error');
        setPreview(null);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error uploading profile picture.';
      showToast(msg, 'error');
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;

    try {
      setUploading(true);
      const res = await authService.deleteProfilePicture();
      if (res.success) {
        showToast('Profile picture removed.', 'success');
        setPreview(null);
        updateUser({ profilePicture: '' });
        if (onPictureChanged) onPictureChanged('');
      } else {
        showToast(res.message || 'Failed to remove picture.', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error removing picture.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const activeImage = preview || currentPicture;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
      {/* Avatar Display */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, var(--blue-primary, #2563eb), var(--navy-main, #0f2b48))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: `${Math.round(size * 0.35)}px`,
          boxShadow: '0 4px 14px rgba(15, 43, 72, 0.12)',
          border: '3px solid #ffffff',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        {activeImage ? (
          <img
            src={activeImage}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          getInitials(name)
        )}

        {uploading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(15, 43, 72, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div className="loader loader-sm"></div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--navy-dark, #0a192f)' }}>
          {label}
        </span>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle, #64748b)' }}>
          {subtitle}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.25rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            disabled={uploading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.35rem 0.85rem' }}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            {activeImage ? 'Change Photo' : 'Upload Photo'}
          </button>

          {activeImage && (
            <button
              type="button"
              className="btn btn-sm"
              onClick={handleRemove}
              disabled={uploading}
              style={{
                background: 'transparent',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '0.82rem',
                padding: '0.35rem 0.85rem',
              }}
            >
              Remove
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
}
