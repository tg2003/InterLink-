import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HeroCarousel from '../components/HeroCarousel';
import RoleCardsSection from '../components/RoleCard';
import AboutSection from '../components/AboutSection';
import Footer from '../components/Footer';
import RoleSelectModal from '../components/RoleSelectModal';

export default function Home() {
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // If navigated with ?signup=true or #signup
    const params = new URLSearchParams(location.search);
    if (params.get('signup') === 'true') {
      setIsSignUpModalOpen(true);
    }

    // Smooth scroll if URL contains hash e.g. #about
    if (location.hash) {
      const sectionId = location.hash.replace('#', '');
      const el = document.getElementById(sectionId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }, [location]);

  return (
    <div className="home-page-layout">
      {/* Fixed Glassmorphism Navbar */}
      <Navbar onOpenSignUpModal={() => setIsSignUpModalOpen(true)} />

      {/* Main Home Sections */}
      <main>
        {/* Section 1: Hero Carousel with Register Now CTA */}
        <HeroCarousel onOpenSignUpModal={() => setIsSignUpModalOpen(true)} />

        {/* Section 2: 3 Role Cards with Hover/Tap Flip Animation and Direct Registration */}
        <RoleCardsSection />

        {/* Section 3: About Section ("Who Are We", What We Provide, Contact Phone Numbers) */}
        <AboutSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Role Selection Modal ("Who are you?") */}
      <RoleSelectModal
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
      />
    </div>
  );
}
