'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  // Accessibility: ESC key to close & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const copyToClipboard = (text: string, field: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  return (
    <div
      className="qr-modal-backdrop open active"
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
          aplikací nebo zkopírujte platební údaje.
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
              marginBottom: '14px',
              fontSize: '0.9rem',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              paddingBottom: '14px',
              color: '#333',
              lineHeight: 1.7,
              textAlign: 'left',
            }}
          >
            <div><strong>Banka:</strong> {SITE_CONFIG.BANK_NAME}</div>
            <div><strong>Číslo účtu (CZ):</strong> {SITE_CONFIG.BANK_ACC}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginTop: 4 }}>
              <div><strong>IBAN:</strong> {SITE_CONFIG.IBAN}</div>
              <button
                type="button"
                onClick={() => copyToClipboard(SITE_CONFIG.IBAN, 'iban')}
                style={{
                  background: copiedField === 'iban' ? '#27ae60' : 'rgba(1,43,18,0.08)',
                  color: copiedField === 'iban' ? '#fff' : '#012B12',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {copiedField === 'iban' ? '✓ Zkopírováno' : 'Kopírovat IBAN'}
              </button>
            </div>
            <div><strong>SWIFT / BIC:</strong> {SITE_CONFIG.BIC}</div>
            <div><strong>Částka:</strong> {formatCZK(order.amount)}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
            <span className="qr-vs-lbl" style={{ margin: 0 }}>Variabilní symbol</span>
            <button
              type="button"
              onClick={() => copyToClipboard(order.vs, 'vs')}
              style={{
                background: copiedField === 'vs' ? '#27ae60' : 'rgba(200,169,110,0.2)',
                color: copiedField === 'vs' ? '#fff' : '#012B12',
                border: 'none',
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {copiedField === 'vs' ? '✓ Zkopírováno' : 'Kopírovat VS'}
            </button>
          </div>
          <span id="vs-display" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#012B12', letterSpacing: '1px', display: 'block', marginTop: '4px' }}>
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