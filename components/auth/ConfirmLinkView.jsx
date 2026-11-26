'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { APP_CONFIG } from '@/lib/constants';
import styles from './AuthScreen.module.css';

const TYPE_META = {
  signup: {
    badge: 'Email Confirmation',
    heading: 'Confirm your Connor account',
    subtitle: 'Click below to verify your email address and activate your cyber guidance workspace.',
    buttonLabel: 'Verify Email & Continue',
    successLabel: 'Email confirmed! Opening Connor...',
    defaultNext: '/',
  },
  magiclink: {
    badge: 'One-Time Sign In',
    heading: 'Complete your sign-in',
    subtitle: 'Click below to verify your one-time Gmail link and enter your private workspace.',
    buttonLabel: 'Confirm & Sign In to Connor',
    successLabel: 'Signed in! Opening Connor...',
    defaultNext: '/',
  },
  email: {
    badge: 'One-Time Sign In',
    heading: 'Complete your sign-in',
    subtitle: 'Click below to verify your one-time Gmail link and enter your private workspace.',
    buttonLabel: 'Confirm & Sign In to Connor',
    successLabel: 'Signed in! Opening Connor...',
    defaultNext: '/',
  },
  recovery: {
    badge: 'Password Recovery',
    heading: 'Verify password reset link',
    subtitle: 'Click below to verify your recovery link and set a new password for your account.',
    buttonLabel: 'Continue to Reset Password',
    successLabel: 'Verified! Opening password reset screen...',
    defaultNext: '/auth/update-password',
  },
};

function getSafeNextPath(rawNext, fallback) {
  if (!rawNext || typeof rawNext !== 'string') return fallback;
  if (!rawNext.startsWith('/') || rawNext.startsWith('//')) return fallback;
  return rawNext;
}

export default function ConfirmLinkView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmailTokenHash } = useAuth();

  const tokenHash = (searchParams.get('token_hash') || '').trim();
  const rawType = (searchParams.get('type') || 'signup').trim().toLowerCase();
  const meta = TYPE_META[rawType] || TYPE_META.signup;
  const nextPath = getSafeNextPath(searchParams.get('next'), meta.defaultNext);

  const [verifying, setVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleConfirm = async () => {
    if (!tokenHash) {
      setErrorMessage('Verification token is missing or invalid. Please request a fresh link.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setVerifying(true);

    try {
      const result = await verifyEmailTokenHash({
        tokenHash,
        type: rawType,
      });

      if (!result.success) {
        setErrorMessage(
          result.error || 'This link is invalid or has expired. Please request a fresh link.'
        );
        return;
      }

      setSuccessMessage(meta.successLabel);
      setTimeout(() => {
        router.replace(nextPath);
      }, 650);
    } catch (err) {
      setErrorMessage(err?.message || 'Unable to verify this email link.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className={`${styles.authRoot} selection:bg-[#9333EA]/35 selection:text-[#F3E8FF]`}>
      <div className={styles.gradientBackground} aria-hidden="true">
        <div className={`${styles.gradientSphere} ${styles.sphere1}`} />
        <div className={`${styles.gradientSphere} ${styles.sphere2}`} />
        <div className={`${styles.gradientSphere} ${styles.sphere3}`} />
        <div className={styles.glow} />
        <div className={styles.gridOverlay} />
        <div className={styles.noiseOverlay} />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-5 py-10 my-auto">
        <div className="relative overflow-hidden rounded-[14px] bg-gradient-to-b from-[#171320]/75 to-[#111016]/80 backdrop-blur-xl border border-[#A855F7]/25 shadow-[0_20px_50px_rgba(0,0,0,0.75),0_0_40px_rgba(147,51,234,0.1)] p-6 sm:p-7">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C084FC]/55 to-transparent"
          />

          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#9333EA]/[0.14] border border-[#A855F7]/25 text-[10px] font-medium tracking-wider uppercase text-[#E9D5FF]">
              <ShieldCheck className="w-3 h-3 text-[#C084FC]" />
              {APP_CONFIG.name} &bull; {meta.badge}
            </span>
          </div>

          <h1 className="text-xl font-semibold text-white tracking-[-0.02em]">{meta.heading}</h1>
          <p className="text-xs text-[#A1A1AA] mt-1 mb-5">{meta.subtitle}</p>

          {!tokenHash ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-[8px] bg-red-500/15 border border-red-500/35 text-red-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>
                  This verification link is incomplete or expired. Request a new confirmation or sign-in link from Connor.
                </span>
              </div>
              <button
                type="button"
                onClick={() => router.replace('/')}
                className="w-full flex items-center justify-center gap-2 h-[42px] px-4 rounded-[8px] bg-[#F4F4F5] hover:bg-[#FAF5FF] text-[#09090B] font-medium text-xs transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {successMessage && (
                <div className="p-3 rounded-[8px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-[8px] bg-red-500/15 border border-red-500/35 text-red-200 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleConfirm}
                disabled={verifying || Boolean(successMessage)}
                className="w-full flex items-center justify-center gap-2 h-[42px] px-4 rounded-[8px] bg-[#F4F4F5] hover:bg-[#FAF5FF] text-[#09090B] font-medium text-xs sm:text-[13px] transition-colors disabled:opacity-50"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#09090B]" />
                    <span>Verifying link...</span>
                  </>
                ) : (
                  <>
                    <span>{meta.buttonLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.replace(rawType === 'recovery' ? '/?mode=forgot' : '/')}
                  className="text-xs text-[#A1A1AA] hover:text-[#D8B4FE] transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
