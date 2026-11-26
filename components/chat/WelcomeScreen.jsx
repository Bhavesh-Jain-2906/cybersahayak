'use client';

import React from 'react';
import {
  ShieldAlert,
  CreditCard,
  MailWarning,
  ShieldCheck,
  FileCheck2,
  SmartphoneNfc,
  UserX,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { SUGGESTED_QUESTIONS } from '@/lib/constants';
import { useChat } from '@/context/ChatContext';

const ICON_MAP = {
  CreditCard,
  MailWarning,
  ShieldAlert,
  FileCheck2,
  SmartphoneNfc,
  UserX,
};

export default function WelcomeScreen() {
  const { sendMessage } = useChat();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 flex flex-col items-center animate-fade-in">
      {/* Hero Badge & Icon */}
      <div className="relative mb-5">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 dark:from-[#2C1F42] dark:via-[#221834] dark:to-[#161122] dark:border dark:border-purple-400/30 flex items-center justify-center text-white dark:text-purple-200 shadow-cool-blue-xl dark:shadow-[0_12px_32px_rgba(0,0,0,0.65)] ring-8 ring-blue-500/20 dark:ring-purple-500/15">
          <ShieldAlert className="w-9 h-9 md:w-11 md:h-11" />
        </div>
        <div className="absolute -bottom-1 -right-1 p-1 bg-blue-500 dark:bg-purple-500 rounded-full ring-2 ring-white dark:ring-[#050507] shadow-[0_0_8px_rgba(59,130,246,0.8)] dark:shadow-none">
          <ShieldCheck className="w-3.5 h-3.5 text-white" />
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white text-center dark:drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
        Welcome to <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 dark:from-purple-200 dark:via-purple-300 dark:to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(59,130,246,0.4)] dark:drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">Connor</span>
      </h1>
      <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-zinc-300 text-center max-w-xl dark:drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
        Your intelligent assistant for understanding cyber threats, identifying online scams, securing compromised accounts, and preserving digital evidence.
      </p>

      {/* Privacy & Safety Guarantee Banner with smoked glass translucency */}
      <div className="mt-6 w-full max-w-2xl flex items-center gap-3 p-3.5 rounded-xl bg-slate-100/90 dark:bg-[#0B0914]/65 dark:backdrop-blur-md border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-zinc-300 shadow-sm dark:shadow-[0_12px_30px_rgba(0,0,0,0.55)]">
        <Lock className="w-5 h-5 text-blue-600 dark:text-purple-400 shrink-0" />
        <div className="leading-snug">
          <strong className="font-semibold text-slate-800 dark:text-white">
            Privacy & Safety First:
          </strong>{' '}
          Connor is an educational guidance companion. We will never ask for your passwords, OTPs, or UPI PINs.
        </div>
      </div>

      {/* Suggested Questions Section */}
      <div className="mt-8 w-full">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Common Cyber Scenarios & Questions
          </h3>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">Click any card to start</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {SUGGESTED_QUESTIONS.map((item, idx) => {
            const IconComponent = ICON_MAP[item.icon] || ShieldAlert;

            return (
              <button
                key={idx}
                onClick={() => sendMessage(item.prompt)}
                className="group relative flex flex-col text-left p-4 rounded-xl bg-white dark:bg-[#0B0914]/60 dark:backdrop-blur-md border border-slate-200 dark:border-white/10 hover:border-blue-500/50 dark:hover:border-purple-400/40 dark:hover:bg-[#141022]/75 shadow-sm dark:shadow-[0_10px_28px_rgba(0,0,0,0.5)] hover:shadow-md dark:hover:shadow-[0_14px_32px_rgba(0,0,0,0.7)] hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border border-blue-500/30 dark:border-purple-400/25 bg-blue-500/10 dark:bg-purple-500/15 text-blue-600 dark:text-purple-200">
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{item.category}</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 group-hover:text-blue-500 dark:group-hover:text-purple-300 group-hover:translate-x-1 transition-all" />
                </div>

                <h4 className="text-xs md:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-purple-200 transition-colors">
                  {item.title}
                </h4>

                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {item.prompt}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
