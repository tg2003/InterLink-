import React from 'react';
import './AboutSection.css';

export default function AboutSection() {
  const stats = [
    { value: '50+', label: 'Partner Universities', sub: 'Across national faculties' },
    { value: '15,000+', label: 'Enrolled Students', sub: 'Verified talent profiles' },
    { value: '1,200+', label: 'Registered Employers', sub: 'Actively recruiting' },
    { value: '98.6%', label: 'Placement Rate', sub: 'Streamlined approval cycle' },
  ];

  const pillars = [
    {
      title: 'For Universities & Academic Supervisors',
      badge: 'Academic Oversight',
      description: 'Centralize department-wide internship management. Assign academic supervisors, review verified employer contracts, audit weekly student logbooks, and issue accredited course grades effortlessly.',
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      ),
    },
    {
      title: 'For Students & Emerging Interns',
      badge: 'Career Acceleration',
      description: 'Build your verified digital portfolio, explore endorsed internship vacancies tailored to your field of study, log your real-world achievements, and receive timely supervisor feedback.',
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
    },
    {
      title: 'For Industry Employers & Recruiters',
      badge: 'Talent Acquisition',
      description: 'Connect directly with motivated undergraduates from leading universities. Post opportunities, screen applicants with verified university standing, and build an exceptional future leadership pipeline.',
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      ),
    },
  ];

  return (
    <section id="about" className="about-section">
      {/* Decorative Wave Divider */}
      <div className="about-wave-top">
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,32L60,42.7C120,53,240,75,360,74.7C480,75,600,53,720,48C840,43,960,53,1080,64C1200,75,1320,85,1380,90.7L1440,96L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z" fill="#ffffff" />
        </svg>
      </div>

      <div className="container about-container">
        {/* Section Header */}
        <div className="about-header">
          <span className="section-eyebrow">Who Are We</span>
          <h2 className="about-main-title">Bridging Academia & Industry with Intelligent Coordination</h2>
          <p className="about-lead">
            Interlink was founded to resolve the challenges of university internship management. We unify universities, students, and employers on a single platform to eliminate fragmented emails, streamline approvals, track progress in real-time, and guarantee verified job matching.
          </p>
        </div>

        {/* Stats / Trust Indicators */}
        <div className="about-stats-grid">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-card">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
              <span className="stat-sub">{stat.sub}</span>
            </div>
          ))}
        </div>

        {/* Pillars: What We Provide & Who It Is For */}
        <div className="pillars-container">
          <div className="pillars-header">
            <h3 className="pillars-title">What We Provide For Every Stakeholder</h3>
            <p className="pillars-sub">A synchronized experience designed around the distinct needs of faculties, interns, and recruitment teams.</p>
          </div>

          <div className="pillars-grid">
            {pillars.map((pillar, i) => (
              <div key={i} className="pillar-card">
                <div className="pillar-icon-box">
                  {pillar.icon}
                </div>
                <span className="pillar-badge">{pillar.badge}</span>
                <h4 className="pillar-name">{pillar.title}</h4>
                <p className="pillar-desc">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Primary Contact Method (Integrated in About Section as specified) */}
        <div className="about-contact-panel">
          <div className="contact-panel-content">
            <div className="contact-panel-text">
              <span className="contact-eyebrow">Direct Contact & Support</span>
              <h3 className="contact-title">Have Questions or Need Assistance?</h3>
              <p className="contact-desc">
                Our support team is available during campus hours to assist universities with system integration, help students with verification, and guide employer partnerships.
              </p>
            </div>

            <div className="contact-channels-box">
              <div className="channel-item">
                <div className="channel-icon-circle">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div className="channel-info">
                  <span className="channel-label">Campus Helpdesk Hotline (Call 1)</span>
                  <a href="tel:+94112345678" className="channel-value">+94 11 234 5678</a>
                </div>
              </div>

              <div className="channel-item">
                <div className="channel-icon-circle">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                    <line x1="12" y1="18" x2="12.01" y2="18"/>
                  </svg>
                </div>
                <div className="channel-info">
                  <span className="channel-label">Student & Partner Support (Call 2)</span>
                  <a href="tel:+94779876543" className="channel-value">+94 77 987 6543</a>
                </div>
              </div>

              <div className="channel-item">
                <div className="channel-icon-circle">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div className="channel-info">
                  <span className="channel-label">Official Correspondence</span>
                  <a href="mailto:support@interlink.edu" className="channel-value">support@interlink.edu</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
