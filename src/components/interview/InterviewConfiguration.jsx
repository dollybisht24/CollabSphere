import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Sparkles, Check, HelpCircle,
  FolderGit2, Briefcase, Award, Zap
} from 'lucide-react';

const difficulties = [
  {
    id: 'Beginner',
    label: 'Beginner',
    tag: 'Junior / Intern',
    desc: 'Core syntax, fundamental language mechanics, standard APIs, and foundational concepts.'
  },
  {
    id: 'Intermediate',
    label: 'Intermediate',
    tag: 'Mid-Level (1-3 yrs)',
    desc: 'Component architecture, asynchronous flows, performance bottlenecks, and real engineering trade-offs.'
  },
  {
    id: 'Advanced',
    label: 'Advanced',
    tag: 'Senior / Staff',
    desc: 'System architecture, deep framework internals, distributed paradigms, edge cases, and scalability.'
  },
  {
    id: 'Mixed Difficulty',
    label: 'Mixed Difficulty',
    tag: 'Adaptive Journey',
    desc: 'Starts with foundational questions and dynamically ramps up difficulty based on your answers.'
  }
];

const questionOptions = [
  { count: 5, label: '5 Questions', time: '~10 min', tag: 'Quick Practice' },
  { count: 10, label: '10 Questions', time: '~20 min', tag: 'Standard (Recommended)' },
  { count: 15, label: '15 Questions', time: '~30 min', tag: 'In-Depth Drill' },
  { count: 20, label: '20 Questions', time: '~45 min', tag: 'Full Mock Interview' }
];

const interviewTypes = [
  {
    id: 'Technical Interview',
    label: 'Technical Interview',
    desc: 'Focuses purely on core language, coding questions, system architecture, and framework principles.'
  },
  {
    id: 'HR Interview',
    label: 'HR / Behavioral Interview',
    desc: 'Focuses on communication, conflict resolution, technical teamwork, deadlines, and project ownership.'
  },
  {
    id: 'Technical + HR',
    label: 'Technical + HR Combined',
    desc: 'A complete simulation alternating between deep technical challenges and behavioral situational prompts.'
  },
  {
    id: 'Project-Based Interview',
    label: 'Project-Based Interview',
    desc: 'Questions specifically centered on your actual project architecture, tech stack, and debugging stories.'
  }
];

