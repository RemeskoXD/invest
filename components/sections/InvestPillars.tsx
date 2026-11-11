'use client';

import React from 'react';
import Image from 'next/image';
import { Dictionary } from '@/lib/translations';
import { InvestmentTier } from '@/lib/config';

interface Props {
  t: Dictionary;
  onOpenModal: (tier?: InvestmentTier) => void;
}

interface Pillar {
  id: string;
  num: string;
  title: string;
  desc: string;
  tag: string;
  img: string;
  alt: string;
}

export const InvestPillars: React.FC<Props> = ({ t, onOpenModal }) => {
  const pillars: Pillar[] = [
    {
      id: 'card-lesnictvi',
      num: t.card1_num,
      title: t.card1_title,
      desc: t.card1_desc,
      tag: t.card1_tag,
      img: '/img/icon-forestry.png',
      alt: 'Lesnický průmysl — těžba a obnova lesních porostů v Beskydech, Jeseníkách a Rychlebských horách',
    },
    {
      id: 'card-agro',
      num: t.card2_num,
      title: t.card2_title,
      desc: t.card2_desc,
      tag: t.card2_tag,
      img: '/img/icon-agro.png',
      alt: 'Agropodnikání — pěstování obilnin, kukuřice a chov skotu v Olomouckém kraji',
    },
    {
      id: 'card-developer',
      num: t.card3_num,
      title: t.card3_title,
      desc: t.card3_desc,
      tag: t.card3_tag,
      img: '/img/icon-development.png',
      alt: 'Developerské projekty — roubenky, sruby, rodinné domy, hotely a rekreační areály',
    },
    {
      id: 'card-ekologie',
      num: t.card4_num,
      title: t.card4_title,
      desc: t.card4_desc,
      tag: t.card4_tag,
      img: '/img/icon-strategic.png',
      alt: 'Ekologie a recyklace — zpracování druhotných surovin, kompostování a ekologická likvidace pneumatik',
    },
  ];

  return (
    <section className="section" id="investice" aria-labelledby="investice-h2">
      <div className="container">
        <div className="sec-header sec-header--center reveal">
          <div className="sec-eyebrow">{t.invest_eyebrow}</div>
          <h2
            className="sec-title"
            id="investice-h2"
            dangerouslySetInnerHTML={{ __html: t.invest_title }}
          />
          <p className="sec-desc">{t.invest_desc}</p>
        </div>

        <div className="invest-grid">
          {pillars.map((p, idx) => (
            <article
              key={p.id}
              className={`invest-card reveal ${idx > 0 ? `reveal-delay-${idx}` : ''}`}
              id={p.id}
              tabIndex={0}
              role="button"
              aria-label={`${p.title} — ${p.num}`}
              onClick={() => onOpenModal()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpenModal();
                }
              }}
            >
              <div style={{ position: 'relative', width: '100%', height: '220px' }}>
                <Image
                  src={p.img}
                  alt={p.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="invest-card-img"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="invest-card-body">
                <div className="invest-card-num">{p.num}</div>
                <h3 className="invest-card-title">{p.title}</h3>
                <p className="invest-card-desc">{p.desc}</p>
              </div>
              <div className="invest-card-footer">
                <span className="invest-card-tag">{p.tag}</span>
                <span className="invest-card-arrow" aria-hidden="true">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};