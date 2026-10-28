import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

// [VIVA SEARCH: EDGE MIDDLEWARE] & [VIVA SEARCH: ROUTE PROTECTION]
// Intercepts requests before reaching page components to enforce authentication.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // [VIVA SEARCH: UNAUTHENTICATED REDIRECT]
  // Unauthenticated requests to /app are redirected to /login with return destination
  if (request.nextUrl.pathname.startsWith('/app') && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in, visiting /login directly forwards to /app
  if (request.nextUrl.pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/app/:path*', '/login'],
};
