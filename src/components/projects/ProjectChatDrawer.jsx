import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, X, Send, Sparkles, Bot, User, CornerDownLeft
} from 'lucide-react';
import { projectsAPI } from '../../utils/api';

const getSuggestedPrompts = (projectName = '') => [
  `How does authentication work in ${projectName || 'this project'}?`,
  'What architecture decisions should I revisit?',
  'What features should I add next?',
  'What security issues should I address first?',
  'How can I improve performance?',
  'Explain the main project structure.'
];

const ProjectChatDrawer = ({ project, isOpen, onClose }) => {
  const projectName = project?.name || 'this project';
  const suggestedPrompts = getSuggestedPrompts(projectName);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I’m your AI engineering assistant for ${projectName}. I can inspect the actual repo code, auth flow, architecture, and project files to answer questions grounded in this project.`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (textToSend = input) => {
    const text = String(textToSend || '').trim();
    if (!text || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await projectsAPI.askChat(project._id, text, messages);
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: response.message || 'I have analyzed your request based on the project files.'
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'Sorry, I encountered an issue inspecting the project. Please check if your question is related to the project files.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-black/10 bg-white shadow-2xl">
      {/* Drawer Header */}
      <div className="flex items-center justify-between border-b border-black/10 px-5 py-4 bg-white/90 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-black text-white">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-black flex items-center gap-1.5">
              <span>Ask AI About This Project</span>
            </h3>
            <p className="text-[11px] text-black/50 truncate max-w-[200px]">
              Grounded in {project?.name}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-black/40 hover:bg-neutral-100 hover:text-black transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
              m.sender === 'user' ? 'bg-black text-white' : 'bg-neutral-100 text-black border border-black/10'
            }`}>
              {m.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </div>

            <div className={`rounded-2xl px-4 py-3 max-w-[85%] leading-relaxed ${
              m.sender === 'user'
                ? 'bg-black text-white shadow-sm'
                : 'bg-neutral-50 border border-black/10 text-black shadow-sm whitespace-pre-wrap'
            }`}>
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-neutral-100 text-black border border-black/10">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="rounded-2xl bg-neutral-50 border border-black/10 px-4 py-3 text-black/60 shadow-sm flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-black animate-bounce" />
              <div className="h-2 w-2 rounded-full bg-black animate-bounce [animation-delay:0.2s]" />
              <div className="h-2 w-2 rounded-full bg-black animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="border-t border-black/5 bg-neutral-50/70 px-4 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-black/40 mb-1.5">
          Suggested Project Inquiries:
        </p>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(p)}
              disabled={loading}
              className="rounded-lg border border-black/10 bg-white px-2.5 py-1 text-[11px] text-black/70 hover:border-black/30 hover:text-black transition text-left"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Bar */}
      <div className="p-3.5 border-t border-black/10 bg-white">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            placeholder="Ask about architecture, auth, refactoring..."
            className="flex-1 resize-none rounded-xl border border-black/15 bg-neutral-50/50 px-3.5 py-2.5 text-xs text-black outline-none focus:border-black focus:bg-white"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-black text-white hover:bg-neutral-800 disabled:opacity-40 transition"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectChatDrawer;
