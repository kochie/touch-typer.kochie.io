import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';

const ALLOWED_NEXT = new Set(['/account', '/auth/set-password']);

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get('token');
  const nextPath = requestUrl.searchParams.get('next');
  const redirectTo = ALLOWED_NEXT.has(nextPath ?? '') ? nextPath! : '/account';
  const targetPath = redirectTo === '/account' ? '/account?open_in_app=1' : redirectTo;

  if (!token) {
    return NextResponse.redirect(new URL('/signin?error=missing_token', requestUrl.origin));
  }

  let response = NextResponse.redirect(new URL(targetPath, requestUrl.origin));

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(token);

  if (error) {
    console.error('Auth callback exchange error:', error.message);
    return NextResponse.redirect(new URL(`/signin?error=${encodeURIComponent(error.message)}`, requestUrl.origin));
  }

  return response;
}
