import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Volume2,
  Sparkles,
  Award,
  Zap,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  User,
  Radio,
  Send,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { englishAPI } from '../../utils/api';

const SPEAKING_PROMPTS = {
  Beginner: [
    { id: 'beg-spk-1', title: 'Self Introduction & Passions', prompt: 'Introduce yourself, state where you are from, and describe two things you love doing on weekends.' },
    { id: 'beg-spk-2', title: 'My Daily Routine', prompt: 'Describe what you normally do in the morning from the time you wake up until you start studying or working.' }
  ],
  Elementary: [
    { id: 'elem-spk-1', title: 'A Memorable Journey', prompt: 'Tell a story about a memorable trip you took with family or friends. What made it special?' },
    { id: 'elem-spk-2', title: 'My Favorite Food & Cooking', prompt: 'Describe your favorite meal. Why do you enjoy it, and how is it prepared?' }
  ],
  Intermediate: [
    { id: 'inter-spk-1', title: 'Overcoming a Difficult Challenge', prompt: 'Describe a complicated project or personal challenge you faced and the specific steps you took to overcome it.' },
    { id: 'inter-spk-2', title: 'Technology in Daily Life', prompt: 'How has mobile technology changed the way we learn and communicate? Discuss both advantages and disadvantages.' }
  ],
  'Upper-Intermediate': [
    { id: 'upper-spk-1', title: 'Remote Work vs In-Office Collaboration', prompt: 'Express your opinion on remote work vs office work. Support your argument with two clear logical points.' },
    { id: 'upper-spk-2', title: 'Environmental Sustainability', prompt: 'What practical steps can urban cities take to reduce pollution and encourage green energy adoption?' }
  ],
  Advanced: [
    { id: 'adv-spk-1', title: 'Executive Placement Pitch', prompt: 'Deliver a 2-minute persuasive presentation on how AI will transform software engineering over the next five years.' },
    { id: 'adv-spk-2', title: 'Leadership & Ethical Dilemmas', prompt: 'How should an engineering leader navigate a scenario where project deadlines conflict with rigorous quality testing?' }
  ]
};

const AI_PERSONAS = [
  { id: 'maya', name: 'Professor Maya', role: 'Encouraging Teacher', avatar: '👩‍🏫', voice: 'Aoede', greeting: 'Hello! I am Professor Maya. Tell me, what topic would you like to practice speaking about today?' },
  { id: 'alex', name: 'Alex', role: 'Friendly Peer & Colleague', avatar: '👨‍💻', voice: 'Puck', greeting: 'Hey there! Great to connect with you. How has your day been treating you so far?' },
  { id: 'sarah', name: 'Sarah', role: 'HR & Placement Interviewer', avatar: '👩‍💼', voice: 'Aoede', greeting: 'Welcome to our interview session. Let’s start: Could you please walk me through your technical background?' }
];

