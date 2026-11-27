'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  ChevronRight,
  X,
  CreditCard,
  MailWarning,
  KeyRound,
  UserX,
  ShoppingBag,
  Fingerprint,
  Cpu,
  Users,
  Globe,
} from 'lucide-react';
import { AWARENESS_ARTICLES } from '@/lib/awarenessData';
import { useChat } from '@/context/ChatContext';
import ViewHeader from '@/components/layout/ViewHeader';

const ICON_MAP = {
  CreditCard,
  MailWarning,
  KeyRound,
  UserX,
  ShoppingBag,
  Fingerprint,
  ShieldCheck,
  Cpu,
  Users,
  Globe,
};

export default function AwarenessView() {
  const { startChatWithPrompt, recordArticleView } = useChat();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeArticle, setActiveArticle] = useState(null);

  const categories = ['All', ...new Set(AWARENESS_ARTICLES.map((a) => a.category))];

  const filteredArticles = AWARENESS_ARTICLES.filter((article) => {
    const matchesCat = selectedCategory === 'All' || article.category === selectedCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.summary.toLowerCase().includes(search.toLowerCase()) ||
      article.explanation.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenArticle = (article) => {
    recordArticleView(article.id);
    setActiveArticle(article);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gradient-to-b from-white via-[#F9FAFF] to-indigo-50/60 dark:bg-none dark:bg-black">
      <ViewHeader
        title="Cyber Awareness & Prevention"
        subtitle="10 comprehensive guides covering UPI fraud, phishing, ransomware, identity theft & online safety"
        icon={BookOpen}
      />
      <div className="flex-1 overflow-y-auto text-slate-900 dark:text-slate-100 p-4 md:p-8 scrollbar-thin">
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-200/75 dark:border-blue-950/60 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6366F1]/10 dark:bg-blue-500/10 text-indigo-700 dark:text-blue-400 border border-[#6366F1]/25 dark:border-blue-500/20 text-xs font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Cyber Awareness Academy</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Cybercrime Guides & Prevention
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-blue-200/70 max-w-xl">
              Practical, plain-language guides on prevailing cyber threats in India, prevention checklists, and statutory legal provisions.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 dark:text-blue-400/60" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guides (e.g. UPI, AnyDesk)..."
              className="w-full pl-9 pr-4 py-2 text-xs md:text-sm rounded-xl bg-white dark:bg-[#060a14] border border-indigo-200/80 dark:border-blue-900/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-blue-300/40 focus:outline-none focus:ring-2 focus:ring-[#6366F1] dark:focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#6366F1] dark:bg-blue-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)] dark:shadow-cool-blue-xs'
                  : 'bg-white dark:bg-[#040814] border border-indigo-200/75 dark:border-blue-950/70 text-slate-600 dark:text-blue-200/70 hover:bg-indigo-50/70 dark:hover:bg-blue-950/40 hover:text-indigo-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredArticles.map((article) => {
            const IconComponent = ICON_MAP[article.icon] || BookOpen;

            return (
              <div
                key={article.id}
                onClick={() => handleOpenArticle(article)}
                className="group cursor-pointer rounded-2xl bg-white dark:bg-[#030612] border border-indigo-200/75 dark:border-blue-950/70 p-5 hover:border-[#6366F1]/60 dark:hover:border-blue-500/50 hover:shadow-[0_8px_24px_rgba(99,102,241,0.12)] dark:hover:shadow-vanta-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#6366F1]/10 dark:bg-blue-500/10 text-[#6366F1] dark:text-blue-400 flex items-center justify-center border border-[#6366F1]/25 dark:border-blue-500/20">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50/80 dark:bg-blue-950/50 text-indigo-800 dark:text-blue-300 border border-indigo-200/80 dark:border-blue-900/40">
                        {article.category}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-blue-300/40">
                      {article.readTime}
                    </span>
                  </div>

                  <h3 className="font-semibold text-base text-slate-900 dark:text-white group-hover:text-[#6366F1] dark:group-hover:text-blue-400 transition-colors">
                    {article.title}
                  </h3>

                  <p className="mt-1.5 text-xs text-slate-500 dark:text-blue-200/60 leading-relaxed line-clamp-3">
                    {article.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-indigo-100/80 dark:border-blue-950/50 flex items-center justify-between text-xs text-[#6366F1] dark:text-blue-400 font-medium">
                  <span>Read detailed guide</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12 text-slate-400 dark:text-blue-300/50 text-sm">
            No articles match your search query. Try another keyword.
          </div>
        )}

        {/* Detailed Modal / Full Reader */}
        {activeArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div
              className="w-full max-w-3xl rounded-2xl bg-white dark:bg-[#030612] border border-slate-200 dark:border-blue-900/60 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-blue-950/70 bg-slate-50/50 dark:bg-[#020409]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {activeArticle.category}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-blue-300/40">
                    {activeArticle.readTime}
                  </span>
                </div>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-blue-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-sm scrollbar-thin">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                    {activeArticle.title}
                  </h2>
                  <p className="mt-2 text-xs md:text-sm text-slate-600 dark:text-blue-200/80 leading-relaxed whitespace-pre-line">
                    {activeArticle.explanation}
                  </p>
                </div>

                {/* Practical Scenarios / Examples */}
                <div className="p-4 rounded-xl bg-amber-500/5 dark:bg-amber-950/15 border border-amber-500/20">
                  <div className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-400 text-xs md:text-sm mb-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Real-World Scenarios & Fraudster Tactics:</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-blue-100/80">
                    {activeArticle.examples.map((ex, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{ex}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Prevention Tips */}
                <div>
                  <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-sm mb-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Essential Prevention Rules:</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {activeArticle.preventionTips.map((tip, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-[#060a17] border border-slate-200 dark:border-blue-950/60 text-xs text-slate-700 dark:text-blue-200/80"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legal Provision Context */}
                {activeArticle.legalSection && (
                  <div className="p-3.5 rounded-xl bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-500/20 text-xs text-slate-700 dark:text-blue-200/80 flex items-start gap-2.5">
                    <Scale className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 dark:text-white">
                        Governing Indian Law:
                      </strong>{' '}
                      {activeArticle.legalSection}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3.5 border-t border-slate-200 dark:border-blue-950/70 bg-slate-50/50 dark:bg-[#020409] flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => {
                    const prompt = `Can you explain more about ${activeArticle.title} and what specific steps I should take if I suspect I was targeted?`;
                    setActiveArticle(null);
                    startChatWithPrompt(prompt);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-indigo-700 dark:from-blue-600 dark:to-indigo-600 text-white font-semibold text-xs hover:from-indigo-500 hover:to-indigo-600 dark:hover:from-blue-500 dark:hover:to-indigo-500 transition-all shadow-[0_4px_14px_rgba(99,102,241,0.28)] dark:shadow-cool-blue-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI Assistant About This</span>
                </button>

                <button
                  onClick={() => setActiveArticle(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-blue-950 text-slate-700 dark:text-blue-200 font-medium text-xs hover:bg-slate-300 dark:hover:bg-blue-900 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
