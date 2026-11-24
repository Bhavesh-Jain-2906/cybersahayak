'use client';

import React, { useState } from 'react';
import {
  X,
  Moon,
  Sun,
  Trash2,
  Download,
  ShieldCheck,
  ExternalLink,
  User,
  Sliders,
  Database,
  Info,
  CheckCircle2,
  Lock,
  Building2,
  Cpu,
} from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useTheme } from '@/context/ThemeContext';
import { APP_CONFIG } from '@/lib/constants';

const INDIAN_BANKS = [
  'State Bank of India (SBI)',
  'HDFC Bank',
  'ICICI Bank',
  'Punjab National Bank (PNB)',
  'Axis Bank',
  'Bank of Baroda',
  'Kotak Mahindra Bank',
  'Canara Bank',
  'Union Bank of India',
  'Paytm Payments Bank',
  'Other / Regional Rural Bank',
];

export default function SettingsModal() {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    conversations,
    clearAllConversations,
    profileSettings,
    updateProfileSettings,
  } = useChat();

  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'preferences' | 'data' | 'about'
  const [confirmClear, setConfirmClear] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Form local state
  const [displayName, setDisplayName] = useState(profileSettings.displayName || 'Digital Citizen');
  const [primaryBank, setPrimaryBank] = useState(profileSettings.primaryBank || 'State Bank of India (SBI)');
  const [emergencyContact, setEmergencyContact] = useState(profileSettings.emergencyContact || '');
  const [conversationTone, setConversationTone] = useState(profileSettings.conversationTone || 'calm_practical');
  const [languagePreference, setLanguagePreference] = useState(profileSettings.languagePreference || 'english');

  if (!isSettingsOpen) return null;

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfileSettings({
      displayName,
      primaryBank,
      emergencyContact,
      conversationTone,
      languagePreference,
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleExportData = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(conversations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `cybersahayak-chats-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClearAll = () => {
    clearAllConversations();
    setConfirmClear(false);
    setIsSettingsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#030610] border border-slate-200 dark:border-blue-900/50 shadow-2xl dark:shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(37,99,235,0.25)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-blue-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400 shadow-cool-blue-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Preferences & Profile Settings
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-blue-300/50">
                Tailor your cyber defense assistant and local privacy
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-blue-200 hover:bg-slate-100 dark:hover:bg-blue-950/40 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 px-5 pt-3 pb-2 border-b border-slate-200 dark:border-blue-950/40 bg-slate-50/50 dark:bg-[#02050c]">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-semibold'
                : 'text-slate-500 dark:text-blue-300/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-blue-950/40'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Theme</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'preferences'
                ? 'bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-semibold'
                : 'text-slate-500 dark:text-blue-300/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-blue-950/40'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>AI Guidance</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'data'
                ? 'bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-semibold'
                : 'text-slate-500 dark:text-blue-300/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-blue-950/40'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Data & Privacy</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'about'
                ? 'bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-semibold'
                : 'text-slate-500 dark:text-blue-300/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-blue-950/40'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>About App</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm flex-1 scrollbar-thin">
          {/* TAB 1: Profile & Appearance */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Bhavesh, Rahul, Digital Citizen"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#060a14] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-blue-300/40 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="mt-1 text-[11px] text-slate-400 dark:text-blue-300/50">
                  Used in your greeting and protection session indicator.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                  Primary Banking Institution
                </label>
                <select
                  value={primaryBank}
                  onChange={(e) => setPrimaryBank(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#060a14] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {INDIAN_BANKS.map((b) => (
                    <option key={b} value={b} className="bg-white dark:bg-black text-slate-900 dark:text-white">
                      {b}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-400 dark:text-blue-300/50">
                  Allows the AI to mention relevant bank dispute channels and helpline numbers when you ask about transactions.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                  Emergency Helpline / State Cyber Cell
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="e.g. Maharashtra Cyber Cell, Delhi Cyber Crime Unit"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#060a14] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-blue-300/40 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Theme Preference */}
              <div className="pt-2 border-t border-slate-200 dark:border-blue-950/60">
                <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-2">
                  Theme Palette
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border font-medium text-xs transition-all ${
                      theme === 'dark'
                        ? 'border-blue-500 bg-blue-500/15 text-blue-300 shadow-cool-blue-xs font-semibold'
                        : 'border-slate-200 dark:border-blue-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-blue-950/40'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-blue-400" />
                    <span>Vanta Black & Blue</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border font-medium text-xs transition-all ${
                      theme === 'light'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-700 font-semibold shadow-sm'
                        : 'border-slate-200 dark:border-blue-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-blue-950/40'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Light Clean</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                {saveToast ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-500 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Preferences saved!
                  </span>
                ) : <span />}

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-cool-blue-xs transition-all"
                >
                  Save Profile Settings
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: AI Guidance & Conversation Preferences */}
          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1.5">
                  Guidance Response Tone
                </label>
                <div className="space-y-2">
                  {[
                    {
                      id: 'calm_practical',
                      title: 'Calm & Step-by-Step (Recommended)',
                      desc: 'Empathetic guidance structured in actionable numerical steps, ideal for distressed users.',
                    },
                    {
                      id: 'urgent_concise',
                      title: 'Concise Emergency Action',
                      desc: 'Rapid bullet points prioritizing the first 60-minute financial freeze and evidence lockdown.',
                    },
                    {
                      id: 'educational_legal',
                      title: 'Educational & Statutory',
                      desc: 'Deep dives including specific Sections of the IT Act 2000 and Indian Penal Code.',
                    },
                  ].map((tone) => (
                    <button
                      key={tone.id}
                      type="button"
                      onClick={() => {
                        setConversationTone(tone.id);
                        updateProfileSettings({ conversationTone: tone.id });
                      }}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                        conversationTone === tone.id
                          ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-300 font-semibold'
                          : 'border-slate-200 dark:border-blue-950 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-blue-950/30'
                      }`}
                    >
                      <div className="font-semibold">{tone.title}</div>
                      <div className="text-[11px] font-normal text-slate-500 dark:text-blue-300/60 mt-0.5">
                        {tone.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1.5">
                  Conversational Language
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLanguagePreference('english');
                      updateProfileSettings({ languagePreference: 'english' });
                    }}
                    className={`p-2.5 rounded-xl border text-xs text-center transition-all ${
                      languagePreference === 'english'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-300 font-semibold'
                        : 'border-slate-200 dark:border-blue-950 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    English (Standard)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLanguagePreference('hinglish');
                      updateProfileSettings({ languagePreference: 'hinglish' });
                    }}
                    className={`p-2.5 rounded-xl border text-xs text-center transition-all ${
                      languagePreference === 'hinglish'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-300 font-semibold'
                        : 'border-slate-200 dark:border-blue-950 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Hinglish (Hindi + English)
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> LangGraph Workflow Guardrails
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-blue-200/70">
                  Every response undergoes validation against our safety rules: no FIR drafts are ever generated, and no passwords, OTPs, or UPI PINs are ever requested.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Data & Privacy */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#060a17] border border-slate-200 dark:border-blue-950 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-800 dark:text-blue-100">
                      Browser-Encrypted Conversations
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-blue-300/40">
                      {conversations.length} conversation{conversations.length === 1 ? '' : 's'} stored exclusively on this device
                    </div>
                  </div>

                  <button
                    onClick={handleExportData}
                    disabled={conversations.length === 0}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-blue-900/60 text-slate-700 dark:text-blue-200 hover:bg-white dark:hover:bg-blue-950/50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-blue-950/60">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-blue-200 font-semibold mb-1">
                    <Lock className="w-3.5 h-3.5 text-blue-400" /> Confidentiality Guarantee
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-blue-300/60 leading-relaxed">
                    CyberSahayak does not sell or harvest user telemetry. Your queries are sent strictly to infer answers via stateful LangGraph nodes and discarded from memory upon completion.
                  </p>
                </div>
              </div>

              {confirmClear ? (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs space-y-2 shadow-sm">
                  <p className="font-semibold text-red-600 dark:text-red-400">
                    Are you sure you want to permanently delete all conversations?
                  </p>
                  <p className="text-[11px] text-red-500/80">
                    This action will wipe all conversation transcripts from your browser.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleClearAll}
                      className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 text-xs shadow-sm transition-colors"
                    >
                      Yes, Clear All
                    </button>
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  disabled={conversations.length === 0}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-red-300 dark:border-red-950/80 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Conversation History</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 4: About & System Info */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#060a17] border border-slate-200 dark:border-blue-950 text-xs space-y-2.5">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold text-slate-800 dark:text-blue-100">
                    CyberSahayak Architecture
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-white dark:bg-black/50 border border-slate-200 dark:border-blue-950/60">
                    <span className="text-slate-400 dark:text-blue-300/40 block">Workflow Engine</span>
                    <span className="font-semibold text-slate-700 dark:text-blue-200">LangGraph.js StateGraph</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-black/50 border border-slate-200 dark:border-blue-950/60">
                    <span className="text-slate-400 dark:text-blue-300/40 block">Legal RAG Corpus</span>
                    <span className="font-semibold text-slate-700 dark:text-blue-200">53 Vectors (IT Act)</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-black/50 border border-slate-200 dark:border-blue-950/60">
                    <span className="text-slate-400 dark:text-blue-300/40 block">Primary Provider</span>
                    <span className="font-semibold text-slate-700 dark:text-blue-200">Groq High-Speed LLM</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-black/50 border border-slate-200 dark:border-blue-950/60">
                    <span className="text-slate-400 dark:text-blue-300/40 block">Backup Provider</span>
                    <span className="font-semibold text-slate-700 dark:text-blue-200">Google Gemini Flash</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-blue-300/60 mb-2">
                  Verified Official Indian Channels
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-blue-200/70">
                  <li className="flex items-center justify-between">
                    <span>National Cybercrime Helpline:</span>
                    <a
                      href={`tel:${APP_CONFIG.nationalHelpline}`}
                      className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      1930
                    </a>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Cybercrime Reporting Portal:</span>
                    <a
                      href={APP_CONFIG.officialPortal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      cybercrime.gov.in <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>RBI Sachet Financial Fraud:</span>
                    <a
                      href={APP_CONFIG.rbiSachetPortal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      sachet.rbi.org.in <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>DoT Sanchar Saathi:</span>
                    <a
                      href="https://sancharsaathi.gov.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      sancharsaathi.gov.in <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-blue-950/70 bg-slate-50 dark:bg-[#020409] flex items-center justify-between text-[11px] text-slate-400 dark:text-blue-300/40">
          <div className="flex items-center gap-2">
            <span>CyberSahayak v{APP_CONFIG.version}</span>
            <span className="w-1 h-1 rounded-full bg-blue-500" />
            <span>Encrypted Session</span>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-3.5 py-1.5 rounded-lg bg-slate-200 dark:bg-blue-950 text-slate-700 dark:text-blue-200 font-medium hover:bg-slate-300 dark:hover:bg-blue-900 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
