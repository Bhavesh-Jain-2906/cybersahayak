'use client';

import React from 'react';
import { Menu, Plus, PhoneCall, ExternalLink, PanelLeft } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { APP_CONFIG } from '@/lib/constants';

export default function ChatHeader() {
  const {
    activeConversation,
    createNewChat,
    setIsMobileSidebarOpen,
    isDesktopSidebarOpen,
    toggleDesktopSidebar,
  } = useChat();

  return (
    <header className="relative h-14 border-b border-slate-200/70 dark:border-white/10 bg-white/45 dark:bg-[#06050B]/35 backdrop-blur-md px-3 md:px-5 flex items-center justify-between gap-3 shrink-0 z-10 dark:shadow-none">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-purple-200/75 dark:hover:text-purple-100 hover:bg-slate-100 dark:hover:bg-purple-950/45 lg:hidden"
          aria-label="Open mobile sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Toggle Button (when collapsed) */}
        {!isDesktopSidebarOpen && (
          <button
            onClick={toggleDesktopSidebar}
            className="hidden lg:flex p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-purple-200/75 dark:hover:text-purple-100 hover:bg-slate-100 dark:hover:bg-purple-950/45 transition-colors"
            title="Open sidebar"
            aria-label="Open desktop sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        )}

        {/* Title */}
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-purple-50 truncate">
            {activeConversation ? activeConversation.title : 'New Cybercrime Guidance Chat'}
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-purple-200/55 hidden sm:block truncate">
            Confidential & Secure AI Cybersecurity Guide
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* National Cybercrime Helpline Badge */}
        <a
          href={`tel:${APP_CONFIG.nationalHelpline}`}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-colors shadow-sm dark:shadow-[0_0_12px_rgba(239,68,68,0.2)]"
          title="National Cyber Crime Reporting Helpline (India)"
        >
          <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
          <span>Helpline: {APP_CONFIG.nationalHelpline}</span>
        </a>

        {/* Official Portal Quick Link */}
        <a
          href={APP_CONFIG.officialPortal}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-slate-500 dark:text-purple-200/70 hover:text-blue-600 dark:hover:text-purple-100 hover:bg-slate-100 dark:hover:bg-purple-950/40 transition-colors"
          title="Visit official National Cyber Crime Reporting Portal"
        >
          <span>cybercrime.gov.in</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        <div className="h-4 w-px bg-slate-200 dark:bg-purple-500/20 hidden sm:block" />

        <ThemeToggle className="hidden sm:inline-flex" />

        {/* New chat icon button on header */}
        <button
          onClick={createNewChat}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-purple-200/75 dark:hover:text-purple-100 hover:bg-slate-100 dark:hover:bg-purple-950/45 transition-colors"
          title="Start new conversation"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
