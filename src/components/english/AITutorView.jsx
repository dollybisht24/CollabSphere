import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Send,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  User,
  Bot,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import { englishAPI } from '../../utils/api';

const STARTER_PROMPT_CHIPS = [
  '💬 What does this word mean? Give examples and simple meaning',
  '🩺 Explain Present Perfect vs Past Simple with real scenarios',
  '✍️ Help me improve this sentence: "I am looking forward to meet you"',
  '🎙️ Give me an engaging speaking topic suited for my level',
  '🗣️ Can we practice an English conversation about daily routines?',
  '📝 Correct my paragraph, identify errors, and explain how to improve',
  '🎯 Ask me 3 challenging job interview questions and critique my answers',
  '🎬 Explain this cartoon dialogue and break down key idioms and expressions'
];

export default function AITutorView({
  userLevel = 'Beginner',
  userName = 'Candidate'
}) {
  const [selectedLevel, setSelectedLevel] = useState(userLevel);
  const [persona, setPersona] = useState('Professor Maya');
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'tutor',
      text: `Hello ${userName}! I am ${persona}, your AI English Tutor. How can I help you improve your speaking, grammar, or vocabulary today? Feel free to ask any question or write a sentence for me to review!`,
      timestamp: new Date()
    }
  ]);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Audio Pronunciation for Tutor Messages
  const speakTutorReply = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*#]/g, '');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 0.9;
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // Web Speech Recognition for Microphone input
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Voice input is not supported in this browser. Please type your message.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast('Listening... Speak into your microphone now', { icon: '🎙️' });
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage.trim();
    if (!text || isSending) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');

    try {
      setIsSending(true);
      const res = await englishAPI.chatWithTutor({
        message: text,
        conversationHistory: messages,
        level: selectedLevel,
        persona
      });

      const tutorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'tutor',
        text: res.reply || "I'm here to help! Could you please rephrase that?",
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, tutorMsg]);
    } catch (err) {
      console.error('Tutor chat error:', err);
      toast.error('Failed to get tutor response');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="rounded-[32px] border border-black/10 bg-white p-6 sm:p-8 shadow-sm max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xl shadow-md">
            👩‍🏫
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900">{persona}</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Online • AI English Tutor
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Adapting explanations to {selectedLevel} English
            </p>
          </div>
        </div>

        {/* Level Selector */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-neutral-100 border border-black/5 self-start sm:self-auto">
          {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
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

      {/* Preset Quick Chips */}
      <div className="flex flex-wrap gap-2">
        {STARTER_PROMPT_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(chip)}
            className="text-[11px] font-semibold text-slate-600 bg-neutral-100 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 border border-slate-200 px-3 py-1.5 rounded-full transition text-left"
          >
            💬 {chip}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="rounded-3xl border border-black/5 bg-neutral-50/60 p-4 sm:p-6 min-h-[380px] max-h-[460px] overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                  isUser ? 'bg-slate-900 text-white' : 'bg-purple-600 text-white shadow-sm'
                }`}
              >
                {isUser ? 'Me' : 'AI'}
              </div>

              <div className={`space-y-1 max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-white border border-black/5 text-slate-900 shadow-xs rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>

                {!isUser && (
                  <button
                    type="button"
                    onClick={() => speakTutorReply(m.text)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-700 pl-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen aloud</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center gap-2 text-xs text-purple-600 font-bold p-2 bg-white rounded-xl border border-purple-200 w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>{persona} is composing an explanation...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Area */}
      <div className="relative flex items-center gap-2">
        <button
          type="button"
          onClick={handleToggleListening}
          className={`p-3 rounded-2xl border transition shadow-sm ${
            isListening
              ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
              : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
          }`}
          title={isListening ? 'Stop listening' : 'Speak message into mic'}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Ask a grammar rule, check a sentence, or practice a conversation..."
          className="flex-1 p-3.5 rounded-2xl border border-slate-300 focus:outline-hidden focus:border-purple-600 text-xs sm:text-sm text-slate-900 bg-white"
        />

        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={!inputMessage.trim() || isSending}
          className="p-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition disabled:opacity-40 shadow-md shadow-purple-600/20"
          title="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
