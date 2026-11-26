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
const GMAIL_REGEX = /^[^\s@]+@(gmail|googlemail)\.com$/i;

function GoogleLogo() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
      />
    </svg>
  );
}

export default function AuthScreen() {
  const {
    signInWithPassword,
    signInWithGoogle,
    signUpWithPassword,
    resendVerificationEmail,
    sendPasswordResetEmail,
  } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');
  const [resetCooldown, setResetCooldown] = useState(0);
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

  // Read OAuth / callback query errors or ?mode=forgot cleanly
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const urlMode = params.get('mode');
    const authError = params.get('auth_error');

    if (urlMode === 'forgot') {
      setMode('forgot');
    }
    if (authError) {
      setErrorMessage(authError);
    }

    if (urlMode || authError) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Cooldown timer for resending password-reset links
  useEffect(() => {
    if (resetCooldown <= 0) return undefined;
    const timer = setTimeout(() => setResetCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resetCooldown]);

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
    setPendingVerificationEmail('');
  };

  // Launch Google OAuth ("Continue with Google")
  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setSuccessNotice('');
    setPendingVerificationEmail('');
    setGoogleSubmitting(true);

    try {
      const result = await signInWithGoogle();
      if (!result.success) {
        setErrorMessage(result.error || 'Could not launch Google Sign-In.');
        setGoogleSubmitting(false);
      }
      // On success, Supabase redirects to Google OAuth consent screen
    } catch (err) {
      setErrorMessage(err?.message || 'Unable to start Google Sign-In.');
      setGoogleSubmitting(false);
    }
  };

  // Resend Gmail confirmation email
  const handleResendVerification = async () => {
    const targetEmail = (pendingVerificationEmail || email).trim().toLowerCase();
    if (!targetEmail) return;
    setResendingEmail(true);
    setErrorMessage('');

    try {
      const result = await resendVerificationEmail(targetEmail);
      if (!result.success) {
        setErrorMessage(result.error || 'Could not resend verification email.');
      } else {
        setSuccessNotice(result.message);
      }
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to resend verification email.');
    } finally {
      setResendingEmail(false);
    }
  };

  // Validate and submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');
    setPendingVerificationEmail('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (mode === 'forgot') {
      if (!cleanEmail) {
        setErrorMessage('Please enter your registered Gmail address.');
        return;
      }
      if (!EMAIL_REGEX.test(cleanEmail)) {
        setErrorMessage('Please enter a valid Gmail address (e.g. name@gmail.com).');
        return;
      }

      setSubmitting(true);
      try {
        const result = await sendPasswordResetEmail(cleanEmail);
        if (!result.success) {
          setErrorMessage(result.error || 'Could not send reset link.');
        } else {
          setSuccessNotice(result.message);
          setResetCooldown(30);
        }
      } catch (err) {
        setErrorMessage(err?.message || 'Unexpected error sending reset email.');
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
        setErrorMessage('Please enter your Gmail address.');
        return;
      }

      if (!EMAIL_REGEX.test(cleanEmail)) {
        setErrorMessage('Please enter a valid Gmail address (e.g. name@gmail.com).');
        return;
      }

      if (mode === 'register' && !GMAIL_REGEX.test(cleanEmail)) {
        setErrorMessage(
          'Please register with a valid @gmail.com address, or click Continue with Google.'
        );
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
            setPendingVerificationEmail(result.email);
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
          setPendingVerificationEmail(cleanEmail);
          setPassword('');
          setConfirmPassword('');
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
                    ? 'Sign in with Google or your verified Gmail account.'
                    : mode === 'register'
                      ? 'Register with Google or a real @gmail.com address.'
                      : 'Enter your registered Gmail address to receive a secure password reset link.'}
                </p>
              </div>

              {/* Segmented Tab Switcher (Sign In / Create Account) */}
              {mode !== 'forgot' && (
                <div className="relative grid grid-cols-2 p-1 rounded-[8px] bg-[#0D0B12]/55 border border-white/[0.08] mb-4">
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

              {/* Google OAuth Button + Divider */}
              {mode !== 'forgot' && (
                <>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleSubmitting || submitting}
                    className="w-full h-[42px] px-4 rounded-[8px] bg-[#0D0B12]/60 hover:bg-[#1E172E]/80 border border-white/[0.14] hover:border-[#A855F7]/50 text-white font-medium text-xs sm:text-[13px] flex items-center justify-center gap-2.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C084FC]/60 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {googleSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#C084FC]" />
                        <span>Connecting to Google...</span>
                      </>
                    ) : (
                      <>
                        <GoogleLogo />
                        <span>Continue with Google</span>
                      </>
                    )}
                  </button>

                  <div className="relative my-4 flex items-center">
                    <div className="flex-grow border-t border-white/[0.08]" />
                    <span className="px-3 text-[10px] uppercase tracking-[0.14em] text-[#71717A] font-medium">
                      or continue with gmail
                    </span>
                    <div className="flex-grow border-t border-white/[0.08]" />
                  </div>
                </>
              )}

              {/* Success Banner */}
              {successNotice && (
                <div className="mb-3.5 p-3 rounded-[8px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1.5">
                    <p>{successNotice}</p>
                    {pendingVerificationEmail && (
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={resendingEmail}
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-200 hover:text-white underline underline-offset-2 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${resendingEmail ? 'animate-spin' : ''}`} />
                        <span>{resendingEmail ? 'Resending...' : 'Resend verification email'}</span>
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
                    {pendingVerificationEmail && (
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={resendingEmail}
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-red-100 hover:text-white underline underline-offset-2 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${resendingEmail ? 'animate-spin' : ''}`} />
                        <span>{resendingEmail ? 'Resending...' : 'Resend Gmail verification link'}</span>
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
                  <label
                    htmlFor="auth-email"
                    className="block text-xs font-medium text-white mb-1.5"
                  >
                    {mode === 'login' ? 'Gmail Address' : 'Real Gmail Address'}
                  </label>
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

                {mode !== 'forgot' && (
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
                          ? 'Encrypted Supabase session • Never share OTPs or PINs.'
                          : 'Use a strong, unique password with at least 6 characters.'}
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
                  disabled={submitting || googleSubmitting || (mode === 'forgot' && resetCooldown > 0)}
                  className="w-full mt-2 flex items-center justify-center gap-2 h-[42px] px-4 rounded-[8px] bg-[#F4F4F5] hover:bg-[#FAF5FF] text-[#09090B] font-medium text-xs sm:text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C084FC]/60 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#09090B]" />
                      <span>
                        {mode === 'login'
                          ? 'Verifying Session...'
                          : mode === 'register'
                            ? 'Setting Up Workspace...'
                            : 'Sending Reset Link...'}
                      </span>
                    </>
                  ) : mode === 'forgot' ? (
                    <span>
                      {resetCooldown > 0
                        ? `Resend Link in ${resetCooldown}s`
                        : successNotice
                          ? 'Resend Reset Link'
                          : 'Send Password Reset Link'}
                    </span>
                  ) : (
                    <span>{mode === 'login' ? 'Continue to Workspace' : 'Create Protected Account'}</span>
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
