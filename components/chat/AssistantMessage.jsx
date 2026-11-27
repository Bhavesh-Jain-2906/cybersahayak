'use client';

import React, { useState, memo } from 'react';
import {
  ShieldAlert,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import { formatMessageTime } from '@/lib/dateUtils';
import { APP_CONFIG } from '@/lib/constants';

function AssistantMessage({ message }) {
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);

  const handleCopy = () => {
    if (!message?.content) return;
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasSources = Boolean(message?.retrievedSources && message.retrievedSources.length > 0);
  const isDemo = Boolean(message?.metadata?.isDemo);

  return (
    <div className="group flex justify-start gap-3 px-4 py-3 md:px-6">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6366F1] via-indigo-500 to-indigo-700 dark:from-[#2C1F42] dark:via-[#221834] dark:to-[#161122] text-white dark:text-purple-200 flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(99,102,241,0.28)] dark:shadow-none ring-1 ring-[#6366F1]/35 dark:ring-purple-400/30 mt-1">
        <ShieldAlert className="w-4 h-4" />
      </div>

      <div className="flex flex-col items-start max-w-3xl min-w-0 w-full">
        {/* Header line */}
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className="text-xs font-semibold text-slate-800 dark:text-zinc-100">
            Connor
          </span>

          <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded bg-[#6366F1]/10 dark:bg-purple-500/15 text-indigo-700 dark:text-purple-200 border border-[#6366F1]/25 dark:border-purple-400/25 font-medium">
            <ShieldCheck className="w-2.5 h-2.5 text-[#6366F1] dark:text-purple-300" />
            AI Guide
          </span>

          {hasSources && (
            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-[#6366F1]/10 dark:bg-purple-500/15 text-indigo-700 dark:text-purple-200 border border-[#6366F1]/25 dark:border-purple-400/25 font-medium">
              <BookOpen className="w-2.5 h-2.5 text-[#6366F1] dark:text-purple-300" />
              RAG Verified
            </span>
          )}

          {isDemo && (
            <span className="inline-flex items-center text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-medium">
              Demo Mode
            </span>
          )}

          <span className="text-[11px] text-slate-400 dark:text-zinc-400 ml-auto sm:ml-0">
            {formatMessageTime(message.createdAt)}
          </span>
        </div>

        {/* Message Card */}
        <div className="w-full rounded-2xl rounded-tl-sm bg-white/80 dark:bg-[#0B0914]/75 backdrop-blur-md border border-indigo-200/75 dark:border-white/10 px-4 md:px-5 py-4 shadow-[0_4px_18px_rgba(99,102,241,0.06)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.55)]">
          <MarkdownRenderer content={message.content} />

          {/* RAG Knowledge References Accordion */}
          {hasSources && (
            <div className="mt-3.5 pt-3 border-t border-indigo-100 dark:border-purple-500/15">
              <button
                onClick={() => setShowSources((prev) => !prev)}
                className="flex items-center justify-between w-full text-left text-xs font-medium text-slate-600 dark:text-purple-200/80 hover:text-[#6366F1] dark:hover:text-purple-200 transition-colors py-1"
              >
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#6366F1] dark:text-purple-400" />
                  <span>
                    Knowledge Base Citations ({message.retrievedSources.length} Legal{' '}
                    {message.retrievedSources.length === 1 ? 'Reference' : 'References'})
                  </span>
                </div>
                {showSources ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {showSources && (
                <div className="mt-2 space-y-2 text-xs">
                  {message.retrievedSources.map((src, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-indigo-50/55 dark:bg-[#110D1C]/75 border border-indigo-200/70 dark:border-purple-500/20 text-slate-700 dark:text-purple-100/90"
                    >
                      <div className="flex items-center justify-between font-semibold text-indigo-700 dark:text-purple-300 text-[11px]">
                        <span>
                          {src.legalSection || 'Section'} — {src.act || 'IT Act'}
                        </span>
                        {src.score && (
                          <span className="text-[10px] text-slate-400 dark:text-purple-200/55 font-normal">
                            Match: {Math.round(src.score * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-slate-900 dark:text-slate-100 font-medium">
                        {src.offence}
                      </div>
                      <div className="mt-1 text-[10px] text-slate-500 dark:text-purple-200/60 flex items-center gap-2">
                        {src.category && <span>Category: {src.category}</span>}
                        {src.page && <span>• Page {src.page}</span>}
                        <span>• Source: {src.source || 'cyber-law.pdf'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Emergency Safety Footer Reminder */}
          <div className="mt-4 pt-3 border-t border-indigo-100 dark:border-purple-500/15 flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-purple-200/60">
            <div className="flex items-center gap-1.5 truncate">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 drop-shadow-[0_0_4px_rgba(245,158,11,0.4)]" />
              <span className="truncate">
                Emergency Helpline: Dial{' '}
                <a
                  href={`tel:${APP_CONFIG.nationalHelpline}`}
                  className="text-[#6366F1] dark:text-purple-300 font-semibold underline hover:text-indigo-800 dark:hover:text-purple-200"
                >
                  {APP_CONFIG.nationalHelpline}
                </a>{' '}
                or visit{' '}
                <a
                  href={APP_CONFIG.officialPortal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6366F1] dark:text-purple-300 font-semibold underline hover:text-indigo-800 dark:hover:text-purple-200"
                >
                  cybercrime.gov.in
                </a>
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-indigo-700 dark:text-purple-300/65 dark:hover:text-purple-100 p-1 shrink-0"
              title="Copy response"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-[#6366F1] dark:text-purple-300" />
                  <span className="text-[#6366F1] dark:text-purple-300 font-medium">Copied</span>
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
    </div>
  );
}

export default memo(AssistantMessage);