const InterviewConfiguration = ({
  role,
  candidate,
  onEditCandidate,
  onBack,
  onStart,
  loading = false,
  error = ''
}) => {
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [questionCount, setQuestionCount] = useState(5);
  const [interviewType, setInterviewType] = useState('Technical Interview');
  const [projectContext, setProjectContext] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onStart({
      role: role.name,
      difficulty,
      interviewType,
      totalQuestions: questionCount,
      projectContext: interviewType === 'Project-Based Interview' ? projectContext : '',
      candidateName: candidate?.name || '',
      candidateEmail: candidate?.email || '',
      candidateClassYear: candidate?.classYear || '',
      candidate: candidate || {}
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-black/60 hover:text-black transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to roles
          </button>
          <span className="text-black/30">/</span>
          <span className="text-xs font-medium text-black/50">{role.name}</span>
        </div>

        {candidate && onEditCandidate && (
          <button
            onClick={onEditCandidate}
            className="text-xs font-semibold text-slate-600 hover:text-black transition"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Candidate Profile Summary Banner */}
      {candidate && candidate.name && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-neutral-50 border border-black/10 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xs">
              {candidate.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span>{candidate.name}</span>
                {candidate.classYear && (
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold">
                    {candidate.classYear}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500">{candidate.email}</div>
            </div>
          </div>

          {onEditCandidate && (
            <button
              type="button"
              onClick={onEditCandidate}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
            >
              Edit Candidate Info
            </button>
          )}
        </div>
      )}

      {/* Role Banner */}
      <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${role.iconBg}`}>
            <role.icon className="h-7 w-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-neutral-50 px-2.5 py-0.5 text-[10px] font-semibold text-black/60 mb-1">
              <Sparkles className="h-3 w-3" /> Interview Setup
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-black">{role.name}</h2>
            <p className="text-xs text-black/60 mt-0.5">{role.tagline}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 max-w-sm sm:justify-end">
          {role.focusAreas.slice(0, 4).map((f) => (
            <span key={f} className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-black/70">
              {f}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. Difficulty Selection */}
        <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-black">1. Select Interview Difficulty</h3>
            <p className="text-xs text-black/55 mt-0.5">
              The AI dynamically calibrates question depth and evaluation standards based on this tier.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {difficulties.map((d) => {
              const isSelected = difficulty === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => setDifficulty(d.id)}
                  className={`cursor-pointer rounded-2xl p-4 border transition-all ${
                    isSelected
                      ? 'border-black bg-neutral-900 text-white shadow-md'
                      : 'border-black/10 bg-neutral-50/50 hover:bg-white hover:border-black/25'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{d.label}</span>
                    <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-black/5 text-black/60'
                    }`}>
                      {d.tag}
                    </span>
                  </div>
                  <p className={`mt-2 text-xs leading-5 ${isSelected ? 'text-white/75' : 'text-black/60'}`}>
                    {d.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Interview Type */}
        <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-black">2. Interview Focus Type</h3>
            <p className="text-xs text-black/55 mt-0.5">
              Choose the questioning format that reflects what you want to prepare for.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {interviewTypes.map((t) => {
              const isSelected = interviewType === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setInterviewType(t.id)}
                  className={`cursor-pointer rounded-2xl p-4 border transition-all ${
                    isSelected
                      ? 'border-black bg-neutral-900 text-white shadow-md'
                      : 'border-black/10 bg-neutral-50/50 hover:bg-white hover:border-black/25'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{t.label}</span>
                    {isSelected && <Check className="h-4 w-4 text-white" />}
                  </div>
                  <p className={`mt-2 text-xs leading-5 ${isSelected ? 'text-white/75' : 'text-black/60'}`}>
                    {t.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Project Details Input if Project-Based selected */}
          {interviewType === 'Project-Based Interview' && (
            <div className="mt-4 pt-4 border-t border-black/10 space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-black/65">
                Describe Your Project(s) to the AI *
              </label>
              <textarea
                rows={3}
                required
                value={projectContext}
                onChange={(e) => setProjectContext(e.target.value)}
                placeholder="E.g. I built an e-commerce platform using React, Node.js, and MongoDB with Stripe payments and Redis caching..."
                className="w-full rounded-xl border border-black/15 bg-white p-3 text-xs sm:text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
              />
              <p className="text-[11px] text-black/50">
                The AI will formulate targeted interview questions probing your specific architecture, database decisions, and debugging stories.
              </p>
            </div>
          )}
        </div>

        {/* 3. Number of Questions */}
        <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-black">3. Number of Questions</h3>
            <p className="text-xs text-black/55 mt-0.5">
              Select interview length and pace.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {questionOptions.map((q) => {
              const isSelected = questionCount === q.count;
              return (
                <div
                  key={q.count}
                  onClick={() => setQuestionCount(q.count)}
                  className={`cursor-pointer rounded-2xl p-4 text-center border transition-all ${
                    isSelected
                      ? 'border-black bg-black text-white shadow-md'
                      : 'border-black/10 bg-neutral-50/50 hover:bg-white hover:border-black/25'
                  }`}
                >
                  <p className="text-xl font-bold">{q.count}</p>
                  <p className={`text-xs font-medium mt-1 ${isSelected ? 'text-white/80' : 'text-black/60'}`}>
                    {q.time}
                  </p>
                  <p className={`text-[10px] mt-2 font-semibold ${isSelected ? 'text-white/60' : 'text-black/40'}`}>
                    {q.tag}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit action */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl px-5 py-3 text-sm font-semibold text-black/60 hover:text-black hover:bg-neutral-100 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-black px-7 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-neutral-800 disabled:opacity-50 transition"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Generating Question 1 with AI...</span>
              </>
            ) : (
              <>
                <span>Start Interview</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default InterviewConfiguration;
