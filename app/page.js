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
import UpdatePasswordView from '@/components/auth/UpdatePasswordView';
import BlackHoleBackground from '@/components/chat/BlackHoleBackground';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { activeView } = useChat();
  const { user, loading, isRecoveryMode } = useAuth();

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
          <span>Verifying Connor secure session...</span>
        </div>
      </div>
    );
  }

  // If in Supabase password-recovery flow, display Update Password view
  if (isRecoveryMode) {
    return <UpdatePasswordView />;
  }

  // If not authenticated, require login/registration
  if (!user) {
    return <AuthScreen />;
  }

  // Authenticated application
  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-white dark:bg-[#050507] text-slate-900 dark:text-slate-100 selection:bg-blue-600/20 dark:selection:bg-purple-600/30 selection:text-slate-900 dark:selection:text-purple-100">
      {/* Full-viewport Purple Noir black-hole video spans behind both Sidebar & Chat on the main AI view */}
      {activeView === 'chat' && <BlackHoleBackground />}

      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
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
