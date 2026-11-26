import { NextResponse } from 'next/server';
import { GMAIL_REGEX, getSupabaseAdminClient, getSupabaseEphemeralClient } from '@/lib/auth/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    const cleanEmail = String(body?.email || '').trim().toLowerCase();
    const cleanOtp = String(body?.otp || '').replace(/\s+/g, '').trim();
    const newPassword = String(body?.newPassword || '').trim();

    if (!cleanEmail || !GMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid @gmail.com address.' },
        { status: 400 }
      );
    }

    if (!cleanOtp || !/^\d{6,8}$/.test(cleanOtp)) {
      return NextResponse.json(
        { success: false, error: 'Please enter the verification OTP code sent to your Gmail.' },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const ephemeral = getSupabaseEphemeralClient();
    const { data: verifyData, error: verifyErr } = await ephemeral.auth.verifyOtp({
      email: cleanEmail,
      token: cleanOtp,
      type: 'recovery',
    });

    if (verifyErr || !verifyData?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired reset OTP code. Please request a fresh OTP to your Gmail.',
        },
        { status: 400 }
      );
    }

    const adminClient = getSupabaseAdminClient();
    const { error: updateErr } = await adminClient.auth.admin.updateUserById(verifyData.user.id, {
      password: newPassword,
    });

    if (updateErr) {
      return NextResponse.json(
        { success: false, error: updateErr.message || 'Failed to update password.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully! Sign in with your Gmail and new password.',
    });
  } catch (error) {
    console.error('[API /auth/reset-password] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
