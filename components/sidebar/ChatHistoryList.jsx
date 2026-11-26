'use client';

import React from 'react';
import { groupConversationsByDate } from '@/lib/dateUtils';
import ConversationItem from './ConversationItem';
import { SearchX, MessagesSquare, Loader2 } from 'lucide-react';
import { useChat } from '@/context/ChatContext';

export default function ChatHistoryList() {
  const { filteredConversations, searchQuery, isDbLoading } = useChat();

  if (isDbLoading && filteredConversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <Loader2 className="w-5 h-5 text-blue-500 dark:text-purple-400 animate-spin mb-2" />
        <p className="text-xs text-slate-400 dark:text-zinc-400">Loading conversations...</p>
      </div>
    );
  }

  if (filteredConversations.length === 0) {
    if (searchQuery.trim()) {
      return (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <SearchX className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2" />
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">No matching conversations</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Try searching with a different term</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <MessagesSquare className="w-8 h-8 text-slate-400 dark:text-slate-600 mb-2 stroke-1" />
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">No conversations yet</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Start a new chat to get cybercrime guidance</p>
      </div>
    );
  }

  const grouped = groupConversationsByDate(filteredConversations);
  const categories = ['Today', 'Yesterday', 'Previous 7 Days', 'Previous 30 Days', 'Older'];

  return (
    <div className="space-y-4 py-1">
      {categories.map((category) => {
        const items = grouped[category];
        if (!items || items.length === 0) return null;

        return (
          <div key={category} className="space-y-1">
            <h4 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {category}
            </h4>
            <div className="space-y-0.5">
              {items.map((conv) => (
                <ConversationItem key={conv.id} conversation={conv} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
