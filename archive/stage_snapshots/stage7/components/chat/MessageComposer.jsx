'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, CornerDownLeft, ShieldCheck } from 'lucide-react';
import { useChat } from '@/context/ChatContext';

export default function MessageComposer() {
  const { sendMessage, isLoading, activeId } = useChat();
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // Focus textarea when conversation changes
  useEffect(() => {
    textareaRef.current?.focus();
  }, [activeId]);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    sendMessage(input.trim());
    setInput('');

    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 pb-3 pt-2">
      {/* Input box with cool blue glow */}
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col rounded-2xl bg-white dark:bg-[#03060f] border border-slate-200 dark:border-blue-900/40 shadow-lg dark:shadow-vanta-composer focus-within:border-blue-500/60 focus-within:dark:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/25 focus-within:dark:shadow-[0_12px_45px_-8px_rgba(0,0,0,0.95),0_0_30px_rgba(59,130,246,0.35)] transition-all duration-200"
      >
        <div className="flex items-end gap-2 p-3">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Ask CyberSahayak about online scams, suspicious links, hacked accounts, or evidence preservation..."
            className="flex-1 max-h-44 resize-none bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-blue-200/40 focus:outline-none leading-relaxed py-1 px-1 scrollbar-thin disabled:opacity-60"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all shrink-0 ${
              input.trim() && !isLoading
                ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-cool-blue hover:shadow-cool-blue-lg active:scale-95'
                : 'bg-slate-100 dark:bg-[#080e1c] text-slate-400 dark:text-blue-900/80 cursor-not-allowed border dark:border-blue-950/40'
            }`}
            title="Send message (Enter)"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Keyboard hints & safe notice */}
        <div className="flex items-center justify-between px-3.5 py-1.5 border-t border-slate-100 dark:border-blue-950/60 text-[11px] text-slate-400 dark:text-blue-300/50">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0 drop-shadow-[0_0_4px_rgba(59,130,246,0.6)]" />
            <span className="hidden sm:inline">Zero-Credential Policy: Never disclose PINs, OTPs or Passwords</span>
            <span className="sm:hidden">Never share OTPs or PINs</span>
          </div>

          <div className="hidden sm:flex items-center gap-1">
            <span>Enter to send</span>
            <CornerDownLeft className="w-2.5 h-2.5" />
            <span className="mx-0.5">•</span>
            <span>Shift+Enter for newline</span>
          </div>
        </div>
      </form>

      {/* Legal & Educational Disclaimer */}
      <p className="mt-2 text-center text-[11px] text-slate-400 dark:text-blue-300/40">
        CyberSahayak is an informational guidance tool. For active financial fraud, dial{' '}
        <span className="font-semibold text-slate-600 dark:text-blue-300">1930</span> or visit{' '}
        <a
          href="https://cybercrime.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-300"
        >
          cybercrime.gov.in
        </a>
        .
      </p>
    </div>
  );
}
