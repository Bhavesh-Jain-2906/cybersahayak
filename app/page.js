'use client';

import React from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';
import Sidebar from '@/components/sidebar/Sidebar';
import ChatArea from '@/components/chat/ChatArea';
import DashboardView from '@/components/dashboard/DashboardView';
import AwarenessView from '@/components/awareness/AwarenessView';
import QuizView from '@/components/quiz/QuizView';
import ResourcesView from '@/components/resources/ResourcesView';
import AdminConsoleView from '@/components/admin/AdminConsoleView';
import SettingsModal from '@/components/modals/SettingsModal';
import AuthScreen from '@/components/auth/AuthScreen';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { activeView } = useChat();
  const { user, loading } = useAuth();

  // Loading state while checking auth session (with fallback styles)
  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen w-full bg-black text-white"
        style={{ backgroundColor: '#030612', color: '#ffffff' }}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mb-4 animate-pulse">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-sm text-blue-200">
          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          <span>Verifying CyberSahayak secure session...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, require login/registration
  if (!user) {
    return <AuthScreen />;
  }

  // Authenticated application
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
        {activeView === 'admin' && <AdminConsoleView />}
      </main>

      {/* Settings & Profile Modal */}
      <SettingsModal />
    </div>
  );
}
