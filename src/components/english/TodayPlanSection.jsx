import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Flame,
  Zap,
  BookOpen,
  Tv,
  PenTool,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Play,
  Check,
  ChevronRight,
  GraduationCap,
  Volume2,
  Mic,
  ShieldCheck
} from 'lucide-react';

const JOURNEY_STEPS = [
  {
    step: '01',
    key: 'vocab',
    title: 'Vocabulary Boost',
    subtitle: "Spaced review & new words",
    tabId: 'vocab',
    duration: '10 min',
    xp: '+40 XP',
    icon: Sparkles,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
  },
  {
    step: '02',
    key: 'cartoon',
    title: 'Cartoon Learning',
    subtitle: 'YouTube animations & AI voice teacher',
    tabId: 'cartoons',
    duration: '15 min',
    xp: '+90 XP',
    icon: Tv,
    color: 'from-blue-600 to-cyan-500',
    bgColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
  },
  {
    step: '03',
    key: 'listening',
    title: 'Listening Lab',
    subtitle: 'Audio comprehension & dialogues',
    tabId: 'listening',
    duration: '5 min',
    xp: '+50 XP',
    icon: Volume2,
    color: 'from-cyan-600 to-blue-500',
    bgColor: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20'
  },
  {
    step: '04',
    key: 'speaking',
    title: 'Speaking Lab',
    subtitle: 'Microphone voice AI conversation',
    tabId: 'speaking',
    duration: '5 min',
    xp: '+60 XP',
    icon: Mic,
    color: 'from-purple-600 to-indigo-600',
    bgColor: 'bg-purple-500/10 text-purple-600 border-purple-500/20'
  },
  {
    step: '05',
    key: 'story',
    title: 'Reading Story',
    subtitle: 'Narrated stories & sentence breakdowns',
    tabId: 'stories',
    duration: '10 min',
    xp: '+80 XP',
    icon: BookOpen,
    color: 'from-rose-600 to-amber-500',
    bgColor: 'bg-rose-500/10 text-rose-600 border-rose-500/20'
  },
  {
    step: '06',
    key: 'writing',
    title: 'Writing Practice',
    subtitle: '6-part pedagogical diagnosis',
    tabId: 'writing',
    duration: '10 min',
    xp: '+75 XP',
    icon: PenTool,
    color: 'from-indigo-600 to-purple-600',
    bgColor: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
  },
  {
    step: '07',
    key: 'grammar',
    title: 'Contextual Grammar',
    subtitle: 'Learn grammar in real situations',
    tabId: 'grammar',
    duration: '10 min',
    xp: '+50 XP',
    icon: ShieldCheck,
    color: 'from-rose-500 to-pink-600',
    bgColor: 'bg-rose-500/10 text-rose-600 border-rose-500/20'
  },
  {
    step: '08',
    key: 'quiz',
    title: 'Daily Challenge & Quiz',
    subtitle: 'Maintain your streak & earn bonus XP',
    tabId: 'quiz_modal',
    duration: '5 min',
    xp: '+60 XP',
    icon: Award,
    color: 'from-emerald-600 to-teal-500',
    bgColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
  }
];

