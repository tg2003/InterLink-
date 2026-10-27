import React, { useState, useEffect, useRef } from 'react';
import './HeroCarousel.css';

const slides = [
  {
    id: 1,
    image: '/images/carousel/slide1.jpg',
    tag: 'Next-Gen Internship Coordination',
    heading: 'Connecting Universities, Students & Employers',
    description: 'Interlink unites academic institutions, undergraduate talent, and corporate recruiters on a single intelligent platform for seamless internship governance.',
    cta: 'Register Now',
  },
  {
    id: 2,
    image: '/images/carousel/slide2.jpg',
    tag: 'Empowering Student Careers',
    heading: 'Launch Your Career with Industry Leaders',
    description: 'Showcase your verified university credentials, apply to top-tier internship openings, and track your logbook progress with real-time academic supervisor feedback.',
    cta: 'Get Started as Student',
  },
  {
    id: 3,
    image: '/images/carousel/slide3.jpg',
    tag: 'Enterprise & Academic Synergy',
    heading: 'Bridge Academia and Industry Effortlessly',
    description: 'Universities oversee faculty supervisor workflows while forward-thinking enterprises discover pre-screened candidates matched to real industry projects.',
    cta: 'Join Partner Network',
  },
];

export default function HeroCarousel({ onOpenSignUpModal }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Auto-advance slides every 5.5s
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
      }, 5500);
    }
    return () => clearInterval(timerRef.current);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleScrollToAbout = () => {
    const el = document.getElementById('about');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="hero-carousel-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Interlink Featured Carousel"
    >
      {/* Slides Container */}
      <div className="carousel-track">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id}
              className={`carousel-slide ${isActive ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              {/* Dark Overlay (20-30% opacity as requested) */}
              <div className="carousel-dark-overlay"></div>

              {/* Decorative Subtle Blue Gradient Vignette */}
              <div className="carousel-gradient-overlay"></div>

              {/* Overlaid Hero Content */}
              <div className="container carousel-content-container">
                <div className="carousel-text-box">
                  <span className="hero-tag-badge">
                    <span className="pulse-dot"></span>
                    {slide.tag}
                  </span>
                  <h1 className="hero-heading">{slide.heading}</h1>
                  <p className="hero-description">{slide.description}</p>

                  <div className="hero-cta-group">
                    <button
                      type="button"
                      className="btn btn-primary btn-lg hero-cta-btn"
                      onClick={onOpenSignUpModal}
                    >
                      <span>Register Now</span>
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-white btn-lg"
                      onClick={handleScrollToAbout}
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Navigation Controls (Prev / Next Arrows) */}
      <button
        className="carousel-control prev"
        onClick={handlePrev}
        aria-label="Previous Slide"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <button
        className="carousel-control next"
        onClick={handleNext}
        aria-label="Next Slide"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      {/* Carousel Navigation Dots */}
      <div className="carousel-indicators">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
