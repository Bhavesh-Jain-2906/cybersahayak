'use client';

import React, { useState } from 'react';
import { User, Copy, Check } from 'lucide-react';
import { formatMessageTime } from '@/lib/dateUtils';

export default function UserMessage({ message }) {
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
          <span className="text-[11px] text-slate-400 dark:text-blue-300/40">
            {formatMessageTime(message.createdAt)}
          </span>
          <span className="text-xs font-semibold text-slate-700 dark:text-blue-200">
            You
          </span>
        </div>

        {/* Message Bubble with cool blue glow */}
        <div className="relative rounded-2xl rounded-tr-sm bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white px-4 py-3 text-sm leading-relaxed shadow-cool-blue">
          <p className="whitespace-pre-wrap break-words">{message.content}</p>

          {/* Copy Button */}
          <div className="absolute -bottom-6 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-blue-400/60 hover:text-slate-600 dark:hover:text-blue-200 p-1"
              title="Copy message"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-blue-400" />
                  <span className="text-blue-400">Copied</span>
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
      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-[#070d1a] border dark:border-blue-500/30 flex items-center justify-center text-slate-600 dark:text-blue-300 shrink-0 mt-5 shadow-cool-blue-xs">
        <User className="w-4 h-4" />
      </div>
    </div>
  );
}
