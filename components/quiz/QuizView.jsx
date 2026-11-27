'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { QUIZ_QUESTIONS } from '@/lib/quizData';
import { useChat } from '@/context/ChatContext';
import ViewHeader from '@/components/layout/ViewHeader';

export default function QuizView() {
  const { startChatWithPrompt, recordQuizResult, quizStats } = useChat();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]); // Array of { questionId, selected, isCorrect }
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQ = QUIZ_QUESTIONS[currentIndex];
  const progressPercent = Math.round(((currentIndex + (isCompleted ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100);

  const handleSelectOption = (index) => {
    if (isAnswered) return;

    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === currentQ.correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setUserAnswers((prev) => [
      ...prev,
      {
        questionId: currentQ.id,
        selected: index,
        correct: currentQ.correctIndex,
        isCorrect,
      },
    ]);
  };

  const handleNext = () => {
    if (currentIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsCompleted(true);
      const finalScore = score + (selectedOption === currentQ.correctIndex ? 0 : 0);
      recordQuizResult(finalScore, QUIZ_QUESTIONS.length);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setUserAnswers([]);
    setIsCompleted(false);
  };

  const getScoreBadge = () => {
    const ratio = score / QUIZ_QUESTIONS.length;
    if (ratio === 1) return { title: 'Cyber Defense Master 🛡️', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (ratio >= 0.75) return { title: 'Cyber Aware Citizen 🌟', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
    if (ratio >= 0.5) return { title: 'Developing Defender ⚠️', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { title: 'High Scam Vulnerability 🚨', color: 'text-red-400 bg-red-500/10 border-red-500/30' };
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gradient-to-b from-white via-[#F9FAFF] to-indigo-50/60 dark:bg-none dark:bg-black">
      <ViewHeader
        title="Interactive Cyber Safety Quiz"
        subtitle="Evaluate your fraud defense reflexes across 8 real-world cybercrime scenarios"
        icon={HelpCircle}
      />
      <div className="flex-1 overflow-y-auto text-slate-900 dark:text-slate-100 p-4 md:p-8 scrollbar-thin">
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6366F1]/10 dark:bg-blue-500/10 text-indigo-700 dark:text-blue-400 border border-[#6366F1]/25 dark:border-blue-500/20 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Interactive Cyber Defense Assessment</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Cyber Safety Quiz
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-blue-200/70 max-w-xl mx-auto">
            Test your ability to spot online traps, UPI scams, fake utility bills, and identity theft scenarios in India.
          </p>
        </div>

        {!isCompleted ? (
          <div className="rounded-2xl bg-white dark:bg-[#030612] border border-indigo-200/75 dark:border-blue-950/70 p-6 md:p-8 shadow-[0_6px_24px_rgba(99,102,241,0.07)] dark:shadow-vanta-card space-y-6">
            {/* Progress Header */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-blue-300/60 mb-2">
                <span>
                  Question {currentIndex + 1} of {QUIZ_QUESTIONS.length}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#6366F1]/10 dark:bg-blue-500/10 text-indigo-700 dark:text-blue-400 border border-[#6366F1]/25 dark:border-blue-500/20">
                  {currentQ.category}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-indigo-100/80 dark:bg-blue-950/50 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#6366F1] to-indigo-600 dark:from-blue-600 dark:to-indigo-500 transition-all duration-300 shadow-[0_0_8px_rgba(99,102,241,0.4)] dark:shadow-cool-blue-xs"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQ.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((option, idx) => {
                let btnStyle = 'border-indigo-200/75 dark:border-blue-950/80 bg-white dark:bg-[#040816] hover:border-[#6366F1]/60 dark:hover:border-blue-500/50 hover:bg-indigo-50/50 dark:hover:bg-blue-950/40 text-slate-800 dark:text-slate-100';

                if (isAnswered) {
                  if (idx === currentQ.correctIndex) {
                    btnStyle = 'border-emerald-500/80 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.2)]';
                  } else if (idx === selectedOption) {
                    btnStyle = 'border-red-500/80 bg-red-500/10 text-red-800 dark:text-red-200 font-semibold shadow-[0_0_15px_rgba(239,68,68,0.2)]';
                  } else {
                    btnStyle = 'border-slate-200 dark:border-blue-950/40 opacity-50 text-slate-400 dark:text-slate-500';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all text-xs md:text-sm flex items-start justify-between gap-3 ${btnStyle}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-blue-950/60 border border-slate-200 dark:border-blue-900/50 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{option}</span>
                    </div>

                    {isAnswered && idx === currentQ.correctIndex && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    )}

                    {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                      <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Box (Visible once answered) */}
            {isAnswered && (
              <div
                className={`p-4 rounded-xl border text-xs md:text-sm leading-relaxed animate-fade-in ${
                  selectedOption === currentQ.correctIndex
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  {selectedOption === currentQ.correctIndex ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Correct!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span>Incorrect Choice</span>
                    </>
                  )}
                </div>
                <p>{currentQ.explanation}</p>
              </div>
            )}

            {/* Action Bar */}
            {isAnswered && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-indigo-700 dark:from-blue-600 dark:to-indigo-600 text-white font-semibold text-xs md:text-sm hover:from-indigo-500 hover:to-indigo-600 dark:hover:from-blue-500 dark:hover:to-indigo-500 transition-all shadow-[0_6px_18px_rgba(99,102,241,0.3)] dark:shadow-cool-blue-xs"
                >
                  <span>{currentIndex + 1 === QUIZ_QUESTIONS.length ? 'View Results' : 'Next Question'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Results View */
          <div className="rounded-2xl bg-white dark:bg-[#030612] border border-indigo-200/75 dark:border-blue-950/70 p-6 md:p-8 shadow-[0_6px_24px_rgba(99,102,241,0.08)] dark:shadow-vanta-card text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6366F1] to-indigo-700 dark:from-blue-600 dark:to-indigo-600 text-white flex items-center justify-center mx-auto shadow-[0_10px_28px_rgba(99,102,241,0.35)] dark:shadow-cool-blue-lg">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold mb-2 ${getScoreBadge().color}`}>
                <Award className="w-4 h-4" />
                <span>{getScoreBadge().title}</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                Quiz Completed!
              </h2>

              <p className="mt-1 text-sm text-slate-600 dark:text-blue-200/70">
                You scored <strong className="text-[#6366F1] dark:text-blue-400 font-bold">{score}</strong> out of{' '}
                <strong>{QUIZ_QUESTIONS.length}</strong> ({Math.round((score / QUIZ_QUESTIONS.length) * 100)}%)
              </p>
            </div>

            {/* Performance Analysis Box */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#040816] border border-slate-200 dark:border-blue-950/60 text-left text-xs md:text-sm space-y-2">
              <div className="font-semibold text-slate-900 dark:text-white">
                Key Takeaway:
              </div>
              <p className="text-slate-600 dark:text-blue-200/80 leading-relaxed">
                {score >= 6
                  ? 'Excellent digital vigilance! You have a solid grasp of UPI protocols, emergency golden hour rules, and deceptive phishing tactics.'
                  : 'Great effort! Reviewing our Cyber Awareness guides on UPI fraud and SMS phishing will help reinforce your online safety reflexes.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRestart}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-blue-900/60 text-slate-700 dark:text-blue-200 hover:bg-slate-100 dark:hover:bg-blue-950/50 font-semibold text-xs md:text-sm transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Quiz</span>
              </button>

              <button
                onClick={() =>
                  startChatWithPrompt(
                    `I just completed the Cyber Safety Quiz with a score of ${score}/${QUIZ_QUESTIONS.length}. What are the most critical cyber safety rules every Indian citizen should follow?`
                  )
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-indigo-700 dark:from-blue-600 dark:to-indigo-600 text-white font-semibold text-xs md:text-sm hover:from-indigo-500 hover:to-indigo-600 dark:hover:from-blue-500 dark:hover:to-indigo-500 transition-all shadow-[0_6px_18px_rgba(99,102,241,0.3)] dark:shadow-cool-blue-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ask AI for Safety Advice</span>
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
