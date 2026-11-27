'use client';

import React from 'react';
import { ShieldAlert, ShieldCheck, Lock } from 'lucide-react';

export default function WelcomeScreen() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-8 flex flex-col items-center justify-center animate-fade-in">
      {/* Hero Badge & Icon */}
      <div className="relative mb-5">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr from-[#6366F1] via-indigo-500 to-indigo-700 dark:from-[#2C1F42] dark:via-[#221834] dark:to-[#161122] dark:border dark:border-purple-400/30 flex items-center justify-center text-white dark:text-purple-200 shadow-[0_12px_28px_rgba(99,102,241,0.3)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.65)] ring-8 ring-[#6366F1]/15 dark:ring-purple-500/15">
          <ShieldAlert className="w-9 h-9 md:w-11 md:h-11" />
        </div>
        <div className="absolute -bottom-1 -right-1 p-1 bg-[#6366F1] dark:bg-purple-500 rounded-full ring-2 ring-white dark:ring-[#050507] shadow-[0_0_10px_rgba(99,102,241,0.7)] dark:shadow-none">
          <ShieldCheck className="w-3.5 h-3.5 text-white" />
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white text-center dark:drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
        Welcome to <span className="bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#312E81] dark:from-purple-200 dark:via-purple-300 dark:to-purple-400 bg-clip-text text-transparent dark:drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">Connor</span>
      </h1>
      <p className="mt-2 text-sm md:text-base text-slate-700 dark:text-zinc-300 text-center max-w-xl leading-relaxed dark:drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
        Your intelligent assistant for understanding cyber threats, identifying online scams, securing compromised accounts, and preserving digital evidence.
      </p>

      {/* Privacy & Safety Guarantee Banner */}
      <div className="mt-6 w-full max-w-2xl flex items-center gap-3 p-3.5 rounded-xl bg-white/90 dark:bg-[#0B0914]/65 backdrop-blur-xl border border-indigo-200/85 dark:border-white/10 text-xs text-slate-800 dark:text-zinc-300 shadow-[0_6px_22px_rgba(99,102,241,0.08)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.55)]">
        <Lock className="w-5 h-5 text-[#4F46E5] dark:text-purple-400 shrink-0" />
        <div className="leading-snug">
          <strong className="font-semibold text-indigo-950 dark:text-white">
            Privacy & Safety First:
          </strong>{' '}
          Connor is an educational guidance companion. We will never ask for your passwords, OTPs, or UPI PINs.
        </div>
      </div>
    </div>
  );
}
