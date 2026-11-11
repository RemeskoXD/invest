'use client';

import React, { useState } from 'react';
import { Dictionary } from '@/lib/translations';

interface Props {
  t: Dictionary;
}

export const DeepfakeBanner: React.FC<Props> = ({ t }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="anti-deepfake-banner">
      <div className="container" style={{ position: 'relative', paddingRight: '40px' }}>
        <span className="banner-icon" aria-hidden="true">🛡️</span>
        <span
          className="banner-text"
          dangerouslySetInnerHTML={{ __html: t.banner }}
        />
        <button
          type="button"
          onClick={() => setDismissed(true)}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '1rem',
            cursor: 'pointer',
            padding: '4px 8px',
            lineHeight: 1,
          }}
          aria-label="Zavřít upozornění"
        >
          ✕
        </button>
      </div>
    </div>
  );
};