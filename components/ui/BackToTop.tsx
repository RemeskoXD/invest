'use client';

import React, { useState, useEffect } from 'react';

export const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        width: '46px',
        height: '46px',
        borderRadius: '50%',
        background: '#012B12',
        border: '1.5px solid #C8A96E',
        color: '#C8A96E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 8px 24px rgba(1, 43, 18, 0.4), 0 0 0 1px rgba(200, 169, 110, 0.2)',
        zIndex: 1000,
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.background = '#04421C';
        e.currentTarget.style.borderColor = '#DFC090';
        e.currentTarget.style.color = '#fff';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.background = '#012B12';
        e.currentTarget.style.borderColor = '#C8A96E';
        e.currentTarget.style.color = '#C8A96E';
      }}
      aria-label="Přejít nahoru"
      title="Přejít nahoru"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
};