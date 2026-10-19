import React, { useState, useEffect } from 'react';
import supervisorService from '../../../services/supervisorService';
import authService from '../../../services/authService';

export default function SupervisorJoinStatusCard({
  supervisor,
  onStatusUpdated,
  showToast,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [loadingUnis, setLoadingUnis] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    universityId: supervisor?.university?._id || supervisor?.university || '',
    staffRegNo: supervisor?.staffRegNo || '',
    department: supervisor?.department || '',
    contactNumber: supervisor?.contactNumber || '',
  });

  const joinStatus = supervisor?.joinStatus || 'draft';
  const universityObj = supervisor?.university && typeof supervisor.university === 'object' ? supervisor.university : null;

  useEffect(() => {
    if (isEditing || joinStatus === 'draft') {
      const loadUnis = async () => {
        try {
          setLoadingUnis(true);
          const res = await authService.getApprovedUniversities();
          if (res.success && res.universities) {
            setUniversities(res.universities);
          }
        } catch (err) {
          console.error('Failed to load universities:', err);
        } finally {
          setLoadingUnis(false);
        }
      };
      loadUnis();
    }
  }, [isEditing, joinStatus]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!formData.universityId) {
      showToast('Please select your affiliated university institution.', 'error');
      return;
    }
    if (!formData.staffRegNo.trim()) {
      showToast('Staff registration number is required for verification.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await supervisorService.sendJoinRequest(formData);
      if (res.success) {
        showToast('Join request submitted to University Head successfully!', 'success');
        setIsEditing(false);
        if (onStatusUpdated) onStatusUpdated();
      } else {
        showToast(res.message || 'Failed to submit join request.', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error submitting join request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // If already approved, do not show this blocker card
  if (joinStatus === 'approved') return null;

  return (
    <div
      className="dashboard-status-card animate-fade-in"
      style={{
        background: '#ffffff',
        border: joinStatus === 'pending'
          ? '1.5px solid #fef08a'
          : joinStatus === 'rejected'
          ? '1.5px solid #fecaca'
          : '1.5px solid #bfdbfe',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', maxWidth: '780px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background: joinStatus === 'pending'
                ? '#fef9c3'
                : joinStatus === 'rejected'
                ? '#fee2e2'
                : '#dbeafe',
              color: joinStatus === 'pending'
                ? '#ca8a04'
                : joinStatus === 'rejected'
                ? '#dc2626'
                : '#2563eb',
            }}
          >
            {joinStatus === 'pending' ? (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            ) : joinStatus === 'rejected' ? (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {joinStatus === 'pending' && 'Join Request Pending University Head Approval'}
                {joinStatus === 'rejected' && 'Supervisor Join Request Declined'}
                {joinStatus === 'draft' && 'Affiliation Pending: Join Request Not Sent'}
              </h3>
              <span
                style={{
                  padding: '3px 9px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  background: joinStatus === 'pending'
                    ? '#fef08a'
                    : joinStatus === 'rejected'
                    ? '#fee2e2'
                    : '#e0e7ff',
                  color: joinStatus === 'pending'
                    ? '#854d0e'
                    : joinStatus === 'rejected'
                    ? '#991b1b'
                    : '#3730a3',
                }}
              >
                {joinStatus}
              </span>
            </div>

            <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.5, margin: '0 0 10px' }}>
              {joinStatus === 'pending' && (
                <>
                  Your request has been submitted to <strong>{universityObj?.universityName || 'your University Head'}</strong>.
                  University-level intern rosters and progress logs will unlock as soon as your staff registration number (<strong>{supervisor?.staffRegNo}</strong>) is approved by the Head.
                </>
              )}
              {joinStatus === 'rejected' && (
                <>
                  Your supervisor join request was declined by the University Head.
                  {supervisor?.reviewNotes ? (
                    <span style={{ display: 'block', marginTop: '6px', padding: '8px 12px', background: '#fef2f2', borderLeft: '3px solid #ef4444', color: '#991b1b', borderRadius: '4px' }}>
                      <strong>Head Review Notes:</strong> {supervisor.reviewNotes}
                    </span>
                  ) : null}
                  You may correct your staff registration details and resubmit the request.
                </>
              )}
              {joinStatus === 'draft' && (
                <>
                  You registered without sending an automatic join request (US-02). Select your university institution and click
                  <strong> "Submit Join Request to Head"</strong> below to begin the verification workflow.
                </>
              )}
            </p>

            {universityObj && joinStatus === 'pending' && (
              <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span>Institutional Head: <strong>{universityObj.headName}</strong></span>
                <span>Contact Email: <strong>{universityObj.headEmail}</strong></span>
                {universityObj.contactNumber && <span>Phone: <strong>{universityObj.contactNumber}</strong></span>}
              </div>
            )}
          </div>
        </div>

        <div>
          {joinStatus !== 'pending' && !isEditing && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsEditing(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              <span>{joinStatus === 'rejected' ? 'Update & Resubmit Request' : 'Submit Join Request'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Editing Form for draft or rejected status */}
      {isEditing && (
        <form
          onSubmit={handleSendRequest}
          style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #e2e8f0',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          <div>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>
              University Institution <span className="req-star">*</span>
            </label>
            {loadingUnis ? (
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Loading institutions...</div>
            ) : (
              <select
                name="universityId"
                className="form-select"
                value={formData.universityId}
                onChange={handleChange}
                required
              >
                <option value="">Select University</option>
                {universities.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.universityName}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>
              Staff Registration Number <span className="req-star">*</span>
            </label>
            <input
              type="text"
              name="staffRegNo"
              className="form-input"
              value={formData.staffRegNo}
              onChange={handleChange}
              placeholder="e.g. STF-2024-019"
              required
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>
              Department / Faculty
            </label>
            <input
              type="text"
              name="department"
              className="form-input"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g. Faculty of Technology"
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>
              Phone Number
            </label>
            <input
              type="tel"
              name="contactNumber"
              className="form-input"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="e.g. 0771234567"
            />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsEditing(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={submitting}
            >
              {submitting ? 'Submitting Request...' : 'Send Request to University Head'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
