'use client';

import React from 'react';
import { Settings, ShieldCheck, User, LogOut } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function UserProfileSection() {
  const { setIsSettingsOpen, profileSettings } = useChat();
  const { user, profile, signOut } = useAuth();

  const displayName = profile?.name || user?.user_metadata?.name || profileSettings?.displayName || 'Digital Citizen';
  const displayEmail = user?.email || (profileSettings?.primaryBank ? `${profileSettings.primaryBank} User` : 'Protected Session');

  return (
    <div className="border-t border-slate-200 dark:border-blue-950/60 p-3 flex items-center justify-between gap-2 bg-slate-50/50 dark:bg-[#020409]">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-500 dark:text-blue-400 shrink-0 shadow-cool-blue-xs">
          <User className="w-4 h-4" />
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-black shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-slate-800 dark:text-blue-100 truncate">
              {displayName}
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0 drop-shadow-[0_0_4px_rgba(59,130,246,0.6)]" />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-blue-300/50 truncate">
            {displayEmail}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <ThemeToggle />
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-blue-300/70 dark:hover:text-blue-100 hover:bg-slate-200/60 dark:hover:bg-blue-950/50 transition-colors"
          title="Settings & Profile"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
        <button
          onClick={signOut}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 dark:text-blue-300/60 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
