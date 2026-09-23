import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Lock,
  Play,
  Award,
  Zap,
  BookOpen,
  Tv,
  PenTool,
  Mic,
  Volume2,
  Sparkles,
  ChevronRight,
  X,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { englishAPI } from '../../utils/api';

const LEVEL_TABS = [
  { id: 'Beginner', title: 'Level 1: Beginner (A1)', color: 'border-emerald-500 text-emerald-600 bg-emerald-50' },
  { id: 'Elementary', title: 'Level 2: Elementary (A2)', color: 'border-blue-500 text-blue-600 bg-blue-50' },
  { id: 'Intermediate', title: 'Level 3: Intermediate (B1)', color: 'border-purple-500 text-purple-600 bg-purple-50' },
  { id: 'Upper-Intermediate', title: 'Level 4: Upper-Int (B2)', color: 'border-amber-500 text-amber-600 bg-amber-50' },
  { id: 'Advanced', title: 'Level 5: Advanced (C1)', color: 'border-rose-500 text-rose-600 bg-rose-50' }
];

export default function JourneyMapSection({ profile, onPhaseProgressUpdate, onNavigateLab }) {
  const [journeyData, setJourneyData] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(profile?.englishLevel || 'Beginner');
  const [loading, setLoading] = useState(true);

  // Active Phase Details & Quiz Modal
  const [activePhase, setActivePhase] = useState(null);
  const [phaseMode, setPhaseMode] = useState('overview'); // 'overview' | 'quiz' | 'result'
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  useEffect(() => {
    loadJourney();
  }, [profile?.englishLevel, profile?.currentPhase]);

  const loadJourney = async () => {
    try {
      setLoading(true);
      const res = await englishAPI.getJourneyPhases();
      setJourneyData(res);
      if (res.currentLevel) {
        setSelectedLevel(res.currentLevel);
      }
    } catch (err) {
      console.error('Error loading journey phases:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentLevelPhases = journeyData?.phases?.filter(p => p.level === selectedLevel) || [];

  const handleOpenPhase = (phase) => {
    if (phase.status === 'locked') {
      toast.error('Complete the previous phase with 70%+ score to unlock this phase');
      return;
    }
    setActivePhase(phase);
    setPhaseMode('overview');
    setQuizAnswers({});
    setQuizScore(null);
    setQuizFeedback(null);
  };

  const handleStartQuiz = () => {
    setPhaseMode('quiz');
    setQuizAnswers({});
  };

  const handleSubmitQuiz = async () => {
    const questions = activePhase?.quizQuestions || [];
    let correct = 0;

    questions.forEach((q) => {
      if (quizAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    const calculatedScore = Math.round((correct / questions.length) * 100);

    try {
      setSubmittingQuiz(true);
      const res = await englishAPI.completeJourneyPhase({
        phaseId: activePhase.phaseId,
        score: calculatedScore
      });

      setQuizScore(calculatedScore);
      setQuizFeedback(res);
      setPhaseMode('result');

      if (res.unlockedNextPhase) {
        confetti({ particleCount: 80, spread: 60 });
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }

      loadJourney();
      if (onPhaseProgressUpdate) onPhaseProgressUpdate(res.profile);
    } catch (err) {
      console.error('Error completing phase quiz:', err);
      toast.error('Quiz submission failed');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION HEADER */}
      <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> 50-Phase Visual Learning Map
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              Your English Progression Roadmap
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl mt-1">
              Progress systematically from Basic to Advanced English. Complete required tasks and score 70%+ on phase quizzes to smart-unlock the next step.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Current Phase</span>
              <div className="text-base font-black text-slate-900">
                Phase {profile?.currentPhase || 1}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Mastered</span>
              <div className="text-base font-black text-emerald-600">
                {profile?.phaseProgress?.length || 0} / 50
              </div>
            </div>
          </div>
        </div>

        {/* LEVEL TABS */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {LEVEL_TABS.map((tab) => {
            const isSelected = selectedLevel === tab.id;
            const isUserCurrent = profile?.englishLevel === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedLevel(tab.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <span>{tab.title}</span>
                {isUserCurrent && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 10 PHASES IN CURRENT LEVEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {currentLevelPhases.map((phase, idx) => {
          const isCompleted = phase.status === 'completed';
          const isCurrent = phase.status === 'current';
          const isLocked = phase.status === 'locked';

          return (
            <motion.div
              key={phase.phaseId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              onClick={() => handleOpenPhase(phase)}
              className={`rounded-2xl border p-5 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isCurrent
                  ? 'border-purple-500 bg-purple-50/20 shadow-md ring-2 ring-purple-500/20 hover:border-purple-600'
                  : isCompleted
                  ? 'border-emerald-200 bg-white hover:border-emerald-300'
                  : isLocked
                  ? 'border-slate-200 bg-slate-50/60 opacity-70 hover:opacity-90'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                      isCurrent
                        ? 'bg-purple-600 text-white'
                        : isCompleted
                        ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                        : isLocked
                        ? 'bg-slate-200 text-slate-500'
                        : 'bg-blue-500/10 text-blue-700'
                    }`}>
                      Phase {phase.phaseNumber}
                    </span>

                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full animate-pulse">
                        <Zap className="w-3 h-3 fill-purple-700" /> Active
                      </span>
                    )}
                  </div>

                  <div>
                    {isCompleted ? (
                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{phase.score}% Mastered</span>
                      </div>
                    ) : isLocked ? (
                      <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked</span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-600">Unlocked</span>
                    )}
                  </div>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                  {phase.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2">
                  {phase.subtitle}
                </p>

                {/* Focus skills chips */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {phase.focusSkills?.map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action bar */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">8 Questions • 70% to pass</span>
                <span className={`font-bold flex items-center gap-1 ${
                  isCurrent ? 'text-purple-600' : 'text-slate-700'
                }`}>
                  {isCurrent ? 'Continue Phase →' : isCompleted ? 'Review Phase' : 'Open Phase'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* PHASE MODAL & QUIZ DRAWER */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {activePhase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl rounded-3xl border border-black/10 bg-white p-6 sm:p-8 text-slate-900 shadow-2xl space-y-6 my-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <div>
                  <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-700 mb-1">
                    {activePhase.level} • Phase {activePhase.phaseNumber}
                  </div>
                  <h2 className="text-xl font-black text-slate-900">{activePhase.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePhase(null)}
                  className="p-2 rounded-full hover:bg-neutral-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* MODE 1: OVERVIEW & TASKS */}
              {phaseMode === 'overview' && (
                <div className="space-y-6">
                  {/* Objectives */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Learning Objectives
                    </h4>
                    <div className="space-y-2">
                      {activePhase.objectives?.map((obj, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Core Lessons */}
                  {activePhase.lessons && activePhase.lessons.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Phase Concept Notes
                      </h4>
                      {activePhase.lessons.map((lesson, idx) => (
                        <div key={idx} className="space-y-0.5 text-xs text-slate-700">
                          <strong className="text-slate-900">{lesson.title}:</strong> {lesson.content}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Action Links to Learning Labs */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Practice in Learning Labs
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => { setActivePhase(null); if (onNavigateLab) onNavigateLab('cartoons'); }}
                        className="p-3 rounded-xl border border-slate-200 hover:border-purple-500 bg-white hover:bg-purple-50 text-left transition"
                      >
                        <Tv className="w-4 h-4 text-purple-600 mb-1" />
                        <div className="text-xs font-bold text-slate-800">Cartoon Lab</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setActivePhase(null); if (onNavigateLab) onNavigateLab('stories'); }}
                        className="p-3 rounded-xl border border-slate-200 hover:border-rose-500 bg-white hover:bg-rose-50 text-left transition"
                      >
                        <BookOpen className="w-4 h-4 text-rose-600 mb-1" />
                        <div className="text-xs font-bold text-slate-800">Reading Lab</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setActivePhase(null); if (onNavigateLab) onNavigateLab('speaking'); }}
                        className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50 text-left transition"
                      >
                        <Mic className="w-4 h-4 text-blue-600 mb-1" />
                        <div className="text-xs font-bold text-slate-800">Speaking Lab</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setActivePhase(null); if (onNavigateLab) onNavigateLab('writing'); }}
                        className="p-3 rounded-xl border border-slate-200 hover:border-indigo-500 bg-white hover:bg-indigo-50 text-left transition"
                      >
                        <PenTool className="w-4 h-4 text-indigo-600 mb-1" />
                        <div className="text-xs font-bold text-slate-800">Writing Lab</div>
                      </button>
                    </div>
                  </div>

                  {/* Start Quiz Action */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <div className="text-xs text-slate-500">
                      Passing Score: <strong>70%+</strong> • Reward: <strong>+120 XP</strong>
                    </div>
                    <button
                      type="button"
                      onClick={handleStartQuiz}
                      className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition flex items-center gap-2 shadow-sm"
                    >
                      <Zap className="w-4 h-4 fill-white" />
                      <span>Take Phase Quiz ({activePhase.quizQuestions?.length || 8} Qs)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* MODE 2: QUIZ QUESTIONS */}
              {phaseMode === 'quiz' && (
                <div className="space-y-6">
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {activePhase.quizQuestions?.map((q, idx) => (
                      <div key={q.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                            Question {idx + 1} • {q.skill}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{q.question}</h4>
                        <div className="space-y-1.5">
                          {q.options?.map((opt, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: opt })}
                              className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition ${
                                quizAnswers[q.id] === opt
                                  ? 'border-purple-600 bg-purple-50 text-purple-900 font-semibold shadow-sm'
                                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setPhaseMode('overview')}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Back to Overview
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitQuiz}
                      disabled={submittingQuiz || Object.keys(quizAnswers).length < (activePhase.quizQuestions?.length || 8)}
                      className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-purple-600/20"
                    >
                      {submittingQuiz ? 'Evaluating...' : 'Submit Phase Quiz'}
                    </button>
                  </div>
                </div>
              )}

              {/* MODE 3: QUIZ RESULT & SMART UNLOCKING */}
              {phaseMode === 'result' && (
                <div className="space-y-6 text-center py-2">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                    quizScore >= 70
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                  }`}>
                    {quizScore >= 70 ? <Award className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900">
                      {quizScore >= 70 ? 'Phase Mastered!' : 'Keep Practicing'}
                    </h3>
                    <p className="text-sm font-bold text-slate-600">
                      Score: <span className={quizScore >= 70 ? 'text-emerald-600' : 'text-rose-600'}>{quizScore}%</span> (Required: 70%+)
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    {quizFeedback?.message}
                  </p>

                  {/* Adaptive Recovery Mission Notice if failed */}
                  {quizScore < 70 && quizFeedback?.recoveryMission && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                        <TrendingUp className="w-4 h-4 text-amber-700" />
                        <span>Adaptive Recovery Mission Assigned</span>
                      </div>
                      <p className="text-xs text-amber-800">
                        {quizFeedback.recoveryMission.title}: {quizFeedback.recoveryMission.description}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setPhaseMode('quiz')}
                      className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Retry Quiz
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePhase(null)}
                      className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
