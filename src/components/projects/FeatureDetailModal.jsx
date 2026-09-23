import React, { useState } from 'react';
import {
  X, Sparkles, Check, Copy, ArrowRight, ShieldAlert,
  Layers, Code2, Database, Network, CheckCircle2,
  Calendar, Wrench, TestTube2, AlertCircle
} from 'lucide-react';

const FeatureDetailModal = ({
  feature,
  isOpen,
  onClose,
  onAddToRoadmap,
  onGeneratePlan
}) => {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState('all');

  if (!isOpen || !feature) return null;

  const handleCopy = () => {
    const spec = `### ${feature.name} (${feature.category || 'Feature Idea'})
**Purpose:** ${feature.purpose || 'N/A'}
**User Story:** ${feature.userStory || 'N/A'}
**User Flow:** ${feature.userFlow || 'N/A'}
**Complexity:** ${feature.complexity || 'Medium'} | **Expected Impact:** ${feature.expectedImpact || 'High'}

#### Frontend Changes:
${(feature.frontendChanges || []).map(c => `- ${c}`).join('\n') || '- None specified'}

#### Backend Changes:
${(feature.backendChanges || []).map(c => `- ${c}`).join('\n') || '- None specified'}

#### Database Changes:
${(feature.databaseChanges || []).map(c => `- ${c}`).join('\n') || '- None specified'}

#### API Endpoints:
${(feature.apiEndpoints || []).map(e => `- ${e}`).join('\n') || '- None specified'}

#### Dependencies:
${(feature.dependencies || []).map(d => `- ${d}`).join('\n') || '- None specified'}

#### Security Considerations:
${(feature.securityConsiderations || []).map(s => `- ${s}`).join('\n') || '- None specified'}

#### Testing Requirements:
${(feature.testingRequirements || []).map(t => `- ${t}`).join('\n') || '- None specified'}

#### Implementation Steps:
${(feature.implementationSteps || []).map((s, idx) => `${idx + 1}. ${s}`).join('\n') || '1. Scaffold component\n2. Add endpoint\n3. Test and integrate'}`;

    navigator.clipboard.writeText(spec);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const complexityColor = {
    Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    High: 'bg-rose-50 text-rose-700 border-rose-200'
  }[feature.complexity] || 'bg-neutral-50 text-neutral-700 border-neutral-200';

  const impactColor = {
    High: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Medium: 'bg-sky-50 text-sky-700 border-sky-200',
    Low: 'bg-neutral-50 text-neutral-600 border-neutral-200'
  }[feature.expectedImpact] || 'bg-indigo-50 text-indigo-700 border-indigo-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-black/10 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-black/10 flex items-start justify-between gap-4 bg-gradient-to-r from-neutral-50 to-white">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                <Sparkles className="h-3 w-3" />
                {feature.category || 'Feature Concept'}
              </span>
              <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${complexityColor}`}>
                Complexity: {feature.complexity || 'Medium'}
              </span>
              <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${impactColor}`}>
                Impact: {feature.expectedImpact || 'High'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
              {feature.name}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-black/60">
              {feature.purpose || 'Domain-specific feature enhancement.'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 rounded-xl border border-black/10 bg-white px-2.5 py-1.5 text-xs font-medium text-black hover:bg-neutral-50 transition shadow-2xs"
              title="Copy 14-Point Spec Markdown"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Spec'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-black/40 hover:bg-neutral-100 hover:text-black transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content (All 14 Specification Points) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Section 1: User Story & User Flow */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-black/10 bg-neutral-50/70 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black/50 mb-1.5 flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-indigo-600" />
                User Story
              </h4>
              <p className="text-xs sm:text-sm text-black/80 leading-relaxed italic">
                "{feature.userStory || `As a user of this application, I want to use ${feature.name} so that I can achieve higher productivity.`}"
              </p>
            </div>

            <div className="rounded-xl border border-black/10 bg-neutral-50/70 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black/50 mb-1.5 flex items-center gap-1.5">
                <ArrowRight className="h-3.5 w-3.5 text-cyan-600" />
                User Flow
              </h4>
              <p className="text-xs sm:text-sm text-black/80 leading-relaxed">
                {feature.userFlow || '1. Navigate to target view -> 2. Trigger action -> 3. View results.'}
              </p>
            </div>
          </div>

          {/* Section 2: Frontend & Backend Architectural Changes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-black/10 bg-white p-4 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black/50 mb-2 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-emerald-600" />
                Frontend Changes
              </h4>
              {feature.frontendChanges && feature.frontendChanges.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-black/75">
                  {feature.frontendChanges.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-black/40 italic">Standard component integration</p>
              )}
            </div>

            <div className="rounded-xl border border-black/10 bg-white p-4 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black/50 mb-2 flex items-center gap-1.5">
                <Network className="h-3.5 w-3.5 text-violet-600" />
                Backend Changes
              </h4>
              {feature.backendChanges && feature.backendChanges.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-black/75">
                  {feature.backendChanges.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-black/40 italic">Standard route controllers</p>
              )}
            </div>
          </div>

          {/* Section 3: Database & API Endpoints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-black/10 bg-white p-4 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black/50 mb-2 flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-amber-600" />
                Database Changes
              </h4>
              {feature.databaseChanges && feature.databaseChanges.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-black/75">
                  {feature.databaseChanges.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-black/40 italic">No schema modifications required</p>
              )}
            </div>

            <div className="rounded-xl border border-black/10 bg-white p-4 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black/50 mb-2 flex items-center gap-1.5">
                <Network className="h-3.5 w-3.5 text-cyan-600" />
                API Endpoints
              </h4>
              {feature.apiEndpoints && feature.apiEndpoints.length > 0 ? (
                <div className="space-y-1.5">
                  {feature.apiEndpoints.map((ep, idx) => (
                    <div key={idx} className="flex items-center gap-2 font-mono text-[11px] bg-neutral-50 rounded-lg px-2.5 py-1 border border-black/5 text-black/80">
                      <span>{ep}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-black/40 italic">Utilizes existing endpoints</p>
              )}
            </div>
          </div>

          {/* Section 4: Dependencies & Security */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-black/10 bg-white p-4 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black/50 mb-2 flex items-center gap-1.5">
                <Wrench className="h-3.5 w-3.5 text-neutral-600" />
                Dependencies Required
              </h4>
              {feature.dependencies && feature.dependencies.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {feature.dependencies.map((dep, idx) => (
                    <span key={idx} className="rounded-md bg-neutral-100 font-mono text-[11px] px-2 py-0.5 text-black/75">
                      {dep}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-black/40 italic">No new packages required</p>
              )}
            </div>

            <div className="rounded-xl border border-black/10 bg-white p-4 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black/50 mb-2 flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                Security Considerations
              </h4>
              {feature.securityConsiderations && feature.securityConsiderations.length > 0 ? (
                <ul className="space-y-1 text-xs text-black/75">
                  {feature.securityConsiderations.map((sec, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-500">•</span>
                      <span>{sec}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-black/40 italic">Standard authentication check</p>
              )}
            </div>
          </div>

          {/* Section 5: Testing Requirements */}
          <div className="rounded-xl border border-black/10 bg-white p-4 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-black/50 mb-2 flex items-center gap-1.5">
              <TestTube2 className="h-3.5 w-3.5 text-indigo-600" />
              Testing Requirements
            </h4>
            {feature.testingRequirements && feature.testingRequirements.length > 0 ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-black/75">
                {feature.testingRequirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-neutral-50 rounded-lg p-2 border border-black/5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-black/40 italic">End-to-end user testing recommended</p>
            )}
          </div>

          {/* Section 6: Step-by-Step Implementation Steps */}
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-neutral-50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-800 mb-3 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              Execution Steps
            </h4>
            {feature.implementationSteps && feature.implementationSteps.length > 0 ? (
              <ol className="space-y-2 text-xs sm:text-sm text-black/80">
                {feature.implementationSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-2xs">
                      {idx + 1}
                    </span>
                    <span className="leading-snug pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-black/40 italic">Generate 11-step plan below for deep execution breakdown.</p>
            )}
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 sm:p-5 border-t border-black/10 bg-neutral-50 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-100 transition shadow-2xs"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {onAddToRoadmap && (
              <button
                type="button"
                onClick={() => {
                  onAddToRoadmap(feature);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-black/15 bg-white px-3.5 py-2 text-xs font-semibold text-black hover:bg-neutral-100 transition shadow-2xs"
              >
                <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                <span>Add to Roadmap</span>
              </button>
            )}

            {onGeneratePlan && (
              <button
                type="button"
                onClick={() => {
                  onGeneratePlan(feature);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
                <span>11-Step Implementation Plan</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureDetailModal;
