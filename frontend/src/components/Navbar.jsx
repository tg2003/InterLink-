import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar({ onOpenSignUpModal }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logoutUser, getDashboardPath } = useAuth();

  const isHomePage = location.pathname === '/';

  // Handle scroll events: background opacity and scrollspy
  useEffect(() => {
    const handleScroll = () => {
      // Toggle navbar opacity when scrolled past 40px
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Scrollspy active section detection on home page
      if (isHomePage) {
        const homeSection = document.getElementById('home');
        const aboutSection = document.getElementById('about');

        const scrollPos = window.scrollY + 120;

        if (aboutSection && scrollPos >= aboutSection.offsetTop) {
          setActiveSection('about');
        } else if (homeSection) {
          setActiveSection('home');
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  // Smooth scroll handler for anchor links
  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (isHomePage) {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        setActiveSection(sectionId);
      }
    } else {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleSignUpClick = () => {
    setMobileMenuOpen(false);
    if (onOpenSignUpModal) {
      onOpenSignUpModal();
    } else {
      navigate('/?signup=true');
    }
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logoutUser();
    navigate('/');
  };

  return (
    <header className={`navbar-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" onClick={() => handleNavClick('home')}>
          <div className="brand-logo-icon">
            <svg viewBox="0 0 100 100" fill="none" width="32" height="32">
              <circle cx="38" cy="50" r="24" stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeDasharray="110 40" />
              <circle cx="62" cy="50" r="24" stroke="#38bdf8" strokeWidth="9" strokeLinecap="round" strokeDasharray="110 40" transform="rotate(180 62 50)" />
              <circle cx="50" cy="50" r="6" fill="#38bdf8" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-title">Interlink</span>
            <span className="brand-subtitle">Internship Portal</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="navbar-nav">
          <button
            type="button"
            className={`nav-link-btn ${activeSection === 'home' && isHomePage ? 'active' : ''}`}
            onClick={() => handleNavClick('home')}
          >
            Home
          </button>
          <button
            type="button"
            className={`nav-link-btn ${activeSection === 'about' && isHomePage ? 'active' : ''}`}
            onClick={() => handleNavClick('about')}
          >
            About
          </button>
        </nav>

        {/* Action Buttons (Sign Up / Login / Dashboard) */}
        <div className="navbar-actions">
          {isAuthenticated && user ? (
            <div className="user-nav-group">
              <Link to={getDashboardPath(user.role)} className="btn btn-primary btn-sm">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm nav-login-btn">
                Login
              </Link>
              <button
                type="button"
                className="btn btn-primary btn-sm nav-signup-btn"
                onClick={handleSignUpClick}
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className={`hamburger-btn ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${mobileMenuOpen ? 'active' : ''}`}>
        <nav className="mobile-nav">
          <button
            type="button"
            className={`mobile-nav-link ${activeSection === 'home' && isHomePage ? 'active' : ''}`}
            onClick={() => handleNavClick('home')}
          >
            Home
          </button>
          <button
            type="button"
            className={`mobile-nav-link ${activeSection === 'about' && isHomePage ? 'active' : ''}`}
            onClick={() => handleNavClick('about')}
          >
            About
          </button>

          <div className="mobile-actions">
            {isAuthenticated && user ? (
              <>
                <Link
                  to={getDashboardPath(user.role)}
                  className="btn btn-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Dashboard ({user.role})
                </Link>
                <button onClick={handleLogout} className="btn btn-secondary">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSignUpClick}
                >
                  Sign Up
                </button>
                <Link
                  to="/login"
                  className="btn btn-secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
