'use client';

import React, { useEffect } from 'react';
import {
  ShieldAlert,
  Plus,
  Search,
  X,
  PanelLeftClose,
  MessageSquare,
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
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
    activeView,
    setActiveView,
    quizStats,
    activeConversation,
  } = useChat();

  const { isAdmin } = useAuth();

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
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 flex flex-col h-full bg-white/45 dark:bg-[#06050B]/40 backdrop-blur-md border-r-0 transition-all duration-300 ease-in-out ${
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
        <div className="flex items-center justify-between p-4 border-b border-transparent">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 dark:from-[#2C1F42] dark:via-[#221834] dark:to-[#161122] dark:border dark:border-purple-400/30 text-white dark:text-purple-200 shadow-cool-blue dark:shadow-none shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm md:text-base tracking-tight text-slate-900 dark:text-white truncate">
                  Connor
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-500/15 dark:bg-purple-500/15 text-blue-400 dark:text-purple-200 border border-blue-500/30 dark:border-purple-400/25 shadow-[0_0_8px_rgba(59,130,246,0.2)] dark:shadow-none shrink-0">
                  AI Guide
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-tight truncate">
                Cybercrime Assistance & Safety
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Desktop collapse button */}
            <button
              onClick={toggleDesktopSidebar}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>

            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-white lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav aria-label="Main Navigation" className="px-3 pt-2 pb-2 space-y-1">
          <button
            onClick={() => {
              setActiveView('chat');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-all border ${
              activeView === 'chat'
                ? 'bg-white/80 dark:bg-[#241B35]/70 text-blue-700 dark:text-white border-blue-500/30 dark:border-purple-400/30 shadow-sm dark:shadow-none font-semibold'
                : 'border-transparent text-slate-700 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-blue-500 dark:text-purple-300 shrink-0" />
            <span className="truncate">AI Assistant</span>
            {activeConversation && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-purple-400 shrink-0 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => {
              setActiveView('dashboard');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-all border ${
              activeView === 'dashboard'
                ? 'bg-white/80 dark:bg-[#241B35]/70 text-blue-700 dark:text-white border-blue-500/30 dark:border-purple-400/30 shadow-sm dark:shadow-none font-semibold'
                : 'border-transparent text-slate-700 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-500 dark:text-purple-300 shrink-0" />
            <span className="truncate">Protection Hub</span>
          </button>

          <button
            onClick={() => {
              setActiveView('awareness');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-all border ${
              activeView === 'awareness'
                ? 'bg-white/80 dark:bg-[#241B35]/70 text-blue-700 dark:text-white border-blue-500/30 dark:border-purple-400/30 shadow-sm dark:shadow-none font-semibold'
                : 'border-transparent text-slate-700 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <span className="truncate">Cyber Awareness</span>
            <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 shrink-0">
              10
            </span>
          </button>

          <button
            onClick={() => {
              setActiveView('quiz');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-all border ${
              activeView === 'quiz'
                ? 'bg-white/80 dark:bg-[#241B35]/70 text-blue-700 dark:text-white border-blue-500/30 dark:border-purple-400/30 shadow-sm dark:shadow-none font-semibold'
                : 'border-transparent text-slate-700 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
            <span className="truncate">Safety Quiz</span>
            {quizStats?.completed && (
              <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20 shrink-0">
                {quizStats.score}/{quizStats.total}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveView('resources');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-all border ${
              activeView === 'resources'
                ? 'bg-white/80 dark:bg-[#241B35]/70 text-blue-700 dark:text-white border-blue-500/30 dark:border-purple-400/30 shadow-sm dark:shadow-none font-semibold'
                : 'border-transparent text-slate-700 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-cyan-500 dark:text-purple-300 shrink-0" />
            <span className="truncate">Help & Resources</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => {
                setActiveView('admin');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-all ${
                activeView === 'admin'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'text-amber-400/80 hover:bg-amber-500/10 hover:text-amber-300'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate font-semibold">Admin Console</span>
              <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ROOT
              </span>
            </button>
          )}
        </nav>

        {/* Conversations Header with New Chat */}
        <div className="px-3 pt-2 pb-1.5">
          <div className="border-t border-slate-300/60 dark:border-white/10 pt-2.5 flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider px-1">
            <span>Conversations</span>
            <button
              onClick={createNewChat}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-blue-500 dark:text-purple-300 transition-colors"
              title="New Chat (Ctrl+K)"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* New Chat Action Button */}
        <div className="px-3 pb-2">
          <button
            onClick={createNewChat}
            className="group flex items-center justify-between w-full px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 dark:bg-none dark:bg-[#231936]/75 dark:hover:bg-[#2E2146]/90 dark:border dark:border-purple-400/30 text-white font-medium text-xs shadow-cool-blue hover:shadow-cool-blue-lg dark:shadow-none transition-all duration-200 active:scale-[0.99]"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 dark:text-purple-200 transition-transform group-hover:rotate-90" />
              <span>New Conversation</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-white/20 dark:bg-white/10 rounded text-white/90 dark:text-purple-200">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Search Conversations Input */}
        <div className="px-3 pb-2">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400 dark:text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-white/70 dark:bg-[#0A0812]/60 border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-0 dark:focus:border-purple-400/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
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
