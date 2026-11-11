'use client';

import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { SITE_CONFIG } from '@/lib/config';
import { buildSpaydString } from '@/lib/spayd';
import { OrderRecord } from '@/lib/validations';
import { formatCZK } from '@/lib/calculator';

interface Props {
  order: OrderRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QrModal: React.FC<Props> = ({ order, isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen || !order || !canvasRef.current) return;

    const spayd = buildSpaydString({
      amount: order.amount,
      vs: order.vs,
      name: order.name,
      isVip: order.tier === 'vip',
    });

    QRCode.toCanvas(
      canvasRef.current,
      spayd,
      {
        width: 220,
        margin: 2,
        color: {
          dark: '#012B12',
          light: '#FFFFFF',
        },
      },
      (err) => {
        if (err) console.error('Failed to generate QR code:', err);
      }
    );
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  return (
    <div
      className="qr-modal-backdrop active"
      id="qr-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-title"
    >
      <div className="qr-overlay" onClick={onClose} />
      <div className="qr-box">
        <div className="qr-icon" aria-hidden="true">✅</div>
        <h2 className="qr-title" id="qr-title">
          Rezervace zaregistrována
        </h2>
        <p className="qr-sub">
          Objednávka přijata. Z bezpečnostních důvodů Vám originální PDF certifikát zašleme do{' '}
          <strong>48 hodin po manuálním spárování platby</strong>. Naskenujte QR kód vaší bankovní
          aplikací a dokončete platbu.
        </p>

        <div className="qr-wrap">
          <canvas
            ref={canvasRef}
            id="qr-canvas"
            aria-label="Platební QR kód pro převod dluhopisu"
          />
        </div>

        <div className="qr-vs">
          <div
            style={{
              marginBottom: '12px',
              fontSize: '0.9rem',
              borderBottom: '1px solid rgba(0,0,0,0.05)',
              paddingBottom: '12px',
              color: '#333',
              lineHeight: 1.6,
              textAlign: 'left',
            }}
          >
            <div><strong>Banka:</strong> {SITE_CONFIG.BANK_NAME}</div>
            <div><strong>Číslo účtu (CZ):</strong> {SITE_CONFIG.BANK_ACC}</div>
            <div><strong>IBAN (CZ / SEPA pro SK &amp; PL):</strong> {SITE_CONFIG.IBAN}</div>
            <div><strong>SWIFT / BIC:</strong> {SITE_CONFIG.BIC}</div>
            <div><strong>Částka:</strong> {formatCZK(order.amount)}</div>
          </div>
          <span className="qr-vs-lbl">Variabilní symbol platby</span>
          <span id="vs-display" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#012B12' }}>
            {order.vs}
          </span>
        </div>

        <div className="qr-alert">
          <span className="qr-alert-icon" aria-hidden="true">🔒</span>
          <span>
            Vaše investiční rezervace byla bezpečně zaregistrována. Z důvodu přísné manuální kontroly
            bankovního převodu a ochrany kapitálu bude Váš originální PDF certifikát dluhopisu
            vygenerován a odeslán do <strong>48 hodin</strong>.
          </span>
        </div>

        <div className="qr-secure">
          🛡️ Šifrováno · GDPR compliant · Manuální ověření
        </div>

        <button
          type="button"
          className="btn btn--emerald btn--lg"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={onClose}
          id="qr-close-btn"
        >
          Rozumím — zavřít
        </button>
      </div>
    </div>
  );
};