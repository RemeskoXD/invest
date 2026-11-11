'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Dictionary } from '@/lib/translations';

interface Props {
  t: Dictionary;
}

export const Navbar: React.FC<Props> = ({ t }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.style.overflow = '';
  };

  const toggleMenu = () => {
    const next = !menuOpen;
    setMenuOpen(next);
    document.body.style.overflow = next ? 'hidden' : '';
  };

  return (
    <nav
      className={`nav ${scrolled ? 'scrolled' : ''}`}
      id="main-nav"
      role="navigation"
      aria-label="Hlavní navigace"
    >
      <div className="nav__inner">
        {/* LOGO */}
        <Link href="#hero" className="nav__logo" id="nav-logo" aria-label="G3NE5IS Holdingová Společnost — domů">
          <div className="nav__logo-lockup">
            <span className="nav__logo-main">
              G3NE<span className="nav__logo-accent">5</span>IS
            </span>
            <span className="nav__logo-divider" aria-hidden="true" />
            <span
              className="nav__logo-sub"
              dangerouslySetInnerHTML={{ __html: t.nav_logo_sub }}
            />
          </div>
        </Link>

        {/* DESKTOP LINKS */}
        <div className={`nav__links ${menuOpen ? 'open' : ''}`} id="nav-links">
          {menuOpen && (
            <button
              type="button"
              className="nav__close"
              id="nav-close"
              aria-label={t.nav_close_label}
              onClick={closeMenu}
            >
              ✕
            </button>
          )}
          <a href="#o-nas" className="nav__link" id="nav-onas" onClick={closeMenu}>
            {t.nav_about}
          </a>
          <a href="#rozvoj" className="nav__link" id="nav-rozvoj" onClick={closeMenu}>
            {t.nav_growth}
          </a>
          <a href="#investice" className="nav__link nav__link--featured" id="nav-investice" onClick={closeMenu}>
            {t.nav_invest}
          </a>
          <a href="#kontakt" className="nav__link" id="nav-kontakt" onClick={closeMenu}>
            {t.nav_contact}
          </a>
          <a href="#kalkulator" className="nav__link nav__cta" id="nav-calc" onClick={closeMenu}>
            {t.nav_calc}
          </a>
          <a href="#vip" className="nav__link nav__vip-link" id="nav-vip" onClick={closeMenu}>
            {t.footer_nav_vip}
          </a>
        </div>

        {/* HAMBURGER */}
        <button
          type="button"
          className="nav__hamburger"
          id="hamburger"
          aria-label={menuOpen ? t.nav_close_label : t.nav_open_label}
          aria-expanded={menuOpen}
          onClick={toggleMenu}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
};
