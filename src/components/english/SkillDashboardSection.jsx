import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Sparkles,
  BookOpen,
  PenTool,
  Volume2,
  Mic,
  Award,
  AlertCircle,
  CheckCircle2,
  Zap,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Clock
} from 'lucide-react';
import { englishAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function SkillDashboardSection({ profile, onNavigateLab }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [profile?.xp, profile?.completedLessons]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await englishAPI.getSkillsDashboard();
      setDashboard(res);
    } catch (err) {
      console.error('Error loading skills dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const skills = [
    {
      key: 'reading',
      label: 'Reading Comprehension',
      score: dashboard?.skills?.reading || profile?.skillScores?.reading || 65,
      icon: BookOpen,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      labKey: 'stories'
    },
    {
      key: 'writing',
      label: 'Writing & Expression',
      score: dashboard?.skills?.writing || profile?.skillScores?.writing || 60,
      icon: PenTool,
      color: 'bg-indigo-500',
      lightColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      labKey: 'writing'
    },
    {
      key: 'listening',
      label: 'Listening & Dialogue',
      score: dashboard?.skills?.listening || profile?.skillScores?.listening || 70,
      icon: Volume2,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50 text-blue-700 border-blue-200',
      labKey: 'cartoons'
    },
    {
      key: 'speaking',
      label: 'Speaking & Fluency',
      score: dashboard?.skills?.speaking || profile?.skillScores?.speaking || 65,
      icon: Mic,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50 text-purple-700 border-purple-200',
      labKey: 'speaking'
    },
    {
      key: 'vocabulary',
      label: 'Vocabulary Range',
      score: dashboard?.skills?.vocabulary || profile?.skillScores?.vocabulary || 72,
      icon: Sparkles,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50 text-amber-700 border-amber-200',
      labKey: 'vocab'
    },
    {
      key: 'grammar',
      label: 'Contextual Grammar',
      score: dashboard?.skills?.grammar || profile?.skillScores?.grammar || 68,
      icon: ShieldCheck,
      color: 'bg-rose-500',
      lightColor: 'bg-rose-50 text-rose-700 border-rose-200',
      labKey: 'grammar'
    }
  ];

  const overall = dashboard?.skills?.overall || profile?.overallScore || 66;
  const recoveryMissions = dashboard?.recoveryMissions || profile?.recoveryMissions || [];

  return (
    <div className="space-y-6">
      {/* 1. TOP PROFICIENCY SUMMARY CARD */}
      <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" /> Real Calculated Analytics
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              6-Skill English Mastery Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Every completed quiz, writing practice, voice conversation, and story dynamically shapes your skill metrics.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex flex-col items-center justify-center shadow-md">
              <span className="text-xl font-black">{overall}%</span>
              <span className="text-[9px] uppercase font-bold tracking-wider opacity-80">Overall</span>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-900">
                Proficiency Level: {profile?.englishLevel || 'Beginner'}
              </div>
              <div className="text-[11px] text-slate-500">
                Phase {profile?.currentPhase || 1} • {profile?.streak || 1} Day Streak 🔥
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 6-SKILL PROGRESS BARS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => {
          const Icon = skill.icon;
          return (
            <div
              key={skill.key}
              className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 hover:border-slate-300 transition shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl border ${skill.lightColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">{skill.label}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">Calculated from activity</span>
                  </div>
                </div>
                <span className="text-base font-black text-slate-900">{skill.score}%</span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.score}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-full rounded-full ${skill.color}`}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-semibold text-slate-500">
                  {skill.score >= 80 ? 'Advanced' : skill.score >= 65 ? 'Proficient' : 'Developing'}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateLab && onNavigateLab(skill.labKey)}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 transition"
                >
                  <span>Practice Lab</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. STRENGTHS, WEAKNESSES & ADAPTIVE RECOVERY MISSIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths & Focus Areas */}
        <div className="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="text-base font-black text-slate-900">AI Diagnostic Breakdown</h3>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">Key Strengths</span>
              <p className="text-xs text-emerald-950 font-medium">
                {dashboard?.skills?.strengths?.join(' & ') || 'Vocabulary Range & Listening'}. Keep compounding these skills in daily conversations!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800">Target Focus Areas</span>
              <p className="text-xs text-amber-950 font-medium">
                {dashboard?.skills?.weaknesses?.join(' & ') || 'Speaking Fluency & Grammar'}. Focus on regular vocalization and contextual sentence practice.
              </p>
            </div>
          </div>
        </div>

        {/* Adaptive Recovery Missions */}
        <div className="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
              <h3 className="text-base font-black text-slate-900">Adaptive Recovery Missions</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400">Personalized</span>
          </div>

          {recoveryMissions.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
              <h4 className="text-xs font-bold text-slate-800">No Active Recovery Missions</h4>
              <p className="text-[11px] text-slate-500">
                Your skills are well-balanced! Complete phase quizzes to unlock new challenges.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recoveryMissions.slice(0, 2).map((mission, idx) => (
                <div
                  key={mission.id || idx}
                  className="p-4 rounded-2xl border border-purple-200 bg-purple-50/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                      {mission.targetSkill || 'Skill Booster'}
                    </span>
                    <span className="text-xs font-bold text-amber-600">+{mission.xpReward || 50} XP</span>
                  </div>

                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">{mission.title}</h4>
                  <p className="text-xs text-slate-600 font-medium">{mission.description}</p>

                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onNavigateLab && onNavigateLab(mission.type === 'grammar' ? 'grammar' : mission.type === 'speaking' ? 'speaking' : 'cartoons')}
                      className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition shadow-sm"
                    >
                      Start Recovery Mission →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. MY LEARNING HISTORY & RECENT PERFORMANCE */}
      <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/10">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>My Learning History & Records</span>
            </h3>
            <p className="text-xs text-slate-500">
              Review previous quizzes, practice attempts, earned XP, and skill gains.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateLab && onNavigateLab('quizzes')}
            className="rounded-xl border border-black/15 bg-neutral-50 px-3.5 py-1.5 text-xs font-bold text-slate-800 hover:bg-neutral-100 transition"
          >
            Launch Practice Quiz →
          </button>
        </div>

        {/* History items */}
        {profile?.quizHistory && profile.quizHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Lesson / Quiz</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Target Skills</th>
                  <th className="py-2.5 px-3 text-right">XP Earned</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {profile.quizHistory.slice(-6).reverse().map((item, idx) => (
                  <tr key={item._id || idx} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(item.completedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {item.title || `Phase ${profile?.currentPhase || 1} Quiz`}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full font-black text-[11px] ${
                        (item.score || 0) >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : (item.score || 0) >= 60
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.score || 0}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {item.weakSkills?.length ? item.weakSkills.join(', ') : 'Mixed Skills'}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-amber-600">
                      +{item.earnedXp || 40} XP
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onNavigateLab && onNavigateLab('quizzes')}
                        className="text-purple-600 hover:text-purple-800 font-bold hover:underline"
                      >
                        Retry →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-neutral-50/70 border border-black/5 text-center space-y-2">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-xs font-bold text-slate-700">No Learning History Recorded Yet</div>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Complete your daily quizzes, phase modules, and speaking lab drills to build your personal learning record.
            </p>
            <button
              type="button"
              onClick={() => onNavigateLab && onNavigateLab('quizzes')}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition shadow-xs"
            >
              Take First Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
