'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  getStoredConversations,
  saveStoredConversations,
  getStoredActiveId,
  saveStoredActiveId,
} from '@/lib/storage';
import { getSampleResponse } from '@/lib/sampleResponses';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // { message, retryPrompt, targetConvId }
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeView, setActiveView] = useState('chat'); // 'chat' | 'dashboard' | 'awareness' | 'quiz' | 'resources'
  const [profileSettings, setProfileSettings] = useState({
    displayName: 'Digital Citizen',
    primaryBank: 'State Bank of India',
    emergencyContact: '',
    conversationTone: 'calm_practical',
  });
  const [quizStats, setQuizStats] = useState({
    completed: false,
    score: 0,
    total: 8,
    lastCompletedDate: null,
  });
  const [recentlyViewedArticles, setRecentlyViewedArticles] = useState(['upi-fraud', 'phishing']);
  const [mounted, setMounted] = useState(false);

  // Initialize from storage on client mount
  useEffect(() => {
    const savedConvs = getStoredConversations();
    const savedActiveId = getStoredActiveId();

    setConversations(savedConvs);
    if (savedActiveId && savedConvs.some((c) => c.id === savedActiveId)) {
      setActiveId(savedActiveId);
    } else if (savedConvs.length > 0) {
      setActiveId(savedConvs[0].id);
    }

    try {
      const savedProfile = localStorage.getItem('cybersahayak_profile');
      if (savedProfile) {
        setProfileSettings(JSON.parse(savedProfile));
      }
      const savedQuiz = localStorage.getItem('cybersahayak_quiz');
      if (savedQuiz) {
        setQuizStats(JSON.parse(savedQuiz));
      }
      const savedArticles = localStorage.getItem('cybersahayak_viewed_articles');
      if (savedArticles) {
        setRecentlyViewedArticles(JSON.parse(savedArticles));
      }
    } catch {
      // Ignore localStorage access exceptions
    }

    setMounted(true);
  }, []);

  // Save profile updates
  const updateProfileSettings = useCallback((newSettings) => {
    setProfileSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('cybersahayak_profile', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Save quiz result
  const recordQuizResult = useCallback((score, total) => {
    const newStats = {
      completed: true,
      score,
      total,
      lastCompletedDate: new Date().toISOString(),
    };
    setQuizStats(newStats);
    try {
      localStorage.setItem('cybersahayak_quiz', JSON.stringify(newStats));
    } catch {}
  }, []);

  // Track viewed article
  const recordArticleView = useCallback((articleId) => {
    setRecentlyViewedArticles((prev) => {
      const filtered = prev.filter((id) => id !== articleId);
      const updated = [articleId, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('cybersahayak_viewed_articles', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Sync conversations to localStorage whenever they change
  useEffect(() => {
    if (mounted) {
      saveStoredConversations(conversations);
    }
  }, [conversations, mounted]);

  // Sync activeId to localStorage
  useEffect(() => {
    if (mounted) {
      saveStoredActiveId(activeId);
    }
  }, [activeId, mounted]);

  // Current active conversation
  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeId) || null;
  }, [conversations, activeId]);

  // Filtered conversations by search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase().trim();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  // Create a brand new chat
  const createNewChat = useCallback(() => {
    setActiveId(null);
    setActiveView('chat');
    setError(null);
    setIsMobileSidebarOpen(false);
  }, []);

  // Select an existing chat
  const selectConversation = useCallback((id) => {
    setActiveId(id);
    setError(null);
    setIsMobileSidebarOpen(false);
  }, []);

  // Rename a conversation
  const renameConversation = useCallback((id, newTitle) => {
    if (!newTitle || !newTitle.trim()) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle.trim(), updatedAt: new Date().toISOString() } : c))
    );
  }, []);

  // Delete a conversation
  const deleteConversation = useCallback((id) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (activeId === id) {
        setActiveId(next.length > 0 ? next[0].id : null);
      }
      return next;
    });
    setError(null);
  }, [activeId]);

  // Clear all conversations
  const clearAllConversations = useCallback(() => {
    setConversations([]);
    setActiveId(null);
    setError(null);
  }, []);

  // Toggle desktop sidebar
  const toggleDesktopSidebar = useCallback(() => {
    setIsDesktopSidebarOpen((prev) => !prev);
  }, []);

  // Helper to generate a clean title from the first prompt
  const generateTitle = (text) => {
    const cleaned = text.trim().replace(/\s+/g, ' ');
    if (cleaned.length <= 34) return cleaned;
    return cleaned.slice(0, 34) + '...';
  };

  // Clear current error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Send a user message to the live LangGraph AI backend
  const sendMessage = async (content) => {
    if (!content || !content.trim() || isLoading) return;

    const trimmed = content.trim();
    setError(null);

    const userMessage = {
      id: 'msg-' + Date.now() + '-user',
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    let targetConvId = activeId;
    let currentHistory = [];

    // If currently no active conversation, create one
    if (!targetConvId || !conversations.some((c) => c.id === targetConvId)) {
      targetConvId = 'conv-' + Date.now();

      const newConv = {
        id: targetConvId,
        title: generateTitle(trimmed),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [userMessage],
        clarificationsAsked: [],
      };

      setConversations((prev) => [newConv, ...prev]);
      setActiveId(targetConvId);
      currentHistory = [];
    } else {
      // Find current conversation messages for history isolation
      const existingConv = conversations.find((c) => c.id === targetConvId);
      currentHistory = existingConv ? existingConv.messages : [];

      // Avoid duplicate user message bubble if this is a retry of the same message
      const isAlreadyLastMsg =
        existingConv &&
        existingConv.messages.length > 0 &&
        existingConv.messages[existingConv.messages.length - 1].role === 'user' &&
        existingConv.messages[existingConv.messages.length - 1].content === trimmed;

      if (!isAlreadyLastMsg) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetConvId
              ? {
                  ...c,
                  updatedAt: new Date().toISOString(),
                  messages: [...c.messages, userMessage],
                }
              : c
          )
        );
      }
    }

    // Set loading indicator
    setIsLoading(true);

    try {
      const activeConv = conversations.find((c) => c.id === targetConvId);
      const priorClarifications = activeConv?.clarificationsAsked || [];

      // Convert history for the API call (isolate to only valid user/assistant turns)
      const formattedHistory = currentHistory
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmed,
          conversationId: targetConvId,
          history: formattedHistory,
          clarificationsAsked: priorClarifications,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.error || `Server responded with status ${res.status}`);
      }

      const assistantMessage = {
        id: 'msg-' + Date.now() + '-assistant',
        role: 'assistant',
        content: data.response,
        createdAt: new Date().toISOString(),
        ragUsed: Boolean(data.ragUsed),
        retrievedSources: data.retrievedSources || [],
        intent: data.intent,
        metadata: data.metadata,
      };

      // Append assistant message and record any new clarifications
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === targetConvId) {
            const nextClarifications = Array.isArray(data.clarificationsAsked)
              ? Array.from(new Set([...(c.clarificationsAsked || []), ...data.clarificationsAsked]))
              : c.clarificationsAsked || [];

            return {
              ...c,
              updatedAt: new Date().toISOString(),
              messages: [...c.messages, assistantMessage],
              clarificationsAsked: nextClarifications,
            };
          }
          return c;
        })
      );

      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError({
        message: err.message || 'Failed to connect to CyberSahayak AI assistant.',
        retryPrompt: trimmed,
        targetConvId: targetConvId,
      });
    }
  };

  // Retry the message that previously failed
  const retryLastMessage = useCallback(() => {
    if (!error || !error.retryPrompt) return;
    const promptToRetry = error.retryPrompt;
    setError(null);
    sendMessage(promptToRetry);
  }, [error, sendMessage]);

  // Start chat with a specific prompt (from dashboard or awareness articles)
  const startChatWithPrompt = useCallback(
    (prompt) => {
      setActiveView('chat');
      setActiveId(null);
      setError(null);
      setIsMobileSidebarOpen(false);
      sendMessage(prompt);
    },
    [sendMessage]
  );

  // Memoize the context value to eliminate wasteful re-renders of the entire app
  const contextValue = useMemo(
    () => ({
      conversations,
      filteredConversations,
      activeId,
      activeConversation,
      searchQuery,
      setSearchQuery,
      isLoading,
      error,
      clearError,
      retryLastMessage,
      isMobileSidebarOpen,
      setIsMobileSidebarOpen,
      isDesktopSidebarOpen,
      toggleDesktopSidebar,
      isSettingsOpen,
      setIsSettingsOpen,
      activeView,
      setActiveView,
      profileSettings,
      updateProfileSettings,
      quizStats,
      recordQuizResult,
      recentlyViewedArticles,
      recordArticleView,
      startChatWithPrompt,
      createNewChat,
      selectConversation,
      renameConversation,
      deleteConversation,
      clearAllConversations,
      sendMessage,
      mounted,
    }),
    [
      conversations,
      filteredConversations,
      activeId,
      activeConversation,
      searchQuery,
      isLoading,
      error,
      clearError,
      retryLastMessage,
      isMobileSidebarOpen,
      isDesktopSidebarOpen,
      toggleDesktopSidebar,
      isSettingsOpen,
      activeView,
      profileSettings,
      updateProfileSettings,
      quizStats,
      recordQuizResult,
      recentlyViewedArticles,
      recordArticleView,
      startChatWithPrompt,
      createNewChat,
      selectConversation,
      renameConversation,
      deleteConversation,
      clearAllConversations,
      sendMessage,
      mounted,
    ]
  );

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
