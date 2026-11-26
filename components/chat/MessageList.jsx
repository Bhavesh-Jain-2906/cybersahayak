'use client';

import React, { useEffect, useRef } from 'react';
import { useChat } from '@/context/ChatContext';
import WelcomeScreen from './WelcomeScreen';
import UserMessage from './UserMessage';
import AssistantMessage from './AssistantMessage';
import LoadingIndicator from './LoadingIndicator';
import { AlertTriangle, RotateCcw, X } from 'lucide-react';

export default function MessageList() {
  const { activeConversation, isLoading, error, clearError, retryLastMessage } = useChat();
  const bottomRef = useRef(null);

  const messages = activeConversation?.messages || [];

  // Auto-scroll to bottom on new message, loading state, or error state change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isLoading, error]);

  if (messages.length === 0 && !error) {
    return (
      <div className="relative z-10 flex-1 overflow-y-auto">
        <WelcomeScreen />
      </div>
    );
  }

  return (
    <div className="relative z-10 flex-1 overflow-y-auto py-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
      {messages.map((message) => {
        if (message.role === 'user') {
          return <UserMessage key={message.id} message={message} />;
        }
        return <AssistantMessage key={message.id} message={message} />;
      })}

      {isLoading && <LoadingIndicator />}

      {/* Error State Banner with Retry */}
      {error && (
        <div className="px-4 md:px-6 py-2 animate-fade-in">
          <div className="max-w-2xl mx-auto p-4 rounded-xl bg-red-500/10 dark:bg-red-950/20 border border-red-500/30 dark:border-red-500/40 shadow-sm dark:shadow-[0_0_20px_rgba(239,68,68,0.2)] flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-red-700 dark:text-red-300">
                  Response Generation Interrupted
                </h4>
                <p className="mt-0.5 text-xs text-red-600/90 dark:text-red-400 leading-relaxed">
                  {error.message}
                </p>
                {error.retryPrompt && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      onClick={retryLastMessage}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs shadow-sm transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry Request</span>
                    </button>
                    <button
                      onClick={clearError}
                      className="px-2.5 py-1 rounded-lg border border-red-300 dark:border-red-800 text-xs text-red-700 dark:text-red-300 hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={clearError}
              className="p-1 rounded text-red-400 hover:text-red-600 dark:hover:text-red-200"
              title="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
