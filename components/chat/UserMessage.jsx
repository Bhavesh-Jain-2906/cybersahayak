'use client';

import React, { useState, memo } from 'react';
import { User, Copy, Check } from 'lucide-react';
import { formatMessageTime } from '@/lib/dateUtils';

function UserMessage({ message }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!message?.content) return;
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group flex justify-end gap-3 px-4 py-3 md:px-6">
      <div className="flex flex-col items-end max-w-2xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">
            {formatMessageTime(message.createdAt)}
          </span>
          <span className="text-xs font-semibold text-slate-800 dark:text-zinc-100">
            You
          </span>
        </div>

        {/* Message Bubble */}
        <div className="relative rounded-2xl rounded-tr-sm bg-gradient-to-r from-[#6366F1] via-indigo-500 to-indigo-700 dark:bg-none dark:bg-[#231936]/80 dark:backdrop-blur-md dark:border dark:border-purple-400/25 text-white dark:text-zinc-100 px-4 py-3 text-sm leading-relaxed shadow-[0_8px_22px_rgba(99,102,241,0.28)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
          <p className="whitespace-pre-wrap break-words">{message.content}</p>

          {/* Copy Button */}
          <div className="absolute -bottom-6 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400 hover:text-indigo-700 dark:hover:text-white p-1"
              title="Copy message"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-[#6366F1] dark:text-purple-300" />
                  <span className="text-[#6366F1] dark:text-purple-300">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-[#161221]/80 border border-indigo-200 dark:border-white/15 flex items-center justify-center text-indigo-700 dark:text-purple-200 shrink-0 mt-5 shadow-[0_2px_10px_rgba(99,102,241,0.16)] dark:shadow-none">
        <User className="w-4 h-4" />
      </div>
    </div>
  );
}

export default memo(UserMessage);
