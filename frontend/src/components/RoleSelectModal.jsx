import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RoleSelectModal.css';

export default function RoleSelectModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const roles = [
    {
      id: 'university',
      title: 'University',
      badge: 'Academic Institution',
      description: 'Register your university to coordinate faculties, assign supervisors, and monitor student internship placements.',
      route: '/signup/university',
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      ),
    },
    {
      id: 'student',
      title: 'Intern (Student)',
      badge: 'Undergraduate Talent',
      description: 'Create your student profile, discover verified corporate internships, submit progress logs, and earn academic credits.',
      route: '/signup/student',
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
    {
      id: 'supervisor',
      title: 'Academic Supervisor',
      badge: 'Faculty Advisor',
      description: 'Register as faculty staff to monitor your university students, track weekly progress logs, and collaborate with your University Head.',
      route: '/signup/supervisor',
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      id: 'employer',
      title: 'Employer',
      badge: 'Industry Partner',
      description: 'Post internship vacancies, review university-endorsed student applicants, and hire emerging industry talent.',
      route: '/signup/employer',
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      ),
    },
  ];

  const handleSelect = (route) => {
    onClose();
    navigate(route);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          &times;
        </button>

        <div className="modal-header">
          <span className="modal-eyebrow">Get Started with Interlink</span>
          <h2 className="modal-title">Who are you?</h2>
          <p className="modal-subtitle">
            Select your account type to continue to the dedicated registration portal.
          </p>
        </div>

        <div className="role-options-list">
          {roles.map((role) => (
            <button
              key={role.id}
              className="role-option-card"
              onClick={() => handleSelect(role.route)}
            >
              <div className="role-option-icon-wrapper">
                {role.icon}
              </div>
              <div className="role-option-content">
                <div className="role-option-header">
                  <span className="role-option-title">{role.title}</span>
                  <span className="role-option-badge">{role.badge}</span>
                </div>
                <p className="role-option-desc">{role.description}</p>
              </div>
              <div className="role-option-arrow">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        <div className="modal-footer">
          <span>Already registered with Interlink?</span>
          <button className="modal-login-link" onClick={() => { onClose(); navigate('/login'); }}>
            Sign In here
          </button>
        </div>
      </div>
    </div>
  );
}
