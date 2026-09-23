import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Trophy,
  Clock,
  Briefcase,
  GraduationCap,
  Users,
  Radio,
  ChevronDown,
  ChevronUp,
  AudioLines
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { englishAPI } from '../utils/api';
import toast from 'react-hot-toast';

const MODES = [
  {
    id: 'Beginner',
    label: 'Beginner',
    desc: 'Slow & clear speech, simple sentences, helpful hints',
    icon: GraduationCap,
    color: 'emerald'
  },
  {
    id: 'Intermediate',
    label: 'Intermediate',
    desc: 'Natural conversation, storytelling & dynamic follow-up questions',
    icon: Users,
    color: 'blue'
  },
  {
    id: 'Professional English',
    label: 'Professional / Placement',
    desc: 'Workplace dialogues, interview questions, manager updates',
    icon: Briefcase,
    color: 'purple'
  }
];

const PROFESSIONAL_PERSONAS = [
  'HR Interviewer',
  'Engineering Manager',
  'Client',
  'Colleague / Team Member',
  'Interview Panel'
];

const TOPICS = [
  'Free Talk',
  'Daily Life & Routine',
  'College & Career Goals',
  'Hobbies & Interests',
  'Technology & Software',
  'Placement Interview Prep',
  'Workplace Communication'
];

