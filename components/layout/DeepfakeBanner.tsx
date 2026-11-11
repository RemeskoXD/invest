import React from 'react';
import { Dictionary } from '@/lib/translations';

interface Props {
  t: Dictionary;
}

export const DeepfakeBanner: React.FC<Props> = ({ t }) => {
  return (
    <div className="anti-deepfake-banner">
      <div className="container">
        <span className="banner-icon" aria-hidden="true">🛡️</span>
        <span
          className="banner-text"
          dangerouslySetInnerHTML={{ __html: t.banner }}
        />
      </div>
    </div>
  );
};
