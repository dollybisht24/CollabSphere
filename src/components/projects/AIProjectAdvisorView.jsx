import React, { useState, useEffect } from 'react';
import {
  Sparkles, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight,
  Code2, RefreshCw, FileText, Check, ChevronDown, ChevronRight,
  TrendingUp, Layers, Cpu, Eye, ExternalLink, Copy, Plus, Lightbulb,
  Image as ImageIcon, Briefcase, Calendar, Zap, Clock, Palette,
  MessageSquare, Info, Shield, Bookmark, BookmarkCheck, ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { projectsAPI } from '../../utils/api';
import FeatureDetailModal from './FeatureDetailModal';
import ImplementationPlanModal from './ImplementationPlanModal';

// 8 Dimensions config
const DIMENSIONS = [
  { key: 'overall', label: 'Overall Quality', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
  { key: 'codeQuality', label: 'Code Quality', icon: Code2, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { key: 'architecture', label: 'Architecture', icon: Layers, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
  { key: 'uiUx', label: 'UI / UX Design', icon: Eye, color: 'text-pink-600', bg: 'bg-pink-50 border-pink-200' },
  { key: 'performance', label: 'Performance', icon: Cpu, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  { key: 'security', label: 'Security & Auth', icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
  { key: 'maintainability', label: 'Maintainability', icon: RefreshCw, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  { key: 'innovation', label: 'Innovation & AI', icon: Sparkles, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-200' },
];

const ANALYSIS_STEPS = [
  'Inspecting project directory structure & configuration files...',
  'Analyzing tech stack dependencies & package versions...',
  'Evaluating React component hierarchy & state patterns...',
  'Auditing REST API routing & backend controller boundaries...',
  'Verifying authentication, JWT tokens & secret protection...',
  'Profiling client bundle footprint & async network requests...',
  'Evaluating UI responsiveness, accessibility & visual aesthetics...',
  'Synthesizing Senior Architect perspective & standout opportunities...',
  'Formulating 14-point contextual feature specifications...',
  'Compiling 6-phase prioritized development roadmap...'
];

const FEATURE_CATEGORIES = [
  'ALL',
  'Core Enhancement',
  'AI & Automation',
  'Performance & Optimization',
  'Security & Compliance',
  'Developer Experience',
  'UI/UX Refinement',
  'Collaboration & Teamwork',
  'Data & Analytics',
  'Integrations & Ecosystem',
  'Mobile & Responsiveness',
  'Architecture & Infrastructure'
];

const AIProjectAdvisorView = ({
  project,
  files = [],
  review,
  onAnalyze,
  analyzing = false,
  onAddToRoadmap,
  onSelectFile
}) => {
  // Navigation tabs inside Advisor
  const [activeSubTab, setActiveSubTab] = useState('advisor'); // 'advisor' | 'code' | 'features' | 'ui' | 'visuals' | 'resume'
  const [activePriority, setActivePriority] = useState('ALL');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [visualTab, setVisualTab] = useState('Suggested'); // 'Suggested' | 'Saved' | 'Used'

  // Modals
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [selectedPlanItem, setSelectedPlanItem] = useState(null);

  // File Code Review State
  const [selectedFileForReview, setSelectedFileForReview] = useState('');
  const [codeReviewLoading, setCodeReviewLoading] = useState(false);
  const [codeReviewResult, setCodeReviewResult] = useState(null);

  // Clipboard copies
  const [copiedResumeIdx, setCopiedResumeIdx] = useState(null);
  const [copiedPromptId, setCopiedPromptId] = useState(null);
  const [addedRoadmapIds, setAddedRoadmapIds] = useState(new Set());

  // 10-step loading animation
  const [analysisStepIndex, setAnalysisStepIndex] = useState(0);

  useEffect(() => {
    let interval;
    if (analyzing) {
      setAnalysisStepIndex(0);
      interval = setInterval(() => {
        setAnalysisStepIndex(prev => (prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev));
      }, 1600);
    } else {
      setAnalysisStepIndex(0);
    }
    return () => clearInterval(interval);
  }, [analyzing]);

  // Scores & Data extraction
  const scores = review?.projectScore || review?.scores || {
    overall: review?.overallScore || 80,
    codeQuality: review?.categories?.codeQuality || 80,
    architecture: review?.categories?.architecture || 80,
    uiUx: review?.categories?.uiUx || 80,
    performance: review?.categories?.performance || 80,
    security: review?.categories?.security || 80,
    maintainability: review?.categories?.maintainability || 80,
    innovation: review?.categories?.innovation || 80,
    reasonings: {}
  };

  const opinion = review?.projectOpinion || review?.opinion || {
    summary: review?.summary || '',
    strengths: review?.strengths || [],
    weaknesses: [],
    standoutOpportunities: []
  };

  const improvements = review?.improvements || [];
  const filteredImprovements = improvements.filter(imp => {
    if (activePriority === 'ALL') return true;
    return (imp.priority || '').toUpperCase() === activePriority;
  });

  const featureIdeas = review?.featureIdeas || [];
  const filteredFeatures = featureIdeas.filter(feat => {
    if (activeCategory === 'ALL') return true;
    return feat.category === activeCategory;
  });

  const visualSuggestions = review?.visualSuggestions || [];
  const savedVisuals = review?.savedVisuals || [];
  const currentVisuals = visualTab === 'Saved'
    ? visualSuggestions.filter(v => v.status === 'Saved' || savedVisuals.some(s => s.visualId === v.id && s.status === 'Saved'))
    : visualTab === 'Used'
      ? visualSuggestions.filter(v => v.status === 'Used' || savedVisuals.some(s => s.visualId === v.id && s.status === 'Used'))
      : visualSuggestions;

  const uiReview = review?.uiReview || {
    score: scores.uiUx || 80,
    priorityImprovements: review?.uiSuggestions || []
  };
  const resumeSuggestions = review?.resumeSuggestions || { missingProfessionalFeatures: [], technicalImprovements: [], resumeBullets: [] };
  const comparison = review?.comparisonWithPrevious || null;

  // Handlers
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
      toast.success('File code review completed!');
    } catch (err) {
      toast.error(err.message || 'Failed to review code');
    } finally {
      setCodeReviewLoading(false);
    }
  };

  const handleAddImprovementToRoadmap = async (imp) => {
    if (!onAddToRoadmap) return;
    try {
      await onAddToRoadmap({
        phase: imp.priority === 'High' ? 'Phase 1: Immediate Stabilization & Code Health' : imp.priority === 'Medium' ? 'Phase 2: UI/UX & Responsive Polish' : 'Phase 4: Core Feature Expansion',
        title: imp.title,
        description: `${imp.currentIssue || imp.problem}\n\nRecommended Fix: ${imp.recommendedSolution || imp.suggestedImprovement}\nWhy it matters: ${imp.whyItMatters}`,
        priority: (imp.priority || 'Medium').toUpperCase(),
        difficulty: imp.complexity ? imp.complexity.toUpperCase() : 'MEDIUM',
        source: 'AI_REVIEW'
      });
      setAddedRoadmapIds(prev => new Set([...prev, imp.id || imp.title]));
      toast.success(`Added "${imp.title}" to project roadmap!`);
    } catch (e) {
      toast.error('Failed to add to roadmap');
    }
  };

  const handleAddFeatureToRoadmap = async (feat) => {
    if (!onAddToRoadmap) return;
    try {
      await onAddToRoadmap({
        phase: 'Phase 4: Core Feature Expansion',
        title: feat.name,
        description: `${feat.purpose}\n\nUser Story: ${feat.userStory}`,
        priority: feat.expectedImpact === 'High' ? 'HIGH' : 'MEDIUM',
        difficulty: feat.complexity ? feat.complexity.toUpperCase() : 'MEDIUM',
        source: 'AI_FEATURE_IDEA',
        featureSpec: feat
      });
      setAddedRoadmapIds(prev => new Set([...prev, feat.id || feat.name]));
      toast.success(`Added "${feat.name}" to project roadmap!`);
    } catch (e) {
      toast.error('Failed to add to roadmap');
    }
  };

  const handleCopyPrompt = (visual) => {
    navigator.clipboard.writeText(visual.prompt || visual.why || '');
    setCopiedPromptId(visual.id);
    toast.success('Image prompt copied to clipboard!');
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const handleCopyResumeBullet = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedResumeIdx(idx);
    toast.success('Resume bullet copied!');
    setTimeout(() => setCopiedResumeIdx(null), 2000);
  };

  const handleSaveVisualStatus = async (visual, nextStatus) => {
    try {
      await projectsAPI.updateVisualStatus(project._id, visual.id, nextStatus);
      visual.status = nextStatus;
      toast.success(`Visual marked as ${nextStatus}!`);
    } catch (err) {
      toast.error('Failed to update visual status');
    }
  };

  // Render 10-Step Sequential Loading Animation
  if (analyzing) {
    const progressPercent = Math.round(((analysisStepIndex + 1) / ANALYSIS_STEPS.length) * 100);
    return (
      <div className="rounded-3xl border border-black/10 bg-white p-8 sm:p-12 shadow-xl text-center space-y-6 animate-in fade-in duration-300">
        <div className="relative mx-auto h-20 w-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse" />
          <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
            <Sparkles className="h-8 w-8 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
        </div>

        <div className="max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI PROJECT ADVISOR AUDIT IN PROGRESS</span>
          </div>
          <h3 className="text-2xl font-bold text-black tracking-tight">
            Consulting Senior Architects & UX Advisors
          </h3>
          <p className="text-xs sm:text-sm text-black/60 font-medium">
            Evaluating {project.name} across 8 architectural dimensions with real context.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-lg mx-auto space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-black/60">
            <span>Step {analysisStepIndex + 1} of {ANALYSIS_STEPS.length}</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-neutral-100 overflow-hidden border border-black/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Sequential Step List */}
        <div className="max-w-lg mx-auto text-left rounded-2xl border border-black/10 bg-neutral-50/70 p-4 space-y-2">
          {ANALYSIS_STEPS.map((step, idx) => {
            const isDone = idx < analysisStepIndex;
            const isCurrent = idx === analysisStepIndex;
            return (
              <div
                key={idx}
                className={`flex items-center gap-2.5 text-xs transition-opacity duration-300 ${
                  isCurrent ? 'font-bold text-indigo-700' : isDone ? 'text-black/50 line-through opacity-70' : 'text-black/30'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <div className="h-4 w-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-black/20 shrink-0" />
                )}
                <span>{step}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Unanalyzed State
  if (!review) {
    return (
      <div className="rounded-3xl border border-dashed border-black/20 bg-gradient-to-br from-indigo-50/30 via-white to-neutral-50 p-8 sm:p-14 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-black text-white mb-5 shadow-xl">
          <Sparkles className="h-10 w-10 text-indigo-300" />
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-bold text-indigo-700 mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>REAL AI PROJECT ADVISOR</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">
          Have an Expert AI Advisory Team Review {project.name}
        </h2>
        <p className="mt-2 text-sm text-black/60 max-w-xl mx-auto leading-relaxed">
          Get real, non-static recommendations: 8-dimension architectural quality audit, Senior Lead opinion, UX fixes with exact file locations, visual mockups, 14-point feature specs, and resume bullets.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onAnalyze('full')}
            disabled={analyzing}
            className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3.5 text-sm font-semibold text-white hover:bg-neutral-800 transition shadow-lg shadow-black/10 cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>Analyze Actual Project with AI</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. TOP HEADER & METADATA */}
      <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                <Sparkles className="h-3.5 w-3.5" />
                AI PROJECT ADVISOR · VERSION {review.version || 1}
              </span>
              {comparison && comparison.scoreDelta !== 0 && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  comparison.scoreDelta > 0
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  <TrendingUp className="h-3 w-3" />
                  {comparison.scoreDelta > 0 ? `+${comparison.scoreDelta}` : comparison.scoreDelta} Quality Delta
                </span>
              )}
              <span className="text-xs text-black/50">
                Last audited {new Date(review.analyzedAt || review.createdAt).toLocaleString()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
              AI Technical Audit & Architectural Roadmap
            </h1>
            <p className="text-xs sm:text-sm text-black/60 max-w-3xl leading-relaxed">
              Synthesized by Senior Principal Software Architect, Staff UI/UX Engineer, and Product Advisor using real project files.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => onAnalyze('reanalyze')}
              disabled={analyzing}
              className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition shadow-sm"
              title="Re-run AI evaluation after making changes"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-amber-300 ${analyzing ? 'animate-spin' : ''}`} />
              <span>Re-analyze Project</span>
            </button>
          </div>
        </div>

        {/* Advisor Navigation Strip */}
        <div className="mt-6 flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-black/5 pt-4">
          {[
            { id: 'advisor', label: '8-Dimension Audit & Opinion', icon: TrendingUp },
            { id: 'improvements', label: `Improvements (${improvements.length})`, icon: Layers },
            { id: 'features', label: `Feature Ideas (${featureIdeas.length})`, icon: Lightbulb },
            { id: 'ui', label: `UI/UX Review (${uiReview.score}/100)`, icon: Eye },
            { id: 'visuals', label: `Visual Inspirations (${visualSuggestions.length})`, icon: ImageIcon },
            { id: 'resume', label: 'Resume Bullets', icon: Briefcase },
            { id: 'code', label: 'File Code Review', icon: Code2 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition whitespace-nowrap ${
                  isActive
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-neutral-100 text-black/60 hover:bg-neutral-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================= TAB 1: 8-DIMENSION AUDIT & OPINION ======================= */}
      {activeSubTab === 'advisor' && (
        <div className="space-y-8">
          {/* AI's Opinion Card */}
          <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 mb-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI ARCHITECT'S OPINION</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
                  Executive Architectural Perspective
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-black/80 leading-relaxed max-w-4xl bg-white/80 rounded-2xl border border-black/5 p-4">
              {opinion.summary || review.summary || 'Strong architectural foundation with modular separation and modern tooling.'}
            </p>

            {/* Strengths, Weaknesses, Standout Opportunities */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Strengths */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Core Strengths
                </h4>
                <div className="space-y-2.5">
                  {(opinion.strengths || []).map((s, idx) => (
                    <div key={idx} className="rounded-xl bg-white p-3 border border-emerald-100 shadow-2xs space-y-1">
                      <p className="text-xs font-bold text-emerald-950">{s.title}</p>
                      <p className="text-[11px] text-black/65 leading-snug">{s.description}</p>
                      {s.whyItMatters && (
                        <p className="text-[10px] text-emerald-700 font-medium pt-1">
                          <span className="font-bold">Why it matters:</span> {s.whyItMatters}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaknesses */}
              <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                  Key Weaknesses & Gaps
                </h4>
                <div className="space-y-2.5">
                  {(opinion.weaknesses && opinion.weaknesses.length > 0 ? opinion.weaknesses : [
                    { title: 'API Error Handling', description: 'Duplicated catch blocks and inconsistent HTTP response formats.', whyItMatters: 'Fragile frontend parsing under edge network failures.' },
                    { title: 'Automated Test Suite', description: 'Zero unit tests or integration pipelines detected.', whyItMatters: 'High manual QA overhead on pull requests.' }
                  ]).map((w, idx) => (
                    <div key={idx} className="rounded-xl bg-white p-3 border border-rose-100 shadow-2xs space-y-1">
                      <p className="text-xs font-bold text-rose-950">{w.title}</p>
                      <p className="text-[11px] text-black/65 leading-snug">{w.description}</p>
                      {w.whyItMatters && (
                        <p className="text-[10px] text-rose-700 font-medium pt-1">
                          <span className="font-bold">Why it matters:</span> {w.whyItMatters}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Standout Opportunities */}
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-800 flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-indigo-600" />
                  Standout Opportunities
                </h4>
                <div className="space-y-2.5">
                  {(opinion.standoutOpportunities && opinion.standoutOpportunities.length > 0 ? opinion.standoutOpportunities : [
                    { title: 'Real-Time State Sync', description: 'Integrate WebSockets for instantaneous collaborative mutations.', whyItMatters: 'Positions the app in competitive modern SaaS tier.' },
                    { title: 'Contextual AI Assistance', description: 'Leverage LLM reasoning directly on workspace artifacts.', whyItMatters: 'High developer retention and productivity multiplier.' }
                  ]).map((o, idx) => (
                    <div key={idx} className="rounded-xl bg-white p-3 border border-indigo-100 shadow-2xs space-y-1">
                      <p className="text-xs font-bold text-indigo-950">{o.title}</p>
                      <p className="text-[11px] text-black/65 leading-snug">{o.description}</p>
                      {o.whyItMatters && (
                        <p className="text-[10px] text-indigo-700 font-medium pt-1">
                          <span className="font-bold">Why it matters:</span> {o.whyItMatters}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 8-Dimension Assessment Grid with Reasoning */}
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-black flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                8-Dimension Quality Assessment
              </h3>
              <p className="text-xs text-black/60">
                Detailed technical scores with AI reasoning for each architectural dimension.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {DIMENSIONS.map(dim => {
                const Icon = dim.icon;
                const scoreVal = scores[dim.key] ?? scores.overall ?? 75;
                const reasoning = scores.reasonings?.[dim.key] || review.scoreExplanation || 'Evaluated based on code organization and modern architectural patterns.';
                return (
                  <div
                    key={dim.key}
                    className="rounded-2xl border border-black/10 bg-white p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className={`grid h-8 w-8 place-items-center rounded-xl border ${dim.bg} ${dim.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className={`text-xl font-extrabold ${
                          scoreVal >= 80 ? 'text-emerald-600' : scoreVal >= 65 ? 'text-indigo-600' : 'text-amber-600'
                        }`}>
                          {scoreVal}<span className="text-xs text-black/40 font-normal">/100</span>
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-black mt-3">{dim.label}</h4>
                      <p className="text-[11px] text-black/65 leading-relaxed mt-1 line-clamp-3" title={reasoning}>
                        {reasoning}
                      </p>
                    </div>

                    <div className="pt-2">
                      <div className="w-full h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            scoreVal >= 80 ? 'bg-emerald-500' : scoreVal >= 65 ? 'bg-indigo-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${scoreVal}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Before vs After Comparison (if available) */}
          {comparison && (
            <div className="rounded-3xl border border-black/10 bg-neutral-50/80 p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-black text-white">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-base text-black">Before vs After Comparison</h3>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                  comparison.scoreDelta >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  Score Delta: {comparison.scoreDelta >= 0 ? `+${comparison.scoreDelta}` : comparison.scoreDelta} Points
                </span>
              </div>

              <p className="text-xs sm:text-sm text-black/70 leading-relaxed">
                {comparison.explanation || 'Progress tracked across project analysis iterations.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                <div className="rounded-xl bg-white p-3.5 border border-black/10">
                  <p className="text-xs font-bold text-emerald-700 mb-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Improvements Detected
                  </p>
                  <ul className="text-[11px] text-black/70 space-y-1">
                    {(comparison.improvementsDetected || comparison.improvementsMade || ['Modular component isolation']).map((imp, i) => (
                      <li key={i}>• {imp}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl bg-white p-3.5 border border-black/10">
                  <p className="text-xs font-bold text-amber-700 mb-1 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Remaining Issues
                  </p>
                  <ul className="text-[11px] text-black/70 space-y-1">
                    {(comparison.remainingImprovements || comparison.remainingIssues || ['Centralized error handling']).map((rem, i) => (
                      <li key={i}>• {rem}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl bg-white p-3.5 border border-black/10">
                  <p className="text-xs font-bold text-indigo-700 mb-1 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> Newly Detected Opportunities
                  </p>
                  <ul className="text-[11px] text-black/70 space-y-1">
                    {(comparison.newlyDetectedIssues && comparison.newlyDetectedIssues.length > 0 ? comparison.newlyDetectedIssues : ['None identified; code health is stable']).map((n, i) => (
                      <li key={i}>• {n}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 2: PRIORITIZED IMPROVEMENTS ======================= */}
      {activeSubTab === 'improvements' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-black">Code & Architecture Improvements</h3>
              <p className="text-xs text-black/60">
                Actionable refactoring tasks with clickable related files and 11-step implementation plans.
              </p>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl">
              {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setActivePriority(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    activePriority === p ? 'bg-white text-black shadow-xs font-bold' : 'text-black/50 hover:text-black'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredImprovements.length === 0 ? (
              <div className="p-8 text-center text-xs text-black/50 bg-neutral-50 rounded-2xl border border-black/10">
                No improvements found matching the selected priority filter.
              </div>
            ) : (
              filteredImprovements.map(imp => {
                const priorityBadge = {
                  High: 'bg-rose-50 text-rose-700 border-rose-200',
                  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
                  Low: 'bg-neutral-100 text-black/70 border-black/10'
                }[imp.priority] || 'bg-neutral-100 text-black/70 border-black/10';

                const isAdded = addedRoadmapIds.has(imp.id || imp.title);

                return (
                  <div
                    key={imp.id || imp.title}
                    className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6 shadow-2xs hover:border-black/25 transition space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-md border px-2 py-0.5 text-xs font-bold ${priorityBadge}`}>
                            {imp.priority} Priority
                          </span>
                          <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-black/60 font-medium">
                            Complexity: {imp.complexity || 'Medium'}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-black">{imp.title}</h4>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedPlanItem(imp)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-black/15 bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-neutral-50 transition shadow-2xs"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                          <span>11-Step Plan</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAddImprovementToRoadmap(imp)}
                          disabled={isAdded}
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                            isAdded
                              ? 'bg-neutral-100 text-black/40'
                              : 'bg-black text-white hover:bg-neutral-800'
                          }`}
                        >
                          {isAdded ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Plus className="h-3.5 w-3.5" />}
                          <span>{isAdded ? 'Added' : 'Add to Roadmap'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Problem & Recommended Solution */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl border border-black/5 bg-neutral-50/70 p-3.5 space-y-1">
                        <p className="font-bold text-black/60 uppercase tracking-wider text-[10px]">Problem</p>
                        <p className="text-black/80 leading-relaxed">{imp.problem || imp.currentIssue}</p>
                        {imp.whyItMatters && (
                          <p className="text-indigo-700 font-medium pt-1">
                            <span className="font-bold">Why it matters:</span> {imp.whyItMatters}
                          </p>
                        )}
                      </div>

                      <div className="rounded-xl border border-black/5 bg-neutral-50/70 p-3.5 space-y-1">
                        <p className="font-bold text-black/60 uppercase tracking-wider text-[10px]">Recommended Solution</p>
                        <p className="text-black/80 leading-relaxed">{imp.recommendedSolution || imp.suggestedImprovement}</p>
                        {imp.expectedBenefit && (
                          <p className="text-emerald-700 font-medium pt-1">
                            <span className="font-bold">Expected Benefit:</span> {imp.expectedBenefit}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Related Files */}
                    {imp.relatedFiles && imp.relatedFiles.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-bold text-black/50">Related Files:</span>
                        {imp.relatedFiles.map((rf, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => onSelectFile && onSelectFile(rf)}
                            className="inline-flex items-center gap-1 font-mono text-[11px] bg-neutral-100 hover:bg-neutral-200 text-black/80 px-2 py-0.5 rounded-md transition"
                            title="Click to view file"
                          >
                            <Code2 className="h-3 w-3 text-black/50" />
                            <span>{rf}</span>
                            <ArrowUpRight className="h-2.5 w-2.5 text-black/40" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ======================= TAB 3: FEATURE IDEAS (14-POINT SPEC) ======================= */}
      {activeSubTab === 'features' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-black">Contextual AI Feature Concepts</h3>
              <p className="text-xs text-black/60">
                14-point detailed engineering specifications tailored specifically to your project stack and domain.
              </p>
            </div>
          </div>

          {/* 11 Category filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {FEATURE_CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-black text-white shadow-xs font-bold'
                    : 'bg-neutral-100 text-black/60 hover:bg-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFeatures.map(feat => {
              const isAdded = addedRoadmapIds.has(feat.id || feat.name);
              return (
                <div
                  key={feat.id || feat.name}
                  className="rounded-2xl border border-black/10 bg-white p-5 shadow-2xs hover:border-black/30 transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                        {feat.category || 'Feature'}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] text-black/50">
                        <span>Complexity: <strong className="text-black">{feat.complexity || 'Med'}</strong></span>
                        <span>·</span>
                        <span>Impact: <strong className="text-indigo-600">{feat.expectedImpact || 'High'}</strong></span>
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-black">{feat.name}</h4>
                    <p className="text-xs text-black/70 leading-relaxed line-clamp-2">{feat.purpose}</p>

                    {feat.userStory && (
                      <p className="text-[11px] text-black/55 italic line-clamp-2">
                        "{feat.userStory}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-black/5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedFeature(feat)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                    >
                      <span>View 14-Point Spec</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedPlanItem({ title: feat.name, description: feat.purpose, category: feat.category })}
                        className="rounded-lg border border-black/10 px-2.5 py-1 text-xs font-medium text-black hover:bg-neutral-50"
                        title="11-Step Plan"
                      >
                        Plan
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddFeatureToRoadmap(feat)}
                        disabled={isAdded}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                          isAdded ? 'bg-neutral-100 text-black/40' : 'bg-black text-white hover:bg-neutral-800'
                        }`}
                      >
                        {isAdded ? <Check className="h-3 w-3 text-emerald-600" /> : <Plus className="h-3 w-3" />}
                        <span>{isAdded ? 'Added' : 'Add to Roadmap'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================= TAB 4: UI/UX REVIEW ======================= */}
      {activeSubTab === 'ui' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50/40 via-white to-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs font-bold text-pink-700 mb-2">
                  <Eye className="h-3.5 w-3.5" />
                  <span>UI / UX DESIGN REVIEW</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
                  User Interface & Experience Polish
                </h2>
                <p className="text-xs sm:text-sm text-black/60 mt-1">
                  Evaluated layout hierarchy, responsive behavior, click states, and visual consistency.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-black/50 font-medium">Design Score</p>
                  <p className="text-3xl font-extrabold text-pink-600">{uiReview.score || scores.uiUx}/100</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-black">Priority UI Improvements</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(uiReview.priorityImprovements || []).map((ui, idx) => (
                <div
                  key={ui.id || idx}
                  className="rounded-2xl border border-black/10 bg-white p-5 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`rounded-md border px-2 py-0.5 text-xs font-bold ${
                      ui.priority === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {ui.priority || 'Medium'} Priority
                    </span>
                    {ui.whereToApply && (
                      <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-mono text-black/70">
                        {ui.whereToApply}
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold text-black/60 uppercase tracking-wider text-[10px]">Current Issue</p>
                    <p className="text-xs text-black/80 font-medium mt-0.5">{ui.currentIssue}</p>
                  </div>

                  <div className="pt-1 border-t border-black/5">
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider text-[10px]">Suggested Polish</p>
                    <p className="text-xs text-black/80 leading-relaxed mt-0.5">{ui.suggestedImprovement}</p>
                    {ui.whyItMatters && (
                      <p className="text-[11px] text-black/55 mt-1">
                        <span className="font-semibold text-black/70">Impact:</span> {ui.whyItMatters}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 5: VISUAL INSPIRATIONS & ASSET LIBRARY ======================= */}
      {activeSubTab === 'visuals' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-black">Visual Asset Inspirations</h3>
              <p className="text-xs text-black/60">
                AI-recommended mockups, vector diagrams, and UI graphics tailored to your application.
              </p>
            </div>

            {/* Visual status tabs */}
            <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl">
              {['Suggested', 'Saved', 'Used'].map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setVisualTab(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    visualTab === st ? 'bg-white text-black shadow-xs font-bold' : 'text-black/50 hover:text-black'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentVisuals.length === 0 ? (
              <div className="md:col-span-2 p-12 text-center text-xs text-black/50 bg-neutral-50 rounded-3xl border border-black/10">
                No visual concepts in "{visualTab}". Check "Suggested" to discover new graphics!
              </div>
            ) : (
              currentVisuals.map(vis => {
                const isCopied = copiedPromptId === vis.id;
                return (
                  <div
                    key={vis.id}
                    className="rounded-3xl border border-black/10 bg-white overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    {/* SVG Graphic Concept Preview */}
                    <div className="relative w-full h-48 bg-neutral-900 overflow-hidden flex items-center justify-center p-2">
                      {vis.conceptPreviewSvg ? (
                        <div
                          className="w-full h-full"
                          dangerouslySetInnerHTML={{ __html: vis.conceptPreviewSvg }}
                        />
                      ) : (
                        <div className="text-white/40 text-xs flex items-center gap-2">
                          <ImageIcon className="h-5 w-5" />
                          <span>Concept Graphic</span>
                        </div>
                      )}
                      <span className="absolute top-3 left-3 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 border border-white/10">
                        {vis.location || 'Overview'}
                      </span>
                    </div>

                    {/* Metadata & Prompts */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-black/50">
                          <span className="font-semibold text-indigo-700">{vis.visualType}</span>
                          <span>{vis.suggestedDimensions}</span>
                        </div>
                        <p className="text-xs text-black/75 leading-relaxed font-medium">{vis.why}</p>
                        <p className="text-[11px] text-black/50">Style: <span className="font-medium text-black/70">{vis.suggestedStyle}</span></p>
                      </div>

                      {/* Image Prompt Box */}
                      {vis.prompt && (
                        <div className="rounded-xl border border-black/10 bg-neutral-50 p-3 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-black/50">
                            <span>Image Generation Prompt</span>
                            <button
                              type="button"
                              onClick={() => handleCopyPrompt(vis)}
                              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
                            >
                              {isCopied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                              <span>{isCopied ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <p className="font-mono text-[10.5px] text-black/75 leading-snug line-clamp-3">
                            {vis.prompt}
                          </p>
                        </div>
                      )}

                      {/* Status Buttons */}
                      <div className="pt-2 border-t border-black/5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSaveVisualStatus(vis, vis.status === 'Saved' ? 'Suggested' : 'Saved')}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                              vis.status === 'Saved'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'border border-black/10 text-black/70 hover:bg-neutral-50'
                            }`}
                          >
                            <Bookmark className="h-3 w-3" />
                            <span>{vis.status === 'Saved' ? 'Saved' : 'Save'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSaveVisualStatus(vis, vis.status === 'Used' ? 'Saved' : 'Used')}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                              vis.status === 'Used'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'border border-black/10 text-black/70 hover:bg-neutral-50'
                            }`}
                          >
                            <Check className="h-3 w-3" />
                            <span>{vis.status === 'Used' ? 'Used in Project' : 'Mark Used'}</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyPrompt(vis)}
                          className="rounded-lg bg-black text-white px-3 py-1 text-xs font-semibold hover:bg-neutral-800 transition"
                        >
                          Copy Prompt
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ======================= TAB 6: RESUME BULLETS ======================= */}
      {activeSubTab === 'resume' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/40 via-white to-white p-6 sm:p-8 shadow-sm">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 mb-2">
              <Briefcase className="h-3.5 w-3.5" />
              <span>CAREER & RECRUITER HIGHLIGHTS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
              Verified, Resume-Ready Engineering Accomplishments
            </h2>
            <p className="text-xs sm:text-sm text-black/60 mt-1">
              Action-oriented bullet points based on your verified architecture, ready for resumes and LinkedIn.
            </p>
          </div>

          {/* Bullets List */}
          <div className="space-y-3">
            {(resumeSuggestions.resumeBullets || []).map((bullet, idx) => {
              const isCopied = copiedResumeIdx === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-black/10 bg-white p-4 sm:p-5 shadow-2xs hover:border-black/25 transition flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-black/85 leading-relaxed font-medium">
                      {bullet}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyResumeBullet(bullet, idx)}
                    className="inline-flex items-center gap-1 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-neutral-50 transition shrink-0 shadow-2xs"
                  >
                    {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Missing Professional Features & Improvements Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-2xs space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black/50 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                Missing Professional Features
              </h4>
              <ul className="text-xs text-black/75 space-y-1.5">
                {(resumeSuggestions.missingProfessionalFeatures || ['Automated CI/CD workflows', 'Comprehensive unit tests']).map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-2xs space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black/50 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-indigo-600" />
                Recommended Technical Milestones
              </h4>
              <ul className="text-xs text-black/75 space-y-1.5">
                {(resumeSuggestions.technicalImprovements || ['Redis caching layer', 'Structured Pino logging']).map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 7: FILE CODE REVIEW ======================= */}
      {activeSubTab === 'code' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-bold text-black">Granular AI Code Review</h3>
              <p className="text-xs text-black/60">
                Select any source file in {project.name} for line-by-line inspection of code smells, security bugs, and refactoring opportunities.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <select
                value={selectedFileForReview}
                onChange={(e) => setSelectedFileForReview(e.target.value)}
                className="input-field text-xs py-2.5 max-w-md"
              >
                <option value="">-- Review Entire Project Sample --</option>
                {files.map(f => (
                  <option key={f._id} value={f._id}>
                    {f.originalName} ({((f.size || 0) / 1024).toFixed(1)} KB)
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleRunCodeReview}
                disabled={codeReviewLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 transition shadow-sm"
              >
                {codeReviewLoading ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Reviewing Code...</span>
                  </>
                ) : (
                  <>
                    <Code2 className="h-3.5 w-3.5 text-indigo-300" />
                    <span>Run Deep Code Review</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code Review Results */}
          {codeReviewResult && (
            <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <div>
                  <h4 className="text-lg font-bold text-black">Review: {codeReviewResult.targetName}</h4>
                  <p className="text-xs text-black/60 mt-0.5">{codeReviewResult.summary}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-black/50">Code Rating</span>
                  <p className="text-2xl font-black text-indigo-600">{codeReviewResult.rating}/10</p>
                </div>
              </div>

              {/* Good Points */}
              {codeReviewResult.goodPoints?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Positive Observations
                  </p>
                  <ul className="text-xs text-black/75 space-y-1">
                    {codeReviewResult.goodPoints.map((gp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{gp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Issues */}
              {codeReviewResult.issues?.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-rose-600" /> Identified Issues & Code Smells
                  </p>
                  <div className="space-y-2.5">
                    {codeReviewResult.issues.map((iss, i) => (
                      <div key={i} className="rounded-xl border border-black/10 bg-neutral-50/80 p-4 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-black">{iss.problem}</span>
                          <span className="rounded bg-neutral-200 px-2 py-0.5 text-[10px] font-bold text-black/70">
                            {iss.category} · {iss.severity}
                          </span>
                        </div>
                        <p className="text-black/70 leading-relaxed"><strong className="text-black/90">Why:</strong> {iss.why}</p>
                        <p className="text-emerald-800 leading-relaxed"><strong className="text-emerald-950">Solution:</strong> {iss.solution}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      {selectedFeature && (
        <FeatureDetailModal
          feature={selectedFeature}
          isOpen={Boolean(selectedFeature)}
          onClose={() => setSelectedFeature(null)}
          onAddToRoadmap={(feat) => handleAddFeatureToRoadmap(feat)}
          onGeneratePlan={(feat) => setSelectedPlanItem({ title: feat.name, description: feat.purpose, category: feat.category })}
        />
      )}

      {selectedPlanItem && (
        <ImplementationPlanModal
          isOpen={Boolean(selectedPlanItem)}
          onClose={() => setSelectedPlanItem(null)}
          project={project}
          item={selectedPlanItem}
          onAddToRoadmap={(task) => onAddToRoadmap && onAddToRoadmap(task)}
        />
      )}
    </div>
  );
};

export default AIProjectAdvisorView;
