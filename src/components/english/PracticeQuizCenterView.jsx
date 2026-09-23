import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Volume2,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Zap,
  ChevronRight,
  Mic,
  PenTool,
  BookOpen,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { englishAPI } from '../../utils/api';

const PRACTICE_BANK = [
  {
    id: 'pq-1',
    type: 'mcq',
    skill: 'speaking',
    category: 'Conversational Fluency',
    question: 'In a professional sprint retrospective, how should you propose an improvement diplomatically?',
    options: [
      'I suggest we allocate 15 minutes for team syncs to prevent communication bottlenecks.',
      'Our team was completely useless last week.',
      'Nobody listened to me so everything failed.',
      'I don\'t care, do whatever you want.'
    ],
    correctAnswer: 'I suggest we allocate 15 minutes for team syncs to prevent communication bottlenecks.',
    explanation: 'Constructive suggestions focus on solutions rather than blaming individuals.'
  },
  {
    id: 'pq-2',
    type: 'fill_blank',
    skill: 'grammar',
    category: 'Grammar in Action',
    question: 'Complete the sentence: "If she ___ the project specifications earlier, the bug would have been avoided."',
    options: ['had reviewed', 'reviewed', 'has reviewed', 'was reviewing'],
    correctAnswer: 'had reviewed',
    explanation: 'Third conditional (unreal past): "If + past perfect (had reviewed), would have + past participle."'
  },
  {
    id: 'pq-3',
    type: 'match_words',
    skill: 'vocabulary',
    category: 'Vocabulary Mastery',
    question: 'Which word is an exact synonym for "Pragmatic"?',
    options: ['Practical and realistic', 'Extremely emotional', 'Purely theoretical', 'Highly unpredictable'],
    correctAnswer: 'Practical and realistic',
    explanation: '"Pragmatic" refers to dealing with matters realistically and sensibly based on practical rather than theoretical considerations.'
  },
  {
    id: 'pq-4',
    type: 'rearrange',
    skill: 'writing',
    category: 'Sentence Structure',
    question: 'Identify the logically arranged sentence:',
    options: [
      'By automating the ingestion workflow, our team reduced latency by 35%.',
      'By our team latency 35% reduced by automating the workflow.',
      'Latency by 35% our team reduced by workflow automating.',
      'Automating reduced workflow team our latency 35%.'
    ],
    correctAnswer: 'By automating the ingestion workflow, our team reduced latency by 35%.',
    explanation: 'Prepositional phrase opening followed by clear subject ("our team"), verb ("reduced"), and metric object.'
  },
  {
    id: 'pq-5',
    type: 'listening',
    skill: 'listening',
    category: 'Auditory Comprehension',
    audioText: 'The quarterly audit has been rescheduled from Thursday afternoon to Friday at ten in the morning.',
    question: 'When will the quarterly audit take place?',
    options: [
      'Friday at 10:00 AM',
      'Thursday afternoon',
      'Monday morning',
      'Next month'
    ],
    correctAnswer: 'Friday at 10:00 AM',
    explanation: 'The speaker states: "...rescheduled from Thursday afternoon to Friday at ten in the morning."'
  },
  {
    id: 'pq-6',
    type: 'reading',
    skill: 'reading',
    category: 'Critical Reading',
    passage: 'Cognitive load theory indicates that learning improves when instructions minimize extraneous mental demands. Clear visual hierarchy and structured step-by-step progressions allow working memory to focus on high-level language acquisition.',
    question: 'Why are structured progressions beneficial according to the text?',
    options: [
      'They minimize extraneous demands on working memory',
      'They make tests harder to pass',
      'They increase unnecessary confusion',
      'They eliminate the need to practice'
    ],
    correctAnswer: 'They minimize extraneous demands on working memory',
    explanation: 'The excerpt states that clear progressions allow working memory to focus on language acquisition.'
  },
  {
    id: 'pq-7',
    type: 'grammar_fix',
    skill: 'grammar',
    category: 'Grammar Correction',
    question: 'Identify the corrected version of: "He don\'t know nothing about the new deployment rules."',
    options: [
      'He doesn\'t know anything about the new deployment rules.',
      'He don\'t know anything about the new deployment rules.',
      'He not knowing nothing about the rules.',
      'He isn\'t know nothing about deployment rules.'
    ],
    correctAnswer: 'He doesn\'t know anything about the new deployment rules.',
    explanation: 'Subject "He" requires singular auxiliary "doesn\'t", and avoiding double negatives requires "anything" instead of "nothing".'
  },
  {
    id: 'pq-8',
    type: 'speaking_response',
    skill: 'speaking',
    category: 'Speaking Articulation',
    question: 'How should you answer the interview inquiry: "Can you tell me about a time you solved an unexpected problem?"',
    options: [
      'Outline the specific challenge, describe the direct actions you took, and quantify the positive result.',
      'Say you never have problems because you are perfect.',
      'Blame team members for causing the problem.',
      'Refuse to answer.'
    ],
    correctAnswer: 'Outline the specific challenge, describe the direct actions you took, and quantify the positive result.',
    explanation: 'The STAR framework (Situation, Task, Action, Result) ensures clarity, credibility, and impact.'
  }
];

