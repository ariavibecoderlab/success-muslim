import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isAuthPage =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup');
  const isAuthCallback = request.nextUrl.pathname.startsWith('/auth/callback');
  const isOnboarding = request.nextUrl.pathname === '/onboarding';
  const isAppPage = request.nextUrl.pathname.startsWith('/app');
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin');
  const isPublicPage = ['/privacy', '/disclaimer'].includes(request.nextUrl.pathname);

  if (isAuthCallback) {
    return supabaseResponse;
  }

  if (user) {
    if (isAuthPage || request.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/app/today', request.url));
    }
    if (!isOnboarding && !isAppPage && !isAdminPage) {
      return NextResponse.redirect(new URL('/app/today', request.url));
    }
  } else {
    if (isPublicPage) {
      return supabaseResponse;
    }
    if (isAppPage || isAdminPage || isOnboarding) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
    if (request.nextUrl.pathname === '/' && !isAuthPage) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return supabaseResponse;
}
