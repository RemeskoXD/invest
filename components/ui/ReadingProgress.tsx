'use client';

import React, { useEffect, useState } from 'react';

export const ReadingProgress: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      const current = window.scrollY;
      const p = Math.min(100, Math.max(0, (current / totalHeight) * 100));
      setProgress(p);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: `${progress}%`,
        height: '3px',
        background: 'linear-gradient(90deg, #C8A96E 0%, #DFC090 50%, #FAF0D7 100%)',
        boxShadow: '0 0 10px rgba(200, 169, 110, 0.7)',
        zIndex: 99999,
        transition: 'width 0.1s ease-out',
        pointerEvents: 'none',
      }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Průběh čtení stránky"
    />
  );
};