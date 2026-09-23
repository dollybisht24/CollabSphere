import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Lock,
  Play,
  Award,
  Zap,
  BookOpen,
  Tv,
  PenTool,
  Mic,
  Volume2,
  Sparkles,
  ChevronRight,
  Flame,
  Clock,
  TrendingUp,
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import { englishAPI } from '../../utils/api';
import PhaseDetailView from './PhaseDetailView';

const LEVEL_TABS = [
  { id: 'Beginner', code: 'A1', title: 'Level 1: Beginner (A1)', color: 'border-emerald-500 text-emerald-600 bg-emerald-50' },
  { id: 'Elementary', code: 'A2', title: 'Level 2: Elementary (A2)', color: 'border-blue-500 text-blue-600 bg-blue-50' },
  { id: 'Intermediate', code: 'B1', title: 'Level 3: Intermediate (B1)', color: 'border-purple-500 text-purple-600 bg-purple-50' },
  { id: 'Upper-Intermediate', code: 'B2', title: 'Level 4: Upper-Int (B2)', color: 'border-amber-500 text-amber-600 bg-amber-50' },
  { id: 'Advanced', code: 'C1', title: 'Level 5: Advanced (C1/C2)', color: 'border-rose-500 text-rose-600 bg-rose-50' }
];

export default function LearningPathView({ profile, onPhaseProgressUpdate, onNavigateLab }) {
  const [journeyData, setJourneyData] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(profile?.englishLevel || 'Beginner');
  const [loading, setLoading] = useState(true);
  const [activePhaseDetail, setActivePhaseDetail] = useState(null);

  useEffect(() => {
    loadJourney();
  }, [profile?.englishLevel, profile?.currentPhase]);

  const loadJourney = async () => {
    try {
      setLoading(true);
      const res = await englishAPI.getJourneyPhases();
      setJourneyData(res);
      if (res.currentLevel) {
        setSelectedLevel(res.currentLevel);
      }
    } catch (err) {
      console.error('Error loading journey phases:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentLevelPhases = journeyData?.phases?.filter(p => p.level === selectedLevel) || [];

  const handleOpenPhase = (phase) => {
    if (phase.status === 'locked') {
      toast.error('Complete the previous phase with 70%+ score to unlock this phase');
      return;
    }
    setActivePhaseDetail(phase);
  };

  // If viewing a detailed phase, render PhaseDetailView
  if (activePhaseDetail) {
    return (
      <PhaseDetailView
        phase={activePhaseDetail}
        userLevel={profile?.englishLevel || 'Beginner'}
        onBack={() => {
          setActivePhaseDetail(null);
          loadJourney();
        }}
        onPhaseUpdated={() => {
          loadJourney();
          if (onPhaseProgressUpdate) onPhaseProgressUpdate();
        }}
      />
    );
  }

  // Active user phase for hero card
  const activePhase = journeyData?.phases?.find(p => p.status === 'current') ||
    journeyData?.phases?.find(p => p.level === profile?.englishLevel && p.phaseNumber === (profile?.currentPhase || 1)) ||
    currentLevelPhases[0] || null;

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & METRICS BAR */}
      <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> 5 Levels • 50 Phases
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Your English Learning Journey
            </h1>
            <p className="text-sm font-semibold text-purple-700">
              Learn. Practice. Improve. Achieve.
            </p>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl">
              From foundational concepts to native-level fluency. Complete structured multi-part modules, practice with speech AI, and master each phase to earn your official certificate.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
              <div className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400">Current Level</div>
              <div className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                {profile?.englishLevel || 'Beginner'}
              </div>
            </div>

            <div className="rounded-2xl border border-purple-200 bg-purple-50 px-3.5 py-2.5">
              <div className="text-[9px] uppercase font-extrabold tracking-wider text-purple-600">Target Level</div>
              <div className="text-sm sm:text-base font-black text-purple-900 mt-0.5">
                Advanced (C1)
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
              <div className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400">Streak</div>
              <div className="flex items-center gap-1 text-sm sm:text-base font-black text-orange-600 mt-0.5">
                <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
                <span>{profile?.streak || 1} Days</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
              <div className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400">Completed Lessons</div>
              <div className="text-sm sm:text-base font-black text-emerald-600 mt-0.5">
                {profile?.completedLessons || 0}
              </div>
            </div>
          </div>
        </div>

        {/* 6-SKILL PROGRESS CHIPS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-4 border-t border-slate-100">
          {[
            { label: 'Reading', score: profile?.skillScores?.reading || 65, color: 'text-indigo-600' },
            { label: 'Writing', score: profile?.skillScores?.writing || 60, color: 'text-purple-600' },
            { label: 'Listening', score: profile?.skillScores?.listening || 68, color: 'text-cyan-600' },
            { label: 'Speaking', score: profile?.skillScores?.speaking || 55, color: 'text-amber-600' },
            { label: 'Vocabulary', score: profile?.skillScores?.vocabulary || 70, color: 'text-emerald-600' },
            { label: 'Grammar', score: profile?.skillScores?.grammar || 64, color: 'text-rose-600' }
          ].map((s) => (
            <div key={s.label} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70">
              <div className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</div>
              <div className={`text-sm font-black ${s.color}`}>{s.score}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. LARGE PROGRESS VISUALIZATION & CONTINUE HERO */}
      {activePhase && (
        <div className="rounded-[28px] border border-black/10 bg-gradient-to-tr from-[#0f172a] via-[#1e1b4b] to-[#1e293b] p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-purple-500/30 text-purple-200 border border-purple-400/20">
                Active Level: {profile?.englishLevel || 'Beginner'}
              </span>
              <span className="text-xs text-white/50">Next Milestone</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {activePhase.title}
            </h2>
            <p className="text-xs sm:text-sm text-white/70 max-w-xl">
              {activePhase.subtitle}
            </p>

            {/* Progress bar */}
            <div className="space-y-1.5 max-w-md">
              <div className="flex justify-between text-xs font-semibold text-white/70">
                <span>Phase Progress</span>
                <span className="text-purple-300 font-bold">{activePhase.progressPercent || 0}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-400 to-indigo-400"
                  style={{ width: `${activePhase.progressPercent || 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => handleOpenPhase(activePhase)}
              className="px-6 py-3.5 rounded-full bg-white text-slate-900 font-black text-xs hover:bg-slate-100 transition flex items-center gap-2 shadow-lg shadow-black/20"
            >
              <span>Continue Phase →</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. 5-LEVEL TABS */}
      <div className="rounded-[28px] border border-black/10 bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {LEVEL_TABS.map((tab) => {
            const isSelected = selectedLevel === tab.id;
            const isUserCurrent = profile?.englishLevel === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedLevel(tab.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <span>{tab.title}</span>
                {isUserCurrent && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. RICH 10-PHASE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentLevelPhases.map((phase, idx) => {
          const isCompleted = phase.status === 'completed';
          const isCurrent = phase.status === 'current';
          const isLocked = phase.status === 'locked';

          return (
            <motion.div
              key={phase.phaseId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => handleOpenPhase(phase)}
              className={`rounded-[24px] border p-6 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isCurrent
                  ? 'border-purple-500 bg-white shadow-md ring-2 ring-purple-500/20 hover:border-purple-600'
                  : isCompleted
                  ? 'border-emerald-200 bg-white hover:border-emerald-300'
                  : isLocked
                  ? 'border-slate-200 bg-slate-50/60 opacity-60 cursor-not-allowed'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header tag and status */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                      isCurrent
                        ? 'bg-purple-600 text-white'
                        : isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isLocked
                        ? 'bg-slate-200 text-slate-500'
                        : 'bg-blue-50 text-blue-700'
                    }`}>
                      Phase {phase.phaseNumber}
                    </span>

                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full animate-pulse">
                        <Zap className="w-3 h-3 fill-purple-700" /> Active
                      </span>
                    )}
                  </div>

                  <div>
                    {isCompleted ? (
                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mastered ({phase.score}%)</span>
                      </div>
                    ) : isLocked ? (
                      <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked</span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-600">Unlocked</span>
                    )}
                  </div>
                </div>

                <h3 className="font-extrabold text-slate-900 text-lg leading-snug">
                  {phase.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2">
                  {phase.subtitle}
                </p>

                {/* Focus skills chips */}
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {phase.focusSkills?.map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Course stats: 8 Lessons, 2 Quizzes, ~2 Hours */}
                <div className="mt-4 flex items-center gap-3 text-[11px] font-semibold text-slate-400">
                  <span>8 Lessons</span>
                  <span>•</span>
                  <span>2 Quizzes</span>
                  <span>•</span>
                  <span>{phase.estimatedTime || '~2 Hours'}</span>
                </div>

                {/* Progress bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-slate-700">{phase.progressPercent || 0}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isCurrent ? 'bg-purple-600' : 'bg-emerald-500'}`}
                      style={{ width: `${phase.progressPercent || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action bar */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">8 Modules • 70% to pass</span>
                <span className={`font-bold flex items-center gap-1 ${
                  isCurrent ? 'text-purple-600' : 'text-slate-700'
                }`}>
                  {isCurrent ? 'Continue Phase →' : isCompleted ? 'Review Phase →' : 'Open Phase →'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
