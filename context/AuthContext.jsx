'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getUserProfile, updateUserProfile } from '@/lib/supabase/db';

const AuthContext = createContext(null);

const GMAIL_REGEX = /^[^\s@]+@(gmail|googlemail)\.com$/i;

function resolveDisplayName(authUser) {
  return (
    authUser?.user_metadata?.full_name ||
    authUser?.user_metadata?.name ||
    (authUser?.email ? authUser.email.split('@')[0] : '') ||
    'Digital Citizen'
  );
}

function formatSupabaseAuthError(rawMessage) {
  const msg = rawMessage || 'Authentication request failed.';
  if (msg.includes('Email address') && msg.includes('not authorized')) {
    return 'Supabase default email sender restricts external addresses. Configure Custom SMTP (Gmail/Resend) in Supabase Auth Settings to deliver emails to any Gmail inbox.';
  }
  if (msg.toLowerCase().includes('rate limit') || msg.includes('over_email_send_rate_limit') || msg.includes('security purposes')) {
    return 'Too many email requests in a short window. Please wait a minute before trying again.';
  }
  return msg;
}

export function AuthProvider({ children }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  // Determine if the active user holds Administrator privileges
  const isAdmin = useMemo(() => {
    return (
      user?.app_metadata?.role === 'admin' ||
      user?.app_metadata?.isAdmin === true
    );
  }, [user]);

  // Fetch user profile from database in background (and ensure OAuth/verified users have a profile row)
  const refreshProfile = useCallback(async (userId, authUser = null) => {
    if (!userId || !supabase) {
      setProfile(null);
      return;
    }
    try {
      const data = await getUserProfile(supabase, userId);
      if (data) {
        setProfile(data);
        return;
      }

      if (authUser?.email) {
        const fallbackName = resolveDisplayName(authUser);
        const { data: upserted } = await supabase
          .from('profiles')
          .upsert(
            {
              id: userId,
              name: fallbackName,
              email: authUser.email,
            },
            { onConflict: 'id' }
          )
          .select()
          .single();

        if (upserted) {
          setProfile(upserted);
        }
      }
    } catch (err) {
      console.warn('[Auth] Error fetching profile:', err);
    }
  }, [supabase]);

  // Initial session hydration and auth state change listener
  useEffect(() => {
    let mounted = true;

    // Safety timeout: Never keep the user waiting more than 2 seconds for initial session check
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 2000);

    async function initializeAuth() {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[Auth] Error getting session:', error.message);
        }

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user || null);
          setLoading(false);
          clearTimeout(safetyTimer);

          if (initialSession?.user) {
            refreshProfile(initialSession.user.id, initialSession.user);
          }
        }
      } catch (err) {
        console.error('[Auth] Initialization error:', err);
        if (mounted) setLoading(false);
      } finally {
        clearTimeout(safetyTimer);
      }
    }

    initializeAuth();

    // Listen to auth events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, PASSWORD_RECOVERY, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      const currentUser = currentSession?.user || null;
      setUser(currentUser);
      setLoading(false);

      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      } else if (event === 'SIGNED_OUT') {
        setIsRecoveryMode(false);
      }

      if (currentUser) {
        refreshProfile(currentUser.id, currentUser);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [supabase, refreshProfile]);

  // Request a real Gmail OTP from the backend (/api/auth/otp/send)
  const requestAuthOtp = useCallback(async ({ purpose, email, password, name }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    const cleanName = (name || '').trim();

    if (!cleanEmail) {
      return { success: false, error: 'Gmail address is required.' };
    }
    if (!GMAIL_REGEX.test(cleanEmail)) {
      return {
        success: false,
        error: 'Please enter a valid @gmail.com address (or use Continue with Google).',
      };
    }

    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose,
          email: cleanEmail,
          password: cleanPassword,
          name: cleanName,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        return {
          success: false,
          needsEmailConfig: Boolean(payload?.needsEmailConfig),
          error: payload?.error || 'Could not send Gmail verification OTP.',
        };
      }

      return {
        success: true,
        otpRequired: true,
        otpType: payload.otpType,
        otpLength: payload.otpLength || 8,
        email: payload.email || cleanEmail,
        message: payload.message,
      };
    } catch (err) {
      return {
        success: false,
        error: err?.message || 'Network error while requesting Gmail OTP.',
      };
    }
  }, []);

  // Verify the OTP sent to Gmail and complete sign-in / signup session
  const verifyEmailOtp = useCallback(async ({ email, otp, otpType, name }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanOtp = String(otp || '').replace(/\s+/g, '').trim();

    if (!cleanOtp || !/^\d{6,8}$/.test(cleanOtp)) {
      return { success: false, error: 'Please enter the verification OTP code sent to your Gmail.' };
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanOtp,
        type: otpType || 'email',
      });

      if (error || !data?.session || !data?.user) {
        return {
          success: false,
          error: error?.message || 'Invalid or expired OTP code. Please double-check your Gmail inbox.',
        };
      }

      setIsRecoveryMode(false);
      setUser(data.user);
      setSession(data.session);

      const resolvedName = (name || '').trim() || resolveDisplayName(data.user);
      try {
        await supabase.from('profiles').upsert(
          {
            id: data.user.id,
            name: resolvedName,
            email: data.user.email || cleanEmail,
          },
          { onConflict: 'id' }
        );
      } catch {}

      refreshProfile(data.user.id, data.user);
      return { success: true, user: data.user, session: data.session };
    } catch (err) {
      return { success: false, error: err?.message || 'Failed to verify OTP code.' };
    }
  }, [supabase, refreshProfile]);

  // Complete password reset using Gmail OTP + new password (/api/auth/reset-password)
  const completePasswordResetWithOtp = useCallback(async ({ email, otp, newPassword }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanOtp = String(otp || '').replace(/\s+/g, '').trim();
    const cleanPassword = (newPassword || '').trim();

    if (!cleanEmail || !GMAIL_REGEX.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid @gmail.com address.' };
    }
    if (!cleanOtp || !/^\d{6,8}$/.test(cleanOtp)) {
      return { success: false, error: 'Please enter the reset OTP code sent to your Gmail.' };
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          otp: cleanOtp,
          newPassword: cleanPassword,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        return {
          success: false,
          error: payload?.error || 'Could not reset password. Please check your OTP code.',
        };
      }

      return {
        success: true,
        message: payload.message || 'Password updated successfully! You can now sign in.',
      };
    } catch (err) {
      return { success: false, error: err?.message || 'Network error while updating password.' };
    }
  }, []);

  // Sign In with email and password:
  // All users authenticate via Supabase email + OTP
  const signInWithPassword = useCallback(async ({ email, password }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    {
      if (!cleanEmail) {
        return { success: false, error: 'Gmail address username is required.' };
      }
      if (!GMAIL_REGEX.test(cleanEmail)) {
        return {
          success: false,
          error: 'Please enter a valid @gmail.com address to receive your sign-in OTP.',
        };
      }
      if (!cleanPassword) {
        return { success: false, error: 'Password is required.' };
      }
      if (cleanPassword.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }

      return requestAuthOtp({
        purpose: 'login',
        email: cleanEmail,
        password: cleanPassword,
      });
    }
  }, [supabase]);

  // Sign Up always dispatches a real Gmail OTP and never creates an active unverified session
  const signUpWithPassword = useCallback(async ({ name, email, password }) => {
    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: 'Full name must be at least 2 characters long.' };
    }
    if (!cleanEmail || !GMAIL_REGEX.test(cleanEmail)) {
      return {
        success: false,
        error: 'Please register with a valid @gmail.com address.',
      };
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    return requestAuthOtp({
      purpose: 'signup',
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
    });
  }, [requestAuthOtp]);

  // Send password reset OTP via /api/auth/otp/send
  const sendPasswordResetEmail = useCallback(async (email) => {
    return requestAuthOtp({
      purpose: 'recovery',
      email,
    });
  }, [requestAuthOtp]);

  // Update password during recovery or while authenticated
  const updateUserPassword = useCallback(async (newPassword) => {
    const cleanPassword = (newPassword || '').trim();
    if (!cleanPassword || cleanPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: cleanPassword,
      });

      if (error) {
        return { success: false, error: formatSupabaseAuthError(error.message) };
      }

      setIsRecoveryMode(false);
      if (data?.user) {
        setUser(data.user);
      }
      return { success: true, user: data?.user };
    } catch (err) {
      return { success: false, error: err.message || 'Unable to update password.' };
    }
  }, [supabase]);

  const clearRecoveryMode = useCallback(() => {
    setIsRecoveryMode(false);
  }, []);

  // Sign Out
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[Auth] SignOut error:', err);
    } finally {
      setIsRecoveryMode(false);
      setUser(null);
      setProfile(null);
      setSession(null);
    }
  }, [supabase]);

  // Update profile name
  const updateName = useCallback(async (newName) => {
    if (!user || !newName?.trim()) return;
    try {
      const updated = await updateUserProfile(supabase, user.id, { name: newName.trim() });
      if (updated) {
        setProfile(updated);
      }
      return true;
    } catch (err) {
      console.error('[Auth] Failed to update profile name:', err);
      return false;
    }
  }, [supabase, user]);

  return (
    <AuthContext.Provider
      value={{
        supabase,
        user,
        profile,
        session,
        loading,
        isAdmin,
        isRecoveryMode,
        signInWithPassword,
        signInWithGoogle,
        signUpWithPassword,
        requestAuthOtp,
        verifyEmailOtp,
        completePasswordResetWithOtp,
        sendPasswordResetEmail,
        updateUserPassword,
        clearRecoveryMode,
        signOut,
        updateName,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
