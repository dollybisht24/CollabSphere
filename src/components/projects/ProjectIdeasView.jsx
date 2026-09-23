import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Plus, ArrowRight, X, Check, Layers, ShieldCheck,
  Code2, Database, Globe, Sliders, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { projectsAPI } from '../../utils/api';

const ProjectIdeasView = ({
  project,
  featureIdeas = [],
  onRefreshIdeas,
  loadingIdeas,
  onAddToRoadmap
}) => {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [addedIds, setAddedIds] = useState(new Set());

  const handleAddFeatureToRoadmap = async (feature) => {
    if (onAddToRoadmap) {
      await onAddToRoadmap({
        phase: 'Phase 4: Add AI Features',
        title: feature.name,
        description: `${feature.purpose}\n\nUser Story: ${feature.userStory || ''}`,
        priority: 'MEDIUM',
        difficulty: feature.complexity === 'High' ? 'HARD' : feature.complexity === 'Low' ? 'EASY' : 'MEDIUM',
        source: 'FEATURE_IDEA',
        featureSpec: feature
      });
      setAddedIds(prev => new Set([...prev, feature.id || feature.name]));
      toast.success(`"${feature.name}" added to Roadmap!`);
      if (selectedFeature) setSelectedFeature(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-black sm:text-2xl">
            AI Feature Ideas Generator
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-black/60">
            Domain-aware feature recommendations tailored specifically to your project's technology stack and architecture.
          </p>
        </div>

        <button
          onClick={onRefreshIdeas}
          disabled={loadingIdeas}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 transition shadow-sm shrink-0"
        >
          {loadingIdeas ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Generating Ideas...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>✨ Generate Feature Ideas</span>
            </>
          )}
        </button>
      </div>

      {featureIdeas.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-black/20 bg-neutral-50/60 p-12 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-black text-white mb-3">
            <Sparkles className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-black">No Feature Ideas Yet</h3>
          <p className="text-xs sm:text-sm text-black/55 mt-1 max-w-sm mx-auto">
            Click "Generate Feature Ideas" to analyze your project code and discover meaningful additions.
          </p>
          <button
            onClick={onRefreshIdeas}
            disabled={loadingIdeas}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800"
          >
            <Sparkles className="h-4 w-4" /> Generate Ideas Now
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featureIdeas.map((idea, idx) => {
            const isAdded = addedIds.has(idea.id || idea.name);
            const complexityColor =
              idea.complexity === 'High' ? 'bg-red-100 text-red-800' :
              idea.complexity === 'Low' ? 'bg-emerald-100 text-emerald-800' :
              'bg-amber-100 text-amber-800';

            return (
              <div
                key={idea.id || idx}
                className="group flex flex-col justify-between rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition hover:border-black/30 hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-neutral-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black/70">
                      {idea.category || 'Feature'}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${complexityColor}`}>
                      {idea.complexity || 'Medium'} Complexity
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-black group-hover:text-black">
                    {idea.name}
                  </h3>

                  <p className="text-xs leading-relaxed text-black/60 line-clamp-3">
                    {idea.purpose}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-black/10 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFeature(idea)}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-black/15 bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-neutral-50 transition"
                  >
                    <span>View Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddFeatureToRoadmap(idea)}
                    disabled={isAdded}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-sm transition ${
                      isAdded
                        ? 'bg-neutral-100 text-black/40 cursor-default'
                        : 'bg-black text-white hover:bg-neutral-800'
                    }`}
                  >
                    {isAdded ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Plus className="h-3.5 w-3.5" />}
                    <span>{isAdded ? 'Added' : 'Add to Plan'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Feature Specification Modal */}
      <AnimatePresence>
        {selectedFeature && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFeature(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-5"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-black/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-black/70 uppercase">
                      {selectedFeature.category || 'Feature'}
                    </span>
                    <span className="text-xs font-semibold text-black/50">
                      Estimated Complexity: {selectedFeature.complexity || 'Medium'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-black mt-1">
                    {selectedFeature.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedFeature(null)}
                  className="rounded-full p-2 text-black/40 hover:bg-neutral-100 hover:text-black transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Purpose & User Story */}
              <div className="space-y-2 text-xs">
                <p className="font-bold text-black uppercase tracking-wider text-[11px]">Feature Purpose</p>
                <p className="text-sm text-black/70 leading-relaxed">{selectedFeature.purpose}</p>

                {selectedFeature.userStory && (
                  <div className="rounded-xl border border-black/10 bg-neutral-50 p-3.5 mt-2">
                    <p className="font-semibold text-black mb-1">User Story:</p>
                    <p className="text-black/60 italic">"{selectedFeature.userStory}"</p>
                  </div>
                )}
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                {selectedFeature.frontendChanges?.length > 0 && (
                  <div className="rounded-xl border border-black/10 bg-white p-3.5 space-y-1.5 shadow-sm">
                    <p className="font-bold text-black flex items-center gap-1.5">
                      <Code2 className="h-3.5 w-3.5 text-black" /> Required Frontend Changes:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-black/65">
                      {selectedFeature.frontendChanges.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedFeature.backendChanges?.length > 0 && (
                  <div className="rounded-xl border border-black/10 bg-white p-3.5 space-y-1.5 shadow-sm">
                    <p className="font-bold text-black flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-black" /> Required Backend Changes:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-black/65">
                      {selectedFeature.backendChanges.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedFeature.apiEndpoints?.length > 0 && (
                  <div className="rounded-xl border border-black/10 bg-white p-3.5 space-y-1.5 shadow-sm">
                    <p className="font-bold text-black flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5 text-black" /> API Endpoints:
                    </p>
                    <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-black/75">
                      {selectedFeature.apiEndpoints.map((ep, i) => (
                        <li key={i}>{ep}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedFeature.databaseChanges?.length > 0 && (
                  <div className="rounded-xl border border-black/10 bg-white p-3.5 space-y-1.5 shadow-sm">
                    <p className="font-bold text-black flex items-center gap-1.5">
                      <Database className="h-3.5 w-3.5 text-black" /> Database Changes:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-black/65">
                      {selectedFeature.databaseChanges.map((db, i) => (
                        <li key={i}>{db}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Implementation Steps */}
              {selectedFeature.implementationSteps?.length > 0 && (
                <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4 space-y-2 text-xs">
                  <p className="font-bold text-black uppercase tracking-wider text-[11px]">
                    Implementation Steps
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-black/70">
                    {selectedFeature.implementationSteps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-4 border-t border-black/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedFeature(null)}
                  className="rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-black/70 hover:bg-neutral-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleAddFeatureToRoadmap(selectedFeature)}
                  className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add to Project Roadmap</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectIdeasView;
