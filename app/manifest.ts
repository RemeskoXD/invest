import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'G3NE5IS holdingová společnost',
    short_name: 'G3NE5IS',
    description: 'Prémiové podnikové dluhopisy kryté reálnými aktivy v ČR.',
    start_url: '/',
    display: 'standalone',
    background_color: '#012B12',
    theme_color: '#012B12',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}