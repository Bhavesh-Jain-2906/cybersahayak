'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function LoadingIndicator() {
  return (
    <div className="flex justify-start gap-3 px-4 py-3 md:px-6 animate-fade-in">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6366F1] via-indigo-500 to-indigo-700 dark:from-[#2C1F42] dark:via-[#221834] dark:to-[#161122] text-white dark:text-purple-200 flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(99,102,241,0.28)] dark:shadow-none ring-1 ring-[#6366F1]/35 dark:ring-purple-400/30">
        <ShieldAlert className="w-4 h-4 animate-pulse" />
      </div>

      <div className="flex flex-col items-start">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-semibold text-slate-800 dark:text-zinc-100">
            Connor
          </span>
          <span className="text-[11px] text-slate-400 dark:text-zinc-400">Processing...</span>
        </div>

        <div className="rounded-2xl rounded-tl-sm bg-white/80 dark:bg-[#0B0914]/75 backdrop-blur-md border border-indigo-200/75 dark:border-white/10 px-4 py-3 shadow-[0_4px_16px_rgba(99,102,241,0.08)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.55)] flex items-center gap-2">
          <span className="text-xs text-slate-600 dark:text-zinc-300 font-medium">
            Formulating guidance
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] dark:bg-purple-400 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] dark:bg-purple-400 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] dark:bg-purple-400 animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}
