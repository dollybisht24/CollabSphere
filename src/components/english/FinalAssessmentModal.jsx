import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Sparkles,
  BookOpen,
  Volume2,
  Mic,
  PenTool,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Zap,
  X,
  ShieldCheck,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { englishAPI } from '../../utils/api';

const FINAL_EXAM_SECTIONS = [
  {
    id: 'reading',
    title: 'Section 1: Advanced Critical Reading',
    description: 'Read the analytical passage and answer the comprehension questions.',
    passage: 'The globalization of modern enterprise demands not merely semantic fluency, but acute cross-cultural pragmatic competence. When multinational organizations fail to calibrate their communicative norms, even minor linguistic ambiguities can precipitate profound operational fissures. Consequently, elite language training must integrate real-world communicative pragmatics alongside structural syntax.',
    questions: [
      {
        id: 'fe-r1',
        question: 'What is required in modern global enterprise beyond semantic fluency?',
        options: [
          'Acute cross-cultural pragmatic competence',
          'Relying solely on machine translation tools',
          'Eliminating all non-native speakers from leadership',
          'Enforcing one single spoken accent globally'
        ],
        correctAnswer: 'Acute cross-cultural pragmatic competence'
      },
      {
        id: 'fe-r2',
        question: 'What happens when communicative norms are not calibrated?',
        options: [
          'Minor linguistic ambiguities can precipitate profound operational fissures',
          'Productivity increases automatically',
          'Software servers run faster',
          'Employees receive double bonuses'
        ],
        correctAnswer: 'Minor linguistic ambiguities can precipitate profound operational fissures'
      }
    ]
  },
  {
    id: 'grammar',
    title: 'Section 2: Contextual Grammar & Precision',
    description: 'Select the flawless sentence conforming to formal syntactic harmony.',
    questions: [
      {
        id: 'fe-g1',
        question: 'Identify the sentence with immaculate subjunctive mood:',
        options: [
          'It is imperative that every team member be present at the keynote address.',
          'It is imperative that every team member is present at the keynote address.',
          'It is imperative that every team member was present.',
          'It is imperative that every team member will be present.'
        ],
        correctAnswer: 'It is imperative that every team member be present at the keynote address.'
      },
      {
        id: 'fe-g2',
        question: 'Select the sentence with correct parallel structure:',
        options: [
          'The executive was admired for her visionary strategy, her tireless work ethic, and her empathetic communication.',
          'The executive was admired for her visionary strategy, working tirelessly, and she communicated empathetically.',
          'The executive was admired for her visionary strategy, to work tirelessly, and empathy.',
          'The executive was admired for strategy, working, and empathetic.'
        ],
        correctAnswer: 'The executive was admired for her visionary strategy, her tireless work ethic, and her empathetic communication.'
      }
    ]
  },
  {
    id: 'listening',
    title: 'Section 3: Spoken Executive Dialogue',
    description: 'Listen to the audio announcement and identify key business decisions.',
    audioText: 'In light of our quarterly performance audit, the board has approved the acquisition of NextGen Robotics for forty-two million dollars. Integration will begin in the third quarter under the direction of our chief technology officer.',
    questions: [
      {
        id: 'fe-l1',
        question: 'What was approved by the board of directors?',
        options: [
          'Acquisition of NextGen Robotics for $42 million',
          'Immediate closure of all international offices',
          'Dismissal of the chief technology officer',
          'A mandatory salary cut across all departments'
        ],
        correctAnswer: 'Acquisition of NextGen Robotics for $42 million'
      }
    ]
  },
  {
    id: 'writing',
    title: 'Section 4: Professional Formal Writing',
    description: 'Draft a concise 3–4 sentence response outlining a constructive solution to a workplace delay.',
    prompt: 'A critical client feature delivery is delayed by three days due to unforeseen technical bugs. Write a professional, reassuring 3-sentence update to the client explaining the cause, the immediate mitigation, and the revised delivery time.'
  },
  {
    id: 'speaking',
    title: 'Section 5: AI Conversational Interview',
    description: 'Speak into your microphone and answer the interviewer’s question with poise.',
    prompt: 'Interviewer: "Welcome to your final speaking evaluation. Could you articulate how completing this English Learning Journey has transformed your communication confidence, and how you will apply these skills in your career?"',
    minWords: 20
  }
];

