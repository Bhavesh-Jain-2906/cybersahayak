'use client';

import React, { useState } from 'react';
import {
  X,
  Moon,
  Sun,
  Trash2,
  Download,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useTheme } from '@/context/ThemeContext';
import { APP_CONFIG } from '@/lib/constants';

export default function SettingsModal() {
  const { isSettingsOpen, setIsSettingsOpen, conversations, clearAllConversations } = useChat();
  const { theme, setTheme } = useTheme();
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isSettingsOpen) return null;

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(conversations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cybersahayak-chats-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClearAll = () => {
    clearAllConversations();
    setConfirmClear(false);
    setIsSettingsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#030610] border border-slate-200 dark:border-blue-900/50 shadow-2xl dark:shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(37,99,235,0.25)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-blue-950/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400 shadow-cool-blue-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              Settings & Preferences
            </h3>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-blue-200"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6 text-sm">
          {/* Appearance */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-blue-300/60 mb-3">
              Appearance
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border font-medium text-xs md:text-sm transition-all ${
                  theme === 'dark'
                    ? 'border-blue-500 bg-blue-500/15 text-blue-300 font-semibold shadow-cool-blue-xs'
                    : 'border-slate-200 dark:border-blue-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-blue-950/40'
                }`}
              >
                <Moon className="w-4 h-4 text-blue-400" />
                <span>Vanta Black & Blue</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border font-medium text-xs md:text-sm transition-all ${
                  theme === 'light'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-700 font-semibold shadow-sm'
                    : 'border-slate-200 dark:border-blue-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-blue-950/40'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light Professional</span>
              </button>
            </div>
          </div>

          {/* Privacy & Data Management */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-blue-300/60 mb-3">
              Data & Privacy
            </h4>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#060a17] border border-slate-200 dark:border-blue-950 text-xs">
                <div>
                  <div className="font-medium text-slate-800 dark:text-blue-100">
                    Saved Conversations
                  </div>
                  <div className="text-slate-400 dark:text-blue-300/40">
                    {conversations.length} conversation{conversations.length === 1 ? '' : 's'} stored locally in browser
                  </div>
                </div>

                <button
                  onClick={handleExportData}
                  disabled={conversations.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-blue-900/60 text-slate-700 dark:text-blue-200 hover:bg-white dark:hover:bg-blue-950/50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
              </div>

              {confirmClear ? (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs space-y-2 shadow-sm">
                  <p className="font-semibold text-red-600 dark:text-red-400">
                    Are you sure you want to permanently delete all conversations?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleClearAll}
                      className="px-3 py-1 rounded bg-red-600 text-white font-medium hover:bg-red-700 text-xs shadow-sm"
                    >
                      Yes, Clear All
                    </button>
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  disabled={conversations.length === 0}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-red-300 dark:border-red-950/80 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Conversation History</span>
                </button>
              )}
            </div>
          </div>

          {/* About & Official Resources */}
          <div className="pt-2 border-t border-slate-200 dark:border-blue-950/70">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-blue-300/60 mb-2">
              Official Indian Reporting Channels
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-blue-200/70">
              <li className="flex items-center justify-between">
                <span>National Cybercrime Helpline:</span>
                <a
                  href={`tel:${APP_CONFIG.nationalHelpline}`}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  1930
                </a>
              </li>
              <li className="flex items-center justify-between">
                <span>Cybercrime Reporting Portal:</span>
                <a
                  href={APP_CONFIG.officialPortal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  cybercrime.gov.in <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li className="flex items-center justify-between">
                <span>RBI Sachet Financial Fraud:</span>
                <a
                  href={APP_CONFIG.rbiSachetPortal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  sachet.rbi.org.in <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-blue-950/70 bg-slate-50 dark:bg-[#020409] flex items-center justify-between text-[11px] text-slate-400 dark:text-blue-300/40">
          <span>CyberSahayak v{APP_CONFIG.version}</span>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-blue-950 text-slate-700 dark:text-blue-200 font-medium hover:bg-slate-300 dark:hover:bg-blue-900 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
