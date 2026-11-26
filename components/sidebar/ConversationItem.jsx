'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Edit3, Trash2, Check, X } from 'lucide-react';
import { useChat } from '@/context/ChatContext';

export default function ConversationItem({ conversation }) {
  const { activeId, selectConversation, renameConversation, deleteConversation } = useChat();
  const isActive = activeId === conversation.id;

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSaveRename = (e) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      renameConversation(conversation.id, editTitle.trim());
    } else {
      setEditTitle(conversation.title);
    }
    setIsEditing(false);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditTitle(conversation.title);
    setIsEditing(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteConversation(conversation.id);
    setIsConfirmingDelete(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-200/80 dark:bg-[#171222]/80 border border-blue-500/40 dark:border-purple-400/40 text-sm">
        <input
          ref={inputRef}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSaveRename(e);
            if (e.key === 'Escape') handleCancelRename(e);
          }}
          className="flex-1 min-w-0 bg-transparent px-1 py-0.5 text-xs text-slate-900 dark:text-white focus:outline-none border-b border-blue-500 dark:border-purple-400"
        />
        <button
          onClick={handleSaveRename}
          className="p-1 text-blue-600 dark:text-purple-300 hover:text-blue-700 dark:hover:text-purple-200 rounded"
          title="Save title"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleCancelRename}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
          title="Cancel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (isConfirmingDelete) {
    return (
      <div className="flex items-center justify-between gap-1 px-2.5 py-2 rounded-lg bg-red-500/10 border border-red-500/30 dark:shadow-[0_0_12px_rgba(239,68,68,0.2)] text-xs">
        <span className="text-red-600 dark:text-red-400 font-medium truncate">Delete this chat?</span>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleDelete}
            className="px-2 py-0.5 rounded bg-red-600 text-white font-medium hover:bg-red-700 text-xs shadow-sm"
          >
            Delete
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsConfirmingDelete(false);
            }}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => selectConversation(conversation.id)}
      className={`group relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs md:text-sm cursor-pointer transition-all duration-200 select-none border ${
        isActive
          ? 'bg-white/80 dark:bg-[#231936]/65 text-blue-900 dark:text-white font-medium border-blue-500/30 dark:border-purple-400/30 shadow-sm dark:shadow-none'
          : 'border-transparent text-slate-700 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-white/5 dark:hover:border-white/10 hover:text-slate-900 dark:hover:text-zinc-100'
      }`}
    >
      <MessageSquare
        className={`w-4 h-4 shrink-0 transition-colors ${
          isActive
            ? 'text-blue-600 dark:text-purple-300'
            : 'text-slate-400 group-hover:text-slate-600 dark:text-zinc-500 dark:group-hover:text-purple-300'
        }`}
      />

      <span className="flex-1 truncate text-left" title={conversation.title}>
        {conversation.title}
      </span>

      {/* Action buttons (Rename & Delete) on hover or active */}
      <div
        className={`items-center gap-1 shrink-0 ${
          isActive ? 'flex' : 'hidden group-hover:flex'
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-white/10 transition-colors"
          title="Rename chat"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsConfirmingDelete(true);
          }}
          className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
          title="Delete chat"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
