import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  Volume2,
  Mic,
  PenTool,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Award,
  Zap,
  RotateCcw,
  Square,
  Check,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { englishAPI } from '../../utils/api';

export default function PlacementAssessmentModal({
  isOpen,
  onClose,
  onComplete,
  userLevel = 'Beginner'
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // User input states
  const [answers, setAnswers] = useState({});
  const [writingText, setWritingText] = useState('');
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Result state
  const [result, setResult] = useState(null);

  const recognitionRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadQuestions();
    }
  }, [isOpen]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const res = await englishAPI.getPlacementQuestions();
      setQuestions(res.questions || []);
    } catch (err) {
      console.error('Failed to load placement questions:', err);
      toast.error('Could not load placement questions');
    } finally {
      setLoading(false);
    }
  };

  // Web Speech API for voice question
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in this browser. Please type your response.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        toast.success('Listening... Please speak now!');
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setSpokenTranscript(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsRecording(false);
    }
  };

  // Audio Playback for listening question using SpeechSynthesis
  const playListeningAudio = (text) => {
    if (!window.speechSynthesis) {
      toast.error('Speech synthesis not supported');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.onstart = () => setAudioPlaying(true);
    utterance.onend = () => setAudioPlaying(false);
    utterance.onerror = () => setAudioPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmitAssessment();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitAssessment = async () => {
    try {
      setSubmitting(true);
      const res = await englishAPI.evaluatePlacement({
        answers,
        spokenTranscript,
        writingText
      });
      setResult(res);
      toast.success(`Assigned Level: ${res.assignedLevel} (Phase ${res.assignedPhase})`);
    } catch (err) {
      console.error('Error submitting placement assessment:', err);
      toast.error('Failed to evaluate assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectLevelChoice = async (chosenLevel, chosenPhase) => {
    try {
      setSubmitting(true);
      const res = await englishAPI.evaluatePlacement({
        answers,
        spokenTranscript,
        writingText,
        chosenLevel,
        chosenPhase
      });
      toast.success(`Welcome to ${chosenLevel}! Your personalized journey is ready.`);
      if (onComplete) onComplete(res);
      if (onClose) onClose();
    } catch (err) {
      console.error('Error selecting level choice:', err);
      toast.error('Failed to set level');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentQ = questions[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl rounded-3xl border border-black/10 bg-white p-6 sm:p-8 text-slate-900 shadow-2xl space-y-6 my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 border border-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">AI English Placement Diagnostic</h2>
              <p className="text-xs text-slate-500 font-medium">6-Skill Diagnostic to personalize your starting phase</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="py-16 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-600">Generating diagnostic questions...</p>
          </div>
        )}

        {/* QUESTION STEPS */}
        {!loading && !result && currentQ && (
          <div className="space-y-6">
            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Skill {currentStep + 1} of {questions.length}: {currentQ.title}</span>
                <span className="uppercase tracking-wider text-purple-600">{currentQ.skill}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* STEP 1: READING */}
            {currentQ.skill === 'reading' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 text-slate-700 text-sm leading-relaxed">
                  <p className="font-semibold text-xs text-amber-800 uppercase tracking-wider mb-1">Passage:</p>
                  {currentQ.passage}
                </div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">{currentQ.question}</h3>
                <div className="space-y-2">
                  {currentQ.options?.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAnswers({ ...answers, [currentQ.id]: opt })}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition ${
                        answers[currentQ.id] === opt
                          ? 'border-purple-600 bg-purple-50 text-purple-900 font-semibold shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: VOCABULARY & GRAMMAR */}
            {(currentQ.skill === 'vocabulary' || currentQ.skill === 'grammar') && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-relaxed">{currentQ.question}</h3>
                <div className="space-y-2">
                  {currentQ.options?.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAnswers({ ...answers, [currentQ.id]: opt })}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition ${
                        answers[currentQ.id] === opt
                          ? 'border-purple-600 bg-purple-50 text-purple-900 font-semibold shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: LISTENING */}
            {currentQ.skill === 'listening' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-xs text-indigo-900">Spoken Announcement</h4>
                    <p className="text-xs text-indigo-700/80">Click Play to listen to the audio prompt.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => playListeningAudio(currentQ.audioPrompt)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-2 hover:bg-indigo-700 transition shadow-sm"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{audioPlaying ? 'Playing Audio...' : '▶ Listen to Audio'}</span>
                  </button>
                </div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">{currentQ.question}</h3>
                <div className="space-y-2">
                  {currentQ.options?.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAnswers({ ...answers, [currentQ.id]: opt })}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition ${
                        answers[currentQ.id] === opt
                          ? 'border-purple-600 bg-purple-50 text-purple-900 font-semibold shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: WRITING */}
            {currentQ.skill === 'writing' && (
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">{currentQ.promptText}</h3>
                <textarea
                  value={writingText}
                  onChange={(e) => setWritingText(e.target.value)}
                  placeholder="Type your response here (2–3 sentences)..."
                  rows={4}
                  className="w-full p-4 rounded-2xl border border-slate-200 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 text-sm outline-none resize-none font-medium"
                />
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>Words: {writingText.trim().split(/\s+/).filter(Boolean).length}</span>
                  <span>Minimum ~15 words recommended</span>
                </div>
              </div>
            )}

            {/* STEP 5: SPEAKING */}
            {currentQ.skill === 'speaking' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">{currentQ.promptText}</h3>
                
                <div className="p-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-center space-y-3">
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition shadow-lg ${
                      isRecording
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-105'
                    }`}
                  >
                    <Mic className="w-7 h-7" />
                  </button>
                  <p className="text-xs font-bold text-slate-700">
                    {isRecording ? 'Listening... Tap to Stop' : 'Tap Microphone to Speak'}
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-sm">
                    Speak into your microphone. Your spoken response will appear below in real time.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Spoken Transcript:
                  </label>
                  <textarea
                    value={spokenTranscript}
                    onChange={(e) => setSpokenTranscript(e.target.value)}
                    placeholder="Your spoken words will appear here automatically, or you can edit/type directly..."
                    rows={3}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-40 disabled:pointer-events-none"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center gap-2 shadow-sm"
              >
                <span>{currentStep === questions.length - 1 ? (submitting ? 'Evaluating...' : 'Complete Assessment') : 'Next Question'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* RESULT VIEW */}
        {result && (
          <div className="space-y-6 text-center py-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 mx-auto">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-800 uppercase tracking-wider">
                CEFR {result.evaluation?.cefrCode || 'A2'} Assessed
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                Your English Level: {result.assignedLevel}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Recommended Starting Point: <strong>Phase {result.assignedPhase}</strong>
              </p>
            </div>

            {/* 6-Skill Baseline Bar Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-left p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              {Object.entries(result.evaluation?.skillScores || {}).filter(([k]) => k !== 'overall').map(([skill, val]) => (
                <div key={skill} className="p-2 bg-white rounded-xl border border-slate-100 shadow-sm space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="capitalize text-slate-600">{skill}</span>
                    <span className="text-slate-900">{val}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-purple-600" style={{ width: `${val}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-md mx-auto">
              {result.evaluation?.feedback}
            </p>

            {/* TWO CRITICAL CHOICES: Start from recommended vs Start from beginning */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleSelectLevelChoice(result.assignedLevel, result.assignedPhase)}
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs hover:scale-105 transition shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Start From Recommended Level (Phase {result.assignedPhase})</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectLevelChoice('Beginner', 1)}
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
              >
                <span>Start From Beginning (Level 1)</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Lower levels remain accessible at any time. You are never locked out.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
