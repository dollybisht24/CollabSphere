import React from 'react';
import { motion } from 'framer-motion';
import { Compass, ArrowRight, Target, Flame, CheckCircle2 } from 'lucide-react';

const priorityBadges = {
  1: {
    label: 'Priority 1 · Critical Focus',
    badgeClass: 'bg-black text-white',
    borderClass: 'border-black/20',
    cardBg: 'bg-neutral-50/80'
  },
  2: {
    label: 'Priority 2 · Moderate Focus',
    badgeClass: 'bg-neutral-200 text-black',
    borderClass: 'border-black/10',
    cardBg: 'bg-white'
  },
  3: {
    label: 'Priority 3 · Refinement',
    badgeClass: 'bg-neutral-100 text-black/70',
    borderClass: 'border-black/10',
    cardBg: 'bg-white'
  }
};

const ImprovementPlanCard = ({ plan = [], onStartPractice }) => {
  if (!plan || plan.length === 0) {
    return null;
  }

  // Ensure items have proper priority numbers 1, 2, 3
  const normalizedPlan = plan.map((item, idx) => ({
    priority: item.priority || idx + 1,
    topic: item.topic || `Focus Area ${idx + 1}`,
    action: item.action || item.recommendation || 'Review core documentation and build mini-projects.',
    focusSkills: Array.isArray(item.focusSkills) ? item.focusSkills : []
  }));

  const topPriority = normalizedPlan[0];

  return (
    <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-neutral-50 px-3 py-1 text-xs font-semibold text-black/70 mb-2">
            <Compass className="h-3.5 w-3.5 text-black/60" />
            <span>Personalized AI Learning Roadmap</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-black">
            Actionable Improvement Plan
          </h3>
          <p className="text-xs sm:text-sm text-black/55">
            Follow this 3-tier sequence to convert weak areas into confident interview responses.
          </p>
        </div>

        {onStartPractice && topPriority && (
          <button
            onClick={() => onStartPractice(topPriority)}
            className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-neutral-800 transition shadow-sm shrink-0 self-start sm:self-auto"
          >
            <span>Start Recommended Practice</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {normalizedPlan.map((step, idx) => {
          const cfg = priorityBadges[step.priority] || priorityBadges[Math.min(3, idx + 1)];

          return (
            <motion.div
              key={step.priority || idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`rounded-2xl border ${cfg.borderClass} ${cfg.cardBg} p-5 flex flex-col justify-between space-y-4`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${cfg.badgeClass}`}>
                    {cfg.label}
                  </span>
                  <span className="text-xs font-mono text-black/40">Step 0{idx + 1}</span>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-black">
                    {step.topic}
                  </h4>
                  <p className="text-xs text-black/70 leading-relaxed mt-1.5">
                    {step.action}
                  </p>
                </div>
              </div>

              {step.focusSkills?.length > 0 && (
                <div className="pt-3 border-t border-black/5 space-y-1.5">
                  <span className="text-[10px] font-semibold text-black/40 uppercase tracking-wider block">
                    Target Concepts
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {step.focusSkills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="rounded-lg border border-black/10 bg-white px-2 py-0.5 text-[11px] font-medium text-black/75"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ImprovementPlanCard;
