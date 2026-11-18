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
      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-200/80 dark:bg-[#080e1c] border border-blue-500/40 shadow-cool-blue-xs text-sm">
        <input
          ref={inputRef}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSaveRename(e);
            if (e.key === 'Escape') handleCancelRename(e);
          }}
          className="flex-1 min-w-0 bg-transparent px-1 py-0.5 text-xs text-slate-900 dark:text-blue-100 focus:outline-none border-b border-blue-500"
        />
        <button
          onClick={handleSaveRename}
          className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 rounded"
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
          ? 'bg-blue-600/15 text-blue-900 dark:text-blue-300 font-medium border-blue-500/30 dark:border-blue-500/50 dark:shadow-[0_0_16px_rgba(59,130,246,0.25)]'
          : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-[#070d1a] dark:hover:border-blue-900/40 hover:text-slate-900 dark:hover:text-blue-200'
      }`}
    >
      <MessageSquare
        className={`w-4 h-4 shrink-0 transition-colors ${
          isActive
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-blue-400'
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
          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-blue-300 hover:bg-slate-300/50 dark:hover:bg-blue-900/50 transition-colors"
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
