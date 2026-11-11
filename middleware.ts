import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = (request.headers.get('host') || '').toLowerCase();

  // 1. WWW Normalization: 301 permanent redirect from www to apex domain
  if (host.startsWith('www.')) {
    const cleanHost = host.slice(4);
    const destination = new URL(request.url);
    destination.host = cleanHost;
    destination.protocol = 'https:';
    return NextResponse.redirect(destination, 301);
  }

  // 2. Bypass static assets, internal Next.js routes, API and Admin
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 3. Multi-domain localization:
  // Automatically serve localized content at root based on incoming domain
  if (pathname === '/') {
    if (host.includes('genesis-invest.sk') || host.endsWith('.sk')) {
      const url = request.nextUrl.clone();
      url.pathname = '/sk';
      return NextResponse.rewrite(url);
    }
    if (host.includes('genesis-invest.pl') || host.endsWith('.pl')) {
      const url = request.nextUrl.clone();
      url.pathname = '/pl';
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|img|favicon.ico|robots.txt|sitemap.xml).*)'],
};