'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Dictionary } from '@/lib/translations';

interface Props {
  t: Dictionary;
  onOpenModal: () => void;
}

export const Hero: React.FC<Props> = ({ t, onOpenModal }) => {
  const [counter, setCounter] = useState(287);
  const badgeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = badgeRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (prefersReduced) {
            setCounter(287);
            return;
          }
          const startTs = performance.now();
          const duration = 2000;
          const end = 287;
          const step = (now: number) => {
            const elapsed = now - startTs;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.round(end * (1 - Math.pow(1 - progress, 3)));
            setCounter(current);
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="hero" id="hero" aria-label="Úvodní sekce G3NE5IS">
      <div className="hero__gold-line" />
      <div className="hero__inner container">
        {/* Content left */}
        <div className="hero__content">
          <div className="hero__eyebrow">
            <span className="hero__eyebrow-line" />
            <span>{t.hero_eyebrow}</span>
          </div>

          <h1
            className="hero__title"
            dangerouslySetInnerHTML={{ __html: t.hero_title }}
          />

          <p
            className="hero__sub"
            dangerouslySetInnerHTML={{ __html: t.hero_sub }}
          />

          <div className="hero__actions">
            <button
              type="button"
              className="btn btn--gold btn--lg"
              id="hero-invest-btn"
              onClick={onOpenModal}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 20, height: 20 }}>
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span>{t.hero_btn_invest}</span>
            </button>
            <a href="#kalkulator" className="btn btn--outline btn--lg" id="hero-calc-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 20, height: 20 }}>
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="8" y1="10" x2="16" y2="10" />
                <line x1="8" y1="14" x2="14" y2="14" />
              </svg>
              <span>{t.hero_btn_calc}</span>
            </a>
            <a href="#o-nas" className="btn btn--ghost btn--lg" id="hero-about-btn">
              {t.hero_btn_about}
            </a>
          </div>

          <div className="hero__stats">
            <div className="hero__stat">
              <div className="hero__stat-num">4,5 %</div>
              <div className="hero__stat-label">{t.hero_stat1_lbl}</div>
            </div>
            <div className="hero__stat">
              <div className="hero__stat-num">až 7,0 %</div>
              <div className="hero__stat-label">{t.hero_stat2_lbl}</div>
            </div>
            <div className="hero__stat">
              <div className="hero__stat-num">48 h</div>
              <div className="hero__stat-label">{t.hero_stat3_lbl}</div>
            </div>
            <div className="hero__stat" style={{ borderRight: 'none' }}>
              <div className="hero__stat-num">{t.hero_stat4_num}</div>
              <div className="hero__stat-label">{t.hero_stat4_lbl}</div>
            </div>
          </div>
        </div>

        {/* Emblem right */}
        <div className="hero__emblem-wrap" id="hero-emblem">
          <div className="hero__emblem-ring2" />
          <div className="hero__emblem-ring" />
          <div className="hero__emblem">
            <Image
              src="/img/emblem.png"
              alt="G3NE5IS holdingová společnost — 3D emblém"
              width={420}
              height={420}
              priority
              className="object-contain"
            />
          </div>
          <div className="hero__emblem-badge" ref={badgeRef}>
            <span className="hero__emblem-badge-icon" aria-hidden="true">📈</span>
            <span className="hero__emblem-badge-text">
              <span className="hero__emblem-badge-val" id="badge-counter">+{counter} %</span>
              <span className="hero__emblem-badge-lbl">{t.hero_badge_lbl}</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
