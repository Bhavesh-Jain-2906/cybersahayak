'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { APP_CONFIG } from '@/lib/constants';
import styles from './AuthScreen.module.css';

const NOIR_PURPLE_PARTICLES = [
  { bg: '#FAF5FF', glow: 'rgba(250, 245, 255, 0.5)' }, // off-white
  { bg: '#C084FC', glow: 'rgba(168, 85, 247, 0.5)' }, // soft amethyst purple
  { bg: '#A855F7', glow: 'rgba(147, 51, 234, 0.45)' }, // vibrant purple
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthScreen() {
  const {
    signInWithPassword,
    signInWithMagicLink,
    signUpWithPassword,
    resendVerificationEmail,
    sendPasswordResetEmail,
  } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'link'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [resendingConfirmation, setResendingConfirmation] = useState(false);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState('');
  const [linkCooldown, setLinkCooldown] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Refs for scoped ambient + interactive particle effects and sphere parallax
  const particlesContainerRef = useRef(null);
  const sphereParallaxRefs = useRef([]);

  useEffect(() => {
    const container = particlesContainerRef.current;
    if (!container) return undefined;

    let isMounted = true;
    const activeTimers = new Set();
    const particleCount = 120;
    let lastTrailTime = 0;

    const scheduleTimer = (fn, delayMs) => {
      const id = setTimeout(() => {
        activeTimers.delete(id);
        if (isMounted) fn();
      }, delayMs);
      activeTimers.add(id);
      return id;
    };

    const applyNoirPurpleTint = (particle) => {
      const tint = NOIR_PURPLE_PARTICLES[Math.floor(Math.random() * NOIR_PURPLE_PARTICLES.length)];
      particle.style.background = tint.bg;
      particle.style.boxShadow = `0 0 6px ${tint.glow}`;
    };

    const resetParticle = (particle) => {
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      particle.style.transition = 'none';
      particle.style.left = `${posX}%`;
      particle.style.top = `${posY}%`;
      particle.style.opacity = '0';
      return { x: posX, y: posY };
    };

    const animateParticle = (particle, isInitial = false) => {
      if (!isMounted) return;
      const pos = resetParticle(particle);
      const duration = Math.random() * 10 + 10; // 10-20s
      const delay = isInitial ? Math.random() * 1.5 : Math.random() * 4;

      scheduleTimer(() => {
        particle.style.transition = `all ${duration}s linear`;
        particle.style.opacity = String(Math.random() * 0.34 + 0.18);

        const moveX = pos.x + (Math.random() * 20 - 10);
        const moveY = pos.y - Math.random() * 30;

        particle.style.left = `${moveX}%`;
        particle.style.top = `${moveY}%`;

        scheduleTimer(() => {
          animateParticle(particle, false);
        }, duration * 1000);
      }, delay * 1000);
    };

    // Create 120 black-noir purple/white ambient particles
    for (let i = 0; i < particleCount; i += 1) {
      const particle = document.createElement('div');
      particle.className = styles.particle;
      const size = Math.random() * 3 + 1;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      applyNoirPurpleTint(particle);
      resetParticle(particle);
      container.appendChild(particle);
      animateParticle(particle, true);
    }

    // Interactive mouse-trail particles + subtle sphere parallax
    const handleMouseMove = (e) => {
      if (!isMounted) return;

      const now = Date.now();
      const moveX = (e.clientX / window.innerWidth - 0.5) * 14;
      const moveY = (e.clientY / window.innerHeight - 0.5) * 14;

      sphereParallaxRefs.current.forEach((layer, idx) => {
        if (!layer) return;
        const depthFactor = idx === 0 ? 1 : idx === 1 ? -0.8 : 0.6;
        layer.style.transform = `translate3d(${moveX * depthFactor}px, ${moveY * depthFactor}px, 0)`;
      });

      if (now - lastTrailTime < 28 || container.childElementCount > 185) {
        return;
      }
      lastTrailTime = now;

      const mouseX = (e.clientX / window.innerWidth) * 100;
      const mouseY = (e.clientY / window.innerHeight) * 100;

      const trailParticle = document.createElement('div');
      trailParticle.className = styles.particle;
      const size = Math.random() * 4 + 2;
      trailParticle.style.width = `${size}px`;
      trailParticle.style.height = `${size}px`;
      applyNoirPurpleTint(trailParticle);
      trailParticle.style.left = `${mouseX}%`;
      trailParticle.style.top = `${mouseY}%`;
      trailParticle.style.opacity = '0.6';
      container.appendChild(trailParticle);

      scheduleTimer(() => {
        trailParticle.style.transition = 'all 2s ease-out';
        trailParticle.style.left = `${mouseX + (Math.random() * 10 - 5)}%`;
        trailParticle.style.top = `${mouseY + (Math.random() * 10 - 5)}%`;
        trailParticle.style.opacity = '0';

        scheduleTimer(() => {
          trailParticle.remove();
        }, 2000);
      }, 10);
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      isMounted = false;
      document.removeEventListener('mousemove', handleMouseMove);
      activeTimers.forEach((id) => clearTimeout(id));
      activeTimers.clear();
      container.innerHTML = '';
    };
  }, []);

  // Read OAuth / callback query or hash errors and ?mode=forgot cleanly
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const urlMode = params.get('mode');
    const authError =
      params.get('auth_error') ||
      params.get('error_description') ||
      hashParams.get('error_description') ||
      hashParams.get('error');

    if (urlMode === 'forgot') {
      setMode('forgot');
    }
    if (authError) {
      const normalized = authError.toLowerCase();
      setErrorMessage(
        normalized.includes('invalid or has expired')
          ? 'This email link is invalid or was already used (some email apps pre-scan links). Please request a fresh link.'
          : authError
      );
    }

    if (urlMode || params.get('auth_error') || params.get('error_description') || hashParams.get('error')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Cooldown timer for resending confirmation, sign-in, or password-reset links
  useEffect(() => {
    if (linkCooldown <= 0) return undefined;
    const timer = setTimeout(() => setLinkCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [linkCooldown]);

  // Auto-clear error when user modifies any input
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  // Switch between login, registration, and forgot-password cleanly
  const switchMode = (targetMode) => {
    setMode(targetMode);
    setErrorMessage('');
    setSuccessNotice('');
    setPendingConfirmationEmail('');
  };

  // Toggle between Password login and One-Time Gmail Link login
  const switchLoginMethod = (method) => {
    setLoginMethod(method);
    setErrorMessage('');
    setSuccessNotice('');
    setPendingConfirmationEmail('');
  };

  // Resend one-time confirmation email for pending signup
  const handleResendConfirmation = async () => {
    const targetEmail = (pendingConfirmationEmail || email).trim().toLowerCase();
    if (!targetEmail || linkCooldown > 0) return;

    setResendingConfirmation(true);
    setErrorMessage('');

    try {
      const result = await resendVerificationEmail(targetEmail);
      if (!result.success) {
        setErrorMessage(result.error || 'Could not resend confirmation link.');
      } else {
        setSuccessNotice(result.message);
        setLinkCooldown(30);
      }
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to resend confirmation link.');
    } finally {
      setResendingConfirmation(false);
    }
  };

  // Validate and submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');
    setPendingConfirmationEmail('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (mode === 'forgot') {
      if (!cleanEmail) {
        setErrorMessage('Please enter your email address.');
        return;
      }
      if (!EMAIL_REGEX.test(cleanEmail)) {
        setErrorMessage('Please enter a valid email address (e.g. your.name@gmail.com).');
        return;
      }

      setSubmitting(true);
      try {
        const result = await sendPasswordResetEmail(cleanEmail);
        if (!result.success) {
          setErrorMessage(result.error || 'Could not send reset link.');
        } else {
          setSuccessNotice(result.message);
          setLinkCooldown(30);
        }
      } catch (err) {
        setErrorMessage(err?.message || 'Unexpected error sending reset email.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // One-time Gmail sign-in link mode (Magic Link)
    if (mode === 'login' && loginMethod === 'link') {
      if (!cleanEmail) {
        setErrorMessage('Please enter your email address.');
        return;
      }
      if (!EMAIL_REGEX.test(cleanEmail)) {
        setErrorMessage('Please enter a valid email address (e.g. your.name@gmail.com).');
        return;
      }

      setSubmitting(true);
      try {
        const result = await signInWithMagicLink(cleanEmail);
        if (!result.success) {
          setErrorMessage(result.error || 'Could not send one-time sign-in link.');
        } else {
          setSuccessNotice(result.message);
          setLinkCooldown(30);
        }
      } catch (err) {
        setErrorMessage(err?.message || 'Failed to send one-time sign-in link.');
      } finally {
        setSubmitting(false);
      }
      return;
    }
    {
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

      if (!EMAIL_REGEX.test(cleanEmail)) {
        setErrorMessage('Please enter a valid email address (e.g. your.name@gmail.com).');
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
          if (result.needsEmailConfirmation && result.email) {
            setPendingConfirmationEmail(result.email);
          }
        }
      } else {
        const result = await signUpWithPassword({
          name: name.trim(),
          email: cleanEmail,
          password: cleanPassword,
        });

        if (!result.success) {
          setErrorMessage(result.error || 'Failed to create account.');
        } else if (result.requiresEmailVerification) {
          setSuccessNotice(result.message);
          setPendingConfirmationEmail(result.email || cleanEmail);
          setLinkCooldown(30);
          setPassword('');
          setConfirmPassword('');
          setLoginMethod('password');
          setMode('login');
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
    <div className={`${styles.authRoot} selection:bg-[#9333EA]/35 selection:text-[#F3E8FF]`}>
      {/* Scoped 5-Layer Black Primary + Purple Secondary Animated Background */}
      <div className={styles.gradientBackground} aria-hidden="true">
        <div
          ref={(el) => {
            sphereParallaxRefs.current[0] = el;
          }}
          className={styles.sphereParallax}
        >
          <div className={`${styles.gradientSphere} ${styles.sphere1}`} />
        </div>
        <div
          ref={(el) => {
            sphereParallaxRefs.current[1] = el;
          }}
          className={styles.sphereParallax}
        >
          <div className={`${styles.gradientSphere} ${styles.sphere2}`} />
        </div>
        <div
          ref={(el) => {
            sphereParallaxRefs.current[2] = el;
          }}
          className={styles.sphereParallax}
        >
          <div className={`${styles.gradientSphere} ${styles.sphere3}`} />
        </div>
        <div className={styles.glow} />
        <div className={styles.gridOverlay} />
        <div className={styles.noiseOverlay} />
        <div ref={particlesContainerRef} className={styles.particlesContainer} />
      </div>

      {/* Main Responsive Split-Screen Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-6 sm:py-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-16 items-center">
          {/* Left Column: Cool-Purple Editorial Hero, Summary & Minimal Stat Bar */}
          <div className="order-1 lg:col-span-7 lg:self-start lg:pt-2 lg:pr-8 text-center lg:text-left animate-fade-in">
            {/* Minimal Eyebrow Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#9333EA]/[0.12] border border-[#A855F7]/25 backdrop-blur-md mb-6 sm:mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C084FC] animate-pulse" />
              <span className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#E9D5FF]">
                AI Cybercrime Guidance Platform
              </span>
            </div>

            <h1 className={`text-5xl sm:text-6xl lg:text-[4.25rem] xl:text-[4.75rem] font-extrabold tracking-tight leading-[1.05] ${styles.heroHeading}`}>
              {APP_CONFIG.name}
            </h1>

            {/* Subtle cool-purple horizontal accent rule */}
            <div className="w-20 h-[2px] rounded-full bg-gradient-to-r from-[#A855F7] via-[#C084FC] to-transparent mx-auto lg:mx-0 my-6 sm:my-7" />

            <p className={`text-lg sm:text-xl xl:text-[1.35rem] font-normal max-w-2xl mx-auto lg:mx-0 leading-[1.7] ${styles.heroSummary}`}>
              Calm, intelligent cybercrime triage built for speed and trust. Navigate UPI fraud,
              phishing threats, and compromised accounts with step-by-step guidance grounded in
              Indian cyber law—keeping your conversations private and your credentials strictly yours.
            </p>

            {/* Clean Hairline-Separated Metric Strip (Visible on sm+ & Desktop) */}
            <div className="mt-8 sm:mt-10 pt-6 border-t border-[#A855F7]/15 hidden sm:flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-10 max-w-2xl mx-auto lg:mx-0">
              <div>
                <div className="text-lg sm:text-xl font-bold text-[#E9D5FF] tracking-tight">53+</div>
                <div className="text-[11px] text-[#A1A1AA] uppercase tracking-wider mt-0.5">
                  IT Act Provisions
                </div>
              </div>
              <div className="hidden sm:block h-7 w-px bg-[#A855F7]/20" />
              <div>
                <div className="text-lg sm:text-xl font-bold text-[#E9D5FF] tracking-tight">6-Stage</div>
                <div className="text-[11px] text-[#A1A1AA] uppercase tracking-wider mt-0.5">
                  LangGraph Triage
                </div>
              </div>
              <div className="hidden sm:block h-7 w-px bg-[#A855F7]/20" />
              <div>
                <div className="text-lg sm:text-xl font-bold text-[#C084FC] tracking-tight">1930</div>
                <div className="text-[11px] text-[#A1A1AA] uppercase tracking-wider mt-0.5">
                  Golden Hour Ready
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Translucent Matte Card with Subtle Purple Tint & Visible Particles */}
          <div className="order-2 lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none animate-fade-in">
            <div className="relative overflow-hidden rounded-[14px] bg-gradient-to-b from-[#171320]/[0.45] to-[#111016]/[0.52] border border-[#A855F7]/25 shadow-[0_20px_50px_rgba(0,0,0,0.72),0_0_40px_rgba(147,51,234,0.08)] p-6 sm:p-7">
              {/* Subtle top hairline & soft corner ambient wash inside the card */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C084FC]/55 to-transparent"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#9333EA]/[0.12] blur-3xl"
              />
              {/* Editorial Header Microcopy */}
              <div className="relative mb-5">
                {mode === 'forgot' && (
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#C084FC] hover:text-[#E9D5FF] mb-3 transition-colors focus:outline-none"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                )}

                <h2 className="text-lg sm:text-xl font-semibold text-white tracking-[-0.02em]">
                  {mode === 'login'
                    ? 'Welcome back'
                    : mode === 'register'
                      ? 'Create your safe space'
                      : 'Reset your password'}
                </h2>
                <p className="text-xs text-[#A1A1AA] mt-1">
                  {mode === 'login'
                    ? loginMethod === 'link'
                      ? 'Sign in securely using a one-time link emailed to your inbox.'
                      : 'Sign in with password or switch to a one-time Gmail link.'
                    : mode === 'register'
                      ? 'Create an account and confirm your email via a one-time Gmail link.'
                      : 'Enter your registered email address and we will send a password reset link.'}
                </p>
              </div>

              {/* Segmented Tab Switcher (Translucent Dark Recess + Subtle Plum Active Tab) */}
              {mode !== 'forgot' && (
                <div className="relative grid grid-cols-2 p-1 rounded-[8px] bg-[#0D0B12]/55 border border-white/[0.08] mb-5">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className={`py-2 text-xs rounded-[6px] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#C084FC]/50 ${
                      mode === 'login'
                        ? 'bg-[#261E35]/75 text-white font-semibold border border-[#A855F7]/30'
                        : 'text-[#A1A1AA] hover:text-white font-medium border border-transparent'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className={`py-2 text-xs rounded-[6px] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#C084FC]/50 ${
                      mode === 'register'
                        ? 'bg-[#261E35]/75 text-white font-semibold border border-[#A855F7]/30'
                        : 'text-[#A1A1AA] hover:text-white font-medium border border-transparent'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              )}

              {/* Success Banner */}
              {successNotice && (
                <div className="mb-3.5 p-3 rounded-[8px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1.5">
                    <p>{successNotice}</p>
                    {pendingConfirmationEmail && (
                      <button
                        type="button"
                        onClick={handleResendConfirmation}
                        disabled={resendingConfirmation || linkCooldown > 0}
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-200 hover:text-white underline underline-offset-2 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${resendingConfirmation ? 'animate-spin' : ''}`} />
                        <span>
                          {resendingConfirmation
                            ? 'Resending...'
                            : linkCooldown > 0
                              ? `Resend confirmation link in ${linkCooldown}s`
                              : 'Resend confirmation link'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Error Banner */}
              {errorMessage && (
                <div className="mb-3.5 p-3 rounded-[8px] bg-red-500/15 border border-red-500/35 text-red-200 text-xs flex items-start gap-2.5 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1.5">
                    <p>{errorMessage}</p>
                    {pendingConfirmationEmail && (
                      <button
                        type="button"
                        onClick={handleResendConfirmation}
                        disabled={resendingConfirmation || linkCooldown > 0}
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-red-100 hover:text-white underline underline-offset-2 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${resendingConfirmation ? 'animate-spin' : ''}`} />
                        <span>
                          {resendingConfirmation
                            ? 'Resending...'
                            : linkCooldown > 0
                              ? `Resend confirmation link in ${linkCooldown}s`
                              : 'Resend confirmation link'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label
                      htmlFor="auth-name"
                      className="block text-xs font-medium text-white mb-1.5"
                    >
                      Full Name
                    </label>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 absolute left-3.5 text-[#71717A] pointer-events-none" />
                      <input
                        id="auth-name"
                        type="text"
                        value={name}
                        onChange={handleInputChange(setName)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full pl-10 pr-4 py-2.5 text-xs rounded-[8px] bg-[#0D0B12]/55 border border-white/[0.12] text-white placeholder-[#71717A] focus:outline-none focus:ring-0 focus:border-[#A855F7]/65 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="auth-email"
                      className="block text-xs font-medium text-white"
                    >
                      Email Address
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => switchLoginMethod(loginMethod === 'password' ? 'link' : 'password')}
                        className="text-[11px] font-medium text-[#C084FC] hover:text-[#E9D5FF] transition-colors focus:outline-none"
                      >
                        {loginMethod === 'password' ? 'Use one-time Gmail link' : 'Use password instead'}
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 absolute left-3.5 text-[#71717A] pointer-events-none" />
                    <input
                      id="auth-email"
                      type="text"
                      inputMode="email"
                      value={email}
                      onChange={handleInputChange(setEmail)}
                      placeholder="your.name@gmail.com"
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-[8px] bg-[#0D0B12]/55 border border-white/[0.12] text-white placeholder-[#71717A] focus:outline-none focus:ring-0 focus:border-[#A855F7]/65 transition-colors"
                    />
                  </div>
                </div>

                {(mode === 'register' || (mode === 'login' && loginMethod === 'password')) && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="auth-password"
                        className="block text-xs font-medium text-white"
                      >
                        Password
                      </label>
                      {mode === 'login' ? (
                        <button
                          type="button"
                          onClick={() => switchMode('forgot')}
                          className="text-[11px] font-medium text-[#C084FC] hover:text-[#E9D5FF] transition-colors focus:outline-none focus-visible:underline"
                        >
                          Forgot password?
                        </button>
                      ) : (
                        password.length > 0 && (
                          <span
                            className={`text-[10px] font-mono ${
                              password.length >= 6 ? 'text-emerald-400' : 'text-[#A1A1AA]'
                            }`}
                          >
                            {password.length >= 6
                              ? `✓ ${password.length} chars (valid)`
                              : `${password.length}/6 chars (min 6)`}
                          </span>
                        )
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 absolute left-3.5 text-[#71717A] pointer-events-none" />
                      <input
                        id="auth-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={handleInputChange(setPassword)}
                        placeholder={mode === 'register' ? 'Minimum 6 characters' : 'Enter your password'}
                        autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                        className="w-full pl-10 pr-10 py-2.5 text-xs rounded-[8px] bg-[#0D0B12]/55 border border-white/[0.12] text-white placeholder-[#71717A] focus:outline-none focus:ring-0 focus:border-[#A855F7]/65 transition-colors"
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-[#A1A1AA] hover:text-[#D8B4FE] transition-colors p-1 focus:outline-none focus-visible:text-[#D8B4FE]"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1.5">
                      <p className="text-[11px] text-[#71717A]">
                        {mode === 'login'
                          ? 'Encrypted Supabase session • Never share banking OTPs or PINs.'
                          : 'A one-time confirmation link will be emailed to verify your inbox.'}
                      </p>
                      {mode === 'login' &&
                        password.length > 0 &&
                        email.trim().toLowerCase() !== 'admin' && (
                          <span
                            className={`text-[10px] font-mono shrink-0 ${
                              password.length >= 6 ? 'text-emerald-400' : 'text-[#A1A1AA]'
                            }`}
                          >
                            {password.length >= 6 ? '✓ valid' : `${password.length}/6`}
                          </span>
                        )}
                    </div>
                  </div>
                )}

                {mode === 'login' && loginMethod === 'link' && (
                  <div className="flex items-center justify-between text-[11px] text-[#71717A]">
                    <span>Open the one-time link in Gmail (same browser) to sign in.</span>
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="font-medium text-[#C084FC] hover:text-[#E9D5FF] shrink-0 ml-2 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {mode === 'register' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="auth-confirm-password"
                        className="block text-xs font-medium text-white"
                      >
                        Confirm Password
                      </label>
                      {confirmPassword.length > 0 && (
                        <span
                          className={`text-[10px] font-mono ${
                            password === confirmPassword ? 'text-emerald-400' : 'text-[#A1A1AA]'
                          }`}
                        >
                          {password === confirmPassword ? '✓ Passwords match' : 'Must match password'}
                        </span>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <KeyRound className="w-4 h-4 absolute left-3.5 text-[#71717A] pointer-events-none" />
                      <input
                        id="auth-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={handleInputChange(setConfirmPassword)}
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                        className="w-full pl-10 pr-4 py-2.5 text-xs rounded-[8px] bg-[#0D0B12]/55 border border-white/[0.12] text-white placeholder-[#71717A] focus:outline-none focus:ring-0 focus:border-[#A855F7]/65 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    ((mode === 'forgot' || (mode === 'login' && loginMethod === 'link')) && linkCooldown > 0)
                  }
                  className="w-full mt-2 flex items-center justify-center gap-2 h-[42px] px-4 rounded-[8px] bg-[#F4F4F5] hover:bg-[#FAF5FF] text-[#09090B] font-medium text-xs sm:text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C084FC]/60 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#09090B]" />
                      <span>
                        {mode === 'forgot'
                          ? 'Sending Reset Link...'
                          : mode === 'login' && loginMethod === 'link'
                            ? 'Sending Sign-In Link...'
                            : mode === 'login'
                              ? 'Verifying Session...'
                              : 'Sending Confirmation Link...'}
                      </span>
                    </>
                  ) : mode === 'forgot' ? (
                    <span>
                      {linkCooldown > 0
                        ? `Resend Link in ${linkCooldown}s`
                        : successNotice
                          ? 'Resend Reset Link'
                          : 'Send Password Reset Link'}
                    </span>
                  ) : mode === 'login' && loginMethod === 'link' ? (
                    <span>
                      {linkCooldown > 0
                        ? `Resend Link in ${linkCooldown}s`
                        : successNotice
                          ? 'Resend One-Time Link'
                          : 'Send One-Time Gmail Link'}
                    </span>
                  ) : (
                    <span>{mode === 'login' ? 'Continue to Workspace' : 'Create Account & Send Link'}</span>
                  )}
                </button>
              </form>

              {/* Clean Monochrome Switch Link with Subtle Purple Accent */}
              <div className="mt-4 text-center">
                {mode === 'forgot' ? (
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-xs text-[#A1A1AA] hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#C084FC]/50 rounded px-1"
                  >
                    Remembered your password?{' '}
                    <span className="text-[#C084FC] hover:text-[#D8B4FE] font-medium underline-offset-4 hover:underline transition-colors">
                      Back to Sign In
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                    className="text-xs text-[#A1A1AA] hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#C084FC]/50 rounded px-1"
                  >
                    {mode === 'login' ? (
                      <>
                        New here?{' '}
                        <span className="text-[#C084FC] hover:text-[#D8B4FE] font-medium underline-offset-4 hover:underline transition-colors">
                          Create an account
                        </span>
                      </>
                    ) : (
                      <>
                        Already have an account?{' '}
                        <span className="text-[#C084FC] hover:text-[#D8B4FE] font-medium underline-offset-4 hover:underline transition-colors">
                          Sign in instead
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Privacy & RLS Assurance */}
              <div className="mt-4 pt-3.5 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-[#A1A1AA]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C084FC]" />
                  <span>Row-Level Security Active</span>
                </span>
                <span>Zero FIR Drafting</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
