import nodemailer from 'nodemailer';

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getGmailCredentials() {
  const user = (process.env.GMAIL_USER || '').trim();
  const rawPass = (process.env.GMAIL_APP_PASSWORD || '').trim();
  // Google displays 16-character App Passwords with spaces; strip whitespace safely
  const pass = rawPass.replace(/\s+/g, '');
  if (user && pass) {
    return { user, pass };
  }
  return null;
}

function getCustomSmtpConfig() {
  const host = (process.env.SMTP_HOST || '').trim();
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();
  const port = Number(process.env.SMTP_PORT || '587');
  const from = (process.env.SMTP_FROM || user).trim();

  if (host && user && pass) {
    return {
      host,
      port: Number.isFinite(port) ? port : 587,
      secure: port === 465,
      user,
      pass,
      from,
    };
  }
  return null;
}

export function getMailerConfigStatus() {
  if ((process.env.RESEND_API_KEY || '').trim()) {
    return { configured: true, provider: 'resend' };
  }
  if (getGmailCredentials()) {
    return { configured: true, provider: 'gmail' };
  }
  if (getCustomSmtpConfig()) {
    return { configured: true, provider: 'smtp' };
  }
  return { configured: false, provider: null };
}

function getPurposeCopy(purpose) {
  if (purpose === 'signup') {
    return {
      subject: 'Connor — Your Gmail Verification OTP',
      heading: 'Verify your Gmail address',
      intro: 'Use the one-time verification code below to activate your Connor cyber guidance workspace.',
      actionLabel: 'Verification Code',
    };
  }
  if (purpose === 'recovery') {
    return {
      subject: 'Connor — Password Reset OTP Code',
      heading: 'Reset your Connor password',
      intro: 'We received a password reset request for your Connor account. Enter this code in the app to set a new password.',
      actionLabel: 'Password Reset OTP',
    };
  }
  return {
    subject: 'Connor — Your Sign-In OTP Code',
    heading: 'Sign in to Connor',
    intro: 'Enter the one-time code below on the Connor login screen to verify your Gmail and unlock your session.',
    actionLabel: 'Sign-In OTP Code',
  };
}

function buildOtpEmailContent({ otp, purpose, recipientName }) {
  const copy = getPurposeCopy(purpose);
  const safeName = escapeHtml(recipientName || 'there');
  const safeOtp = escapeHtml(otp);

  const text = [
    `${copy.heading}`,
    '',
    `Hi ${recipientName || 'there'},`,
    '',
    copy.intro,
    '',
    `${copy.actionLabel}: ${otp}`,
    '',
    'Never share this code with anyone. Connor support will never ask for your OTP, UPI PIN, or password.',
    'If you did not request this code, you can safely ignore this email.',
  ].join('\n');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:24px;background:#07060b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#f4f4f5;">
  <div style="max-width:480px;margin:0 auto;background:#110e1a;border:1px solid rgba(168,85,247,0.32);border-radius:14px;padding:28px;">
    <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#c084fc;font-weight:700;margin-bottom:10px;">
      Connor Cyber Guidance
    </div>
    <h1 style="margin:0 0 10px 0;font-size:20px;font-weight:700;color:#ffffff;">${copy.heading}</h1>
    <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#d4d4d8;">
      Hi ${safeName},<br /><br />${copy.intro}
    </p>
    <div style="background:#07050d;border:1px solid rgba(192,132,252,0.45);border-radius:10px;padding:18px;text-align:center;margin-bottom:20px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.14em;color:#a1a1aa;margin-bottom:6px;">
        ${copy.actionLabel}
      </div>
      <div style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:30px;font-weight:800;letter-spacing:0.22em;color:#e9d5ff;">
        ${safeOtp}
      </div>
    </div>
    <p style="margin:0;font-size:12px;line-height:1.5;color:#a1a1aa;">
      This one-time code expires shortly. Never share OTPs, banking PINs, or passwords with anyone.
      If you did not initiate this request, you can safely ignore this message.
    </p>
  </div>
</body>
</html>`.trim();

  return { subject: copy.subject, text, html };
}

export async function sendOtpEmail({ to, otp, purpose, name }) {
  const { subject, text, html } = buildOtpEmailContent({ otp, purpose, recipientName: name });

  const resendKey = (process.env.RESEND_API_KEY || '').trim();
  if (resendKey) {
    const from = (process.env.RESEND_FROM || 'Connor Security <onboarding@resend.dev>').trim();
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text,
        html,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Resend email delivery failed (${res.status}): ${errBody}`);
    }
    return { provider: 'resend' };
  }

  const gmail = getGmailCredentials();
  if (gmail) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: gmail.user,
        pass: gmail.pass,
      },
    });

    await transporter.sendMail({
      from: `Connor Security <${gmail.user}>`,
      to,
      subject,
      text,
      html,
    });
    return { provider: 'gmail' };
  }

  const smtp = getCustomSmtpConfig();
  if (smtp) {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    });

    await transporter.sendMail({
      from: smtp.from,
      to,
      subject,
      text,
      html,
    });
    return { provider: 'smtp' };
  }

  throw new Error(
    'No SMTP or email delivery provider configured. Set GMAIL_USER and GMAIL_APP_PASSWORD (or RESEND_API_KEY) in environment variables.'
  );
}
