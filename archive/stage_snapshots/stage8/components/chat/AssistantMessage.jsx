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
  Cpu,
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
  const modelName = message?.metadata?.model;

  return (
    <div className="group flex justify-start gap-3 px-4 py-3 md:px-6">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-cool-blue-xs ring-1 ring-blue-400/30 mt-1">
        <ShieldAlert className="w-4 h-4 drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]" />
      </div>

      <div className="flex flex-col items-start max-w-3xl min-w-0 w-full">
        {/* Header line */}
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className="text-xs font-semibold text-slate-800 dark:text-blue-100">
            CyberSahayak
          </span>

          <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium shadow-[0_0_6px_rgba(59,130,246,0.15)]">
            <ShieldCheck className="w-2.5 h-2.5 text-blue-500" />
            AI Guide
          </span>

          {hasSources && (
            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-medium shadow-[0_0_6px_rgba(99,102,241,0.15)]">
              <BookOpen className="w-2.5 h-2.5 text-indigo-400" />
              RAG Verified
            </span>
          )}

          {modelName && !isDemo && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-slate-500/10 text-slate-500 dark:text-slate-400 font-mono">
              <Cpu className="w-2.5 h-2.5" />
              {modelName}
            </span>
          )}

          {isDemo && (
            <span className="inline-flex items-center text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-medium">
              Demo Mode
            </span>
          )}

          <span className="text-[11px] text-slate-400 dark:text-blue-300/40 ml-auto sm:ml-0">
            {formatMessageTime(message.createdAt)}
          </span>
        </div>

        {/* Message Card */}
        <div className="w-full rounded-2xl rounded-tl-sm bg-white dark:bg-[#030713] border border-slate-200 dark:border-blue-950/80 px-4 md:px-5 py-4 shadow-sm dark:shadow-vanta-card">
          <MarkdownRenderer content={message.content} />

          {/* RAG Knowledge References Accordion */}
          {hasSources && (
            <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-blue-950/60">
              <button
                onClick={() => setShowSources((prev) => !prev)}
                className="flex items-center justify-between w-full text-left text-xs font-medium text-slate-600 dark:text-blue-300/80 hover:text-blue-500 dark:hover:text-blue-300 transition-colors py-1"
              >
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
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
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#04091a] border border-slate-200/80 dark:border-blue-900/40 text-slate-700 dark:text-blue-100/90"
                    >
                      <div className="flex items-center justify-between font-semibold text-blue-600 dark:text-blue-400 text-[11px]">
                        <span>
                          {src.legalSection || 'Section'} — {src.act || 'IT Act'}
                        </span>
                        {src.score && (
                          <span className="text-[10px] text-slate-400 dark:text-blue-300/50 font-normal">
                            Match: {Math.round(src.score * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-slate-900 dark:text-slate-100 font-medium">
                        {src.offence}
                      </div>
                      <div className="mt-1 text-[10px] text-slate-500 dark:text-blue-300/60 flex items-center gap-2">
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
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-blue-950/60 flex items-center justify-between gap-2 text-[11px] text-slate-400 dark:text-blue-300/60">
            <div className="flex items-center gap-1.5 truncate">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 drop-shadow-[0_0_4px_rgba(245,158,11,0.4)]" />
              <span className="truncate">
                Emergency Helpline: Dial{' '}
                <a
                  href={`tel:${APP_CONFIG.nationalHelpline}`}
                  className="text-blue-600 dark:text-blue-400 font-semibold underline hover:text-blue-300"
                >
                  {APP_CONFIG.nationalHelpline}
                </a>{' '}
                or visit{' '}
                <a
                  href={APP_CONFIG.officialPortal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 font-semibold underline hover:text-blue-300"
                >
                  cybercrime.gov.in
                </a>
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700 dark:text-blue-400/60 dark:hover:text-blue-200 p-1 shrink-0"
              title="Copy response"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-blue-400" />
                  <span className="text-blue-400 font-medium">Copied</span>
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
