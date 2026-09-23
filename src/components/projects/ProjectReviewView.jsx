import React, { useState } from 'react';
import {
  Sparkles, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight,
  Code2, RefreshCw, FileText, Check, ChevronDown, ChevronRight,
  TrendingUp, Layers, Cpu, Eye, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { projectsAPI } from '../../utils/api';

const dimensionIcons = {
  codeQuality: Code2,
  architecture: Layers,
  uiUx: Eye,
  performance: Cpu,
  security: ShieldAlert,
  maintainability: RefreshCw
};

const dimensionLabels = {
  codeQuality: 'Code Quality',
  architecture: 'Architecture',
  uiUx: 'UI / UX',
  performance: 'Performance',
  security: 'Security',
  maintainability: 'Maintainability'
};

const ProjectReviewView = ({
  project,
  files = [],
  review,
  onAnalyze,
  analyzing,
  onAddToRoadmap,
  onGeneratePlan
}) => {
  const [activePriority, setActivePriority] = useState('ALL');
  const [selectedFileForReview, setSelectedFileForReview] = useState('');
  const [codeReviewLoading, setCodeReviewLoading] = useState(false);
  const [codeReviewResult, setCodeReviewResult] = useState(null);
  const [addedImprovements, setAddedImprovements] = useState(new Set());

  const categories = review?.categories || {
    codeQuality: 75,
    architecture: 75,
    uiUx: 75,
    performance: 75,
    security: 75,
    maintainability: 75
  };

  const improvements = review?.improvements || [];
  const filteredImprovements = improvements.filter(imp => {
    if (activePriority === 'ALL') return true;
    return (imp.priority || '').toUpperCase() === activePriority;
  });

  const handleRunCodeReview = async () => {
    try {
      setCodeReviewLoading(true);
      const targetFile = files.find(f => f._id === selectedFileForReview);
      const res = await projectsAPI.reviewCode(project._id, {
        targetName: targetFile ? targetFile.originalName : 'Entire Project',
        targetType: targetFile ? 'file' : 'project',
        fileId: selectedFileForReview || null
      });
      setCodeReviewResult(res.review);
      toast.success('Code review completed!');
    } catch (err) {
      toast.error(err.message || 'Failed to complete code review');
    } finally {
      setCodeReviewLoading(false);
    }
  };

  const handleAddImprovementToRoadmap = async (imp) => {
    if (onAddToRoadmap) {
      await onAddToRoadmap({
        phase: imp.priority === 'High' ? 'Phase 1: Fix Critical Issues' : imp.priority === 'Medium' ? 'Phase 2: Improve Architecture' : 'Phase 3: Improve UI/UX',
        title: imp.title,
        description: `${imp.currentIssue}\n\nSuggested Fix: ${imp.suggestedImprovement}\nWhy it matters: ${imp.whyItMatters}`,
        priority: imp.priority === 'High' ? 'HIGH' : imp.priority === 'Medium' ? 'MEDIUM' : 'LOW',
        difficulty: 'MEDIUM',
        source: 'AI_REVIEW'
      });
      setAddedImprovements(prev => new Set([...prev, imp.title]));
    }
  };

  if (!review) {
    return (
      <div className="rounded-3xl border border-dashed border-black/20 bg-neutral-50/70 p-12 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-black text-white mb-4 shadow-sm">
          <Sparkles className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-black sm:text-2xl">
          No AI Review Generated Yet
        </h2>
        <p className="mt-2 text-sm text-black/60 max-w-md mx-auto">
          Let AI inspect project structure, React architecture, code quality, security vulnerabilities, and API endpoints to generate actionable recommendations.
        </p>
        <button
          onClick={onAnalyze}
          disabled={analyzing}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 transition shadow-md"
        >
          {analyzing ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Analyzing Architecture & Code...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Analyze Project with AI</span>
            </>
          )}
        </button>
      </div>
    );
  }

  const score = review.overallScore || 75;
  const comparison = review.comparisonWithPrevious;

  return (
    <div className="space-y-8">
      {/* Overview Score & Action Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Radial Score Badge */}
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-black text-white shadow-md">
            <div className="text-center">
              <span className="block text-3xl font-black tracking-tight">{score}</span>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-white/60">/ 100</span>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                score >= 80 ? 'bg-emerald-100 text-emerald-800' : score >= 65 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
              }`}>
                {score >= 80 ? 'Architecture Certified' : score >= 65 ? 'Needs Improvement' : 'Critical Refactoring Needed'}
              </span>
              <span className="text-xs text-black/50">
                Version {review.version || 1} · Evaluated {new Date(review.analyzedAt).toLocaleDateString()}
              </span>
            </div>

            <h2 className="mt-2 text-xl font-bold tracking-tight text-black sm:text-2xl">
              Project Quality & Architecture Analysis
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-black/60 max-w-2xl">
              {review.summary || 'Comprehensive multi-dimensional assessment of project maintainability, architecture, and code quality.'}
            </p>
          </div>
        </div>

        <button
          onClick={onAnalyze}
          disabled={analyzing}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 transition shadow-sm shrink-0"
        >
          {analyzing ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Re-analyzing Project...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              <span>Re-analyze Project</span>
            </>
          )}
        </button>
      </div>

      {/* Before vs After Comparison Card (if version > 1) */}
      {comparison && comparison.previousScore !== null && (
        <div className="rounded-2xl border border-black/10 bg-neutral-50/80 p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-black uppercase tracking-wider">
                Re-Review Comparison (Version {review.version - 1} → Version {review.version})
              </h3>
            </div>
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-bold ${
              comparison.scoreDelta >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              {comparison.scoreDelta >= 0 ? `+${comparison.scoreDelta}` : comparison.scoreDelta} Points Quality Change
            </span>
          </div>

          <p className="text-xs sm:text-sm text-black/70">
            {comparison.explanation}
          </p>

          <div className="grid sm:grid-cols-2 gap-4 pt-2 text-xs">
            {comparison.improvementsMade?.length > 0 && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                <p className="font-bold text-emerald-900 mb-1">Improvements Made:</p>
                <ul className="list-disc list-inside space-y-0.5 text-emerald-800">
                  {comparison.improvementsMade.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {comparison.remainingIssues?.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                <p className="font-bold text-amber-900 mb-1">Remaining Focus Areas:</p>
                <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                  {comparison.remainingIssues.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6-Dimension Score Cards */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-black/60 mb-3.5">
          Project Quality Dimensions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(categories).map(([key, val]) => {
            const Icon = dimensionIcons[key] || Sparkles;
            const label = dimensionLabels[key] || key;
            return (
              <div key={key} className="rounded-2xl border border-black/10 bg-white p-4 space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-black/60">
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-bold text-black">{val}/100</span>
                </div>
                <p className="text-xs font-semibold text-black/80">{label}</p>
                <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      val >= 80 ? 'bg-emerald-500' : val >= 65 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {review.scoreExplanation && (
          <p className="mt-2.5 text-xs text-black/50 leading-relaxed">
            {review.scoreExplanation}
          </p>
        )}
      </div>

      {/* Strengths Section */}
      {review.strengths?.length > 0 && (
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-black/60 mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            What Was Done Well
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {review.strengths.map((s, idx) => (
              <div key={idx} className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-3.5 space-y-1">
                <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                  {s.category || 'Architecture'}
                </span>
                <p className="text-xs font-bold text-black">{s.title}</p>
                <p className="text-[11px] text-black/60">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prioritized Improvements Section: "What Can Be Improved?" */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-black/10">
          <div>
            <h3 className="text-lg font-bold text-black">
              What Can Be Improved?
            </h3>
            <p className="text-xs text-black/55">
              Specific, prioritized recommendations with exact files, rationale, and implementation patterns.
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-full border border-black/10 bg-neutral-100/80 p-1 text-xs font-semibold">
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
              <button
                key={p}
                onClick={() => setActivePriority(p)}
                className={`rounded-full px-3 py-1 transition ${
                  activePriority === p
                    ? 'bg-black text-white shadow-sm'
                    : 'text-black/60 hover:text-black'
                }`}
              >
                {p === 'ALL' ? 'All Priorities' : `${p.charAt(0) + p.slice(1).toLowerCase()} Priority`}
              </button>
            ))}
          </div>
        </div>

        {filteredImprovements.length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-neutral-50 p-8 text-center text-xs text-black/50">
            No improvements in this category.
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredImprovements.map((imp, idx) => {
              const isAdded = addedImprovements.has(imp.title);
              const priorityColor =
                imp.priority === 'High' ? 'border-red-200 bg-red-50/40 text-red-700' :
                imp.priority === 'Medium' ? 'border-amber-200 bg-amber-50/40 text-amber-700' :
                'border-neutral-200 bg-neutral-50 text-neutral-700';

              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm space-y-3.5 transition hover:border-black/25"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${priorityColor}`}>
                        {imp.priority} Priority
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-black">
                        {imp.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onGeneratePlan && onGeneratePlan(imp)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-neutral-50 shadow-sm transition"
                      >
                        <FileText className="h-3.5 w-3.5" /> Plan
                      </button>
                      <button
                        onClick={() => handleAddImprovementToRoadmap(imp)}
                        disabled={isAdded}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition ${
                          isAdded
                            ? 'bg-neutral-100 text-black/40 cursor-default'
                            : 'bg-black text-white hover:bg-neutral-800'
                        }`}
                      >
                        {isAdded ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowRight className="h-3.5 w-3.5" />}
                        {isAdded ? 'Added to Roadmap' : 'Add to Roadmap'}
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl border border-black/5 bg-neutral-50/50 p-3 space-y-1">
                      <p className="font-bold text-black/70">Current Issue:</p>
                      <p className="text-black/60">{imp.currentIssue}</p>
                    </div>
                    <div className="rounded-xl border border-black/5 bg-neutral-50/50 p-3 space-y-1">
                      <p className="font-bold text-black/70">Why it Matters:</p>
                      <p className="text-black/60">{imp.whyItMatters}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-black/10 bg-neutral-900 text-neutral-100 p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400">
                      <span className="font-semibold text-white">Suggested Implementation</span>
                      {imp.suggestedImplementation?.files?.length > 0 && (
                        <span>Files: {imp.suggestedImplementation.files.join(', ')}</span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-300">
                      {imp.suggestedImprovement}
                    </p>
                    {imp.suggestedImplementation?.codeSnippet && (
                      <pre className="mt-2 rounded-lg bg-black/60 p-2.5 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                        {imp.suggestedImplementation.codeSnippet}
                      </pre>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Security Audit Section */}
      {review.securityAnalysis && (
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-black" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-black">
                Security & Secret Audit
              </h3>
            </div>
            <span className="text-xs text-black/50">
              {review.securityAnalysis.issuesCount === 0 ? 'No critical vulnerabilities found' : `${review.securityAnalysis.issuesCount} items flagged`}
            </span>
          </div>

          {review.securityAnalysis.items?.length === 0 ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>All secrets masked. No exposed credentials or unvalidated raw queries detected.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {review.securityAnalysis.items.map((sec, i) => (
                <div key={i} className="rounded-xl border border-black/10 bg-neutral-50/60 p-4 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-black">{sec.title}</span>
                    <span className="rounded bg-red-100 px-2 py-0.5 font-bold text-[10px] text-red-700">
                      {sec.severity}
                    </span>
                  </div>
                  <p className="text-black/60">{sec.description}</p>
                  {sec.file && <p className="text-[11px] text-black/45">Target file: <code>{sec.file}</code></p>}
                  {sec.recommendation && (
                    <p className="text-[11px] font-medium text-indigo-900 pt-1">Recommendation: {sec.recommendation}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Interactive AI Code Review Tool */}
      <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-neutral-50 px-2.5 py-0.5 text-[11px] font-semibold text-black/60 uppercase tracking-wider mb-1.5">
            <Code2 className="h-3 w-3" /> Granular Component Audit
          </div>
          <h3 className="text-lg font-bold tracking-tight text-black sm:text-xl">
            AI Code Review
          </h3>
          <p className="text-xs sm:text-sm text-black/60">
            Select a specific component, file, or the entire project to identify bugs, code smells, performance bottlenecks, and refactoring opportunities.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={selectedFileForReview}
            onChange={(e) => setSelectedFileForReview(e.target.value)}
            className="w-full sm:w-80 rounded-xl border border-black/15 bg-neutral-50 px-3.5 py-2.5 text-xs font-semibold text-black outline-none focus:border-black focus:bg-white"
          >
            <option value="">Entire Project Overview</option>
            {files.map(f => (
              <option key={f._id} value={f._id}>
                {f.originalName} ({f.extension?.toUpperCase() || 'FILE'})
              </option>
            ))}
          </select>

          <button
            onClick={handleRunCodeReview}
            disabled={codeReviewLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 transition shadow-sm"
          >
            {codeReviewLoading ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Reviewing Code...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Review with AI</span>
              </>
            )}
          </button>
        </div>

        {codeReviewResult && (
          <div className="rounded-2xl border border-black/10 bg-neutral-50/50 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div>
                <p className="font-bold text-black text-sm">{codeReviewResult.targetName}</p>
                <p className="text-black/55">{codeReviewResult.summary}</p>
              </div>
              <span className="rounded-xl bg-black px-3 py-1 text-xs font-bold text-white">
                Rating: {codeReviewResult.rating || 8}/10
              </span>
            </div>

            {codeReviewResult.goodPoints?.length > 0 && (
              <div className="space-y-1">
                <p className="font-bold text-emerald-800">What is Good:</p>
                <ul className="list-disc list-inside space-y-0.5 text-black/70">
                  {codeReviewResult.goodPoints.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            )}

            {codeReviewResult.issues?.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="font-bold text-black">Identified Issues (Problem → Why → Solution):</p>
                <div className="grid gap-2.5">
                  {codeReviewResult.issues.map((iss, i) => (
                    <div key={i} className="rounded-xl border border-black/10 bg-white p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-700">{iss.category}: {iss.problem}</span>
                        <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-black/60">
                          {iss.severity}
                        </span>
                      </div>
                      <p className="text-black/65"><strong>Why:</strong> {iss.why}</p>
                      <p className="text-emerald-800"><strong>Solution:</strong> {iss.solution}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectReviewView;
