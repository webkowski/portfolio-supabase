import { NextRequest, NextResponse } from 'next/server';

import SupabaseClient from '@/utils/supabase';
import { calculateRemainingPeriod, validateToken } from '@/utils/user';

const REDIRECT_URL_INVALID_TOKEN = '/login';
const REDIRECT_URL_VALID_TOKEN = '/';
const COOKIE_NAME = '_k';
export const runtime = 'experimental-edge';

function redirectAccessDenied(request: NextRequest): NextResponse {
  const url = request.nextUrl;
  const redirectUrl = url.clone();
  redirectUrl.pathname = REDIRECT_URL_INVALID_TOKEN;

  return NextResponse.redirect(redirectUrl);
}

function redirectAccessGranted(request: NextRequest): NextResponse {
  const url = request.nextUrl;
  const redirectUrl = url.clone();
  redirectUrl.pathname = REDIRECT_URL_VALID_TOKEN;

  return NextResponse.redirect(redirectUrl);
}
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.png).*)'],
};

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;

  const urlElements = url.pathname.split('/');
  let key = undefined;
  key = request.cookies.get(COOKIE_NAME);

  if (request.cookies.get(COOKIE_NAME)?.value) key = request.cookies.get(COOKIE_NAME)?.value;

  if (urlElements[1] === 'login' && key) {
    return redirectAccessGranted(request);
  }

  if (urlElements[1] === 'k') {
    const key: string | undefined = urlElements[2];

    if (!key) {
      return redirectAccessDenied(request);
    }

    const { data: user } = await SupabaseClient.from('user').select('*').eq('token', key).limit(1);

    if (user && user.length > 0) {
      const tokenValid: boolean = validateToken(user[0].created_at, user[0].valid_period);

      if (tokenValid) {
        const response = redirectAccessGranted(request);
        const remainingPeriod = calculateRemainingPeriod(user[0].created_at, user[0].valid_period);

        response.cookies.set(COOKIE_NAME, key as string, {
          path: '/',
          httpOnly: true,
          maxAge: 60 * 60 * 24 * remainingPeriod,
        });

        return response;
      }
    }

    const response = redirectAccessDenied(request);
    response.cookies.delete(COOKIE_NAME);

    return response;
  }

  if (key) {
    const { data: user } = await SupabaseClient.from('user').select('*').eq('token', key).limit(1);

    if (user && user.length > 0) {
      return validateToken(user[0].created_at, user[0].valid_period) ? NextResponse.next() : redirectAccessDenied(request);
    }
  }

  if (urlElements[1] !== 'login') {
    return redirectAccessDenied(request);
  }

  return NextResponse.next();
}
