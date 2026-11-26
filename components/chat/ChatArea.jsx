'use client';

import React from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageComposer from './MessageComposer';

export default function ChatArea() {
  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-slate-50 dark:bg-transparent overflow-hidden relative">
      <ChatHeader />
      <MessageList />
      <MessageComposer />
    </div>
  );
}
