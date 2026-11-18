'use client';

import React from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import ChatArea from '@/components/chat/ChatArea';
import DashboardView from '@/components/dashboard/DashboardView';
import AwarenessView from '@/components/awareness/AwarenessView';
import QuizView from '@/components/quiz/QuizView';
import ResourcesView from '@/components/resources/ResourcesView';
import SettingsModal from '@/components/modals/SettingsModal';
import { useChat } from '@/context/ChatContext';

export default function HomePage() {
  const { activeView } = useChat();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 selection:bg-blue-600/30 selection:text-blue-200">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {activeView === 'chat' && <ChatArea />}
        {activeView === 'dashboard' && <DashboardView />}
        {activeView === 'awareness' && <AwarenessView />}
        {activeView === 'quiz' && <QuizView />}
        {activeView === 'resources' && <ResourcesView />}
      </main>

      {/* Settings & Profile Modal */}
      <SettingsModal />
    </div>
  );
}
