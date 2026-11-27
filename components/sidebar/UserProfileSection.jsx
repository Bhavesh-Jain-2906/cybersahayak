'use client';

import React from 'react';
import { Settings, ShieldCheck, User, LogOut } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function UserProfileSection() {
  const { setIsSettingsOpen, profileSettings } = useChat();
  const { user, profile, signOut, isAdmin } = useAuth();

  const displayName = isAdmin
    ? 'System Administrator'
    : profile?.name ||
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      profileSettings?.displayName ||
      'Digital Citizen';
  const displayEmail = user?.email || (profileSettings?.primaryBank ? `${profileSettings.primaryBank} User` : 'Protected Session');

  return (
    <div className="border-t border-indigo-200/70 dark:border-white/10 p-3 flex items-center justify-between gap-2 bg-white/55 dark:bg-transparent">
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`relative flex items-center justify-center w-8 h-8 rounded-full shrink-0 shadow-[0_2px_10px_rgba(99,102,241,0.18)] dark:shadow-none ${
            isAdmin
              ? 'bg-amber-100 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-400'
              : 'bg-[#EEF2FF] dark:bg-purple-500/15 border border-[#C7D2FE] dark:border-purple-400/30 text-[#4F46E5] dark:text-purple-300'
          }`}
        >
          {isAdmin ? <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400" /> : <User className="w-4 h-4" />}
          <span
            className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ring-2 ring-white dark:ring-[#050507] ${
              isAdmin
                ? 'bg-amber-500 dark:bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]'
                : 'bg-[#6366F1] dark:bg-purple-400 shadow-[0_0_6px_rgba(99,102,241,0.85)] dark:shadow-[0_0_6px_rgba(168,85,247,0.8)]'
            }`}
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span
              className={`text-xs font-semibold truncate ${
                isAdmin ? 'text-amber-900 dark:text-amber-300' : 'text-slate-900 dark:text-zinc-100'
              }`}
            >
              {displayName}
            </span>
            {isAdmin ? (
              <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
                ADMIN
              </span>
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-[#6366F1] dark:text-purple-400 shrink-0" />
            )}
          </div>
          <p className="text-[11px] text-slate-600 dark:text-zinc-400 truncate">
            {displayEmail}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <ThemeToggle />
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-700 dark:text-zinc-400 dark:hover:text-white hover:bg-indigo-50/80 dark:hover:bg-white/10 transition-colors"
          title="Settings & Profile"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
        <button
          onClick={signOut}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
