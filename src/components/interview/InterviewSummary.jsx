import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award, CheckCircle2, AlertCircle, XCircle, ArrowRight, RotateCcw,
  Sparkles, ChevronDown, ChevronUp, FileText, Check, TrendingUp,
  Brain, MessageSquare, BookOpen, Layers, Target, Lightbulb, Compass,
  BarChart3, Cpu, ShieldCheck, Download
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { generateFeedbackReportPDF } from '../../utils/pdfGenerator';
import CertificateView from './CertificateView';

const InterviewSummary = ({
  session,
  summary,
  questions = [],
  onRestart,
  onSelectNewRole,
  onViewHistory,
  onViewProgress,
  onStartRecommendedPractice
}) => {
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);

  const toggleQuestion = (index) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
  };

  const handleDownloadReport = async () => {
    if (isDownloadingReport) return;
    setIsDownloadingReport(true);
    const toastId = toast.loading('Generating comprehensive interview feedback report PDF...');
    try {
      await generateFeedbackReportPDF({
        session,
        summary,
        questions,
        candidateName: session?.candidateName || session?.candidate?.name || 'Candidate',
        candidateEmail: session?.candidateEmail || session?.candidate?.email || '',
        candidateClassYear: session?.candidateClassYear || session?.candidate?.classYear || '',
        certificateId: session?.certificateId || 'CS-INT-2026-X9A21'
      });
      toast.success('Feedback report downloaded successfully!', { id: toastId });
    } catch (err) {
      console.error('Download report error:', err);
      toast.error('Failed to generate PDF report. Please try again.', { id: toastId });
    } finally {
      setIsDownloadingReport(false);
    }
  };

  const overallScore = summary?.overallScore || 0;
  const technicalKnowledge = summary?.technicalKnowledge ?? Math.round((summary?.performanceBreakdown?.technicalKnowledge || 7) * 10);
  const communication = summary?.communication ?? Math.round((summary?.performanceBreakdown?.communication || 7) * 10);
  const problemSolving = summary?.problemSolving ?? Math.round((summary?.performanceBreakdown?.completeness || 7) * 10);
  const conceptClarity = summary?.conceptClarity ?? Math.round((summary?.performanceBreakdown?.conceptUnderstanding || 7) * 10);
  const answerQuality = summary?.answerQuality ?? Math.round((technicalKnowledge + conceptClarity + problemSolving) / 3);

  const placementReadiness = summary?.placementReadiness || (
    overallScore >= 80 ? 'Placement Ready' : overallScore >= 60 ? 'Almost Ready' : 'Needs More Practice'
  );

  const readinessStyles = {
    'Placement Ready': {
      badgeBg: 'bg-emerald-600 text-white',
      border: 'border-emerald-200',
      cardBg: 'bg-emerald-50/60',
      label: 'Placement Ready',
      subtext: 'Consistently strong performance meeting placement and production hiring standards.'
    },
    'Almost Ready': {
      badgeBg: 'bg-amber-500 text-white',
      border: 'border-amber-200',
      cardBg: 'bg-amber-50/60',
      label: 'Almost Ready',
      subtext: 'Good performance with some targeted technical areas requiring improvement.'
    },
    'Needs More Practice': {
      badgeBg: 'bg-neutral-800 text-white',
      border: 'border-neutral-200',
      cardBg: 'bg-neutral-50',
      label: 'Needs More Practice',
      subtext: 'Foundational concepts and applied engineering trade-offs need additional preparation.'
    }
  };

  const currentReadinessStyle = readinessStyles[placementReadiness] || readinessStyles['Almost Ready'];

  // Normalize strengths based on student's actual answers
  const strengthsList = (summary?.strengths?.length ? summary.strengths : summary?.strongAreas || []).map(s => {
    if (typeof s === 'string') return { topic: s, detail: 'Demonstrated solid understanding and accurate terminology.' };
    return { topic: s.topic || 'Core Concept', detail: s.detail || '' };
  });

  // Normalize weak areas based on student's actual struggles
  const weakAreasList = (summary?.weakAreas?.length ? summary.weakAreas : summary?.areasToImprove || []).map(w => {
    if (typeof w === 'string') return { topic: w, explanation: 'Needs deeper explanation of underlying mechanics and production trade-offs.' };
    return { topic: w.topic || 'Core Concept', explanation: w.explanation || '' };
  });

  // Recommended focus areas for improvement plan
  const recommendedFocusAreas = weakAreasList.map(w => w.topic).filter(Boolean);
  if (recommendedFocusAreas.length === 0 && summary?.improvementPlan?.length) {
    summary.improvementPlan.forEach(p => recommendedFocusAreas.push(p.topic));
  }

  const performanceMetrics = [
    { label: 'Overall Score', val: overallScore, icon: Award, desc: 'Holistic performance rating' },
    { label: 'Technical Knowledge', val: technicalKnowledge, icon: Brain, desc: 'Syntax, APIs & architecture' },
    { label: 'Communication', val: communication, icon: MessageSquare, desc: 'Clarity, conciseness & articulation' },
    { label: 'Problem Solving', val: problemSolving, icon: Cpu, desc: 'Reasoning, trade-offs & edge cases' },
    { label: 'Concept Clarity', val: conceptClarity, icon: BookOpen, desc: 'Underlying mechanics & internals' },
    { label: 'Answer Quality', val: answerQuality, icon: Layers, desc: 'Depth, precision & completeness' }
  ];

  const getQuestionStatus = (score, isSkipped) => {
    if (isSkipped || score === null || score === undefined || score < 4.0) {
      return { label: 'Weak', bg: 'bg-red-50 text-red-700 border-red-200', badge: '✗ Weak' };
    }
    if (score < 7.0) {
      return { label: 'Needs Improvement', bg: 'bg-amber-50 text-amber-700 border-amber-200', badge: '△ Needs Improvement' };
    }
    return { label: 'Strong', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', badge: '✓ Strong' };
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto space-y-10"
      style={{ fontFamily: 'inherit' }}
    >
      {/* Top Banner */}
      <div className="rounded-3xl border border-black/10 bg-black text-white p-8 sm:p-12 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[.18em] text-white/80 mb-4 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Interview Completed
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Interview Completion Report
            </h1>
            <p className="mt-2 text-sm text-white/60 max-w-lg leading-relaxed">
              Target Role: <span className="text-white font-medium">{session.role}</span> · Difficulty: <span className="text-white font-medium">{session.difficulty}</span> · {questions.length} Questions Evaluated
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 border border-white/15 rounded-2xl p-5 backdrop-blur shrink-0">
            <div className="grid h-16 w-16 place-items-center rounded-xl bg-white text-black font-bold text-2xl">
              {overallScore}%
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50 block">Overall Score</span>
              <span className="text-sm font-bold text-white block">
                {placementReadiness}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Download & Certificate Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-neutral-50 rounded-2xl border border-black/10 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-slate-800">
            <span className="font-bold">Candidate:</span>
            <span>{session?.candidateName || session?.candidate?.name || 'Candidate'}</span>
            {(session?.candidateClassYear || session?.candidate?.classYear) && (
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-semibold text-[11px]">
                {session.candidateClassYear || session.candidate.classYear}
              </span>
            )}
          </div>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5 font-mono text-slate-600">
            <span className="font-semibold text-slate-900">ID:</span>
            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-indigo-700 font-bold text-[11px]">
              {session.certificateId || 'CS-INT-2026-X9A21'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadReport}
            disabled={isDownloadingReport}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-800 shadow-2xs transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isDownloadingReport ? 'Generating Report...' : 'Download Feedback Report (PDF)'}</span>
          </button>

          <button
            onClick={() => setShowCertificateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-2xs transition"
          >
            <Award className="w-3.5 h-3.5" />
            <span>View & Download Certificate</span>
          </button>
        </div>
      </div>

      {/* ================= SECTION 1: OVERALL PERFORMANCE ================= */}
      <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-black">Overall Performance</h2>
            <p className="text-xs text-black/55">Holistic engineering evaluation across 6 core criteria</p>
          </div>
          <Award className="h-5 w-5 text-black/40" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {performanceMetrics.map((m) => {
            const Icon = m.icon;
            const score = Math.min(100, Math.max(0, m.val));
            return (
              <div
                key={m.label}
                className="p-4 rounded-2xl border border-black/10 bg-neutral-50/70 space-y-2.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-black/70">{m.label}</span>
                  <Icon className="h-4 w-4 text-black/40" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-black">{score}</span>
                  <span className="text-xs text-black/40 font-medium">/ 100</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-neutral-200 overflow-hidden">
                  <div
                    className="h-full bg-black rounded-full transition-all duration-500"
                    style={{ width: `${score}%` }}
                  />
                </div>
                <p className="text-[11px] text-black/45">{m.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= SECTION 2: PLACEMENT READINESS ================= */}
      <div className={`rounded-3xl border ${currentReadinessStyle.border} ${currentReadinessStyle.cardBg} p-6 sm:p-8 shadow-sm space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-black/50 block">
              Placement Readiness Classification
            </span>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold ${currentReadinessStyle.badgeBg} shadow-xs`}>
                <ShieldCheck className="h-3.5 w-3.5" />
                {currentReadinessStyle.label}
              </span>
              <span className="text-xs text-black/60 font-medium">
                {currentReadinessStyle.subtext}
              </span>
            </div>
          </div>
        </div>

        {/* Short explanation for the result */}
        <div className="rounded-2xl border border-black/10 bg-white/95 p-4 sm:p-5 shadow-2xs">
          <span className="text-[11px] font-bold text-black/50 uppercase tracking-wider block mb-1.5">
            Readiness Assessment Rationale
          </span>
          <p className="text-xs sm:text-sm leading-relaxed text-black/80">
            {summary?.readinessExplanation || (
              placementReadiness === 'Placement Ready'
                ? `The candidate demonstrated consistent technical depth, clear communication, and solid problem-solving composure across all interview questions for ${session.role}.`
                : placementReadiness === 'Almost Ready'
                ? `The candidate has a solid foundational grasp of ${session.role}, but needs to sharpen specific production edge cases, performance trade-offs, and complete implementations before placement interviews.`
                : `The candidate showed basic understanding but exhibited important gaps in foundational concepts and applied mechanics for ${session.role}. Additional structured practice is strongly recommended.`
            )}
          </p>
        </div>
      </div>

      {/* ================= SECTION 3: AI FEEDBACK ================= */}
      <div className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* What You Did Well */}
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span>What You Did Well</span>
            </div>
            <p className="text-xs text-emerald-900/80">
              Your strongest areas based on your actual interview answers:
            </p>
            <div className="space-y-2.5 pt-1">
              {strengthsList.length ? (
                strengthsList.map((item, idx) => (
                  <div key={idx} className="rounded-2xl border border-emerald-200/80 bg-white p-3.5 shadow-2xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold text-emerald-950">{item.topic}</span>
                    </div>
                    {item.detail && (
                      <p className="text-xs text-emerald-900/70 pl-3.5 leading-relaxed">
                        {item.detail}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <span className="text-xs text-black/50">Continue practicing to establish consistent strengths.</span>
              )}
            </div>
          </div>

          {/* What You Need to Improve */}
          <div className="rounded-3xl border border-amber-200 bg-amber-50/40 p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <span>What You Need to Improve</span>
            </div>
            <p className="text-xs text-amber-900/80">
              Specific concepts or skills where your answers struggled or lacked depth:
            </p>
            <div className="space-y-2.5 pt-1">
              {weakAreasList.length ? (
                weakAreasList.map((item, idx) => (
                  <div key={idx} className="rounded-2xl border border-amber-200/80 bg-white p-3.5 shadow-2xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      <span className="text-xs font-bold text-amber-950">{item.topic}</span>
                    </div>
                    {item.explanation && (
                      <p className="text-xs text-amber-900/70 pl-3.5 leading-relaxed">
                        {item.explanation}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <span className="text-xs text-black/50">No major weaknesses identified.</span>
              )}
            </div>
          </div>
        </div>

        {/* AI Interview Feedback */}
        {summary?.aiFeedback && (
          <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-black font-bold text-sm">
              <Sparkles className="h-4 w-4" />
              <span>AI Interview Feedback</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-black/75">
              {summary.aiFeedback}
            </p>
          </div>
        )}
      </div>

      {/* ================= SECTION 4: AI IMPROVEMENT PLAN ================= */}
      <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-neutral-50 px-3 py-1 text-xs font-semibold text-black/70 mb-2">
              <Compass className="h-3.5 w-3.5 text-black/60" />
              <span>Personalized Roadmap</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-black">
              AI Improvement Plan
            </h3>
            <p className="text-xs sm:text-sm text-black/55">
              Target these weak areas before your next placement interview attempt.
            </p>
          </div>

          <button
            onClick={onRestart}
            className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-neutral-800 transition shadow-sm self-start sm:self-auto"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Practice Again</span>
          </button>
        </div>

        {/* Recommended Focus Areas List */}
        {recommendedFocusAreas.length > 0 && (
          <div className="rounded-2xl border border-black/10 bg-neutral-50 p-5 space-y-3">
            <span className="text-xs font-bold text-black uppercase tracking-wider block">
              Recommended Focus Areas
            </span>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {recommendedFocusAreas.slice(0, 4).map((area, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-black/5">
                  <span className="grid h-6 w-6 place-items-center rounded-lg bg-black text-white text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-black truncate">{area}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actionable Steps Roadmap */}
        {summary?.improvementPlan?.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3 pt-2">
            {summary.improvementPlan.map((step, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-black/10 bg-white p-5 flex flex-col justify-between space-y-3 shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-black text-white px-2.5 py-1 text-[11px] font-semibold">
                      Priority {step.priority || idx + 1}
                    </span>
                    <span className="text-xs font-mono text-black/40">Step 0{idx + 1}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-black">{step.topic}</h4>
                  <p className="text-xs text-black/70 leading-relaxed">{step.action}</p>
                </div>

                {step.focusSkills?.length > 0 && (
                  <div className="pt-2 border-t border-black/5 flex flex-wrap gap-1">
                    {step.focusSkills.map((sk, sIdx) => (
                      <span key={sIdx} className="rounded-md border border-black/10 bg-neutral-50 px-2 py-0.5 text-[10px] font-medium text-black/70">
                        {sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= SECTION 5: QUESTION-BY-QUESTION AUDIT ================= */}
      <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-5">
        <div>
          <h3 className="text-lg font-bold text-black">Question-by-Question Audit</h3>
          <p className="text-xs text-black/55 mt-0.5">
            Audit your answer, technical evaluation, missing edge cases, and the interview-ready model response.
          </p>
        </div>

        <div className="space-y-3">
          {questions.map((q, index) => {
            const isExpanded = expandedQuestion === index;
            const score = q.evaluation?.score;
            const status = getQuestionStatus(score, q.isSkipped);

            return (
              <div
                key={index}
                className="rounded-2xl border border-black/10 overflow-hidden transition hover:border-black/25"
              >
                <div
                  onClick={() => toggleQuestion(index)}
                  className="p-4 bg-neutral-50/60 hover:bg-neutral-100/70 cursor-pointer flex items-center justify-between gap-4 transition"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-black text-white text-xs font-bold">
                      Q{q.questionNumber || index + 1}
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-black truncate">
                      {q.questionText}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${status.bg}`}>
                      {status.badge} ({score !== null && score !== undefined ? `${score}/10` : 'N/A'})
                    </span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-black/50" /> : <ChevronDown className="h-4 w-4 text-black/50" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 border-t border-black/10 bg-white space-y-4 text-xs">
                    <div>
                      <span className="font-bold text-black/50 uppercase tracking-wider text-[10px] block mb-1">
                        Question Prompt
                      </span>
                      <p className="font-medium text-black text-sm">{q.questionText}</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 pt-2">
                      <div className="p-3.5 rounded-xl border border-black/10 bg-neutral-50 space-y-1">
                        <span className="font-bold text-black/50 uppercase tracking-wider text-[10px] block">
                          Your Candidate Response
                        </span>
                        <p className="text-black/80 whitespace-pre-wrap leading-relaxed">
                          {q.userAnswer || (q.isSkipped ? 'Question was skipped.' : 'No answer provided.')}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-black/10 bg-neutral-900 text-white space-y-1">
                        <span className="font-bold text-white/50 uppercase tracking-wider text-[10px] block">
                          Interview-Ready Answer
                        </span>
                        <div className="text-neutral-200 prose prose-invert prose-xs max-w-none">
                          <ReactMarkdown>{q.evaluation?.suggestedAnswer || 'Standard model answer unavailable.'}</ReactMarkdown>
                        </div>
                      </div>
                    </div>

                    {/* Strengths & Missing Points */}
                    <div className="grid sm:grid-cols-2 gap-3 pt-1">
                      {q.evaluation?.strengths?.length > 0 && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 space-y-1">
                          <span className="font-bold text-emerald-900 block text-[11px]">Strengths in Your Answer:</span>
                          <ul className="list-disc list-inside text-emerald-950 space-y-0.5">
                            {q.evaluation.strengths.map((s, idx) => <li key={idx}>{s}</li>)}
                          </ul>
                        </div>
                      )}

                      {(q.evaluation?.missingPoints?.length > 0 || q.evaluation?.improvements?.length > 0) && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 space-y-1">
                          <span className="font-bold text-amber-900 block text-[11px]">Missing Nuances & Edge Cases:</span>
                          <ul className="list-disc list-inside text-amber-950 space-y-0.5">
                            {(q.evaluation.missingPoints || q.evaluation.improvements).map((im, idx) => (
                              <li key={idx}>{im}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* AI Tip for Interviews */}
                    {q.evaluation?.aiTip && (
                      <div className="rounded-xl border border-black/10 bg-neutral-50 p-3 flex items-start gap-2.5">
                        <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-black block text-[11px]">Hiring Manager Tip</span>
                          <p className="text-black/70 mt-0.5 leading-relaxed">{q.evaluation.aiTip}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Navigation Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-black/10">
        <button
          onClick={onSelectNewRole}
          className="rounded-xl border border-black/15 bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-black hover:bg-neutral-50 transition shadow-sm"
        >
          Practice Another Role
        </button>

        <div className="flex flex-wrap items-center gap-3">
          {onViewProgress && (
            <button
              onClick={onViewProgress}
              className="inline-flex items-center gap-1.5 rounded-xl border border-black/15 bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-black hover:bg-neutral-50 transition shadow-sm"
            >
              <BarChart3 className="h-4 w-4 text-black/60" />
              <span>Progress Analytics</span>
            </button>
          )}

          <button
            onClick={handleDownloadReport}
            disabled={isDownloadingReport}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-xs sm:text-sm font-semibold text-neutral-800 hover:bg-neutral-50 transition shadow-sm disabled:opacity-50"
          >
            <Download className="h-4 w-4 text-indigo-600" />
            <span>{isDownloadingReport ? 'Generating...' : 'Report PDF'}</span>
          </button>

          <button
            onClick={() => setShowCertificateModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-3 text-xs sm:text-sm font-semibold hover:from-amber-500 hover:to-amber-600 transition shadow-sm"
          >
            <Award className="h-4 w-4" />
            <span>Certificate</span>
          </button>

          <button
            onClick={onViewHistory}
            className="rounded-xl border border-black/15 bg-white px-4 py-3 text-xs sm:text-sm font-semibold text-black hover:bg-neutral-50 transition shadow-sm"
          >
            Past History
          </button>

          <button
            onClick={onRestart}
            className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-neutral-800 transition shadow-md"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Practice Again</span>
          </button>
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificateModal && (
        <CertificateView
          session={session}
          candidateName={session?.candidateName || session?.candidate?.name || 'Candidate'}
          classYear={session?.candidateClassYear || session?.candidate?.classYear}
          role={session?.role}
          difficulty={session?.difficulty}
          interviewType={session?.interviewType || 'Technical Interview'}
          overallScore={overallScore}
          placementReadiness={placementReadiness}
          certificateId={session?.certificateId || 'CS-INT-2026-X9A21'}
          completedAt={session?.completedAt}
          achievement={summary?.achievement}
          onClose={() => setShowCertificateModal(false)}
          isModal={true}
        />
      )}
    </motion.div>
  );
};

export default InterviewSummary;
