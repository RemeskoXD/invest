'use client';

import React from 'react';
import { Dictionary } from '@/lib/translations';

interface Props {
  t: Dictionary;
}

export const Scorecard: React.FC<Props> = ({ t }) => {
  return (
    <section className="section" id="scorecard" aria-label="Scorecard 2.0 a zajištění">
      <div className="container">
        <div className="sec-header sec-header--center reveal">
          <div className="sec-eyebrow">{t.sc_eyebrow}</div>
          <h2
            className="sec-title"
            dangerouslySetInnerHTML={{ __html: t.sc_title }}
          />
        </div>
        <div className="scorecard-grid reveal reveal-delay-1">
          <div className="scorecard-item">
            <div className="scorecard-num">01</div>
            <h3 className="scorecard-item-title">{t.sc1_title}</h3>
            <p
              className="scorecard-item-desc"
              dangerouslySetInnerHTML={{ __html: t.sc1_desc }}
            />
          </div>
          <div className="scorecard-item">
            <div className="scorecard-num">02</div>
            <h3 className="scorecard-item-title">{t.sc2_title}</h3>
            <p
              className="scorecard-item-desc"
              dangerouslySetInnerHTML={{ __html: t.sc2_desc }}
            />
          </div>
          <div className="scorecard-item">
            <div className="scorecard-num">03</div>
            <h3 className="scorecard-item-title">{t.sc3_title}</h3>
            <p
              className="scorecard-item-desc"
              dangerouslySetInnerHTML={{ __html: t.sc3_desc }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};