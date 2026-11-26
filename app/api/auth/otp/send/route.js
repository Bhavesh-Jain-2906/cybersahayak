import { NextResponse } from 'next/server';
import { getMailerConfigStatus, sendOtpEmail } from '@/lib/auth/mailer';
import {
  GMAIL_REGEX,
  findRegisteredUserByEmail,
  getSupabaseAdminClient,
  getSupabaseEphemeralClient,
} from '@/lib/auth/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_PURPOSES = new Set(['signup', 'login', 'login-otp', 'recovery']);

export async function POST(req) {
  try {
    const body = await req.json();
    const purpose = String(body?.purpose || '').trim();
    const cleanEmail = String(body?.email || '').trim().toLowerCase();
    const cleanPassword = String(body?.password || '').trim();
    const cleanName = String(body?.name || '').trim();

    if (!ALLOWED_PURPOSES.has(purpose)) {
      return NextResponse.json({ success: false, error: 'Unsupported OTP request type.' }, { status: 400 });
    }

    if (!cleanEmail) {
      return NextResponse.json({ success: false, error: 'Gmail address is required.' }, { status: 400 });
    }

    if (!GMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please enter a real @gmail.com address (or use Continue with Google).',
        },
        { status: 400 }
      );
    }

    const mailerStatus = getMailerConfigStatus();
    if (!mailerStatus.configured) {
      return NextResponse.json(
        {
          success: false,
          needsEmailConfig: true,
          error:
            'Real Gmail OTP delivery is not configured yet. Add GMAIL_USER and GMAIL_APP_PASSWORD (or RESEND_API_KEY) to your server environment variables so Connor can email live verification codes.',
        },
        { status: 503 }
      );
    }

    const adminClient = getSupabaseAdminClient();
    let otp = '';
    let otpType = 'magiclink';
    let recipientName = cleanName;
    let createdUnconfirmedId = null;

    if (purpose === 'signup') {
      if (cleanName.length < 2) {
        return NextResponse.json(
          { success: false, error: 'Full name must be at least 2 characters long.' },
          { status: 400 }
        );
      }
      if (cleanPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password must contain at least 6 characters.' },
          { status: 400 }
        );
      }

      const { data: existingUser } = await findRegisteredUserByEmail(adminClient, cleanEmail)
        .then((u) => ({ data: u }))
        .catch(() => ({ data: null }));

      const { data: linkData, error: linkErr } = await adminClient.auth.admin.generateLink({
        type: 'signup',
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            name: cleanName,
            role: 'user',
          },
        },
      });

      if (linkErr) {
        const msg = linkErr.message || '';
        if (msg.toLowerCase().includes('already') && msg.toLowerCase().includes('registered')) {
          return NextResponse.json(
            {
              success: false,
              error: 'An account with this Gmail already exists. Sign in or use Forgot Password.',
            },
            { status: 409 }
          );
        }
        return NextResponse.json({ success: false, error: msg || 'Unable to generate signup OTP.' }, { status: 400 });
      }

      // If resending signup OTP for an unconfirmed user, sync their latest name/password safely
      if (linkData?.user?.id && !linkData.user.email_confirmed_at) {
        if (!existingUser) {
          createdUnconfirmedId = linkData.user.id;
        }
        await adminClient.auth.admin.updateUserById(linkData.user.id, {
          password: cleanPassword,
          user_metadata: {
            name: cleanName,
            role: 'user',
          },
        });
      }

      otp = linkData?.properties?.email_otp || '';
      otpType = 'signup';
    } else if (purpose === 'login') {
      if (cleanPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password must contain at least 6 characters.' },
          { status: 400 }
        );
      }

      const ephemeral = getSupabaseEphemeralClient();
      const { data: pwCheck, error: pwErr } = await ephemeral.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (pwErr || !pwCheck?.user) {
        const msg = pwErr?.message || '';
        if (msg.includes('Email not confirmed')) {
          return NextResponse.json(
            {
              success: false,
              error:
                'This Gmail address is not verified yet. Complete Create Account OTP verification or sign in via Gmail OTP.',
            },
            { status: 403 }
          );
        }
        return NextResponse.json(
          { success: false, error: 'Invalid Gmail address or password.' },
          { status: 401 }
        );
      }

      recipientName =
        pwCheck.user.user_metadata?.full_name || pwCheck.user.user_metadata?.name || cleanEmail.split('@')[0];

      const { data: linkData, error: linkErr } = await adminClient.auth.admin.generateLink({
        type: 'magiclink',
        email: cleanEmail,
      });

      if (linkErr || !linkData?.properties?.email_otp) {
        return NextResponse.json(
          { success: false, error: linkErr?.message || 'Unable to generate sign-in OTP.' },
          { status: 500 }
        );
      }

      otp = linkData.properties.email_otp;
      otpType = 'magiclink';
    } else if (purpose === 'login-otp') {
      const existing = await findRegisteredUserByEmail(adminClient, cleanEmail);
      if (!existing) {
        return NextResponse.json(
          {
            success: false,
            error: 'No Connor account found for this Gmail address. Switch to Create Account first.',
          },
          { status: 404 }
        );
      }

      recipientName = existing.name || cleanEmail.split('@')[0];
      const { data: linkData, error: linkErr } = await adminClient.auth.admin.generateLink({
        type: 'magiclink',
        email: cleanEmail,
      });

      if (linkErr || !linkData?.properties?.email_otp) {
        return NextResponse.json(
          { success: false, error: linkErr?.message || 'Unable to generate sign-in OTP.' },
          { status: 500 }
        );
      }

      otp = linkData.properties.email_otp;
      otpType = 'magiclink';
    } else if (purpose === 'recovery') {
      const existing = await findRegisteredUserByEmail(adminClient, cleanEmail);
      if (!existing) {
        return NextResponse.json(
          {
            success: false,
            error: 'No Connor account found with this Gmail address.',
          },
          { status: 404 }
        );
      }

      recipientName = existing.name || cleanEmail.split('@')[0];
      const { data: linkData, error: linkErr } = await adminClient.auth.admin.generateLink({
        type: 'recovery',
        email: cleanEmail,
      });

      if (linkErr || !linkData?.properties?.email_otp) {
        return NextResponse.json(
          { success: false, error: linkErr?.message || 'Unable to generate password reset OTP.' },
          { status: 500 }
        );
      }

      otp = linkData.properties.email_otp;
      otpType = 'recovery';
    }

    if (!otp) {
      return NextResponse.json(
        { success: false, error: 'Failed to issue Gmail verification code.' },
        { status: 500 }
      );
    }

    try {
      await sendOtpEmail({
        to: cleanEmail,
        otp,
        purpose: purpose === 'login-otp' ? 'login' : purpose,
        name: recipientName,
      });
    } catch (mailErr) {
      // Clean up newly generated unconfirmed user if initial email dispatch failed
      if (createdUnconfirmedId) {
        try {
          await adminClient.auth.admin.deleteUser(createdUnconfirmedId);
        } catch {}
      }
      console.error('[OTP Mail Error]:', mailErr);
      return NextResponse.json(
        {
          success: false,
          error: `Could not send OTP to ${cleanEmail}. Verify your server email settings (${mailErr.message}).`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      otpType,
      otpLength: otp.length,
      email: cleanEmail,
      message: `We sent a ${otp.length}-digit OTP code to ${cleanEmail}. Check your Gmail inbox (and Spam) and enter it below.`,
    });
  } catch (error) {
    console.error('[API /auth/otp/send] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
