'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getUserProfile, updateUserProfile } from '@/lib/supabase/db';

const AuthContext = createContext(null);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

  // Sign In with email and password
  const signInWithPassword = useCallback(async ({ email, password }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    {
      if (!cleanEmail) {
        return { success: false, error: 'Email address is required.' };
      }
      if (!EMAIL_REGEX.test(cleanEmail)) {
        return { success: false, error: 'Please enter a valid Gmail address (e.g. name@gmail.com).' };
      }
      if (!cleanPassword) {
        return { success: false, error: 'Password is required.' };
      }
      if (cleanPassword.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        let msg = error.message;
        const needsEmailConfirmation = msg.includes('Email not confirmed');
        if (msg.includes('Invalid login credentials')) {
          msg = 'Invalid credentials. Please verify your Gmail and password.';
        } else if (needsEmailConfirmation) {
          msg = 'Your Gmail address is not verified yet. Please click the verification link in your inbox or resend it below.';
        }
        return { success: false, error: msg, needsEmailConfirmation, email: cleanEmail };
      }

      setIsRecoveryMode(false);
      setUser(data.user);
      setSession(data.session);
      if (data.user) {
        refreshProfile(data.user.id, data.user);
      }
      return { success: true, user: data.user, session: data.session };
    } catch (err) {
      return { success: false, error: err.message || 'An unexpected error occurred during sign in.' };
    }
  }, [supabase, refreshProfile]);

  // Sign In / Sign Up via real Google (Gmail) OAuth
  const signInWithGoogle = useCallback(async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // Preflight provider check so users aren't stranded on a raw GoTrue error JSON page
      if (supabaseUrl && supabaseAnonKey) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          const settingsRes = await fetch(`${supabaseUrl}/auth/v1/settings`, {
            headers: { apikey: supabaseAnonKey },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (settingsRes.ok) {
            const settings = await settingsRes.json();
            if (settings?.external?.google === false) {
              return {
                success: false,
                providerNotEnabled: true,
                error:
                  'Google Sign-In is not enabled in Supabase yet. Enable Google under Authentication → Providers in your Supabase Dashboard, or sign in with your Gmail & password below.',
              };
            }
          }
        } catch {
          // If preflight check fails due to transient network error, let signInWithOAuth proceed normally
        }
      }

      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        return { success: false, error: formatSupabaseAuthError(error.message) };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Unable to launch Google Sign-In.' };
    }
  }, [supabase]);

  // Sign Up with real Gmail and password
  const signUpWithPassword = useCallback(async ({ name, email, password }) => {
    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanName) {
      return { success: false, error: 'Full name is required.' };
    }
    if (!cleanEmail) {
      return { success: false, error: 'Gmail address is required.' };
    }
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid Gmail address.' };
    }
    if (!GMAIL_REGEX.test(cleanEmail)) {
      return {
        success: false,
        error: 'Please register with a valid @gmail.com address, or click Continue with Google.',
      };
    }
    if (!cleanPassword) {
      return { success: false, error: 'Password is required.' };
    }
    if (cleanPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    try {
      const emailRedirectTo = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          emailRedirectTo,
          data: {
            name: cleanName,
            role: 'user',
          },
        },
      });

      if (error) {
        return { success: false, error: formatSupabaseAuthError(error.message) };
      }

      // When email confirmation is enabled, Supabase returns an empty identities array for duplicate signups
      if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return {
          success: false,
          error: 'An account with this Gmail already exists. Try signing in or using Forgot Password.',
        };
      }

      if (data.session) {
        setUser(data.user);
        setSession(data.session);
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            name: cleanName,
            email: cleanEmail,
          });
        } catch {}
        refreshProfile(data.user.id, data.user);
        return { success: true, user: data.user, session: data.session };
      }

      return {
        success: true,
        requiresEmailVerification: true,
        email: cleanEmail,
        user: data.user,
        message: `Verification link sent to ${cleanEmail}. Check your Gmail inbox to activate your account, then sign in.`,
      };
    } catch (err) {
      return { success: false, error: err.message || 'An unexpected error occurred during sign up.' };
    }
  }, [supabase, refreshProfile]);

  // Resend Gmail signup confirmation link
  const resendVerificationEmail = useCallback(async (email) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid Gmail address first.' };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { success: false, error: formatSupabaseAuthError(error.message) };
      }

      return {
        success: true,
        message: `Verification link resent to ${cleanEmail}. Please check your Gmail inbox (and Spam/Promotions).`,
      };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to resend verification email.' };
    }
  }, [supabase]);

  // Send password reset email via Supabase PKCE recovery flow
  const sendPasswordResetEmail = useCallback(async (email) => {
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your registered Gmail address.' };
    }
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid Gmail address (e.g. name@gmail.com).' };
    }

    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=/auth/update-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo,
      });

      if (error) {
        return { success: false, error: formatSupabaseAuthError(error.message) };
      }

      return {
        success: true,
        message: `Password reset link sent to ${cleanEmail}. Open the link in your Gmail inbox (in this same browser) to set a new password.`,
      };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to send password reset email.' };
    }
  }, [supabase]);

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
        resendVerificationEmail,
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
