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
    setMounted(true);
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

  // Send a user message
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

    // If currently no active conversation, create one
    if (!targetConvId || !conversations.some((c) => c.id === targetConvId)) {
      targetConvId = 'conv-' + Date.now();

      const newConv = {
        id: targetConvId,
        title: generateTitle(trimmed),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [userMessage],
      };

      setConversations((prev) => [newConv, ...prev]);
      setActiveId(targetConvId);
    } else {
      // Append user message to existing conversation
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

    // Set loading indicator
    setIsLoading(true);

    // Simulate response delay for interaction testing
    setTimeout(() => {
      try {
        // Will throw if query includes 'test error' or '/error' to verify error state
        const responseContent = getSampleResponse(trimmed);

        const assistantMessage = {
          id: 'msg-' + Date.now() + '-assistant',
          role: 'assistant',
          content: responseContent,
          createdAt: new Date().toISOString(),
        };

        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetConvId
              ? {
                  ...c,
                  updatedAt: new Date().toISOString(),
                  messages: [...c.messages, assistantMessage],
                }
              : c
          )
        );

        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        setError({
          message: err.message || 'An error occurred while generating guidance.',
          retryPrompt: trimmed,
          targetConvId: targetConvId,
        });
      }
    }, 600);
  };

  // Retry the message that previously failed
  const retryLastMessage = useCallback(() => {
    if (!error || !error.retryPrompt) return;
    const promptToRetry = error.retryPrompt;
    setError(null);
    sendMessage(promptToRetry);
  }, [error]);

  return (
    <ChatContext.Provider
      value={{
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
        createNewChat,
        selectConversation,
        renameConversation,
        deleteConversation,
        clearAllConversations,
        sendMessage,
        mounted,
      }}
    >
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
