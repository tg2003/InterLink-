import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const scrollToSection = (id) => {
    if (isHomePage) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `/#${id}`;
    }
  };

  return (
    <footer className="footer-root">
      <div className="container footer-container">
        {/* Top Tier */}
        <div className="footer-top">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <div className="footer-logo">
              <div className="footer-logo-icon">
                <svg viewBox="0 0 100 100" fill="none" width="28" height="28">
                  <circle cx="38" cy="50" r="24" stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeDasharray="110 40" />
                  <circle cx="62" cy="50" r="24" stroke="#38bdf8" strokeWidth="9" strokeLinecap="round" strokeDasharray="110 40" transform="rotate(180 62 50)" />
                  <circle cx="50" cy="50" r="6" fill="#38bdf8" />
                </svg>
              </div>
              <span className="footer-brand-title">Interlink</span>
            </div>
            <p className="footer-tagline">
              Connecting Universities, Students & Employers on a unified internship ecosystem.
            </p>
          </div>

          {/* Quick Anchor Links */}
          <div className="footer-nav-col">
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" onClick={() => scrollToSection('home')} className="footer-anchor-btn">
                  Home
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection('about')} className="footer-anchor-btn">
                  About Interlink
                </button>
              </li>
              <li>
                <Link to="/login" className="footer-link">
                  Sign In Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Registration Links */}
          <div className="footer-nav-col">
            <h4 className="footer-heading">Portals</h4>
            <ul className="footer-links-list">
              <li>
                <Link to="/signup/university" className="footer-link">
                  University Registration
                </Link>
              </li>
              <li>
                <Link to="/signup/student" className="footer-link">
                  Student Registration
                </Link>
              </li>
              <li>
                <Link to="/signup/employer" className="footer-link">
                  Employer Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media Links (FB, Insta, X, WA as in wireframe) */}
          <div className="footer-social-col">
            <h4 className="footer-heading">Connect With Us</h4>
            <p className="footer-social-desc">Follow our network across official channels:</p>
            <div className="social-icons-group">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="social-icon-btn fb"
                aria-label="Facebook"
                title="Facebook"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="social-code">FB</span>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="social-icon-btn insta"
                aria-label="Instagram"
                title="Instagram"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="social-code">Insta</span>
              </a>

              {/* X / Twitter */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="social-icon-btn x"
                aria-label="X (Twitter)"
                title="X"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="social-code">X</span>
              </a>

              {/* WhatsApp */}
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noreferrer"
                className="social-icon-btn wa"
                aria-label="WhatsApp"
                title="WhatsApp"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.586 1.761.88 2.796.88 3.183 0 5.769-2.587 5.77-5.766.001-3.182-2.585-5.767-5.77-5.767zm7.391 5.766c-.002 4.075-3.317 7.39-7.392 7.39-1.282 0-2.482-.328-3.535-.907l-4.523 1.186 1.21-4.407c-.655-1.096-1.02-2.378-1.02-3.262.002-4.075 3.318-7.391 7.393-7.391 4.076 0 7.391 3.316 7.392 7.391z"/>
                </svg>
                <span className="social-code">WA</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Tier */}
        <div className="footer-bottom">
          <p className="copyright-text">
            &copy; {new Date().getFullYear()} Interlink University Internship Portal. All rights reserved.
          </p>
          <div className="footer-legal-links">
            <span className="legal-item">Privacy Policy</span>
            <span className="legal-dot">&bull;</span>
            <span className="legal-item">Terms of Governance</span>
            <span className="legal-dot">&bull;</span>
            <span className="legal-item">Academic Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