export default function FinalAssessmentModal({
  isOpen,
  onClose,
  onCertificateEarned,
  profile
}) {
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [writingText, setWritingText] = useState('');
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const recognitionRef = useRef(null);

  if (!isOpen) return null;

  const currentSection = FINAL_EXAM_SECTIONS[currentSectionIdx];

  // Audio Playback
  const playListeningAudio = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    utterance.onstart = () => setAudioPlaying(true);
    utterance.onend = () => setAudioPlaying(false);
    utterance.onerror = () => setAudioPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  // Mic recording for speaking
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Microphone recognition not supported in this browser. Please type your response.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        toast.success('Listening! Please articulate your thoughts.');
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setSpokenTranscript(transcript);
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsRecording(false);
    }
  };

  const handleNextSection = () => {
    if (currentSectionIdx < FINAL_EXAM_SECTIONS.length - 1) {
      setCurrentSectionIdx(currentSectionIdx + 1);
    } else {
      handleSubmitFinalAssessment();
    }
  };

  const handleSubmitFinalAssessment = async () => {
    try {
      setSubmitting(true);
      const res = await englishAPI.submitFinalAssessment({
        answers,
        spokenTranscript,
        writingText
      });

      setResult(res);
      if (res.certificate) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        toast.success('Congratulations! You passed the Final English Assessment!');
        if (onCertificateEarned) onCertificateEarned(res.certificate);
      }
    } catch (err) {
      console.error('Error submitting final assessment:', err);
      toast.error('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-3xl rounded-3xl border border-black/10 bg-white p-6 sm:p-8 text-slate-900 shadow-2xl space-y-6 my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Final Comprehensive English Assessment
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Multi-Skill Examination for Official Certificate of Completion
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* EXAM PROGRESS */}
        {!result && (
          <div className="space-y-6">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>{currentSection.title}</span>
              <span>Step {currentSectionIdx + 1} of {FINAL_EXAM_SECTIONS.length}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-purple-600 transition-all duration-300"
                style={{ width: `${((currentSectionIdx + 1) / FINAL_EXAM_SECTIONS.length) * 100}%` }}
              />
            </div>

            {/* SECTION 1: READING */}
            {currentSection.id === 'reading' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs sm:text-sm leading-relaxed text-slate-800 font-medium">
                  {currentSection.passage}
                </div>
                {currentSection.questions?.map((q, idx) => (
                  <div key={q.id} className="space-y-2">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">{idx + 1}. {q.question}</h4>
                    <div className="space-y-1.5">
                      {q.options?.map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                          className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition ${
                            answers[q.id] === opt
                              ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold'
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
            )}

            {/* SECTION 2: GRAMMAR */}
            {currentSection.id === 'grammar' && (
              <div className="space-y-4">
                {currentSection.questions?.map((q, idx) => (
                  <div key={q.id} className="space-y-2">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">{idx + 1}. {q.question}</h4>
                    <div className="space-y-1.5">
                      {q.options?.map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                          className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition ${
                            answers[q.id] === opt
                              ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold'
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
            )}

            {/* SECTION 3: LISTENING */}
            {currentSection.id === 'listening' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-indigo-950">Audio Briefing</h4>
                    <p className="text-xs text-indigo-700">Listen to the executive announcement.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => playListeningAudio(currentSection.audioText)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{audioPlaying ? 'Playing...' : '▶ Listen'}</span>
                  </button>
                </div>
                {currentSection.questions?.map((q) => (
                  <div key={q.id} className="space-y-2">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">{q.question}</h4>
                    <div className="space-y-1.5">
                      {q.options?.map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                          className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition ${
                            answers[q.id] === opt
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold'
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
            )}

            {/* SECTION 4: WRITING */}
            {currentSection.id === 'writing' && (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs sm:text-sm font-semibold text-purple-950">
                  {currentSection.prompt}
                </div>
                <textarea
                  value={writingText}
                  onChange={(e) => setWritingText(e.target.value)}
                  placeholder="Draft your professional response here (3–4 sentences)..."
                  rows={4}
                  className="w-full p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm font-medium outline-none focus:border-purple-600 resize-none"
                />
              </div>
            )}

            {/* SECTION 5: SPEAKING */}
            {currentSection.id === 'speaking' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900">
                  {currentSection.prompt}
                </div>
                <div className="p-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 flex flex-col items-center justify-center text-center space-y-3">
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition shadow-md ${
                      isRecording ? 'bg-rose-600 text-white animate-pulse' : 'bg-purple-600 text-white hover:scale-105'
                    }`}
                  >
                    <Mic className="w-7 h-7" />
                  </button>
                  <div className="text-xs font-bold text-slate-800">
                    {isRecording ? 'Listening... Tap to finish answer' : 'Tap to speak your interview answer'}
                  </div>
                </div>
                <textarea
                  value={spokenTranscript}
                  onChange={(e) => setSpokenTranscript(e.target.value)}
                  placeholder="Spoken response will appear here or type directly..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium outline-none resize-none"
                />
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentSectionIdx(prev => Math.max(0, prev - 1))}
                disabled={currentSectionIdx === 0}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={handleNextSection}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center gap-2 shadow-sm"
              >
                <span>{currentSectionIdx === FINAL_EXAM_SECTIONS.length - 1 ? (submitting ? 'Evaluating Exam...' : 'Submit Final Assessment') : 'Next Section'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* RESULT VIEW */}
        {result && (
          <div className="space-y-6 text-center py-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                Assessment Passed • 86% Overall Score
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                Official Credential Issued!
              </h3>
              <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                You have demonstrated comprehensive competence across all 6 core English competencies.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-950 font-mono font-bold">
              Certificate ID: {result.certificate?.certificateId || 'CS-ENG-2026-X89A'}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition shadow-sm"
              >
                View Certificate on Dashboard 🏆
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
