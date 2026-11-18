'use client';

import React from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import ChatArea from '@/components/chat/ChatArea';
import SettingsModal from '@/components/modals/SettingsModal';

export default function HomePage() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 selection:bg-blue-600/30 selection:text-blue-200">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Chat Area */}
      <ChatArea />

      {/* Settings Dialog */}
      <SettingsModal />
    </div>
  );
}
