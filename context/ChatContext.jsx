'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getConversations,
  updateConversationTitle,
  deleteConversation as deleteConversationFromDb,
} from '@/lib/supabase/db';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { supabase, user, profile, session } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDbLoading, setIsDbLoading] = useState(false);
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

  // Sync profile display name when user/profile changes
  useEffect(() => {
    if (profile?.name || user?.user_metadata?.name) {
      const activeName = profile?.name || user?.user_metadata?.name;
      setProfileSettings((prev) => ({
        ...prev,
        displayName: activeName,
      }));
    }
  }, [profile, user]);

  // Load user's conversations from Supabase PostgreSQL whenever user logs in
  const loadConversationsFromDb = useCallback(async () => {
    if (!supabase || !user) {
      setConversations([]);
      setActiveId(null);
      return;
    }

    setIsDbLoading(true);
    try {
      const dbConversations = await getConversations(supabase);
      setConversations(dbConversations);
      if (dbConversations.length > 0) {
        // Default to the most recent conversation if none selected
        setActiveId((prevId) => {
          if (prevId && dbConversations.some((c) => c.id === prevId)) {
            return prevId;
          }
          return dbConversations[0].id;
        });
      } else {
        setActiveId(null);
      }
    } catch (err) {
      console.error('[ChatContext] Failed to load conversations from Supabase:', err);
    } finally {
      setIsDbLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    loadConversationsFromDb();
  }, [loadConversationsFromDb]);

  // Hydrate local UI preferences
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('connor_profile') || localStorage.getItem('cybersahayak_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfileSettings((prev) => ({
          ...prev,
          ...parsed,
          displayName: profile?.name || user?.user_metadata?.name || parsed.displayName || 'Digital Citizen',
        }));
      }
      const savedQuiz = localStorage.getItem('connor_quiz') || localStorage.getItem('cybersahayak_quiz');
      if (savedQuiz) {
        setQuizStats(JSON.parse(savedQuiz));
      }
      const savedArticles = localStorage.getItem('connor_viewed_articles') || localStorage.getItem('cybersahayak_viewed_articles');
      if (savedArticles) {
        setRecentlyViewedArticles(JSON.parse(savedArticles));
      }
    } catch {
      // Ignore localStorage exceptions
    }

    setMounted(true);
  }, [profile, user]);

  // Save profile updates
  const updateProfileSettings = useCallback((newSettings) => {
    setProfileSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('connor_profile', JSON.stringify(updated));
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
      localStorage.setItem('connor_quiz', JSON.stringify(newStats));
    } catch {}
  }, []);

  // Track viewed article
  const recordArticleView = useCallback((articleId) => {
    setRecentlyViewedArticles((prev) => {
      const filtered = prev.filter((id) => id !== articleId);
      const updated = [articleId, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('connor_viewed_articles', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

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
        (c.messages || []).some((m) => m.content && m.content.toLowerCase().includes(q))
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

  // Rename a conversation in Supabase & local state
  const renameConversation = useCallback(
    async (id, newTitle) => {
      if (!newTitle || !newTitle.trim()) return;
      const cleanTitle = newTitle.trim();

      // Optimistic local update
      setConversations((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, title: cleanTitle, updatedAt: new Date().toISOString() } : c
        )
      );

      // Persist in Supabase
      if (supabase) {
        try {
          await updateConversationTitle(supabase, id, cleanTitle);
        } catch (err) {
          console.error('[ChatContext] Failed to rename conversation in Supabase:', err);
        }
      }
    },
    [supabase]
  );

  // Delete a conversation in Supabase & local state
  const deleteConversation = useCallback(
    async (id) => {
      // Optimistic local update
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (activeId === id) {
          setActiveId(next.length > 0 ? next[0].id : null);
        }
        return next;
      });
      setError(null);

      // Persist deletion in Supabase (cascades to messages)
      if (supabase) {
        try {
          await deleteConversationFromDb(supabase, id);
        } catch (err) {
          console.error('[ChatContext] Failed to delete conversation in Supabase:', err);
        }
      }
    },
    [activeId, supabase]
  );

  // Clear all conversations for the user
  const clearAllConversations = useCallback(async () => {
    const idsToDelete = conversations.map((c) => c.id);
    setConversations([]);
    setActiveId(null);
    setError(null);

    if (supabase && idsToDelete.length > 0) {
      try {
        await supabase.from('conversations').delete().in('id', idsToDelete);
      } catch (err) {
        console.error('[ChatContext] Failed to clear all conversations:', err);
      }
    }
  }, [conversations, supabase]);

  // Toggle desktop sidebar
  const toggleDesktopSidebar = useCallback(() => {
    setIsDesktopSidebarOpen((prev) => !prev);
  }, []);

  // Helper to generate a clean title from the prompt
  const generateTitle = (text) => {
    const cleaned = text.trim().replace(/\s+/g, ' ');
    if (cleaned.length <= 34) return cleaned;
    return cleaned.slice(0, 34) + '...';
  };

  // Clear current error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Send a user message to the live LangGraph AI backend with Supabase sync
  const sendMessage = async (content) => {
    if (!content || !content.trim() || isLoading) return;

    const trimmed = content.trim();
    setError(null);

    // Generate UUID if creating new conversation
    const isUuid = (id) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || '');

    let targetConvId = activeId;
    let currentHistory = [];

    const tempUserMsgId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'msg-' + Date.now() + '-user';

    const userMessage = {
      id: tempUserMsgId,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    // If currently no active conversation, create one locally with UUID
    if (!targetConvId || !conversations.some((c) => c.id === targetConvId)) {
      targetConvId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'conv-' + Date.now();

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
      const existingConv = conversations.find((c) => c.id === targetConvId);
      currentHistory = existingConv ? existingConv.messages || [] : [];

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
                  messages: [...(c.messages || []), userMessage],
                }
              : c
          )
        );
      }
    }

    setIsLoading(true);

    try {
      const activeConv = conversations.find((c) => c.id === targetConvId);
      const priorClarifications = activeConv?.clarificationsAsked || [];

      // Format previous history for API request
      const formattedHistory = currentHistory
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // Prepare headers with Supabase Auth token
      const headers = {
        'Content-Type': 'application/json',
      };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
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

      const actualConvId = data.conversationId || targetConvId;

      const assistantMessage = {
        id: data.assistantMessageId || ('msg-' + Date.now() + '-assistant'),
        role: 'assistant',
        content: data.response,
        createdAt: new Date().toISOString(),
        ragUsed: Boolean(data.ragUsed),
        retrievedSources: data.retrievedSources || [],
        intent: data.intent,
        metadata: data.metadata,
      };

      // Append assistant message and record clarifications
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === targetConvId || c.id === actualConvId) {
            const nextClarifications = Array.isArray(data.clarificationsAsked)
              ? Array.from(new Set([...(c.clarificationsAsked || []), ...data.clarificationsAsked]))
              : c.clarificationsAsked || [];

            // Replace temp user message ID if server provided one
            const updatedMessages = (c.messages || []).map((m) =>
              m.id === tempUserMsgId && data.userMessageId
                ? { ...m, id: data.userMessageId }
                : m
            );

            return {
              ...c,
              id: actualConvId,
              updatedAt: new Date().toISOString(),
              messages: [...updatedMessages, assistantMessage],
              clarificationsAsked: nextClarifications,
            };
          }
          return c;
        })
      );

      if (actualConvId !== targetConvId) {
        setActiveId(actualConvId);
      }

      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError({
        message: err.message || 'Failed to connect to Connor AI assistant.',
        retryPrompt: trimmed,
        targetConvId: targetConvId,
      });
    }
  };

  // Retry failed prompt
  const retryLastMessage = useCallback(() => {
    if (!error || !error.retryPrompt) return;
    const promptToRetry = error.retryPrompt;
    setError(null);
    sendMessage(promptToRetry);
  }, [error, sendMessage]);

  // Start chat with prompt
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

  const contextValue = useMemo(
    () => ({
      conversations,
      filteredConversations,
      activeId,
      activeConversation,
      searchQuery,
      setSearchQuery,
      isLoading,
      isDbLoading,
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
      loadConversationsFromDb,
      mounted,
    }),
    [
      conversations,
      filteredConversations,
      activeId,
      activeConversation,
      searchQuery,
      isLoading,
      isDbLoading,
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
      loadConversationsFromDb,
      mounted,
    ]
  );

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
