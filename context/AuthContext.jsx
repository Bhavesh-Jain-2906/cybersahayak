'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getUserProfile, updateUserProfile } from '@/lib/supabase/db';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from database in background
  const refreshProfile = useCallback(async (userId) => {
    if (!userId || !supabase) {
      setProfile(null);
      return;
    }
    try {
      const data = await getUserProfile(supabase, userId);
      if (data) {
        setProfile(data);
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
            refreshProfile(initialSession.user.id);
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

    // Listen to auth events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      const currentUser = currentSession?.user || null;
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        refreshProfile(currentUser.id);
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

    if (!cleanEmail) {
      return { success: false, error: 'Email address is required.' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!cleanPassword) {
      return { success: false, error: 'Password is required.' };
    }
    if (cleanPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        let msg = error.message;
        if (msg.includes('Invalid login credentials')) {
          msg = 'Invalid email or password. Please verify your credentials or register a new account.';
        } else if (msg.includes('Email not confirmed')) {
          msg = 'Email address has not been confirmed. Please check your inbox or disable email confirmation in Supabase.';
        }
        return { success: false, error: msg };
      }

      setUser(data.user);
      setSession(data.session);
      if (data.user) {
        refreshProfile(data.user.id);
      }
      return { success: true, user: data.user, session: data.session };
    } catch (err) {
      return { success: false, error: err.message || 'An unexpected error occurred during sign in.' };
    }
  }, [supabase, refreshProfile]);

  // Sign Up with email and password
  const signUpWithPassword = useCallback(async ({ name, email, password }) => {
    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanName) {
      return { success: false, error: 'Full name is required.' };
    }
    if (!cleanEmail) {
      return { success: false, error: 'Email address is required.' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!cleanPassword) {
      return { success: false, error: 'Password is required.' };
    }
    if (cleanPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            name: cleanName,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
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
        refreshProfile(data.user.id);
        return { success: true, user: data.user, session: data.session };
      }

      return {
        success: true,
        user: data.user,
        message: 'Account created successfully! You can now sign in.',
      };
    } catch (err) {
      return { success: false, error: err.message || 'An unexpected error occurred during sign up.' };
    }
  }, [supabase, refreshProfile]);

  // Sign Out
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[Auth] SignOut error:', err);
    } finally {
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
        signInWithPassword,
        signUpWithPassword,
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
