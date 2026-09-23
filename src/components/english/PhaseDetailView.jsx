import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Play,
  Volume2,
  Sparkles,
  BookOpen,
  PenTool,
  Mic,
  Zap,
  HelpCircle,
  Award,
  ChevronRight,
  RotateCcw,
  Check,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { englishAPI } from '../../utils/api';

export default function PhaseDetailView({
  phase,
  onBack,
  onPhaseUpdated,
  userLevel = 'Beginner'
}) {
  const [selectedModule, setSelectedModule] = useState(
    phase?.modules?.find(m => m.isCurrent) || phase?.modules?.[0] || null
  );
  const [moduleTab, setModuleTab] = useState('learn'); // 'learn' | 'practice' | 'ai_practice' | 'mini_quiz'

  // Practice state
  const [practiceAnswer, setPracticeAnswer] = useState('');
  const [practiceSubmitted, setPracticeSubmitted] = useState(false);

  // AI Practice state
  const [aiInputText, setAiInputText] = useState('');
  const [aiFeedback, setAiFeedback] = useState(null);
  const [evaluatingAI, setEvaluatingAI] = useState(false);

  // Mini quiz state
  const [miniQuizAnswers, setMiniQuizAnswers] = useState({});
  const [miniQuizSubmitted, setMiniQuizSubmitted] = useState(false);

  // Capstone quiz state
  const [capstoneAnswers, setCapstoneAnswers] = useState({});
  const [capstoneScore, setCapstoneScore] = useState(null);
  const [submittingCapstone, setSubmittingCapstone] = useState(false);
  const [completingModule, setCompletingModule] = useState(false);

  // Audio helper
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  const handleSelectModule = (mod) => {
    if (mod.isLocked) {
      toast.error('Complete the previous module to unlock this lesson!');
      return;
    }
    setSelectedModule(mod);
    setModuleTab('learn');
    setPracticeAnswer('');
    setPracticeSubmitted(false);
    setAiInputText('');
    setAiFeedback(null);
    setMiniQuizAnswers({});
    setMiniQuizSubmitted(false);
    setCapstoneAnswers({});
    setCapstoneScore(null);
  };

  // Complete a standard module
  const handleMarkModuleComplete = async () => {
    if (!selectedModule) return;
    try {
      setCompletingModule(true);
      const res = await englishAPI.completePhaseLesson({
        phaseId: phase.phaseId,
        lessonId: selectedModule.id
      });

      confetti({ particleCount: 60, spread: 55 });
      toast.success(res.message || 'Module completed! +40 XP');

      if (onPhaseUpdated) onPhaseUpdated();

      // Find next module to auto-advance
      const currentIdx = phase.modules.findIndex(m => m.id === selectedModule.id);
      if (currentIdx >= 0 && currentIdx < phase.modules.length - 1) {
        const nextMod = phase.modules[currentIdx + 1];
        setSelectedModule({ ...nextMod, isLocked: false });
        setModuleTab('learn');
      }
    } catch (err) {
      toast.error('Failed to complete module');
    } finally {
      setCompletingModule(false);
    }
  };

  // Submit AI Practice prompt
  const handleEvaluateAIPractice = async () => {
    if (!aiInputText.trim()) {
      toast.error('Please enter your response before submitting to AI');
      return;
    }

    try {
      setEvaluatingAI(true);
      const res = await englishAPI.evaluateSpeaking({
        prompt: selectedModule?.aiPractice?.prompt || 'Introduce yourself',
        transcript: aiInputText,
        level: userLevel
      });

      setAiFeedback(res.feedback || {
        whatWentWell: 'Good expression! You communicated your idea clearly.',
        whatToImprove: 'Work on adding descriptive adjectives and smoother sentence connectors.',
        betterWayToSay: selectedModule?.aiPractice?.sampleResponse || 'That was a solid, clear effort.',
        newWords: ['Articulate', 'Expression', 'Confidence']
      });
      confetti({ particleCount: 40, spread: 45 });
      toast.success('AI feedback generated!');
    } catch (err) {
      // Fallback feedback if offline
      setAiFeedback({
        whatWentWell: 'Great initiative! You expressed your thoughts using complete English sentences.',
        whatToImprove: 'Try incorporating more precise vocabulary related to this phase topic.',
        betterWayToSay: selectedModule?.aiPractice?.sampleResponse || 'Your sentence was understandable and polite.',
        newWords: ['Articulate', 'Clarity', 'Confidence']
      });
    } finally {
      setEvaluatingAI(false);
    }
  };

  // Submit Capstone Quiz
  const handleSubmitCapstone = async () => {
    const questions = selectedModule?.quizQuestions || phase.quizQuestions || [];
    let correct = 0;

    questions.forEach((q) => {
      if (capstoneAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    const score = Math.round((correct / questions.length) * 100);

    try {
      setSubmittingCapstone(true);
      const res = await englishAPI.completeJourneyPhase({
        phaseId: phase.phaseId,
        score
      });

      setCapstoneScore(score);

      if (res.unlockedNextPhase) {
        confetti({ particleCount: 90, spread: 70 });
        toast.success(`Phase Mastered with ${score}%! Next Phase Unlocked.`);
      } else {
        toast.error(`Score: ${score}%. You need 70%+ to master this phase. Review and try again!`);
      }

      if (onPhaseUpdated) onPhaseUpdated();
    } catch (err) {
      toast.error('Failed to submit capstone quiz');
    } finally {
      setSubmittingCapstone(false);
    }
  };

  const isCapstone = selectedModule?.type === 'capstone_quiz' || selectedModule?.moduleNumber === 8;

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition mb-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Learning Path
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700">
                {phase.level} • Phase {phase.phaseNumber}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {phase.estimatedTime || '~2 Hours'} • 8 Modules
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {phase.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl">
              {phase.subtitle}
            </p>
          </div>

          {/* Progress gauge */}
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Phase Progress</div>
              <div className="text-lg font-black text-slate-900">
                {phase.progressPercent || 0}%
              </div>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 flex items-center justify-center font-bold text-xs text-purple-700 bg-purple-50">
              {phase.completedLessonIds?.length || 0}/8
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5 space-y-1.5">
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${phase.progressPercent || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. MAIN LAYOUT: MODULES SIDEBAR + ACTIVE LESSON RUNNER */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">

        {/* LEFT: 8 MODULE LIST */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Learning Modules (8)
            </h3>
            <span className="text-[10px] font-bold text-purple-600">
              Step-by-step
            </span>
          </div>

          <div className="space-y-2">
            {(phase.modules || []).map((mod, idx) => {
              const isSelected = selectedModule?.id === mod.id;
              const isCompleted = mod.isCompleted;
              const isLocked = mod.isLocked;

              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => handleSelectModule(mod)}
                  disabled={isLocked}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50/50 shadow-sm ring-2 ring-purple-600/10'
                      : isCompleted
                      ? 'border-emerald-200 bg-white hover:border-emerald-300'
                      : isLocked
                      ? 'border-slate-200 bg-slate-50/60 opacity-60 cursor-not-allowed'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : isLocked
                        ? 'bg-slate-200 text-slate-400'
                        : isSelected
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {isCompleted ? <Check className="w-4 h-4" /> : isLocked ? <Lock className="w-3.5 h-3.5" /> : mod.moduleNumber}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-900 line-clamp-1">
                        {mod.title}
                      </div>
                      <div className="text-[10px] font-medium text-slate-500">
                        {mod.estimatedMinutes} min • {mod.type.replace('_', ' ')}
                      </div>
                    </div>
                  </div>

                  <div>
                    {isCompleted ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Done ✓
                      </span>
                    ) : isLocked ? (
                      <Lock className="w-3.5 h-3.5 text-slate-300" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: INTERACTIVE MODULE RUNNER */}
        <div className="space-y-4">
          {selectedModule && !isCapstone && (
            <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-7 shadow-sm space-y-6">
              {/* Module Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded">
                    Module {selectedModule.moduleNumber} of 8
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-1">
                    {selectedModule.title}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedModule.description}
                  </p>
                </div>

                {selectedModule.isCompleted && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start">
                    <CheckCircle2 className="w-4 h-4" /> Completed
                  </span>
                )}
              </div>

              {/* 4 LESSON TABS: LEARN • PRACTICE • AI PRACTICE • MINI QUIZ */}
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                {[
                  { id: 'learn', label: '1. Learn', icon: BookOpen },
                  { id: 'practice', label: '2. Practice', icon: PenTool },
                  { id: 'ai_practice', label: '3. AI Practice', icon: Mic },
                  { id: 'mini_quiz', label: '4. Mini Quiz', icon: HelpCircle }
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = moduleTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setModuleTab(t.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: LEARN */}
              {moduleTab === 'learn' && (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/80">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 mb-1">
                      Concept Summary
                    </h4>
                    <p className="text-xs sm:text-sm text-purple-950 font-medium leading-relaxed">
                      {selectedModule.learnContent?.summary}
                    </p>
                  </div>

                  {/* Key Rules */}
                  {selectedModule.learnContent?.keyRules && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Golden Rules to Remember
                      </h4>
                      <div className="space-y-1.5">
                        {selectedModule.learnContent.keyRules.map((rule, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] shrink-0 text-slate-600">
                              {idx + 1}
                            </span>
                            <span className="mt-0.5">{rule}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vocabulary Flashcards */}
                  {selectedModule.learnContent?.vocabulary && (
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Essential Vocabulary with Audio
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedModule.learnContent.vocabulary.map((v) => (
                          <div key={v.word} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-sm text-slate-900">{v.word}</span>
                              <button
                                type="button"
                                onClick={() => speakText(v.word)}
                                className="p-1 rounded-full hover:bg-slate-200 text-purple-600"
                                title="Listen to pronunciation"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">{v.phonetic}</div>
                            <p className="text-xs text-slate-600">{v.meaning}</p>
                            <p className="text-xs text-slate-500 italic">"{v.example}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conversational Dialogue with Audio */}
                  {selectedModule.learnContent?.dialogue && (
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Real-World Dialogue Scenario
                      </h4>
                      <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        {selectedModule.learnContent.dialogue.map((d, i) => (
                          <div key={i} className="flex items-start justify-between gap-3 text-xs">
                            <div>
                              <strong className="text-slate-900">{d.speaker}:</strong>{' '}
                              <span className="text-slate-700 font-medium">{d.text}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => speakText(d.audioText || d.text)}
                              className="p-1 text-slate-400 hover:text-purple-600 shrink-0"
                              title="Listen aloud"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PRACTICE DRILL */}
              {moduleTab === 'practice' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                    <span className="text-[10px] font-black uppercase text-purple-700">Practice Question</span>
                    <h3 className="font-bold text-sm text-slate-900">
                      {selectedModule.practice?.question}
                    </h3>

                    <div className="space-y-2">
                      {selectedModule.practice?.options?.map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setPracticeAnswer(opt);
                            setPracticeSubmitted(true);
                          }}
                          className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition ${
                            practiceSubmitted && opt === selectedModule.practice?.correctAnswer
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                              : practiceSubmitted && practiceAnswer === opt && opt !== selectedModule.practice?.correctAnswer
                              ? 'border-rose-400 bg-rose-50 text-rose-900'
                              : practiceAnswer === opt
                              ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
                          {opt}
                        </button>
                      ))}
                    </div>

                    {practiceSubmitted && (
                      <div className="mt-3 p-3 rounded-xl bg-purple-50 text-xs text-purple-900">
                        💡 <strong>Explanation:</strong> {selectedModule.practice?.explanation}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: AI PRACTICE */}
              {moduleTab === 'ai_practice' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-purple-700 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> AI Spoken / Written Drill
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">Level: {userLevel}</span>
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      "{selectedModule.aiPractice?.prompt}"
                    </p>

                    <textarea
                      rows={3}
                      value={aiInputText}
                      onChange={(e) => setAiInputText(e.target.value)}
                      placeholder="Type or speak your answer here to receive instant AI evaluation..."
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-purple-600 bg-white"
                    />

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => speakText(selectedModule.aiPractice?.sampleResponse || '')}
                        className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Listen to Native Model Answer
                      </button>

                      <button
                        type="button"
                        onClick={handleEvaluateAIPractice}
                        disabled={evaluatingAI || !aiInputText.trim()}
                        className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition disabled:opacity-40"
                      >
                        {evaluatingAI ? 'Evaluating with AI...' : 'Submit to AI Coach →'}
                      </button>
                    </div>

                    {aiFeedback && (
                      <div className="mt-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2 text-xs">
                        <div className="font-bold text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> AI Coach Feedback
                        </div>
                        <p><strong className="text-emerald-950">Strengths:</strong> {aiFeedback.whatWentWell}</p>
                        <p><strong className="text-emerald-950">Tip to Improve:</strong> {aiFeedback.whatToImprove}</p>
                        <p><strong className="text-emerald-950">Better Way to Phrase:</strong> "{aiFeedback.betterWayToSay}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: MINI QUIZ */}
              {moduleTab === 'mini_quiz' && (
                <div className="space-y-4">
                  {(selectedModule.miniQuiz || []).map((q, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="text-[10px] font-black uppercase text-purple-700">Question {idx + 1}</div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">{q.question}</h4>
                      <div className="space-y-2">
                        {q.options?.map((opt, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setMiniQuizAnswers({ ...miniQuizAnswers, [idx]: opt });
                              setMiniQuizSubmitted(true);
                            }}
                            className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition ${
                              miniQuizSubmitted && opt === q.correctAnswer
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                                : miniQuizSubmitted && miniQuizAnswers[idx] === opt && opt !== q.correctAnswer
                                ? 'border-rose-400 bg-rose-50 text-rose-900'
                                : miniQuizAnswers[idx] === opt
                                ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <span className="font-bold mr-1.5">{String.fromCharCode(65 + i)}.</span> {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* FOOTER ACTION: COMPLETE MODULE */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-purple-600">
                  Earn +40 XP upon completion
                </span>
                <button
                  type="button"
                  onClick={handleMarkModuleComplete}
                  disabled={completingModule}
                  className="px-6 py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{completingModule ? 'Saving...' : 'Mark Module Completed ✓'}</span>
                </button>
              </div>
            </div>
          )}

          {/* CAPSTONE QUIZ VIEW (MODULE 8) */}
          {selectedModule && isCapstone && (
            <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-7 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded">
                  Module 8 • Phase Capstone Quiz
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {phase.title} — Capstone Mastery Quiz
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Answer all 8 comprehensive questions. Score 70%+ to master this phase and unlock the subsequent phase.
                </p>
              </div>

              {capstoneScore === null ? (
                <div className="space-y-5">
                  {(selectedModule.quizQuestions || phase.quizQuestions || []).map((q, idx) => (
                    <div key={q.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
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
                            onClick={() => setCapstoneAnswers({ ...capstoneAnswers, [q.id]: opt })}
                            className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition ${
                              capstoneAnswers[q.id] === opt
                                ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold shadow-sm'
                                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                            }`}
                          >
                            <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span> {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400 font-medium">
                      {Object.keys(capstoneAnswers).length} / {(selectedModule.quizQuestions || phase.quizQuestions || []).length} Answered
                    </span>
                    <button
                      type="button"
                      onClick={handleSubmitCapstone}
                      disabled={submittingCapstone || Object.keys(capstoneAnswers).length < (selectedModule.quizQuestions || phase.quizQuestions || []).length}
                      className="px-6 py-3 rounded-2xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition disabled:opacity-40 shadow-md shadow-purple-600/20"
                    >
                      {submittingCapstone ? 'Evaluating Quiz...' : 'Submit Phase Capstone Quiz →'}
                    </button>
                  </div>
                </div>
              ) : (
                /* CAPSTONE RESULT VIEW */
                <div className="text-center py-6 space-y-4">
                  <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-black bg-purple-100 text-purple-700">
                    {capstoneScore >= 70 ? '🏆' : '📚'}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">
                      {capstoneScore >= 70 ? 'Phase Mastered!' : 'Keep Practicing!'}
                    </h3>
                    <div className="text-4xl font-black text-purple-600 mt-1">
                      {capstoneScore}%
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {capstoneScore >= 70
                        ? 'Congratulations! You unlocked the next phase and earned +120 XP.'
                        : 'You need 70%+ to unlock the next phase. Review the concepts and try again.'}
                    </p>
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCapstoneScore(null)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Retake Quiz
                    </button>
                    <button
                      type="button"
                      onClick={onBack}
                      className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                    >
                      Return to Learning Path →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
