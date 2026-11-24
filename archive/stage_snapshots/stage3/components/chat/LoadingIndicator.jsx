'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function LoadingIndicator() {
  return (
    <div className="flex justify-start gap-3 px-4 py-3 md:px-6 animate-fade-in">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-cool-blue-xs ring-1 ring-blue-400/30">
        <ShieldAlert className="w-4 h-4 animate-pulse drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]" />
      </div>

      <div className="flex flex-col items-start">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-semibold text-slate-800 dark:text-blue-100">
            CyberSahayak
          </span>
          <span className="text-[11px] text-slate-400 dark:text-blue-300/40">Processing...</span>
        </div>

        <div className="rounded-2xl rounded-tl-sm bg-white dark:bg-[#030713] border border-slate-200 dark:border-blue-950/80 px-4 py-3 shadow-sm dark:shadow-vanta-card flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-blue-200/70 font-medium">
            Formulating guidance
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}
