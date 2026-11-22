'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  PhoneCall,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { APP_CONFIG } from '@/lib/constants';

export default function AuthScreen() {
  const { signInWithPassword, signUpWithPassword } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Auto-clear error when user modifies any input
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  // 1-Click Demo Sign In for instant access
  const handleQuickDemo = async () => {
    setErrorMessage('');
    setSuccessNotice('');
    setDemoLoading(true);

    try {
      const result = await signInWithPassword({
        email: 'demo.citizen@gmail.com',
        password: 'Password!123',
      });

      if (!result.success) {
        // If not created yet, try register then login
        const regResult = await signUpWithPassword({
          name: 'Demo Citizen',
          email: 'demo.citizen@gmail.com',
          password: 'Password!123',
        });
        if (!regResult.success) {
          setErrorMessage(regResult.error || 'Failed to sign in with demo account.');
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to initialize demo session.');
    } finally {
      setDemoLoading(false);
    }
  };

  // Validate and submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (mode === 'register') {
      const cleanName = name.trim();
      if (!cleanName) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (cleanName.length < 2) {
        setErrorMessage('Name must be at least 2 characters long.');
        return;
      }
    }

    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address (e.g., user@example.com).');
      return;
    }

    if (!cleanPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorMessage('Password must contain at least 6 characters.');
      return;
    }

    if (mode === 'register') {
      if (cleanPassword !== confirmPassword.trim()) {
        setErrorMessage('Passwords do not match. Please verify both fields.');
        return;
      }
    }

    setSubmitting(true);

    try {
      if (mode === 'login') {
        const result = await signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (!result.success) {
          setErrorMessage(result.error || 'Failed to sign in. Please verify your credentials.');
        }
      } else {
        const result = await signUpWithPassword({
          name: name.trim(),
          email: cleanEmail,
          password: cleanPassword,
        });

        if (!result.success) {
          setErrorMessage(result.error || 'Failed to create account.');
        } else if (result.message) {
          setSuccessNotice(result.message);
          setMode('login');
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start sm:justify-center p-3 sm:p-6 py-6 sm:py-10 bg-slate-950 text-slate-100 selection:bg-blue-600/30 selection:text-blue-200 relative overflow-y-auto">
      {/* Background glowing gradients */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container with vertical auto centering */}
      <div className="w-full max-w-md my-auto relative z-10 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white shadow-cool-blue mb-2.5">
            <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              CyberSahayak
            </h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.2)]">
              AI Guide
            </span>
          </div>
          <p className="text-xs text-blue-300/60 max-w-xs mx-auto">
            Secure Cybercrime Guidance, Threat Awareness & Immediate Action Platform
          </p>
        </div>

        {/* Card Box */}
        <div className="rounded-2xl bg-[#030612]/95 border border-blue-950/80 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(37,99,235,0.15)] p-5 sm:p-7 backdrop-blur-xl">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900/80 border border-blue-950/60 mb-4 sm:mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
                setSuccessNotice('');
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-cool-blue-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
                setSuccessNotice('');
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-blue-600 text-white shadow-cool-blue-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Success Banner */}
          {successNotice && (
            <div className="mb-3.5 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-3.5 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-blue-200/80 mb-1">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 absolute left-3.5 text-blue-400/60 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={handleInputChange(setName)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#060a17] border border-blue-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-blue-200/80 mb-1">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3.5 text-blue-400/60 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={handleInputChange(setEmail)}
                  placeholder="your.email@example.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#060a17] border border-blue-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-blue-200/80">
                  Password
                </label>
                {password.length > 0 && (
                  <span
                    className={`text-[10px] font-mono ${
                      password.length >= 6 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {password.length >= 6
                      ? `✓ ${password.length} chars (valid)`
                      : `${password.length}/6 chars (min 6)`}
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3.5 text-blue-400/60 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handleInputChange(setPassword)}
                  placeholder={mode === 'register' ? 'Minimum 6 characters' : 'Enter your password'}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  className="w-full pl-10 pr-10 py-2 text-xs rounded-xl bg-[#060a17] border border-blue-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-blue-300 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-blue-200/80">
                    Confirm Password
                  </label>
                  {confirmPassword.length > 0 && (
                    <span
                      className={`text-[10px] font-mono ${
                        password === confirmPassword ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {password === confirmPassword ? '✓ Passwords match' : 'Must match password'}
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <KeyRound className="w-4 h-4 absolute left-3.5 text-blue-400/60 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={handleInputChange(setConfirmPassword)}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#060a17] border border-blue-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || demoLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-cool-blue hover:shadow-cool-blue-lg active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{mode === 'login' ? 'Authenticating...' : 'Creating Account...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to CyberSahayak' : 'Create Protected Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="mt-4 pt-3.5 border-t border-blue-950/60">
            <button
              type="button"
              onClick={handleQuickDemo}
              disabled={submitting || demoLoading}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold hover:text-white transition-all disabled:opacity-50"
            >
              {demoLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  <span>Entering CyberSahayak Demo...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>⚡ 1-Click Demo Login (Immediate Access)</span>
                </>
              )}
            </button>
          </div>

          {/* Privacy & RLS Assurance */}
          <div className="mt-3.5 flex items-center justify-between text-[11px] text-blue-300/50">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Row-Level Security Active</span>
            </span>
            <span>Zero FIR Drafting</span>
          </div>
        </div>

        {/* Emergency National Helpline Badge */}
        <div className="mt-4 text-center pb-4">
          <a
            href={`tel:${APP_CONFIG.nationalHelpline}`}
            className="inline-flex items-center gap-1.5 text-xs text-amber-400/80 hover:text-amber-300 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Under active attack? Call <strong>1930</strong> National Helpline immediately</span>
          </a>
        </div>
      </div>
    </div>
  );
}
