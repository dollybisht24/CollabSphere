import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, X, Plus, Check, Code2, Database, Globe, CheckCircle2,
  ListOrdered, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import { projectsAPI } from '../../utils/api';

const ImplementationPlanModal = ({
  isOpen,
  onClose,
  project,
  item,
  onAddToRoadmap
}) => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (isOpen && item && project) {
      setLoading(true);
      setAdded(false);
      projectsAPI.getImplementationPlan(project._id, {
        title: item.title,
        description: item.suggestedImprovement || item.description || '',
        category: item.category || 'Improvement'
      })
        .then(res => setPlan(res.plan))
        .catch(err => toast.error('Failed to generate implementation plan'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, item, project]);

  if (!isOpen || !item) return null;

  const handleAdd = async () => {
    if (onAddToRoadmap && plan) {
      await onAddToRoadmap({
        phase: item.priority === 'High' ? 'Phase 1: Fix Critical Issues' : 'Phase 2: Improve Architecture',
        title: plan.title || item.title,
        description: item.suggestedImprovement || item.description,
        priority: item.priority === 'High' ? 'HIGH' : 'MEDIUM',
        difficulty: plan.difficulty === 'High' ? 'HARD' : plan.difficulty === 'Low' ? 'EASY' : 'MEDIUM',
        source: 'AI_REVIEW',
        implementationPlan: plan
      });
      setAdded(true);
      toast.success('Added to project roadmap with implementation plan!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-2xl rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-5"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-black/10 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-neutral-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black/60 mb-1">
              <FileText className="h-3 w-3" /> AI Implementation Assistant
            </div>
            <h3 className="text-xl font-bold tracking-tight text-black sm:text-2xl">
              {item.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-black/40 hover:bg-neutral-100 hover:text-black transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-black border-t-transparent" />
            <p className="text-xs text-black/60">Generating 8-step implementation plan...</p>
          </div>
        ) : plan ? (
          <div className="space-y-4 text-xs">
            {/* Meta badges */}
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-neutral-100 px-2.5 py-1 font-bold text-black/70">
                Difficulty: {plan.difficulty || 'Medium'}
              </span>
              <span className="rounded-md bg-neutral-100 px-2.5 py-1 font-bold text-black/70">
                Estimated Effort: {plan.estimatedEffort || '2-4 hours'}
              </span>
            </div>

            {/* Files to Create / Modify */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-black/10 bg-neutral-50/70 p-3.5 space-y-1">
                <p className="font-bold text-black flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5" /> Files to Create:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-black/65 font-mono text-[11px]">
                  {plan.filesToCreate?.length ? plan.filesToCreate.map((f, i) => <li key={i}>{f}</li>) : <li>None required</li>}
                </ul>
              </div>

              <div className="rounded-xl border border-black/10 bg-neutral-50/70 p-3.5 space-y-1">
                <p className="font-bold text-black flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5" /> Files to Modify:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-black/65 font-mono text-[11px]">
                  {plan.filesToModify?.length ? plan.filesToModify.map((f, i) => <li key={i}>{f}</li>) : <li>None required</li>}
                </ul>
              </div>
            </div>

            {/* Architecture changes */}
            <div className="grid sm:grid-cols-2 gap-3">
              {plan.apiChanges?.length > 0 && (
                <div className="rounded-xl border border-black/10 bg-white p-3.5 space-y-1 shadow-sm">
                  <p className="font-bold text-black flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-indigo-600" /> API Changes:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-black/65 font-mono text-[11px]">
                    {plan.apiChanges.map((api, i) => <li key={i}>{api}</li>)}
                  </ul>
                </div>
              )}

              {plan.databaseChanges?.length > 0 && (
                <div className="rounded-xl border border-black/10 bg-white p-3.5 space-y-1 shadow-sm">
                  <p className="font-bold text-black flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5 text-amber-600" /> Database Changes:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-black/65 text-[11px]">
                    {plan.databaseChanges.map((db, i) => <li key={i}>{db}</li>)}
                  </ul>
                </div>
              )}

              {plan.dependencies?.length > 0 && (
                <div className="sm:col-span-2 rounded-xl border border-black/10 bg-neutral-50/60 p-3 space-y-1">
                  <p className="font-bold text-black text-[11px]">Dependencies Required:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {plan.dependencies.map((dep, i) => (
                      <span key={i} className="rounded-md bg-white border border-black/10 px-2 py-0.5 font-mono text-[11px] text-black/75">
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Implementation Steps */}
            {plan.implementationSteps?.length > 0 && (
              <div className="rounded-2xl border border-black/10 bg-white p-4 space-y-2 shadow-sm">
                <p className="font-bold text-black uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <ListOrdered className="h-4 w-4" /> Step-by-Step Implementation:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-black/75">
                  {plan.implementationSteps.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
              </div>
            )}

            {/* Testing Steps */}
            {plan.testingSteps?.length > 0 && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-2">
                <p className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Verification & Testing Steps:
                </p>
                <ul className="list-disc list-inside space-y-1 text-emerald-900">
                  {plan.testingSteps.map((test, i) => <li key={i}>{test}</li>)}
                </ul>
              </div>
            )}
          </div>
        ) : null}

        {/* Modal Actions */}
        <div className="pt-4 border-t border-black/10 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-black/15 bg-white px-4 py-2 text-xs font-semibold text-black/70 hover:bg-neutral-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleAdd}
            disabled={added || loading}
            className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-semibold shadow-sm transition ${
              added ? 'bg-neutral-100 text-black/50' : 'bg-black text-white hover:bg-neutral-800'
            }`}
          >
            {added ? <Check className="h-4 w-4 text-emerald-600" /> : <Plus className="h-4 w-4" />}
            <span>{added ? 'Added to Roadmap' : 'Add to Project Roadmap'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ImplementationPlanModal;
