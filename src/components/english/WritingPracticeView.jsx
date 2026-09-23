import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenTool,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  HelpCircle,
  Lightbulb,
  Check,
  RefreshCw,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { englishAPI } from '../../utils/api';

export default function WritingPracticeView({
  userLevel = 'Beginner',
  userName = 'Candidate',
  onFinishActivity
}) {
  const [selectedLevel, setSelectedLevel] = useState(userLevel);
  const [prompts, setPrompts] = useState([]);
  const [activePrompt, setActivePrompt] = useState(null);
  const [loadingPrompts, setLoadingPrompts] = useState(true);

  // Editor State
  const [writtenText, setWrittenText] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  // Rewrite / Try Again Mode
  const [isRewriting, setIsRewriting] = useState(false);
  const textareaRef = useRef(null);

  // Load Prompts
  const loadPrompts = async (level) => {
    try {
      setLoadingPrompts(true);
      const res = await englishAPI.getWritingPrompts(level);
      const list = res.prompts || [];
      setPrompts(list);
      if (list.length > 0) {
        setActivePrompt(list[0]);
      }
    } catch (err) {
      console.error('Failed to load prompts:', err);
      toast.error('Unable to load writing prompts');
    } finally {
      setLoadingPrompts(false);
    }
  };

  useEffect(() => {
    loadPrompts(selectedLevel);
  }, [selectedLevel]);

  const wordCount = writtenText.trim() ? writtenText.trim().split(/\s+/).length : 0;
  const charCount = writtenText.length;

  const handleEvaluate = async () => {
    if (wordCount < 8) {
      toast.error('Please write at least 8 to 10 words before evaluating.');
      return;
    }

    try {
      setIsEvaluating(true);
      const res = await englishAPI.evaluateWriting({
        text: writtenText,
        promptId: activePrompt?.id,
        topic: activePrompt?.title,
        level: selectedLevel
      });

      setEvaluationResult(res.evaluation);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      toast.success(`Writing evaluated! +${res.earnedXp || 75} XP earned!`);

      if (onFinishActivity) onFinishActivity('writing');
    } catch (err) {
      console.error('Writing evaluation error:', err);
      toast.error(err.message || 'Evaluation failed. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleTryAgain = () => {
    setIsRewriting(true);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast('✍️ Review the AI corrections and rewrite your sentences in the editor!', { icon: '💡' });
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-[32px] border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-black/5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-purple-800 mb-2">
              <PenTool className="w-3.5 h-3.5" /> AI Writing Practice
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Express Yourself in Written English
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Receive deep AI grammar critiques that explain the exact reasons <span className="font-semibold text-slate-700">WHY</span> something is incorrect, score your clarity, and help you rewrite with confidence.
            </p>
          </div>

          {/* Level Selector */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-neutral-100 border border-black/5 self-start md:self-auto">
            {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  setSelectedLevel(lvl);
                  setEvaluationResult(null);
                  setIsRewriting(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  selectedLevel === lvl
                    ? 'bg-white text-slate-900 shadow-sm border border-black/5'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Selector Pills */}
        <div className="mt-6 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Choose a Prompt for {selectedLevel} Level:
          </span>
          <div className="flex flex-wrap gap-2">
            {prompts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setActivePrompt(p);
                  setEvaluationResult(null);
                  setIsRewriting(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                  activePrompt?.id === p.id
                    ? 'border-purple-500 bg-purple-50 text-purple-950 shadow-xs'
                    : 'border-slate-200 bg-neutral-50 text-slate-600 hover:bg-white'
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Active Prompt Box */}
        {activePrompt && (
          <div className="mt-4 p-5 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-purple-950 flex items-center gap-2">
                <span>📝 {activePrompt.title}</span>
              </h4>
              <span className="text-[11px] font-semibold text-purple-700">
                Min {activePrompt.minWords || 30} words
              </span>
            </div>
            <p className="text-xs sm:text-sm text-purple-900/90 leading-relaxed font-medium">
              {activePrompt.prompt}
            </p>
            {activePrompt.tips && (
              <div className="pt-2 flex flex-wrap gap-2">
                {activePrompt.tips.map((tip, i) => (
                  <span key={i} className="text-[11px] font-semibold text-purple-800 bg-white/80 px-2.5 py-0.5 rounded-md border border-purple-200/50">
                    💡 {tip}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Writing Editor Area */}
        <div className="mt-6 space-y-3">
          {isRewriting && (
            <div className="p-3 rounded-xl bg-purple-100 border border-purple-300 text-purple-900 text-xs font-bold flex items-center justify-between animate-pulse">
              <span>✍️ Try Again Mode Active: Apply the AI corrections and re-submit your improved text!</span>
              <button
                type="button"
                onClick={() => setIsRewriting(false)}
                className="text-purple-700 hover:text-purple-950 font-extrabold"
              >
                ✕
              </button>
            </div>
          )}

          <div className="relative rounded-2xl border border-slate-300 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 bg-white transition shadow-inner">
            <textarea
              ref={textareaRef}
              rows={6}
              value={writtenText}
              onChange={(e) => setWrittenText(e.target.value)}
              placeholder="Write your answer here in English... (e.g., 'I wake up at 7 AM every morning and attend my college classes...')"
              className="w-full p-4 sm:p-5 rounded-2xl focus:outline-hidden text-sm text-slate-900 leading-relaxed resize-y"
            />

            <div className="px-4 py-2.5 bg-neutral-50 rounded-b-2xl border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>{wordCount} words • {charCount} characters</span>
              <span>Need help? Try writing naturally first, then let AI analyze!</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setWrittenText('');
                setEvaluationResult(null);
                setIsRewriting(false);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Clear Editor
            </button>

            <button
              type="button"
              onClick={handleEvaluate}
              disabled={isEvaluating || wordCount < 5}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              {isEvaluating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI Analyzing Grammar & Structure...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Check My Writing</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI EVALUATION RESULTS BREAKDOWN */}
        <AnimatePresence>
          {evaluationResult && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 pt-8 border-t border-black/10 space-y-6"
            >
              {/* Score Header Cards */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Your Writing Score & Analysis
                  </h3>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-black">
                    <Award className="w-3.5 h-3.5" />
                    Overall: {evaluationResult.scores?.overall || 85}/100
                  </div>
                </div>

                {/* 5 Score Categories Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: 'Grammar', score: evaluationResult.scores?.grammar || 80, color: 'text-blue-600' },
                    { label: 'Vocabulary', score: evaluationResult.scores?.vocabulary || 75, color: 'text-emerald-600' },
                    { label: 'Sentence Structure', score: evaluationResult.scores?.sentenceStructure || 85, color: 'text-indigo-600' },
                    { label: 'Spelling', score: evaluationResult.scores?.spelling || 95, color: 'text-amber-600' },
                    { label: 'Clarity', score: evaluationResult.scores?.clarity || 85, color: 'text-purple-600' }
                  ].map((cat) => (
                    <div key={cat.label} className="p-3.5 rounded-2xl bg-neutral-50 border border-black/5 text-center">
                      <div className="text-[10px] uppercase font-bold text-slate-400">{cat.label}</div>
                      <div className={`text-xl font-black ${cat.color} mt-0.5`}>{cat.score}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Note */}
              {evaluationResult.feedbackSummary && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 font-medium leading-relaxed">
                  💡 <strong>Coach Summary:</strong> {evaluationResult.feedbackSummary}
                </div>
              )}

              {/* Original vs. Corrected Comparison */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Original */}
                <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                    <span>Original Submission</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                    {evaluationResult.originalText}
                  </p>
                </div>

                {/* Corrected */}
                <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>AI Recommended Version</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-900 leading-relaxed whitespace-pre-wrap font-medium">
                    {evaluationResult.correctedText}
                  </p>
                </div>
              </div>

              {/* Categorized Mistakes Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Identified Mistakes & Explanations ({evaluationResult.mistakes?.length || 0})
                </h4>

                {(!evaluationResult.mistakes || evaluationResult.mistakes.length === 0) ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">
                    ✓ No significant grammatical or structural mistakes detected! Your writing is clear and natural.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {evaluationResult.mistakes.map((m, mIdx) => (
                      <div
                        key={mIdx}
                        className="p-4 rounded-2xl border border-black/10 bg-neutral-50/80 space-y-2 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-extrabold uppercase tracking-wider">
                            {m.category || 'Grammar'} Mistake
                          </span>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-2 text-xs">
                          <div className="p-2 rounded-xl bg-rose-100/60 text-rose-950 font-medium">
                            <span className="font-bold block text-rose-800 text-[10px] uppercase">Original:</span>
                            "{m.originalChunk}"
                          </div>
                          <div className="p-2 rounded-xl bg-emerald-100/60 text-emerald-950 font-medium">
                            <span className="font-bold block text-emerald-800 text-[10px] uppercase">Correction:</span>
                            "{m.correction}"
                          </div>
                        </div>

                        <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-black/5 leading-relaxed">
                          <strong>Why:</strong> {m.explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* How to Improve Tips */}
              {evaluationResult.improvementTips?.length > 0 && (
                <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span>How To Improve Next Time</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-amber-900 font-medium list-disc pl-5">
                    {evaluationResult.improvementTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Try Again Rewrite Option */}
              <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleTryAgain}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 transition shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Again (Rewrite to Improve Score)</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