export default function PracticeQuizCenterView({ profile, onQuizCompleted }) {
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('all');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [submitting, setSubmitting] = useState(false);
  const [weakSkills, setWeakSkills] = useState([]);

  // Filter questions
  const filteredQuestions = selectedSkillFilter === 'all'
    ? PRACTICE_BANK
    : PRACTICE_BANK.filter(q => q.skill === selectedSkillFilter);

  const activeQ = filteredQuestions[currentIdx] || filteredQuestions[0];

  // Timer
  useEffect(() => {
    let timer;
    if (!quizFinished && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizFinished, timeLeft]);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  const handleSelectOption = (opt) => {
    if (hasSubmitted) return;
    setSelectedAnswer(opt);
    setUserAnswers({ ...userAnswers, [activeQ.id]: opt });
    setHasSubmitted(true);
  };

  const handleNext = () => {
    if (currentIdx < filteredQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedAnswer(userAnswers[filteredQuestions[currentIdx + 1]?.id] || '');
      setHasSubmitted(Boolean(userAnswers[filteredQuestions[currentIdx + 1]?.id]));
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    let correct = 0;
    const weak = [];

    filteredQuestions.forEach((q) => {
      const ans = userAnswers[q.id];
      if (ans === q.correctAnswer) {
        correct++;
      } else {
        if (!weak.includes(q.skill)) weak.push(q.skill);
      }
    });

    const score = Math.round((correct / filteredQuestions.length) * 100);
    setWeakSkills(weak);
    setQuizFinished(true);

    try {
      setSubmitting(true);
      await englishAPI.submitPracticeQuiz({
        quizId: `practice-${Date.now()}`,
        title: 'Comprehensive English Multi-Skill Drill',
        score,
        totalQuestions: filteredQuestions.length,
        weakSkills: weak
      });

      confetti({ particleCount: 70, spread: 60 });
      toast.success(`Practice completed! Score: ${score}%`);
      if (onQuizCompleted) onQuizCompleted();
    } catch (err) {
      console.error('Failed to submit practice quiz:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setCurrentIdx(0);
    setSelectedAnswer('');
    setHasSubmitted(false);
    setUserAnswers({});
    setQuizFinished(false);
    setTimeLeft(300);
    setWeakSkills([]);
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Interactive Practice & Quizzes
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              English Skill Drills & Quizzes
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl">
              10 question formats covering reading, writing, listening, speaking, grammar, and vocabulary with instant pedagogical explanations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span className="font-mono font-bold text-sm text-slate-900">
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Skill Filter Chips */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Skills' },
            { id: 'grammar', label: 'Grammar' },
            { id: 'vocabulary', label: 'Vocabulary' },
            { id: 'listening', label: 'Listening' },
            { id: 'reading', label: 'Reading' },
            { id: 'speaking', label: 'Speaking' },
            { id: 'writing', label: 'Writing' }
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setSelectedSkillFilter(f.id);
                resetQuiz();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedSkillFilter === f.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. QUIZ RUNNER OR RESULTS */}
      {!quizFinished ? (
        <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          {/* Question progress */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded">
                Question {currentIdx + 1} of {filteredQuestions.length}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {activeQ?.category}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase">
              {activeQ?.skill}
            </span>
          </div>

          {/* Reading passage if applicable */}
          {activeQ?.passage && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              <div className="font-bold text-slate-400 text-[10px] uppercase mb-1">Reading Passage</div>
              "{activeQ.passage}"
            </div>
          )}

          {/* Listening audio if applicable */}
          {activeQ?.audioText && (
            <div className="p-4 rounded-2xl bg-cyan-50/50 border border-cyan-200 flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-cyan-800 text-xs">Audio Prompt</div>
                <div className="text-xs text-cyan-900">Click to listen to the dialogue spoken aloud</div>
              </div>
              <button
                type="button"
                onClick={() => speakText(activeQ.audioText)}
                className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold text-xs hover:bg-cyan-700 transition flex items-center gap-1.5 shadow-sm"
              >
                <Volume2 className="w-4 h-4" /> Listen
              </button>
            </div>
          )}

          {/* Question Prompt */}
          <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
            {activeQ?.question}
          </h3>

          {/* Options */}
          <div className="space-y-2">
            {activeQ?.options?.map((opt, i) => {
              const isSelected = selectedAnswer === opt;
              const isCorrect = opt === activeQ.correctAnswer;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm font-medium transition ${
                    hasSubmitted && isCorrect
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                      : hasSubmitted && isSelected && !isCorrect
                      ? 'border-rose-400 bg-rose-50 text-rose-900'
                      : isSelected
                      ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="font-bold mr-2 text-slate-400">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Instant pedagogical explanation */}
          {hasSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 text-xs text-purple-950 space-y-1"
            >
              <div className="font-bold text-purple-800">💡 Rule & Explanation</div>
              <p>{activeQ.explanation}</p>
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              {hasSubmitted ? 'Option selected' : 'Choose your answer above'}
            </span>
            <button
              type="button"
              onClick={handleNext}
              disabled={!hasSubmitted}
              className="px-6 py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition disabled:opacity-40 flex items-center gap-1.5"
            >
              <span>{currentIdx < filteredQuestions.length - 1 ? 'Next Question →' : 'Finish Quiz →'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* QUIZ RESULTS BREAKDOWN */
        <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-8 text-center shadow-sm space-y-6">
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-black bg-purple-100 text-purple-700">
            🏆
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900">Drill Completed!</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Your responses have been evaluated and recorded into your performance profile.
            </p>
          </div>

          {/* Weak areas notification */}
          {weakSkills.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 max-w-md mx-auto text-left text-xs space-y-1">
              <div className="font-bold text-amber-800 flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-amber-600" /> Focus Area Identified
              </div>
              <p className="text-amber-900">
                You made mistakes in: <strong>{weakSkills.join(', ')}</strong>. Review related phases to strengthen your score!
              </p>
            </div>
          )}

          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={resetQuiz}
              className="px-6 py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
            >
              Take Another Drill →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
