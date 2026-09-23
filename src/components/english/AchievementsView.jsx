import React from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Flame,
  Sparkles,
  BookOpen,
  Volume2,
  Mic,
  PenTool,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Zap,
  Star
} from 'lucide-react';

const ALL_ACHIEVEMENT_BADGES = [
  {
    id: 'first_lesson',
    title: 'First Lesson',
    desc: 'Completed your very first English learning module.',
    icon: '🌱',
    category: 'Milestone',
    condition: (p) => (p?.completedLessons || 0) >= 1
  },
  {
    id: 'streak_7',
    title: '7 Day Streak',
    desc: 'Maintained an unbroken 7-day daily learning streak.',
    icon: '🔥',
    category: 'Consistency',
    condition: (p) => (p?.streak || 0) >= 7
  },
  {
    id: 'vocab_master',
    title: 'Vocabulary Master',
    desc: 'Learned and reviewed 50+ high-frequency vocabulary words.',
    icon: '📚',
    category: 'Vocabulary',
    condition: (p) => (p?.vocabularyBank?.length || 0) >= 20
  },
  {
    id: 'grammar_explorer',
    title: 'Grammar Explorer',
    desc: 'Mastered 5 contextual grammar drill modules.',
    icon: '🛡️',
    category: 'Grammar',
    condition: (p) => (p?.completedLessons || 0) >= 5
  },
  {
    id: 'speaking_starter',
    title: 'Speaking Starter',
    desc: 'Spoke aloud in the Speaking Lab or Voice Partner session.',
    icon: '🎙️',
    category: 'Speaking',
    condition: (p) => (p?.skillScores?.speaking || 0) >= 60
  },
  {
    id: 'listening_pro',
    title: 'Listening Pro',
    desc: 'Scored 80%+ on audio listening comprehension tests.',
    icon: '🎧',
    category: 'Listening',
    condition: (p) => (p?.skillScores?.listening || 0) >= 70
  },
  {
    id: 'reading_champion',
    title: 'Reading Champion',
    desc: 'Completed reading stories and answered all check questions.',
    icon: '📖',
    category: 'Reading',
    condition: (p) => (p?.skillScores?.reading || 0) >= 70
  },
  {
    id: 'writing_expert',
    title: 'Writing Expert',
    desc: 'Submitted writing exercises and applied AI improvements.',
    icon: '✍️',
    category: 'Writing',
    condition: (p) => (p?.skillScores?.writing || 0) >= 65
  },
  {
    id: 'phase_complete',
    title: 'Phase Complete',
    desc: 'Scored 70%+ on a Phase Capstone Quiz and unlocked the next phase.',
    icon: '⭐',
    category: 'Progression',
    condition: (p) => (p?.phaseProgress?.some(ph => ph.status === 'completed'))
  },
  {
    id: 'level_complete',
    title: 'Level Complete',
    desc: 'Graduated through an entire CEFR level curriculum.',
    icon: '👑',
    category: 'Mastery',
    condition: (p) => (p?.englishLevel !== 'Beginner' || (p?.phaseProgress?.length || 0) >= 10)
  }
];

export default function AchievementsView({ profile }) {
  const earnedBadges = ALL_ACHIEVEMENT_BADGES.filter(b => b.condition(profile));
  const progressPercent = Math.round((earnedBadges.length / ALL_ACHIEVEMENT_BADGES.length) * 100);

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
              <Award className="w-3.5 h-3.5 text-amber-600" /> Achievements & Badges
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Your English Milestones
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Celebrate your progress as you practice, complete phases, and converse with AI.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Unlocked</span>
            <div className="text-xl font-black text-slate-900">
              {earnedBadges.length} / {ALL_ACHIEVEMENT_BADGES.length}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-400">Badge Completion</span>
            <span className="text-amber-600 font-extrabold">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. BADGES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_ACHIEVEMENT_BADGES.map((badge, idx) => {
          const isEarned = badge.condition(profile);

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={`rounded-[24px] border p-5 transition flex flex-col justify-between ${
                isEarned
                  ? 'border-amber-300 bg-amber-50/30 shadow-sm'
                  : 'border-slate-200 bg-slate-50/50 opacity-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{badge.icon}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isEarned
                      ? 'bg-amber-100 text-amber-800 border border-amber-300/60'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {badge.category}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base">
                  {badge.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  {badge.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                {isEarned ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked
                  </span>
                ) : (
                  <span className="text-slate-400 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Locked
                  </span>
                )}
                <span className="text-amber-600">+60 XP</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