export default function TodayPlanSection({
  dailyPlan,
  onToggleTask,
  onNavigateTab,
  onOpenQuiz,
  metrics,
  streak = 1,
  xp = 150
}) {
  const completedTasks = dailyPlan?.completedTasks || [];
  const completedCount = completedTasks.length;
  const totalSteps = JOURNEY_STEPS.length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalSteps) * 100));

  // Find next step to continue
  const currentStep = JOURNEY_STEPS.find((s) => !completedTasks.includes(s.key)) || JOURNEY_STEPS[0];

  const handleStepAction = (step) => {
    if (step.tabId === 'quiz_modal') {
      onOpenQuiz();
    } else {
      onNavigateTab(step.tabId);
    }
  };

  return (
    <div className="space-y-8">
      {/* ========================================================================= */}
      {/* 1. PROMINENT HERO: "CONTINUE LEARNING" (Requirement 1) */}
      {/* ========================================================================= */}
      <div className="rounded-[36px] border border-black/10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-10 shadow-2xl overflow-hidden relative">
        {/* Ambient Decorative Accents */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.3fr_1fr] items-center">
          {/* Left Hero Details */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/20 px-4 py-1 text-xs font-black uppercase tracking-widest text-rose-300">
              <Sparkles className="w-3.5 h-3.5" /> Continue Your Journey
            </div>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Today's Story:<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-white">
                A Day at the Café
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Watch Emma and Alex in a short animated cartoon café. Listen to natural voice narration, follow highlighted subtitles, and discover daily conversational English.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="px-3.5 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold border border-white/10">
                Beginner • 8 min
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Animated Cartoon Story
              </span>
              <span className="text-xs text-amber-300 font-extrabold flex items-center gap-1">
                <Award className="w-4 h-4" /> +120 XP
              </span>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigateTab('stories')}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 hover:from-rose-500 hover:to-amber-400 text-white font-black text-sm px-6 py-3.5 shadow-xl shadow-rose-600/30 transition hover:scale-105 active:scale-95"
              >
                <span>Continue Story →</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('cartoons')}
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-black text-sm px-6 py-3.5 border border-indigo-400/30 shadow-lg shadow-indigo-600/20 transition hover:scale-105 active:scale-95"
              >
                <Tv className="w-4 h-4 text-indigo-300" />
                <span>Watch Zootopia Lesson →</span>
              </button>
            </div>
          </div>

          {/* Right Visual Story Thumbnail */}
          <div
            onClick={() => onNavigateTab('stories')}
            className="group cursor-pointer rounded-3xl overflow-hidden border-2 border-white/20 bg-gradient-to-br from-amber-100/15 via-rose-100/10 to-indigo-950 p-6 shadow-2xl hover:border-amber-400/60 transition-all duration-300 relative"
          >
            <div className="w-full h-52 rounded-2xl bg-gradient-to-br from-amber-200/90 via-orange-100 to-amber-50 flex flex-col items-center justify-center relative shadow-inner overflow-hidden">
              {/* Café visual scene elements */}
              <div className="text-5xl filter drop-shadow">☕ 🥐</div>
              <div className="mt-3 flex items-center gap-3 bg-slate-900/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-white text-xs font-black shadow-md border border-white/15">
                <span>Emma & Alex</span>
                <span className="text-amber-400">★ 5 Scenes</span>
              </div>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/95 text-rose-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition">
                  <Play className="w-6 h-6 fill-rose-600 ml-0.5" />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-white/80 font-bold">Scene 1: Emma Enters the Café</span>
              <span className="text-amber-400 font-extrabold flex items-center gap-1 group-hover:translate-x-1 transition">
                Start Watching <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TODAY'S LEARNING JOURNEY — VISUAL PROGRESSION (Requirement 17) */}
      {/* ========================================================================= */}
      <div className="rounded-[36px] border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-indigo-800 mb-1">
              <Clock className="w-3.5 h-3.5" /> Progression Path
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Today's Learning Journey
            </h3>
            <p className="text-xs text-slate-500">
              Follow this connected step-by-step path to practice vocabulary, cartoons, stories, writing, and test yourself.
            </p>
          </div>

          {/* Overall Progress Badge */}
          <div className="flex items-center gap-3 bg-neutral-50 px-4 py-2.5 rounded-2xl border border-black/5">
            <div className="text-right">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Completion</div>
              <div className="text-sm font-black text-slate-900">{completedCount} of {totalSteps} Done</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-md">
              {progressPercent}%
            </div>
          </div>
        </div>

        {/* CONNECTED JOURNEY ROADMAP (Step 01 -> 02 -> 03 -> 04 -> 05) */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {JOURNEY_STEPS.map((step, idx) => {
            const isCompleted = completedTasks.includes(step.key);
            const isCurrent = currentStep.key === step.key && !isCompleted;
            const Icon = step.icon;

            return (
              <div
                key={step.key}
                onClick={() => handleStepAction(step)}
                className={`group cursor-pointer rounded-2xl border p-4 flex flex-col justify-between transition-all relative ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-300'
                    : isCurrent
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-md ring-2 ring-indigo-500/20'
                    : 'border-black/5 bg-neutral-50/70 hover:border-black/20 hover:bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-black text-slate-400 group-hover:text-slate-900">
                      {step.step}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-200/80 text-emerald-800'
                          : isCurrent
                          ? 'bg-indigo-600 text-white'
                          : 'bg-neutral-200 text-slate-600'
                      }`}
                    >
                      {isCompleted ? '✓ Completed' : isCurrent ? '→ Continue' : '○ Pending'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl border ${step.bgColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 leading-snug">
                        {step.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {step.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-400">{step.duration}</span>
                  <span className={isCompleted ? 'text-emerald-700 font-extrabold' : 'text-indigo-600'}>
                    {isCompleted ? 'Finished ✓' : step.xp}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SECONDARY LEARNING ACTIVITIES (Hierarchical Design - Requirement 1) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <h4 className="text-sm font-black uppercase tracking-wider text-slate-400 px-1">
          Explore Specific English Learning Modes
        </h4>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card A: Daily AI Vocabulary */}
          <div
            onClick={() => onNavigateTab('vocab')}
            className="group cursor-pointer rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50/50 to-white p-5 flex flex-col justify-between hover:shadow-md transition hover:-translate-y-0.5"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-black text-slate-900 text-base">Daily AI Vocabulary</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Learn 3 curated words, usage in dialogues, and practice in real sentences.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-bold text-amber-700 pt-3 border-t border-amber-100">
              <span>Mini Lesson</span>
              <span className="flex items-center gap-1 group-hover:translate-x-1 transition">
                Start →
              </span>
            </div>
          </div>

          {/* Card B: Cartoon Conversations */}
          <div
            onClick={() => onNavigateTab('cartoons')}
            className="group cursor-pointer rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-50/50 to-white p-5 flex flex-col justify-between hover:shadow-md transition hover:-translate-y-0.5"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-700 flex items-center justify-center mb-3">
                <Tv className="w-5 h-5" />
              </div>
              <h4 className="font-black text-slate-900 text-base">Cartoon Conversations</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Watch animated episodes with 3 modes: Watch, Learn, and Practice.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-bold text-blue-700 pt-3 border-t border-blue-100">
              <span>Watch Episode</span>
              <span className="flex items-center gap-1 group-hover:translate-x-1 transition">
                Watch →
              </span>
            </div>
          </div>

          {/* Card C: Writing Practice */}
          <div
            onClick={() => onNavigateTab('writing')}
            className="group cursor-pointer rounded-3xl border border-purple-200/80 bg-gradient-to-br from-purple-50/50 to-white p-5 flex flex-col justify-between hover:shadow-md transition hover:-translate-y-0.5"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-700 flex items-center justify-center mb-3">
                <PenTool className="w-5 h-5" />
              </div>
              <h4 className="font-black text-slate-900 text-base">AI Writing Practice</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Write 5-6 sentences and get deep rule explanations on WHY something is corrected.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-bold text-purple-700 pt-3 border-t border-purple-100">
              <span>Write with AI</span>
              <span className="flex items-center gap-1 group-hover:translate-x-1 transition">
                Write →
              </span>
            </div>
          </div>

          {/* Card D: AI English Tutor */}
          <div
            onClick={() => onNavigateTab('tutor')}
            className="group cursor-pointer rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/50 to-white p-5 flex flex-col justify-between hover:shadow-md transition hover:-translate-y-0.5"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 flex items-center justify-center mb-3">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h4 className="font-black text-slate-900 text-base">AI English Tutor</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Practice job interviews, ask grammar questions, and refine speaking confidence.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-bold text-indigo-700 pt-3 border-t border-indigo-100">
              <span>Chat & Ask</span>
              <span className="flex items-center gap-1 group-hover:translate-x-1 transition">
                Talk →
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
