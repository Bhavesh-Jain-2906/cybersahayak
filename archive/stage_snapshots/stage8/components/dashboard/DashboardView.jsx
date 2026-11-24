'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  MailWarning,
  KeyRound,
  UserX,
  PhoneCall,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Sparkles,
  HelpCircle,
  FileCheck2,
  Lock,
  LayoutDashboard,
} from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { AWARENESS_ARTICLES } from '@/lib/awarenessData';
import { APP_CONFIG } from '@/lib/constants';
import ViewHeader from '@/components/layout/ViewHeader';

export default function DashboardView() {
  const {
    profileSettings,
    conversations,
    quizStats,
    setActiveView,
    startChatWithPrompt,
    recordArticleView,
  } = useChat();

  const [quickQuestion, setQuickQuestion] = useState('');

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (!quickQuestion.trim()) return;
    startChatWithPrompt(quickQuestion.trim());
  };

  const featuredArticles = AWARENESS_ARTICLES.slice(0, 4);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-black">
      <ViewHeader
        title="Cyber Protection Hub"
        subtitle="Threat intelligence, quick AI assistance, and security overview"
        icon={LayoutDashboard}
      />
      <div className="flex-1 overflow-y-auto text-slate-900 dark:text-slate-100 p-4 md:p-8 scrollbar-thin">
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-6 md:p-8 text-white shadow-cool-blue-lg">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
              <span>CyberSahayak Protection Hub</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {profileSettings.displayName || 'Digital Citizen'}
            </h1>
            <p className="mt-2 text-sm md:text-base text-blue-100/90 leading-relaxed">
              Your central headquarters for cybersecurity guidance, fraud prevention, official incident reporting channels, and interactive safety assessments.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveView('chat')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-blue-700 font-semibold text-xs md:text-sm hover:bg-blue-50 transition-all shadow-md active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Open AI Assistant</span>
              </button>

              <button
                onClick={() => setActiveView('quiz')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/30 hover:bg-blue-500/40 border border-white/20 text-white font-semibold text-xs md:text-sm transition-all active:scale-95"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Take Safety Quiz</span>
              </button>

              <a
                href={`tel:${APP_CONFIG.nationalHelpline}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 font-semibold text-xs md:text-sm hover:bg-amber-500/30 transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Helpline: 1930</span>
              </a>
            </div>
          </div>

          {/* Decorative glowing background shield */}
          <div className="absolute -right-8 -bottom-8 opacity-15 pointer-events-none">
            <ShieldAlert className="w-72 h-72 text-white" />
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-xl bg-white dark:bg-[#030612] border border-slate-200 dark:border-blue-950/70 shadow-sm dark:shadow-vanta-card">
            <div className="text-xs font-medium text-slate-500 dark:text-blue-300/60">
              Active Conversations
            </div>
            <div className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-white">
              {conversations.length}
            </div>
            <div className="mt-1 text-[11px] text-slate-400 dark:text-blue-400/50">
              Stored locally & encrypted
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#030612] border border-slate-200 dark:border-blue-950/70 shadow-sm dark:shadow-vanta-card">
            <div className="text-xs font-medium text-slate-500 dark:text-blue-300/60">
              Quiz Safety Score
            </div>
            <div className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{quizStats.completed ? `${quizStats.score}/${quizStats.total}` : 'Not Taken'}</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400 dark:text-blue-400/50">
              {quizStats.completed ? 'Defense Score Verified' : '8 questions ready'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#030612] border border-slate-200 dark:border-blue-950/70 shadow-sm dark:shadow-vanta-card">
            <div className="text-xs font-medium text-slate-500 dark:text-blue-300/60">
              Awareness Guides
            </div>
            <div className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-white">
              {AWARENESS_ARTICLES.length}
            </div>
            <div className="mt-1 text-[11px] text-slate-400 dark:text-blue-400/50">
              100% verified Indian cyber laws
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#030612] border border-slate-200 dark:border-blue-950/70 shadow-sm dark:shadow-vanta-card">
            <div className="text-xs font-medium text-slate-500 dark:text-blue-300/60">
              Emergency Gateway
            </div>
            <div className="mt-1.5 text-2xl font-bold text-amber-500 dark:text-amber-400">
              1930
            </div>
            <div className="mt-1 text-[11px] text-slate-400 dark:text-blue-400/50">
              National Fraud Helpline
            </div>
          </div>
        </div>

        {/* Quick Question Bar */}
        <div className="rounded-2xl bg-white dark:bg-[#03060f] border border-slate-200 dark:border-blue-900/40 p-4 md:p-5 shadow-sm dark:shadow-vanta-card">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Quick Ask CyberSahayak AI
            </h3>
          </div>
          <form onSubmit={handleQuickSubmit} className="flex gap-2">
            <input
              type="text"
              value={quickQuestion}
              onChange={(e) => setQuickQuestion(e.target.value)}
              placeholder="e.g. Someone asked for my UPI PIN to receive money, is that safe?"
              className="flex-1 px-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-[#060a14] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-blue-300/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!quickQuestion.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-sm hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 transition-all shrink-0"
            >
              Ask AI
            </button>
          </form>
        </div>

        {/* Cyber Awareness Highlights */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
                Cyber Awareness & Prevention Guides
              </h2>
              <p className="text-xs text-slate-500 dark:text-blue-300/60">
                Actionable guides to protect your accounts, money, and identity
              </p>
            </div>
            <button
              onClick={() => setActiveView('awareness')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>View all {AWARENESS_ARTICLES.length} guides</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => {
                  recordArticleView(article.id);
                  setActiveView('awareness');
                }}
                className="group cursor-pointer rounded-2xl bg-white dark:bg-[#030612] border border-slate-200 dark:border-blue-950/70 p-5 hover:border-blue-500/50 hover:shadow-md dark:hover:shadow-vanta-hover transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {article.category}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-blue-300/40">
                    {article.readTime}
                  </span>
                </div>
                <h3 className="font-semibold text-sm md:text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {article.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-blue-200/60 line-clamp-2 leading-relaxed">
                  {article.summary}
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                  <span>Read guide</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Official Resources Card */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 p-6 text-white border border-blue-900/50 shadow-cool-blue">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <ShieldAlert className="w-4 h-4" />
                <span>Official Indian Cybercrime Channels</span>
              </div>
              <h3 className="text-lg font-bold">Have you encountered active fraud or financial theft?</h3>
              <p className="text-xs text-blue-200/70 max-w-xl">
                Always report within the 2-3 hour &quot;Golden Hour&quot; window to ensure beneficiary bank freezes can be executed.
              </p>
            </div>
            <button
              onClick={() => setActiveView('resources')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs md:text-sm shrink-0 transition-all shadow-md"
            >
              Access Official Resources
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
