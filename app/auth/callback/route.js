import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function getSafeNextPath(rawNext) {
  if (!rawNext || typeof rawNext !== 'string') return '/';
  if (!rawNext.startsWith('/') || rawNext.startsWith('//')) return '/';
  return rawNext;
}

function getRequestOrigin(request) {
  const { origin } = new URL(request.url);
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';

  if (forwardedHost && process.env.NODE_ENV !== 'development') {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return origin;
}

async function ensureUserProfile(supabase, user) {
  if (!supabase || !user?.id || !user?.email) return;

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email.split('@')[0] ||
    'Digital Citizen';

  try {
    await supabase.from('profiles').upsert(
      {
        id: user.id,
        name: displayName,
        email: user.email,
      },
      { onConflict: 'id' }
    );
  } catch (err) {
    console.warn('[Auth Callback] Profile upsert warning:', err?.message);
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const origin = getRequestOrigin(request);
  const nextPath = getSafeNextPath(searchParams.get('next'));

  const oauthError = searchParams.get('error_description') || searchParams.get('error');
  if (oauthError) {
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(oauthError)}`);
  }

  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const otpType = searchParams.get('type');

  try {
    const supabase = createClient();

    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        if (data?.user) {
          await ensureUserProfile(supabase, data.user);
        }
        return NextResponse.redirect(`${origin}${nextPath}`);
      }
      return NextResponse.redirect(
        `${origin}/?auth_error=${encodeURIComponent(error.message || 'Authentication link expired or invalid.')}`
      );
    }

    if (tokenHash && otpType) {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: otpType,
      });
      if (!error) {
        if (data?.user) {
          await ensureUserProfile(supabase, data.user);
        }
        const resolvedNext = otpType === 'recovery' ? '/auth/update-password' : nextPath;
        return NextResponse.redirect(`${origin}${resolvedNext}`);
      }
      return NextResponse.redirect(
        `${origin}/?auth_error=${encodeURIComponent(error.message || 'Verification link expired or invalid.')}`
      );
    }
  } catch (err) {
    return NextResponse.redirect(
      `${origin}/?auth_error=${encodeURIComponent(err?.message || 'Unable to complete sign in.')}`
    );
  }

  return NextResponse.redirect(
    `${origin}/?auth_error=${encodeURIComponent('Invalid or expired authentication callback link.')}`
  );
}
