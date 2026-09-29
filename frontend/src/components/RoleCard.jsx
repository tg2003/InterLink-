import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RoleCard.css';

const roleCardsData = [
  {
    id: 'university',
    number: '1',
    title: 'Register as a University',
    shortName: 'University Portal',
    image: '/images/roles/university.jpg',
    tagline: 'Academic Institution Governance',
    route: '/signup/university',
    frontHighlight: 'Coordinate faculties, supervise student progress & approve academic credits.',
    backSummary: {
      headline: 'What Universities Gain with Interlink',
      benefits: [
        'Centralized faculty supervisor & student assignment tools',
        'Real-time student internship progress logbook auditing',
        'Direct institutional communication with accredited employers',
        'Automated academic credit validation & compliance reports',
      ],
      ctaText: 'Register University',
    },
  },
  {
    id: 'student',
    number: '2',
    title: 'Register as an Intern',
    shortName: 'Student Portal',
    image: '/images/roles/student.jpg',
    tagline: 'Undergraduate Career Launchpad',
    route: '/signup/student',
    frontHighlight: 'Showcase your skills, find verified internships & log daily learning milestones.',
    backSummary: {
      headline: 'What Students Gain with Interlink',
      benefits: [
        'Curated internship opportunities matching your study category',
        'Digital skill portfolio endorsed by your verified university',
        'Streamlined weekly progress log submissions to academic advisors',
        'Direct messaging with hiring managers and corporate mentors',
      ],
      ctaText: 'Register as Intern',
    },
  },
  {
    id: 'employer',
    number: '3',
    title: 'Register as an Employer',
    shortName: 'Employer Portal',
    image: '/images/roles/employer.jpg',
    tagline: 'Enterprise Talent Discovery',
    route: '/signup/employer',
    frontHighlight: 'Recruit top university talent, manage internship postings & evaluate candidates.',
    backSummary: {
      headline: 'What Employers Gain with Interlink',
      benefits: [
        'Access to pre-screened talent from accredited universities',
        'Post targeted internship vacancies by skill categories',
        'Collaborative candidate evaluation with faculty supervisors',
        'Pipeline for converting top interns into full-time employees',
      ],
      ctaText: 'Register Employer',
    },
  },
];

export default function RoleCardsSection() {
  const [flippedCards, setFlippedCards] = useState({});
  const navigate = useNavigate();

  // Toggle card flip on mobile/touch tap
  const handleCardClick = (id) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleRegisterClick = (e, route) => {
    e.stopPropagation();
    navigate(route);
  };

  return (
    <section className="role-cards-section" aria-label="Portal Registration Options">
      {/* Decorative Wave Background Graphic */}
      <div className="curved-bg-wave-accent">
        <svg viewBox="0 0 1440 260" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,64L80,80C160,96,320,128,480,122.7C640,117,800,75,960,69.3C1120,64,1280,96,1360,112L1440,128L1440,260L1360,260C1280,260,1120,260,960,260C800,260,640,260,480,260C320,260,160,260,80,260L0,260Z" fill="#eff6ff" fillOpacity="0.8" />
        </svg>
      </div>

      <div className="container role-cards-container">
        <div className="role-cards-header">
          <span className="section-eyebrow">Choose Your Gateway</span>
          <h2 className="section-title">Built for Everyone in the Internship Ecosystem</h2>
          <p className="section-subtitle">
            Whether you represent a higher education institution, are a motivated student, or represent an industry employer, Interlink gives you dedicated tools.
          </p>
          <div className="interaction-hint">
            <span className="hint-icon">💡</span>
            <span>Hover on desktop or tap on mobile to explore role benefits</span>
          </div>
        </div>

        {/* 3 Role Cards Grid */}
        <div className="role-cards-grid">
          {roleCardsData.map((card) => {
            const isFlipped = Boolean(flippedCards[card.id]);

            return (
              <div key={card.id} className="role-card-column">
                {/* 3D Flip Container */}
                <div
                  className={`role-flip-card ${isFlipped ? 'is-flipped' : ''}`}
                  onClick={() => handleCardClick(card.id)}
                  tabIndex="0"
                  role="button"
                  aria-label={`${card.title}. Click to view details and register.`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCardClick(card.id);
                    }
                  }}
                >
                  <div className="flip-card-inner">
                    {/* Front Face */}
                    <div className="flip-card-front">
                      <div className="card-number-badge">{card.number}</div>

                      <div className="card-image-box">
                        <img
                          src={card.image}
                          alt={card.title}
                          className="card-feature-img"
                          loading="lazy"
                        />
                        <div className="card-image-overlay">
                          <span className="card-tagline">{card.tagline}</span>
                        </div>
                      </div>

                      <div className="card-front-body">
                        <h3 className="card-title">{card.title}</h3>
                        <p className="card-highlight">{card.frontHighlight}</p>

                        <div className="flip-prompt">
                          <span>View Role Benefits</span>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Back Face (Revealed on hover/tap) */}
                    <div className="flip-card-back">
                      <div className="card-back-header">
                        <div className="card-back-badge">{card.number}</div>
                        <h3 className="card-back-title">{card.shortName}</h3>
                      </div>

                      <div className="card-back-content">
                        <h4 className="benefits-headline">{card.backSummary.headline}</h4>
                        <ul className="benefits-list">
                          {card.backSummary.benefits.map((benefit, i) => (
                            <li key={i} className="benefit-item">
                              <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="card-back-action">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm back-register-btn"
                          onClick={(e) => handleRegisterClick(e, card.route)}
                        >
                          <span>{card.backSummary.ctaText}</span>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Registration Button below the card (As sketched in wireframe) */}
                <div className="role-direct-action">
                  <button
                    type="button"
                    className="btn btn-secondary direct-register-btn"
                    onClick={(e) => handleRegisterClick(e, card.route)}
                  >
                    <span>Register</span>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
