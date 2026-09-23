import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, CheckCircle2, TrendingUp, Brain, BookOpen, MessageSquare, Cpu } from 'lucide-react';

const readinessConfig = {
  'Placement Ready': {
    badge: 'Placement Ready',
    bg: 'bg-emerald-50/80',
    border: 'border-emerald-200',
    textColor: 'text-emerald-950',
    badgeBg: 'bg-emerald-600 text-white',
    ringColor: 'stroke-emerald-600',
    icon: ShieldCheck,
    subtext: 'Meets production hiring standards for technical interviews'
  },
  'Almost Ready': {
    badge: 'Almost Ready',
    bg: 'bg-amber-50/80',
    border: 'border-amber-200',
    textColor: 'text-amber-950',
    badgeBg: 'bg-amber-500 text-white',
    ringColor: 'stroke-amber-500',
    icon: AlertCircle,
    subtext: 'Solid baseline; close the targeted gap areas before campus interviews'
  },
  'Needs More Practice': {
    badge: 'Needs More Practice',
    bg: 'bg-neutral-50',
    border: 'border-neutral-200',
    textColor: 'text-neutral-900',
    badgeBg: 'bg-neutral-800 text-white',
    ringColor: 'stroke-neutral-800',
    icon: AlertCircle,
    subtext: 'Key technical depth and communication patterns need strengthening'
  }
};

const PlacementReadinessCard = ({ summary }) => {
  const readiness = summary?.placementReadiness || 'Almost Ready';
  const cfg = readinessConfig[readiness] || readinessConfig['Almost Ready'];
  const Icon = cfg.icon;

  const metrics = [
    {
      label: 'Technical Knowledge',
      score: summary?.technicalKnowledge ?? Math.round((summary?.performanceBreakdown?.technicalKnowledge || 7) * 10),
      icon: Brain,
      desc: 'Correctness, APIs & syntax mastery'
    },
    {
      label: 'Concept Understanding',
      score: summary?.conceptClarity ?? Math.round((summary?.performanceBreakdown?.conceptUnderstanding || 7) * 10),
      icon: BookOpen,
      desc: 'Underlying mechanics & internals'
    },
    {
      label: 'Problem Solving',
      score: summary?.problemSolving ?? Math.round((summary?.performanceBreakdown?.completeness || 7) * 10),
      icon: Cpu,
      desc: 'Edge cases, trade-offs & reasoning'
    },
    {
      label: 'Communication Quality',
      score: summary?.communication ?? Math.round((summary?.performanceBreakdown?.communication || 7) * 10),
      icon: MessageSquare,
      desc: 'Clarity, conciseness & terminology'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-3xl border ${cfg.border} ${cfg.bg} p-6 sm:p-8 shadow-sm space-y-6`}
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cfg.badgeBg} shadow-xs`}>
              <Icon className="h-3.5 w-3.5" />
              {cfg.badge}
            </span>
            <span className="text-xs font-medium text-black/50">
              AI Placement Assessment
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-black">
            Interview Readiness Scorecard
          </h2>
          <p className="text-xs sm:text-sm text-black/60">
            {cfg.subtext}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white border border-black/10 rounded-2xl px-5 py-3 shadow-xs shrink-0 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[11px] font-medium text-black/50 block">Overall Score</span>
            <span className="text-2xl font-bold text-black">{summary?.overallScore || 0}%</span>
          </div>
          <div className="h-9 w-[1px] bg-black/10" />
          <div className="text-left">
            <span className="text-[11px] font-medium text-black/50 block">Evaluation</span>
            <span className="text-xs font-semibold text-black">{readiness}</span>
          </div>
        </div>
      </div>

      {/* AI Explanation Paragraph */}
      {summary?.readinessExplanation && (
        <div className="rounded-2xl border border-black/10 bg-white/90 backdrop-blur-sm p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-black/70 mb-2">
            <TrendingUp className="h-3.5 w-3.5 text-black/60" />
            <span>AI Evaluation Rationale</span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-black/80">
            {summary.readinessExplanation}
          </p>
        </div>
      )}

      {/* 4 Dimension Metrics Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => {
          const MIcon = m.icon;
          const score = Math.min(100, Math.max(0, m.score));
          return (
            <div
              key={m.label}
              className="rounded-2xl border border-black/10 bg-white p-4 space-y-2.5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-black/60">{m.label}</span>
                <MIcon className="h-3.5 w-3.5 text-black/40" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-black">{score}</span>
                <span className="text-xs text-black/40 font-medium">/ 100</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-black transition-all duration-500"
                  style={{ width: `${score}%` }}
                />
              </div>
              <p className="text-[11px] text-black/50 leading-tight pt-0.5">
                {m.desc}
              </p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default PlacementReadinessCard;
