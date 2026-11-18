'use client';

import React, { useEffect } from 'react';
import { ShieldAlert, Plus, Search, X, PanelLeftClose } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import ChatHistoryList from './ChatHistoryList';
import UserProfileSection from './UserProfileSection';

export default function Sidebar() {
  const {
    createNewChat,
    searchQuery,
    setSearchQuery,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    isDesktopSidebarOpen,
    toggleDesktopSidebar,
  } = useChat();

  // Keyboard shortcut listener for Ctrl+K / Cmd+K to start New Chat
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        createNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createNewChat]);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 flex flex-col h-full bg-slate-100 dark:bg-[#03060d] border-r border-slate-200 dark:border-blue-950/70 dark:shadow-[8px_0_35px_rgba(0,0,0,0.95)] transition-all duration-300 ease-in-out ${
          isMobileSidebarOpen
            ? 'w-72 md:w-80 translate-x-0 shadow-2xl'
            : '-translate-x-full lg:translate-x-0'
        } ${
          isDesktopSidebarOpen
            ? 'lg:w-72 md:lg:w-80 lg:opacity-100'
            : 'lg:w-0 lg:opacity-0 lg:pointer-events-none lg:border-r-0 lg:overflow-hidden'
        }`}
      >
        {/* Header / Brand */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-blue-950/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white shadow-cool-blue shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm md:text-base tracking-tight text-slate-900 dark:text-white truncate">
                  CyberSahayak
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.2)] shrink-0">
                  AI Guide
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-blue-300/60 leading-tight truncate">
                Cybercrime Assistance & Safety
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Desktop collapse button */}
            <button
              onClick={toggleDesktopSidebar}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-blue-300 hover:bg-slate-200/60 dark:hover:bg-blue-950/50 transition-colors"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>

            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-blue-300 lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* New Chat Action */}
        <div className="p-3">
          <button
            onClick={createNewChat}
            className="group flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs md:text-sm shadow-cool-blue hover:shadow-cool-blue-lg transition-all duration-200 active:scale-[0.99]"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
              <span>New Chat</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white/20 rounded text-white/90 shadow-sm">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Search Conversations Input */}
        <div className="px-3 pb-2">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400 dark:text-blue-400/60 pointer-events-none" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-white dark:bg-[#060a14] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-blue-300/40 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:dark:shadow-[0_0_12px_rgba(59,130,246,0.3)] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-blue-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Chat History List */}
        <div className="flex-1 overflow-y-auto px-3 scrollbar-thin">
          <ChatHistoryList />
        </div>

        {/* User Profile & Settings Footer */}
        <UserProfileSection />
      </aside>
    </>
  );
}
