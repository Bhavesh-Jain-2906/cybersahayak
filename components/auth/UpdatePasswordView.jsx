'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { APP_CONFIG } from '@/lib/constants';
import styles from './AuthScreen.module.css';

export default function UpdatePasswordView() {
  const router = useRouter();
  const { user, loading, updateUserPassword, clearRecoveryMode, signOut } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [accountEmail, setAccountEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user?.email) {
      setAccountEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanPassword = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanPassword) {
      setErrorMessage('Please enter a new password.');
      return;
    }
    if (cleanPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (cleanPassword !== cleanConfirm) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await updateUserPassword(cleanPassword, {
        signOutAfter: true,
        keepRecoveryView: true,
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Failed to update password.');
        return;
      }

      setNewPassword('');
      setConfirmPassword('');
      setPasswordChanged(true);
    } catch (err) {
      setErrorMessage(err?.message || 'Unexpected error while updating password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToForgot = () => {
    clearRecoveryMode();
    router.replace('/?mode=forgot');
  };

  const handleCancelToLogin = async () => {
    await signOut();
    clearRecoveryMode();
    router.replace('/');
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
              {APP_CONFIG.name} Account Recovery
            </span>
          </div>

          {passwordChanged ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white tracking-[-0.02em]">
                    Password changed
                  </h1>
                  <p className="text-xs text-emerald-300/90 mt-0.5">
                    Your account password has been updated.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-[8px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs leading-relaxed">
                {accountEmail
                  ? `Password changed for ${accountEmail}. Please go back to the Connor website to sign in with your email and new password.`
                  : 'Password changed successfully. Please go back to the Connor website to sign in with your email and new password.'}
              </div>

              <Link
                href="/?reset=success"
                onClick={() => clearRecoveryMode()}
                className="w-full flex items-center justify-center gap-2 h-[42px] px-4 rounded-[8px] bg-[#F4F4F5] hover:bg-[#FAF5FF] text-[#09090B] font-medium text-xs sm:text-[13px] transition-colors"
              >
                <span>Click here to Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : loading ? (
            <>
              <h1 className="text-xl font-semibold text-white tracking-[-0.02em]">
                Set a new password
              </h1>
              <p className="text-xs text-[#A1A1AA] mt-1 mb-5">
                Verify your reset link to choose a new password.
              </p>
              <div className="py-8 flex flex-col items-center justify-center gap-3 text-xs text-[#D8B4FE]">
                <Loader2 className="w-5 h-5 animate-spin text-[#C084FC]" />
                <span>Verifying recovery session...</span>
              </div>
            </>
          ) : !user ? (
            <>
              <h1 className="text-xl font-semibold text-white tracking-[-0.02em]">
                Reset link unavailable
              </h1>
              <p className="text-xs text-[#A1A1AA] mt-1 mb-5">
                We could not verify an active recovery session for this link.
              </p>
              <div className="space-y-4">
                <div className="p-3.5 rounded-[8px] bg-red-500/15 border border-red-500/35 text-red-200 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>
                    This password reset link is invalid or has expired. Please request a fresh reset link.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleBackToForgot}
                  className="w-full flex items-center justify-center gap-2 h-[42px] px-4 rounded-[8px] bg-[#F4F4F5] hover:bg-[#FAF5FF] text-[#09090B] font-medium text-xs transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Request a New Reset Link</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-white tracking-[-0.02em]">
                Set a new password
              </h1>
              <p className="text-xs text-[#A1A1AA] mt-1 mb-5">
                {user?.email
                  ? `Create a strong new password for ${user.email}.`
                  : 'Create a strong new password for your account.'}
              </p>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-[8px] bg-red-500/15 border border-red-500/35 text-red-200 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="recovery-password" className="block text-xs font-medium text-white">
                      New Password
                    </label>
                    {newPassword.length > 0 && (
                      <span
                        className={`text-[10px] font-mono ${
                          newPassword.length >= 6 ? 'text-emerald-400' : 'text-[#A1A1AA]'
                        }`}
                      >
                        {newPassword.length >= 6
                          ? `✓ ${newPassword.length} chars`
                          : `${newPassword.length}/6 min`}
                      </span>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 absolute left-3.5 text-[#71717A] pointer-events-none" />
                    <input
                      id="recovery-password"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="Minimum 6 characters"
                      autoComplete="new-password"
                      className="w-full pl-10 pr-10 py-2.5 text-xs rounded-[8px] bg-[#0D0B12]/60 border border-white/[0.12] text-white placeholder-[#71717A] focus:outline-none focus:border-[#A855F7]/65 transition-colors"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-[#A1A1AA] hover:text-[#D8B4FE] p-1"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="recovery-confirm" className="block text-xs font-medium text-white">
                      Confirm New Password
                    </label>
                    {confirmPassword.length > 0 && (
                      <span
                        className={`text-[10px] font-mono ${
                          newPassword === confirmPassword ? 'text-emerald-400' : 'text-[#A1A1AA]'
                        }`}
                      >
                        {newPassword === confirmPassword ? '✓ Match' : 'Must match'}
                      </span>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <KeyRound className="w-4 h-4 absolute left-3.5 text-[#71717A] pointer-events-none" />
                    <input
                      id="recovery-confirm"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="Re-enter your new password"
                      autoComplete="new-password"
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-[8px] bg-[#0D0B12]/60 border border-white/[0.12] text-white placeholder-[#71717A] focus:outline-none focus:border-[#A855F7]/65 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 h-[42px] px-4 rounded-[8px] bg-[#F4F4F5] hover:bg-[#FAF5FF] text-[#09090B] font-medium text-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#09090B]" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Save New Password</span>
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={handleCancelToLogin}
                  className="text-xs text-[#A1A1AA] hover:text-[#D8B4FE] transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
