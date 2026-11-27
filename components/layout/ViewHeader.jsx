'use client';

import React from 'react';
import { Menu, PanelLeft, PhoneCall, ExternalLink, Bot } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { APP_CONFIG } from '@/lib/constants';

export default function ViewHeader({ title, subtitle, icon: Icon, children }) {
  const {
    setIsMobileSidebarOpen,
    isDesktopSidebarOpen,
    toggleDesktopSidebar,
    setActiveView,
  } = useChat();

  return (
    <header className="h-14 border-b border-indigo-200/75 dark:border-blue-950/70 bg-white/85 dark:bg-black/90 backdrop-blur-md px-3 md:px-6 flex items-center justify-between gap-3 shrink-0 z-10 dark:shadow-[0_4px_25px_rgba(0,0,0,0.9)]">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 rounded-lg text-slate-500 hover:text-indigo-700 dark:text-blue-300/70 dark:hover:text-blue-100 hover:bg-indigo-50/80 dark:hover:bg-blue-950/50 lg:hidden"
          aria-label="Open mobile sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Toggle when collapsed */}
        {!isDesktopSidebarOpen && (
          <button
            onClick={toggleDesktopSidebar}
            className="hidden lg:flex p-2 rounded-lg text-slate-500 hover:text-indigo-700 dark:text-blue-300/70 dark:hover:text-blue-100 hover:bg-indigo-50/80 dark:hover:bg-blue-950/50 transition-colors"
            title="Open sidebar"
            aria-label="Open desktop sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        )}

        {/* Icon & Title */}
        <div className="flex items-center gap-2 min-w-0">
          {Icon && (
            <div className="hidden sm:flex items-center justify-center w-7 h-7 rounded-lg bg-[#6366F1]/10 dark:bg-blue-500/10 text-[#6366F1] dark:text-blue-400 border border-[#6366F1]/25 dark:border-blue-500/20 shrink-0">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-blue-100 truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[11px] text-slate-500 dark:text-blue-300/50 hidden md:block truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {children}

        {/* Quick Ask AI button if not currently on chat view */}
        <button
          onClick={() => setActiveView('chat')}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#6366F1]/10 hover:bg-[#6366F1]/20 dark:bg-blue-600/10 dark:hover:bg-blue-600/20 text-indigo-700 dark:text-blue-400 border border-[#6366F1]/30 dark:border-blue-500/30 text-xs font-semibold transition-colors"
          title="Open AI Assistant"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Ask AI</span>
        </button>

        {/* National Helpline Badge */}
        <a
          href={`tel:${APP_CONFIG.nationalHelpline}`}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-colors shadow-sm dark:shadow-[0_0_12px_rgba(239,68,68,0.2)]"
          title="National Cyber Crime Reporting Helpline (India)"
        >
          <PhoneCall className="w-3 h-3 animate-pulse" />
          <span className="font-mono">1930</span>
        </a>

        <ThemeToggle />
      </div>
    </header>
  );
}
