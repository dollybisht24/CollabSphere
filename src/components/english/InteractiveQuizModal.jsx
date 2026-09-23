import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Volume2,
  Clock,
  Zap,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Check,
  X,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function InteractiveQuizModal({
  isOpen,
  onClose,
  quizData,
  onSubmitQuiz,
  onClaimCertificate,
  loading = false,
  userName = 'Candidate'
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [unscrambledWords, setUnscrambledWords] = useState([]);
  const [timeLeft, setTimeLeft] = useState(150);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const questions = quizData?.questions || [];
  const currentQ = questions[currentIdx];

  // Timer
  useEffect(() => {
    let timer;
    if (isOpen && !quizSubmitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, quizSubmitted, timeLeft]);

  // Reset when quiz opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIdx(0);
      setSelectedAnswers({});
      setShowFeedback(false);
      setUnscrambledWords([]);
      setTimeLeft(150);
      setQuizSubmitted(false);
      setResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Speak audio for listening questions
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  };

  const handleSelectOption = (optIdx) => {
    if (showFeedback) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIdx]: optIdx }));
    setShowFeedback(true);
  };

  const handleAddWordToUnscramble = (w) => {
    setUnscrambledWords((prev) => [...prev, w]);
  };

  const handleRemoveWordFromUnscramble = (idx) => {
    setUnscrambledWords((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleConfirmUnscramble = () => {
    const assembled = unscrambledWords.join(' ').trim();
    setSelectedAnswers((prev) => ({ ...prev, [currentIdx]: assembled }));
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setUnscrambledWords([]);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      const userAns = selectedAnswers[idx];
      if (q.type === 'unscramble') {
        if (
          typeof userAns === 'string' &&
          userAns.trim().toLowerCase() === q.correctSentence?.trim().toLowerCase()
        ) {
          correctCount++;
        }
      } else if (userAns === q.correct) {
        correctCount++;
      }
    });

    const percent = Math.round((correctCount / questions.length) * 100);
    const earnedXp = percent >= 80 ? 100 : percent >= 60 ? 70 : 40;

    const resPayload = {
      score: correctCount,
      totalQuestions: questions.length,
      percent,
      earnedXp,
      streak: (quizData?.streak || 1) + 1
    };

    setResult(resPayload);
    setQuizSubmitted(true);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    if (onSubmitQuiz) {
      onSubmitQuiz(selectedAnswers);
    }
  };

  // Determine if current choice is correct for feedback
  const isCurrentChoiceCorrect = () => {
    if (!currentQ) return false;
    const ans = selectedAnswers[currentIdx];
    if (currentQ.type === 'unscramble') {
      return (
        typeof ans === 'string' &&
        ans.trim().toLowerCase() === currentQ.correctSentence?.trim().toLowerCase()
      );
    }
    return ans === currentQ.correct;
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl rounded-3xl border border-black/10 bg-white p-6 sm:p-8 text-slate-900 shadow-2xl my-8 overflow-hidden"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-black/5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Daily English Challenge
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold">
                Question {currentIdx + 1} of {questions.length || 5}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!quizSubmitted && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 border border-black/5 text-xs font-mono font-bold text-slate-700">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{timeFormatted}</span>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-neutral-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* QUIZ IN PROGRESS */}
        {!quizSubmitted && currentQ ? (
          <div className="mt-6 space-y-6">
            {/* Progress Bar */}
            <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Listening Phrase Box */}
            {currentQ.type === 'listening' && (
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-950 block">
                    🎧 Listening Comprehension
                  </span>
                  <span className="text-xs text-indigo-700">
                    Listen to the audio prompt, then pick the right answer below.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => speakText(currentQ.audioText || currentQ.prompt)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <Volume2 className="w-4 h-4" /> Listen
                </button>
              </div>
            )}

            {/* Question Title */}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                {currentQ.category || 'English Knowledge'}
              </span>
              <h4 className="text-base sm:text-lg font-bold text-slate-900 mt-2 leading-relaxed">
                {currentQ.prompt || currentQ.question}
              </h4>
            </div>

            {/* Options List (MCQ / True-False / Fill in blank) */}
            {currentQ.options && currentQ.type !== 'unscramble' && (
              <div className="grid gap-2.5">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[currentIdx] === oIdx;
                  const isCorrect = oIdx === currentQ.correct;

                  let cardStyle = 'border-slate-200 bg-neutral-50/60 hover:bg-white text-slate-800';
                  if (showFeedback) {
                    if (isCorrect) {
                      cardStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                    } else if (isSelected) {
                      cardStyle = 'border-rose-400 bg-rose-50 text-rose-950';
                    } else {
                      cardStyle = 'border-slate-200 bg-white opacity-40 text-slate-500';
                    }
                  } else if (isSelected) {
                    cardStyle = 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold';
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={showFeedback}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`p-4 rounded-2xl border text-left font-medium text-xs sm:text-sm transition flex items-center justify-between ${cardStyle}`}
                    >
                      <span>{opt}</span>
                      <div className="shrink-0 ml-3">
                        {showFeedback ? (
                          isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : isSelected ? (
                            <XCircle className="w-5 h-5 text-rose-600" />
                          ) : null
                        ) : (
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Sentence Unscrambler Type */}
            {currentQ.type === 'unscramble' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-neutral-100 border border-slate-300 min-h-[60px] flex flex-wrap gap-2 items-center">
                  {unscrambledWords.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">
                      Click words below to assemble the sentence in order...
                    </span>
                  ) : (
                    unscrambledWords.map((w, wIdx) => (
                      <button
                        key={wIdx}
                        type="button"
                        disabled={showFeedback}
                        onClick={() => handleRemoveWordFromUnscramble(wIdx)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1 shadow"
                      >
                        <span>{w}</span>
                        {!showFeedback && <X className="w-3 h-3 text-slate-400" />}
                      </button>
                    ))
                  )}
                </div>

                {!showFeedback && (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {(currentQ.words || []).map((w, wIdx) => {
                        const isUsed = unscrambledWords.includes(w);
                        return (
                          <button
                            key={wIdx}
                            type="button"
                            disabled={isUsed}
                            onClick={() => handleAddWordToUnscramble(w)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                              isUsed
                                ? 'opacity-30 bg-neutral-200 border-transparent cursor-not-allowed'
                                : 'bg-white border-slate-300 hover:border-slate-400 text-slate-800 shadow-sm'
                            }`}
                          >
                            {w}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      disabled={unscrambledWords.length === 0}
                      onClick={handleConfirmUnscramble}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow disabled:opacity-40"
                    >
                      Check Word Order
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Immediate Encouraging Feedback Callout */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-2xl border space-y-1 ${
                    isCurrentChoiceCorrect()
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                    {isCurrentChoiceCorrect() ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Great! You understood the sentence.</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Almost there! Let's learn why:</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 pl-6 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation / Next Button */}
            {showFeedback && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 shadow-md transition"
                >
                  <span>{currentIdx < questions.length - 1 ? 'Next Question' : 'View Results'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* RESULT SCREEN DASHBOARD */
          result && (
            <div className="mt-6 space-y-6 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl mx-auto shadow-md">
                🏆
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  Congratulations, {userName}!
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  You completed today's English Challenge!
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-neutral-50 border border-black/5">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Score</div>
                  <div className="text-2xl font-black text-slate-900 mt-0.5">{result.percent}%</div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-black/5">
                  <div className="text-[10px] uppercase font-bold text-slate-400">XP Earned</div>
                  <div className="text-2xl font-black text-amber-600 mt-0.5">+{result.earnedXp}</div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-black/5">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Streak</div>
                  <div className="text-2xl font-black text-orange-600 mt-0.5">{result.streak} 🔥</div>
                </div>
              </div>

              {/* Certificate Unlock Banner */}
              {result.percent >= 80 && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-transparent border border-amber-300 text-left flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500 text-white shadow">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase">
                        Certificate Unlocked!
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        You scored {result.percent}% and earned official recognition.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onClaimCertificate) onClaimCertificate();
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm shrink-0"
                  >
                    View Certificate
                  </button>
                </div>
              )}

              <div className="pt-4 border-t border-black/5 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs"
                >
                  Continue Learning
                </button>
              </div>
            </div>
          )
        )}
      </motion.div>
    </div>
  );
}
