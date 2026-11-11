import type { Metadata, Viewport } from 'next';
import './globals.css';
import { fontDisplay, fontBody, fontMono } from '@/lib/fonts';
import { SITE_CONFIG } from '@/lib/config';

export const viewport: Viewport = {
  themeColor: '#012B12',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(`https://${SITE_CONFIG.DOMAINS.CZ}`),
  title: 'G3NE5IS holdingová společnost | Prémiové investice s garancí reálných aktiv',
  description:
    'Vydáváme certifikované podnikové dluhopisy kryté reálnými aktivy v lesnictví, zemědělství a nemovitostech. Garantovaný výnos od 4,5 % do 7,0 % p.a. Přímo od jednatele od roku 2015.',
  keywords: [
    'investice',
    'podnikové dluhopisy',
    'garantovaný výnos',
    'zhodnocení kapitálu',
    'reálná aktiva',
    'lesnictví',
    'zemědělství',
    'development',
    'G3NE5IS',
    'Lukáš Zaoral',
  ],
  authors: [{ name: SITE_CONFIG.FOUNDER }],
  creator: SITE_CONFIG.COMPANY,
  publisher: SITE_CONFIG.COMPANY,
  alternates: {
    canonical: `https://${SITE_CONFIG.DOMAINS.CZ}`,
    languages: {
      'cs-CZ': `https://${SITE_CONFIG.DOMAINS.CZ}`,
      'sk-SK': `https://${SITE_CONFIG.DOMAINS.SK}`,
      'pl-PL': `https://${SITE_CONFIG.DOMAINS.PL}`,
    },
  },
  openGraph: {
    title: 'G3NE5IS holdingová společnost — Prémiové podnikové dluhopisy',
    description:
      'Reálná aktiva, stabilní výnos 4,5 % až 7,0 % p.a. a osobní jednání přímo se zakladatelem společnosti.',
    url: `https://${SITE_CONFIG.DOMAINS.CZ}`,
    siteName: SITE_CONFIG.COMPANY,
    images: [
      {
        url: '/img/emblem.png',
        width: 1200,
        height: 630,
        alt: 'G3NE5IS investiční společnost',
      },
    ],
    locale: 'cs_CZ',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `https://${SITE_CONFIG.DOMAINS.CZ}/#organization`,
        name: SITE_CONFIG.COMPANY,
        legalName: SITE_CONFIG.LEGAL_NAME,
        url: `https://${SITE_CONFIG.DOMAINS.CZ}`,
        logo: `https://${SITE_CONFIG.DOMAINS.CZ}/img/emblem.png`,
        founder: {
          '@type': 'Person',
          name: SITE_CONFIG.FOUNDER,
          jobTitle: 'Jednatel a zakladatel',
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Patrice Lumumby 2310/52',
          addressLocality: 'Ostrava - Zábřeh',
          postalCode: '700 30',
          addressCountry: 'CZ',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: SITE_CONFIG.PHONE,
          contactType: 'customer support',
          email: SITE_CONFIG.EMAIL,
          availableLanguage: ['Czech', 'Slovak', 'Polish'],
        },
      },
      {
        '@type': 'FinancialProduct',
        name: 'Podnikový dluhopis G3NE5IS',
        description: 'Certifikované korporátní dluhopisy kryté reálnými aktivy',
        annualPercentageRate: '4.5% - 7.0%',
        provider: {
          '@id': `https://${SITE_CONFIG.DOMAINS.CZ}/#organization`,
        },
      },
    ],
  };

  return (
    <html lang="cs" className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}