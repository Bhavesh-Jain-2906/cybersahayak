'use client';

import React from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageComposer from './MessageComposer';

export default function ChatArea() {
  return (
    <main className="flex-1 flex flex-col h-full min-w-0 bg-slate-50 dark:bg-black dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(37,99,235,0.12),rgba(0,0,0,1))] overflow-hidden relative">
      <ChatHeader />
      <MessageList />
      <MessageComposer />
    </main>
  );
}
