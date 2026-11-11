import React from 'react';
import Image from 'next/image';
import { Dictionary } from '@/lib/translations';

interface Props {
  t: Dictionary;
}

export const About: React.FC<Props> = ({ t }) => {
  return (
    <section className="section" id="o-nas" aria-labelledby="about-h2">
      <div className="container">
        <div className="about-grid">
          {/* Founder Image & Experience Badge */}
          <div className="about-img-wrap reveal-left">
            <Image
              src="/img/founder.webp"
              alt="Lukáš Zaoral — zakladatel a jednatel G3NE5IS holdingové společnosti"
              className="about-img"
              width={460}
              height={575}
              loading="lazy"
            />
            <div className="about-badge">
              <div className="about-badge-num">2015</div>
              <div className="about-badge-lbl">{t.about_badge_lbl}</div>
            </div>
          </div>

          {/* Content */}
          <div className="about-content reveal-right">
            <div className="sec-header">
              <div className="sec-eyebrow">{t.about_eyebrow}</div>
              <h2
                className="sec-title"
                id="about-h2"
                dangerouslySetInnerHTML={{ __html: t.about_title }}
              />
            </div>

            <blockquote className="about-quote">
              {t.about_quote}
            </blockquote>

            <p
              className="about-text"
              dangerouslySetInnerHTML={{ __html: t.about_p1 }}
            />
            <p
              className="about-text"
              dangerouslySetInnerHTML={{ __html: t.about_p2 }}
            />
            <p
              className="about-text"
              dangerouslySetInnerHTML={{ __html: t.about_p3 }}
            />

            <div className="about-features">
              <div className="about-feature">
                <div className="about-feature-icon" aria-hidden="true">🛡️</div>
                <div className="about-feature-title">{t.feat1_title}</div>
                <div className="about-feature-desc">{t.feat1_desc}</div>
              </div>
              <div className="about-feature">
                <div className="about-feature-icon" aria-hidden="true">🔍</div>
                <div className="about-feature-title">{t.feat2_title}</div>
                <div className="about-feature-desc">{t.feat2_desc}</div>
              </div>
              <div className="about-feature">
                <div className="about-feature-icon" aria-hidden="true">💎</div>
                <div className="about-feature-title">{t.feat3_title}</div>
                <div className="about-feature-desc">{t.feat3_desc}</div>
              </div>
              <div className="about-feature">
                <div className="about-feature-icon" aria-hidden="true">👨‍👩‍👧</div>
                <div className="about-feature-title">{t.feat4_title}</div>
                <div className="about-feature-desc">{t.feat4_desc}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
