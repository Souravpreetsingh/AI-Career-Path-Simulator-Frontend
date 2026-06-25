import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];
const authOnlyPaths = ['/dashboard', '/assessment', '/chat', '/results', '/profile', '/roadmaps'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  const isProtected = authOnlyPaths.some((p) => pathname.startsWith(p)) || pathname === '/';

  if (!token && isProtected && !isPublic) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isPublic) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|static|favicon.ico).*)'],
};
