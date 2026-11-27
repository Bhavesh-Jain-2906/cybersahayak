'use client';

import React from 'react';
import {
  ShieldAlert,
  PhoneCall,
  ExternalLink,
  ShieldCheck,
  Clock,
  FileText,
  AlertTriangle,
  Building2,
  Lock,
  Sparkles,
} from 'lucide-react';
import { OFFICIAL_RESOURCES, GOLDEN_HOUR_STEPS } from '@/lib/resourcesData';
import { useChat } from '@/context/ChatContext';
import { APP_CONFIG } from '@/lib/constants';
import ViewHeader from '@/components/layout/ViewHeader';

export default function ResourcesView() {
  const { startChatWithPrompt } = useChat();

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gradient-to-b from-white via-[#F9FAFF] to-indigo-50/60 dark:bg-none dark:bg-black">
      <ViewHeader
        title="Official Cybercrime Help & Resources"
        subtitle="Verified Indian cybercrime portals, 1930 helpline protocol, and digital evidence preparation"
        icon={ShieldCheck}
      />
      <div className="flex-1 overflow-y-auto text-slate-900 dark:text-slate-100 p-4 md:p-8 scrollbar-thin">
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6366F1]/10 dark:bg-blue-500/10 text-indigo-700 dark:text-blue-400 border border-[#6366F1]/25 dark:border-blue-500/20 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Government Portals & Helplines</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Indian Cybercrime Help & Resources
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-blue-200/70 max-w-2xl">
            A verified directory of authorized government portals, regulatory authorities, and 24/7 emergency helplines for reporting digital offenses in India.
          </p>
        </div>

        {/* Golden Hour Emergency Protocol Banner */}
        <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30 p-6 md:p-7 space-y-4 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm md:text-base">
              <Clock className="w-5 h-5" />
              <span>The &quot;Golden Hour&quot; Protocol for Financial Cyber Fraud</span>
            </div>
            <a
              href={`tel:${APP_CONFIG.nationalHelpline}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs md:text-sm hover:bg-amber-400 transition-all shadow-md active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Dial 1930 Now</span>
            </a>
          </div>

          <p className="text-xs md:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            If you have suffered an unauthorized UPI, banking, or credit card deduction, reporting within the first <strong>2 to 3 hours</strong> allows the Indian Cyber Crime Coordination Centre (I4C) system to freeze the fraudster&apos;s beneficiary bank accounts before the money is withdrawn.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
            {GOLDEN_HOUR_STEPS.map((s) => (
              <div
                key={s.step}
                className="p-3.5 rounded-xl bg-white/70 dark:bg-[#060a16] border border-amber-500/20 text-xs"
              >
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold flex items-center justify-center mb-1.5">
                  {s.step}
                </div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {s.title}
                </div>
                <div className="mt-1 text-slate-500 dark:text-blue-200/60 leading-relaxed text-[11px]">
                  {s.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Official Directory Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Official Indian Cyber Defense Directory
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OFFICIAL_RESOURCES.map((res) => (
              <div
                key={res.id}
                className="rounded-2xl bg-white dark:bg-[#030612] border border-indigo-200/75 dark:border-blue-950/70 p-5 flex flex-col justify-between hover:border-[#6366F1]/60 dark:hover:border-blue-500/50 hover:shadow-[0_8px_24px_rgba(99,102,241,0.12)] dark:hover:shadow-vanta-hover transition-all space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#6366F1]/10 dark:bg-blue-500/10 text-indigo-700 dark:text-blue-400 border border-[#6366F1]/25 dark:border-blue-500/20">
                      {res.badge}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-blue-300/40">
                      {res.type}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {res.name}
                  </h3>

                  <div className="mt-1 text-xs text-[#6366F1] dark:text-blue-400/80 font-medium flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{res.authority}</span>
                  </div>

                  <p className="mt-2 text-xs text-slate-500 dark:text-blue-200/60 leading-relaxed">
                    {res.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-indigo-100/80 dark:border-blue-950/60 flex items-center justify-between gap-2">
                  {res.helpline ? (
                    <a
                      href={`tel:${res.helpline.split(' ')[0]}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>{res.helpline}</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400 dark:text-blue-400/50">
                      Online service only
                    </span>
                  )}

                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6366F1] hover:bg-indigo-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-medium text-xs shadow-sm transition-all"
                  >
                    <span>{res.actionText}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Evidence Checklist Card */}
        <div className="rounded-2xl bg-white dark:bg-[#03060f] border border-indigo-200/75 dark:border-blue-900/50 p-6 space-y-3 shadow-[0_4px_18px_rgba(99,102,241,0.06)] dark:shadow-sm">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
            <FileText className="w-5 h-5 text-[#6366F1] dark:text-blue-500" />
            <span>Digital Evidence Checklist (What to have before reporting)</span>
          </div>

          <p className="text-xs text-slate-600 dark:text-blue-200/70">
            When filing a complaint with cyber police or the National Cybercrime Portal, having organized digital evidence speeds up investigation:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2 text-xs text-slate-700 dark:text-blue-200/80">
            <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-[#050917] border border-indigo-200/70 dark:border-blue-950 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] dark:bg-blue-500 mt-1.5 shrink-0" />
              <span>Full unedited screenshots showing transaction UTR/Reference numbers and date/time stamps.</span>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-[#050917] border border-indigo-200/70 dark:border-blue-950 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] dark:bg-blue-500 mt-1.5 shrink-0" />
              <span>Bank account statement (PDF) highlighting the fraudulent unauthorized debit.</span>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-[#050917] border border-indigo-200/70 dark:border-blue-950 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] dark:bg-blue-500 mt-1.5 shrink-0" />
              <span>WhatsApp / Telegram chat export without deleting the scammer&apos;s thread.</span>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-[#050917] border border-indigo-200/70 dark:border-blue-950 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] dark:bg-blue-500 mt-1.5 shrink-0" />
              <span>Exact phone number, email ID, URL, or UPI Virtual Payment Address (VPA) of the fraudster.</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() =>
                startChatWithPrompt(
                  'What specific digital evidence should I collect and how should I preserve it before filing an incident report on cybercrime.gov.in?'
                )
              }
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6366F1] dark:text-blue-400 hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Assistant for personalized evidence guidance</span>
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