export default function TalkWithAI() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Settings
  const [mode, setMode] = useState('Beginner');
  const [persona, setPersona] = useState('English Partner');
  const [topic, setTopic] = useState('Free Talk');

  // Conversation Session State
  const [sessionId, setSessionId] = useState('');
  const [sessionActive, setSessionActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [durationSeconds, setDurationSeconds] = useState(0);

  // Voice Interaction State: 'idle' | 'aiSpeaking' | 'listening' | 'processing'
  const [status, setStatus] = useState('idle');
  const [interimText, setInterimText] = useState('');
  const [latestCorrection, setLatestCorrection] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [micVolumeLevel, setMicVolumeLevel] = useState(0);

  // Evaluation & Results
  const [showResultModal, setShowResultModal] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [isEnding, setIsEnding] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  // References
  const audioPlayerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const hasSpokenRef = useRef(false);
  const isStoppingRef = useRef(false);

  // Update default persona when mode changes
  useEffect(() => {
    if (mode === 'Professional English' && !PROFESSIONAL_PERSONAS.includes(persona)) {
      setPersona('HR Interviewer');
    } else if (mode !== 'Professional English') {
      setPersona('English Partner');
    }
  }, [mode]);

  // Session duration timer
  useEffect(() => {
    if (sessionActive) {
      timerRef.current = setInterval(() => {
        setDurationSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMicrophoneStream();
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Format seconds to mm:ss
  const formatTime = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  /**
   * Stop audio input stream & analyser
   */
  const stopMicrophoneStream = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (_) {}
      audioContextRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    setMicVolumeLevel(0);
  };

  /**
   * START CONVERSATION SESSION
   * AI speaks first: "Hi! I'm your English speaking partner..."
   */
  const handleStartSession = async () => {
    try {
      setStatus('processing');
      setMessages([]);
      setDurationSeconds(0);
      setLatestCorrection(null);
      setEvaluation(null);
      setShowResultModal(false);

      const response = await englishAPI.startVoiceSession({
        mode,
        level: mode,
        topic,
        persona
      });

      setSessionId(response?.session?.id || '');
      setSessionActive(true);

      const aiText = response?.firstMessage || "Hi! I'm your English speaking partner. Let's practice English together. How are you today?";
      setMessages([{ role: 'assistant', text: aiText, timestamp: new Date() }]);

      // Play AI Voice Audio
      if (response?.audioData && !isMuted) {
        playAiAudio(response.audioData);
      } else {
        fallbackSpeak(aiText);
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
      toast.error('Unable to connect to AI English partner. Please try again.');
      setStatus('idle');
    }
  };

  /**
   * PLAY AI AUDIO (from Gemini TTS WAV)
   */
  const playAiAudio = (audioDataUrl) => {
    if (!audioPlayerRef.current) return;
    setStatus('aiSpeaking');

    audioPlayerRef.current.src = audioDataUrl;
    audioPlayerRef.current.onended = () => {
      // Automatic turn-taking: when AI finishes speaking, immediately listen to user!
      handleStartListening();
    };
    audioPlayerRef.current.onerror = (e) => {
      console.warn('Audio playback error, falling back to speech synthesis:', e);
      fallbackSpeak(messages[messages.length - 1]?.text || '');
    };

    audioPlayerRef.current.play().catch((err) => {
      console.warn('Auto-play blocked, user interaction required:', err);
      fallbackSpeak(messages[messages.length - 1]?.text || '');
    });
  };

  /**
   * FALLBACK: Web Speech Synthesis if audio fails
   */
  const fallbackSpeak = (text) => {
    if (!('speechSynthesis' in window)) {
      handleStartListening();
      return;
    }
    window.speechSynthesis.cancel();
    setStatus('aiSpeaking');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = mode === 'Beginner' ? 0.82 : mode === 'Intermediate' ? 0.94 : 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    utterance.onend = () => {
      handleStartListening();
    };
    utterance.onerror = () => {
      handleStartListening();
    };

    window.speechSynthesis.speak(utterance);
  };

  /**
   * START LISTENING (Microphone capture + VAD)
   */
  const handleStartListening = async () => {
    if (isEnding) return;
    stopMicrophoneStream();
    setInterimText('');
    hasSpokenRef.current = false;
    isStoppingRef.current = false;
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      setStatus('listening');

      // Setup Web Audio API for live sound visualizer & silence detection
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      // Voice Activity Detection (VAD) Loop
      const checkAudioLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setMicVolumeLevel(normalized);

        // Speaking threshold
        if (normalized > 14) {
          hasSpokenRef.current = true;
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        } else if (hasSpokenRef.current) {
          // If user has spoken and now silence is detected for 1.4s, automatically submit turn!
          if (!silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(() => {
              handleStopAndSendTurn();
            }, 1400);
          }
        }

        animFrameRef.current = requestAnimationFrame(checkAudioLevel);
      };
      animFrameRef.current = requestAnimationFrame(checkAudioLevel);

      // Setup MediaRecorder
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
      const supportedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || '';

      const recorder = new MediaRecorder(stream, supportedMime ? { mimeType: supportedMime } : {});
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(250);

      // Optional live speech recognition for instant on-screen text preview
      startOptionalLiveRecognition();
    } catch (err) {
      console.error('Microphone access failed:', err);
      toast.error('Please allow microphone access to talk with your AI English partner.');
      setStatus('idle');
    }
  };

  /**
   * Start optional browser SpeechRecognition for live on-screen interim preview
   */
  const startOptionalLiveRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let current = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setInterimText(current);
      };

      recognition.onerror = () => {};
      recognition.onend = () => {};

      recognition.start();
      recognitionRef.current = recognition;
    } catch (_) {}
  };

  /**
   * STOP RECORDING & SEND AUDIO TO AI
   */
  const handleStopAndSendTurn = async () => {
    if (isStoppingRef.current || status !== 'listening') return;
    isStoppingRef.current = true;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }

    setStatus('processing');

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
    stopMicrophoneStream();

    // Brief delay to ensure all chunks are flushed
    await new Promise((r) => setTimeout(r, 200));

    const chunks = audioChunksRef.current;
    const mimeType = recorder?.mimeType || 'audio/webm';
    const audioBlob = new Blob(chunks, { type: mimeType });

    // If audio is completely empty and no interim text, resume listening
    if (audioBlob.size < 1000 && !interimText) {
      isStoppingRef.current = false;
      handleStartListening();
      return;
    }

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'user_speech.webm');
      formData.append('sessionId', sessionId);
      formData.append('mode', mode);
      formData.append('level', mode);
      formData.append('persona', persona);
      formData.append('topic', topic);
      if (interimText) {
        formData.append('message', interimText);
      }

      const response = await englishAPI.sendVoiceTurnAudio(formData);

      const userSaid = response?.userText || interimText || 'Spoken English response';
      const aiReply = response?.responseText || "That's interesting! Can you tell me more about that?";

      setMessages((prev) => [
        ...prev,
        { role: 'user', text: userSaid, timestamp: new Date() },
        { role: 'assistant', text: aiReply, timestamp: new Date() }
      ]);

      setInterimText('');
      if (response?.correction) {
        setLatestCorrection(response.correction);
      }

      // Play AI Spoken Voice
      if (response?.audioData && !isMuted) {
        playAiAudio(response.audioData);
      } else {
        fallbackSpeak(aiReply);
      }
    } catch (err) {
      console.error('Turn failed:', err);
      toast.error('AI could not hear clearly. Please speak again.');
      isStoppingRef.current = false;
      handleStartListening();
    } finally {
      isStoppingRef.current = false;
    }
  };

  /**
   * END CONVERSATION & SHOW RESULTS
   */
  const handleEndConversation = async () => {
    setIsEnding(true);
    stopMicrophoneStream();
    if (audioPlayerRef.current) audioPlayerRef.current.pause();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }

    setStatus('processing');

    try {
      const response = await englishAPI.endVoiceSession({
        sessionId,
        durationSeconds
      });

      setEvaluation(response?.evaluation || null);
      setSessionActive(false);
      setStatus('idle');
      setShowResultModal(true);
      toast.success('Speaking practice completed! Check your score.');
    } catch (err) {
      console.error('End session failed:', err);
      toast.error('Session ended. Generating summary...');
      setSessionActive(false);
      setStatus('idle');
      setShowResultModal(true);
    } finally {
      setIsEnding(false);
    }
  };

  /**
   * Interrupt / Pause AI speech
   */
  const handleInterruptAi = () => {
    if (audioPlayerRef.current) audioPlayerRef.current.pause();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    handleStartListening();
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      {/* Hidden Audio Player */}
      <audio ref={audioPlayerRef} playsInline />

      {/* Top Header Navigation */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/english')}
              className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white transition"
              title="Back to English Learning"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <h1 className="text-sm font-semibold tracking-tight sm:text-base">
                  AI English Speaking Partner
                </h1>
              </div>
              <p className="text-[11px] text-white/50">
                {mode} Mode • {mode === 'Professional English' ? persona : topic}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Timer */}
            {sessionActive && (
              <div className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-mono text-white/80">
                <Clock className="h-3.5 w-3.5 text-white/50" />
                {formatTime(durationSeconds)}
              </div>
            )}

            {/* Mute Button */}
            <button
              type="button"
              onClick={() => {
                setIsMuted(!isMuted);
                if (audioPlayerRef.current && !isMuted) audioPlayerRef.current.pause();
              }}
              className={`rounded-full p-2 border transition ${
                isMuted ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-white/10 bg-white/5 text-white/70 hover:text-white'
              }`}
              title={isMuted ? 'Unmute AI' : 'Mute AI'}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>

            {/* End Conversation Button */}
            {sessionActive && (
              <button
                type="button"
                onClick={handleEndConversation}
                disabled={isEnding}
                className="rounded-full bg-red-500/20 border border-red-500/40 px-4 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500 hover:text-white transition"
              >
                {isEnding ? 'Analyzing...' : 'End Conversation'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Hero Voice Interaction Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 max-w-4xl mx-auto w-full">
        {!sessionActive && status === 'idle' ? (
          /* PRE-CONVERSATION CONFIGURATION SCREEN */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-8 text-center"
          >
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-purple-300">
                <Sparkles className="h-3.5 w-3.5" /> Real-time Speech-to-Speech
              </div>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl text-white">
                Talk with your AI English Partner
              </h2>
              <p className="mt-3 text-base sm:text-lg text-white/60 max-w-xl mx-auto">
                Have a real spoken conversation in English. No typing required. Speak into your microphone and hear natural AI voice responses.
              </p>
            </div>

            {/* Mode Selector Cards */}
            <div className="grid gap-3 sm:grid-cols-3 text-left">
              {MODES.map((m) => {
                const Icon = m.icon;
                const active = mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    className={`rounded-2xl border p-4 transition text-left flex flex-col justify-between ${
                      active
                        ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_25px_rgba(168,85,247,0.15)] ring-1 ring-purple-500'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div>
                      <div className={`p-2.5 rounded-xl w-fit ${active ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/70'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-3 font-semibold text-white text-base">{m.label}</h3>
                      <p className="mt-1 text-xs text-white/50 leading-relaxed">{m.desc}</p>
                    </div>
                    {active && (
                      <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-purple-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Selected
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sub-options for Selected Mode */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
              {mode === 'Professional English' ? (
                <label className="space-y-1.5">
                  <span className="text-xs uppercase tracking-wider font-semibold text-white/60">
                    Interviewer / Persona
                  </span>
                  <select
                    value={persona}
                    onChange={(e) => setPersona(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                  >
                    {PROFESSIONAL_PERSONAS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </label>
              ) : (
                <label className="space-y-1.5">
                  <span className="text-xs uppercase tracking-wider font-semibold text-white/60">
                    Conversation Topic
                  </span>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                  >
                    {TOPICS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </label>
              )}

              <div className="space-y-1.5">
                <span className="text-xs uppercase tracking-wider font-semibold text-white/60">
                  Interaction Experience
                </span>
                <div className="rounded-xl border border-white/10 bg-black/30 p-2.5 text-xs text-white/70">
                  🎙️ <strong>Hands-free:</strong> Turn-taking is automatic via speech detection.
                </div>
              </div>
            </div>

            {/* Big Start Speaking Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartSession}
                className="group relative inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-purple-600/30 transition hover:scale-105 hover:shadow-purple-600/50"
              >
                <Mic className="h-6 w-6 transition group-hover:scale-110" />
                Start Speaking
              </button>
              <p className="mt-3 text-xs text-white/40">
                Click to connect. AI will speak first to introduce the conversation.
              </p>
            </div>
          </motion.div>
        ) : (
          /* ACTIVE HERO VOICE SCREEN */
          <div className="w-full flex flex-col items-center text-center space-y-8 my-auto">
            {/* Real-time Status Indicator Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 backdrop-blur-md"
              style={{
                borderColor:
                  status === 'aiSpeaking'
                    ? 'rgba(168, 85, 247, 0.5)'
                    : status === 'listening'
                    ? 'rgba(16, 185, 129, 0.5)'
                    : 'rgba(255, 255, 255, 0.2)',
                backgroundColor:
                  status === 'aiSpeaking'
                    ? 'rgba(168, 85, 247, 0.15)'
                    : status === 'listening'
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                color:
                  status === 'aiSpeaking'
                    ? '#d8b4fe'
                    : status === 'listening'
                    ? '#6ee7b7'
                    : '#e2e8f0'
              }}
            >
              {status === 'aiSpeaking' && <Volume2 className="h-4 w-4 animate-bounce" />}
              {status === 'listening' && <Mic className="h-4 w-4 animate-pulse" />}
              {status === 'processing' && <Radio className="h-4 w-4 animate-spin" />}
              <span>
                {status === 'aiSpeaking' && 'AI is speaking...'}
                {status === 'listening' && 'Listening... Speak now'}
                {status === 'processing' && 'AI is thinking...'}
              </span>
            </div>

            {/* Central Animated Hero Visualizer / Avatar */}
            <div className="relative flex items-center justify-center my-6">
              {/* Pulsing Ripple Rings */}
              {status === 'aiSpeaking' && (
                <>
                  <div className="absolute h-56 w-56 rounded-full bg-purple-500/20 animate-ping" />
                  <div className="absolute h-44 w-44 rounded-full bg-indigo-500/30 animate-pulse" />
                </>
              )}

              {status === 'listening' && (
                <>
                  <div
                    className="absolute rounded-full bg-emerald-500/20 transition-all duration-100"
                    style={{
                      width: `${140 + micVolumeLevel * 1.8}px`,
                      height: `${140 + micVolumeLevel * 1.8}px`
                    }}
                  />
                  <div className="absolute h-40 w-40 rounded-full bg-emerald-500/10 animate-pulse" />
                </>
              )}

              {status === 'processing' && (
                <div className="absolute h-44 w-44 rounded-full bg-blue-500/20 animate-pulse" />
              )}

              {/* Main Circular Button / Avatar */}
              <button
                type="button"
                onClick={() => {
                  if (status === 'aiSpeaking') {
                    handleInterruptAi();
                  } else if (status === 'listening') {
                    handleStopAndSendTurn();
                  } else if (status === 'idle') {
                    handleStartListening();
                  }
                }}
                className={`relative z-10 flex h-36 w-36 items-center justify-center rounded-full border-2 shadow-2xl transition-transform duration-200 active:scale-95 ${
                  status === 'aiSpeaking'
                    ? 'border-purple-400 bg-gradient-to-tr from-purple-700 to-indigo-600 text-white shadow-purple-500/40'
                    : status === 'listening'
                    ? 'border-emerald-400 bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-emerald-500/40'
                    : 'border-white/20 bg-neutral-800 text-white/80 hover:border-white/40'
                }`}
              >
                {status === 'aiSpeaking' && <AudioLines className="h-16 w-16 animate-pulse" />}
                {status === 'listening' && <Mic className="h-16 w-16" />}
                {status === 'processing' && (
                  <div className="h-12 w-12 rounded-full border-4 border-white/20 border-t-white animate-spin" />
                )}
              </button>
            </div>

            {/* Dynamic Sound Waveform Bars (During AI Speech or User Speech) */}
            <div className="flex items-center justify-center gap-1.5 h-10 w-full max-w-xs">
              {[...Array(16)].map((_, i) => {
                const height =
                  status === 'aiSpeaking'
                    ? Math.sin(Date.now() / 200 + i) * 16 + 20
                    : status === 'listening'
                    ? Math.max(6, Math.min(36, (micVolumeLevel / 100) * 36 * (0.6 + 0.4 * Math.sin(i))))
                    : 6;

                return (
                  <motion.span
                    key={i}
                    animate={{ height }}
                    transition={{ duration: 0.1 }}
                    className={`w-1 rounded-full ${
                      status === 'aiSpeaking'
                        ? 'bg-purple-400'
                        : status === 'listening'
                        ? 'bg-emerald-400'
                        : 'bg-white/20'
                    }`}
                  />
                );
              })}
            </div>

            {/* Spoken Interim Text or Latest Dialogue Prompt */}
            <div className="min-h-[70px] max-w-xl px-4 text-center">
              {status === 'listening' ? (
                <div>
                  <p className="text-lg font-medium text-emerald-300 italic">
                    {interimText || 'Listening to your voice...'}
                  </p>
                  <p className="mt-1 text-xs text-white/40">
                    Speak naturally. When you finish, AI will answer automatically.
                  </p>
                </div>
              ) : status === 'aiSpeaking' ? (
                <div>
                  <p className="text-base sm:text-lg font-medium text-white/90 leading-relaxed">
                    "{messages[messages.length - 1]?.text || 'Speaking...'}"
                  </p>
                  <button
                    type="button"
                    onClick={handleInterruptAi}
                    className="mt-2 text-xs text-purple-300/80 hover:text-purple-200 underline"
                  >
                    Tap here or mic to reply now
                  </button>
                </div>
              ) : status === 'processing' ? (
                <p className="text-sm font-medium text-white/60 animate-pulse">
                  Understanding your speech & crafting response...
                </p>
              ) : null}
            </div>

            {/* Real-time Subtle Grammar Tip Notification */}
            <AnimatePresence>
              {latestCorrection && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-200 max-w-md flex items-center gap-2.5 text-left"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
                  <div>
                    <span className="font-semibold text-amber-300">Quick Grammar Note: </span>
                    <span>{latestCorrection.tip || latestCorrection.better}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Manual Mic Action Buttons */}
            <div className="flex items-center gap-4 pt-2">
              {status === 'listening' ? (
                <button
                  type="button"
                  onClick={handleStopAndSendTurn}
                  className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition shadow-lg shadow-emerald-600/30"
                >
                  Done Speaking
                </button>
              ) : status === 'idle' ? (
                <button
                  type="button"
                  onClick={handleStartListening}
                  className="rounded-full bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 transition shadow-lg shadow-purple-600/30"
                >
                  Speak
                </button>
              ) : null}

              <button
                type="button"
                onClick={handleEndConversation}
                className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
              >
                End Session
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Secondary Bottom Drawer: Live Transcript & Learning History */}
      {sessionActive && (
        <div className="border-t border-white/10 bg-black/60 backdrop-blur-xl">
          <div className="mx-auto max-w-4xl px-4 py-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowTranscript(!showTranscript)}
              className="flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white transition"
            >
              <span>Conversation Transcript ({messages.length} turns)</span>
              {showTranscript ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
            <span className="text-[11px] text-white/40">Voice is primary • Transcript is for review</span>
          </div>

          <AnimatePresence>
            {showTranscript && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-white/5 px-4 py-4"
              >
                <div className="mx-auto max-w-4xl max-h-56 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/20">
                  {messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`rounded-2xl p-3.5 text-sm max-w-[85%] ${
                        m.role === 'user'
                          ? 'ml-auto bg-purple-600/20 border border-purple-500/30 text-purple-100'
                          : 'mr-auto bg-white/5 border border-white/10 text-white/90'
                      }`}
                    >
                      <div className="text-[10px] font-semibold uppercase tracking-wider opacity-60 mb-1">
                        {m.role === 'user' ? 'You' : 'AI Speaking Partner'}
                      </div>
                      <p className="leading-relaxed">{m.text}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Post-Session Evaluation Results Modal */}
      <AnimatePresence>
        {showResultModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-[#161b22] p-6 sm:p-8 text-white shadow-2xl space-y-6 my-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-3 text-black shadow-lg">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
                      Speaking Practice Completed
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Your Speaking Report</h2>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-mono text-white/80">
                    <Clock className="h-3 w-3" /> {formatTime(durationSeconds)}
                  </span>
                </div>
              </div>

              {/* Overall Score Banner */}
              <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-purple-900/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                    Overall Speaking Score
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold text-white">
                      {evaluation?.speakingScore || 78}
                    </span>
                    <span className="text-xl text-white/50">/100</span>
                  </div>
                  <p className="mt-2 text-sm text-purple-200/80 max-w-md">
                    {evaluation?.summary || 'Good job practicing your spoken English today! Regular voice conversations build lasting fluency.'}
                  </p>
                </div>

                {/* Circular Score Visual */}
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-purple-500/30 bg-purple-500/10">
                  <span className="text-2xl font-black text-purple-300">
                    {evaluation?.speakingScore || 78}%
                  </span>
                </div>
              </div>

              {/* Breakdown Metric Bars */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'Grammar', score: evaluation?.grammar || 74 },
                  { label: 'Vocabulary', score: evaluation?.vocabulary || 81 },
                  { label: 'Fluency', score: evaluation?.fluency || 76 },
                  { label: 'Pronunciation', score: evaluation?.pronunciation || 79 }
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
                    <div className="text-[11px] uppercase tracking-wider text-white/50">{item.label}</div>
                    <div className="mt-1 text-2xl font-bold text-white">{item.score}</div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Strengths & Improvements */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* You Did Well */}
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" /> You did well
                  </div>
                  <ul className="mt-3 space-y-2 text-xs text-white/80">
                    {(evaluation?.strengths || ['Good conversational willingness', 'Clear responses', 'Active participation']).map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Practice More */}
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-amber-400">
                    <AlertCircle className="h-4 w-4" /> Practice more
                  </div>
                  <ul className="mt-3 space-y-2 text-xs text-white/80">
                    {(evaluation?.improvements || ['Use longer descriptive sentences', 'Pay attention to verb tenses', 'Expand professional vocabulary']).map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Specific Sentence Corrections */}
              {evaluation?.corrections && evaluation.corrections.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="text-xs uppercase tracking-wider font-semibold text-white/60 mb-3">
                    Sentence Improvements from Session
                  </div>
                  <div className="space-y-2.5 max-h-40 overflow-y-auto pr-2">
                    {evaluation.corrections.map((corr, idx) => (
                      <div key={idx} className="rounded-xl border border-white/5 bg-black/30 p-3 text-xs">
                        <div className="text-red-400/80">
                          <span className="font-semibold">You said: </span>"{corr.original}"
                        </div>
                        <div className="text-emerald-400 font-semibold mt-1">
                          <span>Better: </span>"{corr.better}"
                        </div>
                        {corr.explanation && (
                          <div className="text-white/50 text-[11px] mt-1">
                            💡 {corr.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowResultModal(false);
                    navigate('/english');
                  }}
                  className="w-full sm:w-auto rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition"
                >
                  Back to English Learning
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResultModal(false);
                    handleStartSession();
                  }}
                  className="w-full sm:w-auto rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:scale-105 transition shadow-lg shadow-purple-600/30"
                >
                  Practice Again
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
