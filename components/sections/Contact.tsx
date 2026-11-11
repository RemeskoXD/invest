'use client';

import React from 'react';
import Image from 'next/image';
import { Dictionary } from '@/lib/translations';
import { SITE_CONFIG } from '@/lib/config';

interface Props {
  t: Dictionary;
}

export const Contact: React.FC<Props> = ({ t }) => {
  return (
    <section className="section" id="kontakt" aria-labelledby="contact-h2">
      <div className="container">
        <div className="contact-grid">
          <div>
            <div className="sec-header reveal">
              <div className="sec-eyebrow">{t.contact_eyebrow}</div>
              <h2
                className="sec-title"
                id="contact-h2"
                dangerouslySetInnerHTML={{ __html: t.contact_title }}
              />
              <p className="sec-desc">{t.contact_desc}</p>
            </div>

            <div className="contact-info-cards">
              {/* Phone card */}
              <div className="contact-card reveal reveal-delay-1">
                <div className="contact-card-icon">
                  <Image
                    src="/img/icon-contact.png"
                    alt="Kontakt — osobní schůzka"
                    width={56}
                    height={56}
                    loading="lazy"
                  />
                </div>
                <div>
                  <div className="contact-card-lbl">{t.contact_phone_lbl}</div>
                  <a
                    href={`tel:${SITE_CONFIG.PHONE_CLEAN}`}
                    className="contact-card-val"
                    id="contact-phone"
                  >
                    {SITE_CONFIG.PHONE}
                  </a>
                  <div className="contact-card-desc">{t.contact_phone_desc}</div>
                </div>
              </div>

              {/* Email card */}
              <div className="contact-card reveal reveal-delay-2">
                <div
                  className="contact-card-icon"
                  style={{
                    background: 'var(--emerald-pale)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}
                  aria-hidden="true"
                >
                  ✉️
                </div>
                <div>
                  <div className="contact-card-lbl">{t.contact_email_lbl}</div>
                  <a
                    href={`mailto:${SITE_CONFIG.EMAIL}`}
                    className="contact-card-val"
                    id="contact-email"
                    style={{ fontSize: '0.95rem' }}
                  >
                    {SITE_CONFIG.EMAIL}
                  </a>
                  <div className="contact-card-desc">{t.contact_email_desc}</div>
                </div>
              </div>

              {/* In-person meetings */}
              <div className="contact-card reveal reveal-delay-3">
                <div
                  className="contact-card-icon"
                  style={{
                    background: 'var(--gold-pale)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}
                  aria-hidden="true"
                >
                  📍
                </div>
                <div>
                  <div className="contact-card-lbl">{t.contact_meet_lbl}</div>
                  <div
                    className="contact-card-val"
                    style={{ fontSize: '1rem' }}
                    dangerouslySetInnerHTML={{ __html: t.contact_meet_val }}
                  />
                  <div className="contact-card-desc">{t.contact_meet_desc}</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Right card */}
          <div className="contact-cta reveal reveal-delay-2">
            <div className="contact-cta-eye">{t.cta_eyebrow}</div>
            <div
              className="contact-cta-title"
              dangerouslySetInnerHTML={{ __html: t.cta_title }}
            />
            <p className="contact-cta-text">{t.cta_text}</p>
            <a
              href={`mailto:${SITE_CONFIG.EMAIL}?subject=Z%C3%A1jem+o+osobn%C3%AD+sch%C5%AFzku&body=Dobr%C3%BD+den%2C%0A%0Am%C3%A1m+z%C3%A1jem+o+osobn%C3%AD+sch%C5%AFzku+ohledn%C4%9B+investi%C4%8Dn%C3%ADch+dluhopis%C5%AF+G3NE5IS.%0A%0AD%C4%9Bkuji.`}
              className="btn btn--white btn--lg"
              style={{
                background: 'white',
                color: 'var(--emerald)',
                boxShadow: 'var(--shadow-md)',
              }}
              id="contact-meeting-btn"
            >
              {t.cta_btn_meet}
            </a>
            <div style={{ marginTop: '16px' }}>
              <a
                href={`tel:${SITE_CONFIG.PHONE_CLEAN}`}
                className="btn btn--outline btn--lg"
                style={{
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: 'rgba(255,255,255,0.85)',
                }}
                id="contact-call-btn"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ width: '18px', height: '18px', marginRight: '8px' }}
                  aria-hidden="true"
                >
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
                {t.cta_btn_call}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};