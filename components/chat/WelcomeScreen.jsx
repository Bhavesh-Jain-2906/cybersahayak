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
    <div className="max-w-4xl mx-auto px-4 py-5 md:py-7 flex flex-col items-center animate-fade-in">
      {/* Hero Badge & Icon */}
      <div className="relative mb-3.5">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-tr from-[#6366F1] via-indigo-500 to-indigo-700 dark:from-[#2C1F42] dark:via-[#221834] dark:to-[#161122] dark:border dark:border-purple-400/30 flex items-center justify-center text-white dark:text-purple-200 shadow-[0_12px_28px_rgba(99,102,241,0.3)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.65)] ring-8 ring-[#6366F1]/15 dark:ring-purple-500/15">
          <ShieldAlert className="w-8 h-8 md:w-9 md:h-9" />
        </div>
        <div className="absolute -bottom-1 -right-1 p-1 bg-[#6366F1] dark:bg-purple-500 rounded-full ring-2 ring-white dark:ring-[#050507] shadow-[0_0_10px_rgba(99,102,241,0.7)] dark:shadow-none">
          <ShieldCheck className="w-3 h-3 text-white" />
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white text-center dark:drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
        Welcome to <span className="bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#312E81] dark:from-purple-200 dark:via-purple-300 dark:to-purple-400 bg-clip-text text-transparent dark:drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">Connor</span>
      </h1>
      <p className="mt-1.5 text-sm md:text-[15px] text-slate-700 dark:text-zinc-300 text-center max-w-xl leading-relaxed dark:drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
        Your intelligent assistant for understanding cyber threats, identifying online scams, securing compromised accounts, and preserving digital evidence.
      </p>

      {/* Privacy & Safety Guarantee Banner with crisp frosted legibility */}
      <div className="mt-4 w-full max-w-2xl flex items-center gap-3 p-3.5 rounded-xl bg-white/90 dark:bg-[#0B0914]/65 backdrop-blur-xl border border-indigo-200/85 dark:border-white/10 text-xs text-slate-800 dark:text-zinc-300 shadow-[0_6px_22px_rgba(99,102,241,0.08)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.55)]">
        <Lock className="w-5 h-5 text-[#4F46E5] dark:text-purple-400 shrink-0" />
        <div className="leading-snug">
          <strong className="font-semibold text-indigo-950 dark:text-white">
            Privacy & Safety First:
          </strong>{' '}
          Connor is an educational guidance companion. We will never ask for your passwords, OTPs, or UPI PINs.
        </div>
      </div>

      {/* Suggested Questions Section */}
      <div className="mt-5 w-full">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-400">
            Common Cyber Scenarios & Questions
          </h3>
          <span className="text-[11px] font-medium text-slate-600 dark:text-zinc-500">Click any card to start</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SUGGESTED_QUESTIONS.map((item, idx) => {
            const IconComponent = ICON_MAP[item.icon] || ShieldAlert;

            return (
              <button
                key={idx}
                onClick={() => sendMessage(item.prompt)}
                className="group relative flex flex-col text-left p-4 rounded-xl bg-white/90 hover:bg-white dark:bg-[#0B0914]/60 dark:hover:bg-[#141022]/75 backdrop-blur-xl border border-indigo-200/85 dark:border-white/10 hover:border-[#6366F1] dark:hover:border-purple-400/40 shadow-[0_4px_16px_rgba(99,102,241,0.06)] dark:shadow-[0_10px_28px_rgba(0,0,0,0.5)] hover:shadow-[0_10px_26px_rgba(99,102,241,0.16)] dark:hover:shadow-[0_14px_32px_rgba(0,0,0,0.7)] hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border border-[#C7D2FE] dark:border-purple-400/25 bg-[#EEF2FF] dark:bg-purple-500/15 text-[#4338CA] dark:text-purple-200">
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{item.category}</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-500 group-hover:text-[#4F46E5] dark:group-hover:text-purple-300 group-hover:translate-x-1 transition-all" />
                </div>

                <h4 className="text-xs md:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-[#4338CA] dark:group-hover:text-purple-200 transition-colors">
                  {item.title}
                </h4>

                <p className="mt-1 text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
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
