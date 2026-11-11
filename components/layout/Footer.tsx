import React from 'react';
import Link from 'next/link';
import { Dictionary } from '@/lib/translations';

interface Props {
  t: Dictionary;
}

export const Footer: React.FC<Props> = ({ t }) => {
  return (
    <footer className="footer" aria-label="Zápatí webu G3NE5IS">
      <div className="container">
        <div className="footer-gold-line" />
        <div className="footer-grid">
          <div>
            <div className="footer-brand-name">G3NE5IS</div>
            <div className="footer-brand-sub">{t.footer_brand_sub}</div>
            <p className="footer-brand-desc">{t.footer_brand_desc}</p>
          </div>

          <div>
            <div className="footer-col-title">{t.footer_nav_title}</div>
            <div className="footer-col-links">
              <a href="#o-nas" className="footer-col-link">{t.footer_nav_about}</a>
              <a href="#rozvoj" className="footer-col-link">{t.footer_nav_growth}</a>
              <a href="#investice" className="footer-col-link">{t.footer_nav_invest}</a>
              <a href="#kalkulator" className="footer-col-link">{t.footer_nav_calc}</a>
              <a href="#vip" className="footer-col-link">{t.footer_nav_vip}</a>
              <a href="#kontakt" className="footer-col-link">{t.footer_nav_cont}</a>
            </div>
          </div>

          <div>
            <div className="footer-col-title">{t.footer_sec_title}</div>
            <div className="footer-col-links">
              <a href="#investice" className="footer-col-link">{t.footer_sec1}</a>
              <a href="#investice" className="footer-col-link">{t.footer_sec2}</a>
              <a href="#investice" className="footer-col-link">{t.footer_sec3}</a>
              <a href="#investice" className="footer-col-link">{t.footer_sec4}</a>
            </div>
          </div>

          {/* DESATERO CNB */}
          <div style={{ gridColumn: '1 / -1', marginTop: '20px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="footer-col-title">{t.footer_cnb_title}</div>
            <div className="cnb-grid">
              <div className="cnb-item">{t.footer_cnb1}</div>
              <div className="cnb-item">{t.footer_cnb2}</div>
              <div className="cnb-item">{t.footer_cnb3}</div>
              <div className="cnb-item">{t.footer_cnb4}</div>
              <div className="cnb-item">{t.footer_cnb5}</div>
              <div className="cnb-item">{t.footer_cnb6}</div>
            </div>
          </div>
        </div>

        <div className="footer-divider" />
        <div className="footer-bottom">
          <span>{t.footer_copy}</span>
          <Link href="/admin" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }} id="footer-admin">
            Admin
          </Link>
        </div>

        <p
          className="footer-legal"
          dangerouslySetInnerHTML={{ __html: t.footer_legal }}
        />
      </div>
    </footer>
  );
};
