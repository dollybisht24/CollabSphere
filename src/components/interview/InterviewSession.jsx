import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Mic, MicOff, Send, ArrowRight, SkipForward, Sparkles,
  Bot, HelpCircle, Check
} from 'lucide-react';

const InterviewSession = ({
  session,
  currentQuestion,
  onSubmitAnswer,
  submitting = false,
  error = ''
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const recognitionRef = useRef(null);
  const topRef = useRef(null);

  // Sync state whenever question changes
  useEffect(() => {
    setUserAnswer(currentQuestion.userAnswer || '');
    setIsListening(false);
    setSpeechError('');
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentQuestion.questionNumber]);

  // Speech-to-Text setup using Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setUserAnswer((prev) => {
          const trimmed = prev.trim();
          return trimmed ? `${trimmed} ${transcript}` : transcript;
        });
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission was denied. Please allow microphone access.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    setSpeechError('');
    if (!recognitionRef.current) {
      setSpeechError('Speech recognition is not supported in this browser. Please type your answer.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Failed to start voice recognition:', err);
      }
    }
  };

  const handleSubmit = (isSkipped = false) => {
    if (isListening && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      setIsListening(false);
    }

    onSubmitAnswer({
      questionNumber: currentQuestion.questionNumber,
      userAnswer: isSkipped ? '' : userAnswer,
      isSkipped
    });
  };

  const isLastQuestion = currentQuestion.questionNumber >= session.totalQuestions;
  const progressPercent = Math.round((currentQuestion.questionNumber / session.totalQuestions) * 100);

  return (
    <div ref={topRef} className="max-w-3xl mx-auto space-y-6" style={{ fontFamily: 'inherit' }}>
      {/* Top Header Card */}
      <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-neutral-50 px-3 py-1 text-xs font-semibold uppercase tracking-[.15em] text-black/60 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Interview Session</span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-black">
                {session.role}
              </h2>
              <span className="rounded-full bg-black text-white px-3 py-0.5 text-xs font-semibold">
                {currentQuestion.difficulty || session.difficulty}
              </span>
              <span className="rounded-full border border-black/10 bg-neutral-50 px-2.5 py-0.5 text-xs font-medium text-black/60">
                {session.interviewType}
              </span>
            </div>
          </div>

          <div className="text-right sm:self-auto">
            <span className="text-[11px] font-semibold text-black/45 uppercase tracking-wider block">
              Interview Progress
            </span>
            <span className="text-sm font-bold text-black">
              Question {currentQuestion.questionNumber} of {session.totalQuestions}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="h-full bg-black rounded-full"
            />
          </div>
          <div className="flex justify-between text-[11px] text-black/40 font-medium">
            <span>{isLastQuestion ? 'Final Question' : `Question ${currentQuestion.questionNumber}`}</span>
            <span>{progressPercent}% completed</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-600 flex items-center justify-between">
          <span>{error}</span>
        </div>
      )}

      {/* AI Interviewer Prompt Card */}
      <motion.div
        key={currentQuestion.questionNumber}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-4"
      >
        {/* Interviewer Persona Bar */}
        <div className="flex items-center justify-between border-b border-black/5 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-black text-white text-sm">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-black block leading-none">
                AI Technical Interviewer
              </span>
              <span className="text-[11px] text-black/45 font-medium">
                Senior Engineering Hiring Manager
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentQuestion.isFollowUp && (
              <span className="rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 text-[11px] font-semibold">
                Follow-Up Question
              </span>
            )}
            <span className="text-xs font-medium text-black/50 border border-black/10 rounded-full px-2.5 py-0.5">
              Topic: {currentQuestion.topic || 'Engineering'}
            </span>
          </div>
        </div>

        {/* Natural Interviewer Conversational Remark (acknowledgement / transition) */}
        {currentQuestion.interviewerRemark && (
          <div className="rounded-2xl bg-neutral-50 p-3.5 border border-black/5 text-xs text-black/75 italic leading-relaxed">
            "{currentQuestion.interviewerRemark}"
          </div>
        )}

        {/* Question Prompt */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-bold text-black/40 uppercase tracking-wider block">
            Question Prompt
          </span>
          <h3 className="text-lg sm:text-xl font-semibold leading-relaxed text-black">
            {currentQuestion.questionText}
          </h3>
        </div>
      </motion.div>

      {/* Candidate Response Section */}
      <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wider text-black/60">
            Your Answer
          </label>

          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'border border-black/10 bg-neutral-50 text-black/70 hover:bg-neutral-100 hover:text-black'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="h-3.5 w-3.5" />
                <span>Listening... (Click to stop)</span>
              </>
            ) : (
              <>
                <Mic className="h-3.5 w-3.5" />
                <span>🎙 Answer with Voice</span>
              </>
            )}
          </button>
        </div>

        {speechError && (
          <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            {speechError}
          </p>
        )}

        <div className="relative">
          <textarea
            rows={7}
            disabled={submitting}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your technical answer here, or click 'Answer with Voice' to speak out loud... Be clear, direct, and explain your technical reasoning as you would in a real interview."
            className="w-full rounded-2xl border border-black/15 bg-neutral-50/40 p-4 text-sm leading-relaxed text-black outline-none transition focus:border-black focus:bg-white focus:ring-1 focus:ring-black disabled:opacity-75"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <span className="text-xs text-black/45">
            {userAnswer.trim().split(/\s+/).filter(Boolean).length} words · {userAnswer.length} characters
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 px-4 py-2.5 text-xs font-semibold text-black/60 hover:bg-neutral-50 hover:text-black disabled:opacity-50 transition"
            >
              <SkipForward className="h-3.5 w-3.5" />
              <span>Skip Question</span>
            </button>

            <button
              type="button"
              disabled={submitting || !userAnswer.trim()}
              onClick={() => handleSubmit(false)}
              className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 disabled:opacity-40 transition"
            >
              {submitting ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>{isLastQuestion ? 'Submitting final answer...' : 'Interviewer is preparing next question...'}</span>
                </>
              ) : isLastQuestion ? (
                <>
                  <span>Submit & Complete Interview</span>
                  <Check className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>Submit & Next Question</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;