export default function SpeakingLabView({ userLevel = 'Beginner', userName = 'Candidate' }) {
  const [mode, setMode] = useState('prompt'); // 'prompt' | 'conversation'
  const activeLevel = SPEAKING_PROMPTS[userLevel] ? userLevel : 'Beginner';

  // Prompt Mode State
  const [selectedPrompt, setSelectedPrompt] = useState(SPEAKING_PROMPTS[activeLevel][0]);
  const [isRecording, setIsRecording] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [submittingEvaluation, setSubmittingEvaluation] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  // Conversational Voice Partner State
  const [selectedPersona, setSelectedPersona] = useState(AI_PERSONAS[0]);
  const [sessionId, setSessionId] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [isConvRecording, setIsConvRecording] = useState(false);
  const [convTranscript, setConvTranscript] = useState('');
  const [sendingTurn, setSendingTurn] = useState(false);

  const recognitionRef = useRef(null);
  const convRecognitionRef = useRef(null);

  // Toggle Recording for Prompt Mode
  const togglePromptRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Microphone speech recognition is not supported in this browser. Please type your response.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        toast.success('Microphone listening! Speak clearly.');
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
      console.error('Speech recognition error:', err);
      setIsRecording(false);
    }
  };

  // Submit Spoken Response for Pedagogical Feedback
  const handleSubmitSpokenResponse = async () => {
    if (!spokenTranscript.trim()) {
      toast.error('Please record or type your spoken response before submitting');
      return;
    }

    try {
      setSubmittingEvaluation(true);
      const res = await englishAPI.evaluateSpeaking({
        transcript: spokenTranscript,
        prompt: selectedPrompt.prompt,
        level: activeLevel
      });

      setEvaluationResult(res.evaluation);
      toast.success('Speech Evaluated! Check your constructive feedback below.');
    } catch (err) {
      console.error('Error evaluating speech:', err);
      toast.error('Evaluation failed. Please try again.');
    } finally {
      setSubmittingEvaluation(false);
    }
  };

  // Audio Playback
  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  // Conversational Mode: Start Session
  useEffect(() => {
    if (mode === 'conversation' && conversationMessages.length === 0) {
      setConversationMessages([
        { sender: 'ai', text: selectedPersona.greeting, persona: selectedPersona.name }
      ]);
      speakText(selectedPersona.greeting);
    }
  }, [mode, selectedPersona]);

  // Conversational Turn
  const toggleConvRecording = () => {
    if (isConvRecording) {
      if (convRecognitionRef.current) convRecognitionRef.current.stop();
      setIsConvRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsConvRecording(true);
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setConvTranscript(transcript);
      };
      recognition.onerror = () => setIsConvRecording(false);
      recognition.onend = () => setIsConvRecording(false);

      convRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsConvRecording(false);
    }
  };

  const handleSendConvTurn = async () => {
    if (!convTranscript.trim()) return;

    const userMsg = convTranscript;
    setConversationMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setConvTranscript('');

    try {
      setSendingTurn(true);
      const res = await englishAPI.sendVoiceTurn({
        sessionId,
        message: userMsg,
        mode: 'Free Talk',
        level: activeLevel,
        persona: selectedPersona.name
      });

      if (res.sessionId && !sessionId) {
        setSessionId(res.sessionId);
      }

      const aiReply = res.aiReply || 'That is an excellent point. How do you see this developing further?';
      setConversationMessages(prev => [...prev, { sender: 'ai', text: aiReply, persona: selectedPersona.name }]);
      speakText(aiReply);
    } catch (err) {
      console.error('Error in conversation turn:', err);
      const fallback = 'I understood your thought clearly. Could you tell me more about that experience?';
      setConversationMessages(prev => [...prev, { sender: 'ai', text: fallback, persona: selectedPersona.name }]);
      speakText(fallback);
    } finally {
      setSendingTurn(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & MODE SWITCHER */}
      <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">
              <Mic className="w-3.5 h-3.5" /> AI Speaking Lab
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              Vocal Fluency & Spoken Confidence
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Practice speaking with real-time speech recognition, natural AI conversational partners, and constructive feedback.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setMode('prompt')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                mode === 'prompt'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Prompt Practice
            </button>
            <button
              type="button"
              onClick={() => setMode('conversation')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                mode === 'conversation'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Voice Partner
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODE 1: PROMPT PRACTICE & 4-PART FEEDBACK */}
      {/* ===================================================================== */}
      {mode === 'prompt' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Prompts Selector */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Speaking Prompt ({activeLevel})
            </h3>
            <div className="space-y-2">
              {(SPEAKING_PROMPTS[activeLevel] || SPEAKING_PROMPTS.Beginner).map((pr) => (
                <button
                  key={pr.id}
                  type="button"
                  onClick={() => {
                    setSelectedPrompt(pr);
                    setSpokenTranscript('');
                    setEvaluationResult(null);
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition ${
                    selectedPrompt.id === pr.id
                      ? 'border-purple-600 bg-purple-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <h4 className="text-xs font-bold text-slate-900">{pr.title}</h4>
                  <p className="text-[11px] text-slate-500 font-medium line-clamp-2 mt-1">
                    {pr.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Microphone Recording & Diagnosis */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-7 shadow-sm space-y-5">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  Speaking Challenge
                </span>
                <p className="text-sm font-bold text-slate-800 pt-1">{selectedPrompt.prompt}</p>
              </div>

              {/* Mic Record Button */}
              <div className="p-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 flex flex-col items-center justify-center text-center space-y-3">
                <button
                  type="button"
                  onClick={togglePromptRecording}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition shadow-xl ${
                    isRecording
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-105'
                  }`}
                >
                  <Mic className="w-8 h-8" />
                </button>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {isRecording ? 'Listening... Tap to Stop' : 'Tap Microphone to Speak'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {isRecording ? 'Speak your thoughts aloud naturally' : 'Audio will be transcribed in real time'}
                  </p>
                </div>
              </div>

              {/* Spoken Transcript Area */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Your Spoken Response</span>
                  <span>{spokenTranscript.trim().split(/\s+/).filter(Boolean).length} Words</span>
                </div>
                <textarea
                  value={spokenTranscript}
                  onChange={(e) => setSpokenTranscript(e.target.value)}
                  placeholder="Your spoken words will appear here as you speak into the microphone..."
                  rows={4}
                  className="w-full p-4 rounded-2xl border border-slate-200 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 text-xs sm:text-sm font-medium outline-none resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmitSpokenResponse}
                  disabled={submittingEvaluation || !spokenTranscript.trim()}
                  className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition disabled:opacity-40 disabled:pointer-events-none shadow-sm flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>{submittingEvaluation ? 'Analyzing Speech...' : 'Get AI Speaking Feedback →'}</span>
                </button>
              </div>
            </div>

            {/* 4-PART CONSTRUCTIVE PEDAGOGICAL FEEDBACK */}
            {evaluationResult && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[28px] border border-purple-200 bg-purple-50/20 p-6 sm:p-7 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between border-b border-purple-200/60 pb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-700" />
                    <h3 className="text-base font-black text-slate-900">AI Speaking Diagnosis</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                      Score: {evaluationResult.overallScore}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Part 1: What You Did Well */}
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>What You Did Well</span>
                    </div>
                    <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                      {evaluationResult.feedback?.whatWentWell}
                    </p>
                  </div>

                  {/* Part 2: What To Improve */}
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>What To Improve</span>
                    </div>
                    <p className="text-xs text-amber-950 font-medium leading-relaxed">
                      {evaluationResult.feedback?.whatToImprove}
                    </p>
                  </div>
                </div>

                {/* Part 3: Better Way To Say It */}
                <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                      Better Way To Say It (Native Phrasing)
                    </span>
                    <button
                      type="button"
                      onClick={() => speakText(evaluationResult.feedback?.betterWayToSay)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen</span>
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-indigo-950 font-semibold italic">
                    "{evaluationResult.feedback?.betterWayToSay}"
                  </p>
                </div>

                {/* Part 4: New Words To Learn */}
                {evaluationResult.feedback?.newWords && evaluationResult.feedback.newWords.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      New Vocabulary To Try Next Time:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {evaluationResult.feedback.newWords.map((word, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-xl bg-white border border-purple-200 text-xs font-bold text-purple-800 shadow-sm"
                        >
                          + {word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODE 2: LIVE VOICE CONVERSATION PARTNER */}
      {/* ===================================================================== */}
      {mode === 'conversation' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Persona Selection */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Speaking Partner
            </h3>
            <div className="space-y-2">
              {AI_PERSONAS.map((persona) => (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => {
                    setSelectedPersona(persona);
                    setConversationMessages([]);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center gap-3 ${
                    selectedPersona.id === persona.id
                      ? 'border-purple-600 bg-purple-50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-2xl">{persona.avatar}</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{persona.name}</h4>
                    <span className="text-[10px] text-slate-500 font-medium">{persona.role}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Chat Stream */}
          <div className="lg:col-span-3 rounded-[28px] border border-black/10 bg-white p-6 shadow-sm flex flex-col justify-between min-h-[480px]">
            {/* Messages */}
            <div className="space-y-3 overflow-y-auto max-h-[350px] pr-2">
              {conversationMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-slate-900 text-white rounded-br-none'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none space-y-1'
                    }`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                        <span>{msg.persona}</span>
                        <button
                          type="button"
                          onClick={() => speakText(msg.text)}
                          className="hover:text-purple-600"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar with Mic */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleConvRecording}
                className={`p-3 rounded-2xl flex items-center justify-center transition shadow-sm ${
                  isConvRecording
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                <Mic className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={convTranscript}
                onChange={(e) => setConvTranscript(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendConvTurn()}
                placeholder={isConvRecording ? 'Listening... Speak into mic' : 'Speak with mic or type your response...'}
                className="flex-1 p-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-medium outline-none focus:border-purple-600"
              />

              <button
                type="button"
                onClick={handleSendConvTurn}
                disabled={sendingTurn || !convTranscript.trim()}
                className="px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
