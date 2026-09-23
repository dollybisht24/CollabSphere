import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Bot, MessageSquarePlus, Send, Trash2, Sparkles,
  PanelLeftClose, PanelLeft, Paperclip, X, FileCode2,
  Image as ImageIcon, ArrowRight, CornerDownLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { geminiAPI, projectsAPI } from '../../utils/api';

const suggestions = [
  'Explain React hooks & state patterns',
  'Help me debug this JavaScript code',
  'Explain JWT authentication & session security',
  'How to design a scalable full-stack architecture'
];

const guestMockAnswers = {
  'Explain React hooks & state patterns':
`### React Hooks & Modern State Patterns

React Hooks enable functional components to manage local state, lifecycle events, and shared logic without class components.

#### 1. Fundamental Hooks
- **\`useState\`**: Declares reactive local state.
\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`
- **\`useEffect\`**: Handles side effects such as data fetching, subscriptions, and DOM updates. Always include dependencies in the array!
\`\`\`javascript
useEffect(() => {
  const fetchData = async () => {
    const res = await fetch('/api/data');
    setData(await res.json());
  };
  fetchData();
}, []); // Empty array runs on mount
\`\`\`

#### 2. Advanced State Patterns
- **\`useMemo\` & \`useCallback\`**: Prevent unnecessary re-computations and callback recreation across renders.
- **\`useReducer\`**: Manages complex state transitions with a reducer function, ideal for complex form state or multi-step flows.
- **Custom Hooks**: Encapsulate reusable logic (e.g. \`useDebounce\`, \`useLocalStorage\`, \`useFetch\`).`,

  'Help me debug this JavaScript code':
`### JavaScript Debugging Strategy

To effectively diagnose issues in JavaScript, follow this systematic approach:

1. **Check the Execution Context**:
   - Verify asynchronous execution: Did you \`await\` the Promise? Is there an unhandled rejection?
   - Check scope and closures: Are values captured before an update?

2. **Common Culprits**:
   - *Undefined object property access*: Use optional chaining (\`user?.profile?.name\`).
   - *State mutation*: In React, never mutate state directly (\`list.push(item)\`); always create a new reference (\`[...list, item]\`).
   - *Equality checks*: Prefer strict equality (\`===\`) over loose equality (\`==\`).

3. **Console Inspection**:
\`\`\`javascript
console.log('Current payload:', JSON.stringify(data, null, 2));
console.trace('Call stack trace');
\`\`\`

Paste your specific code snippet here, and I'll analyze syntax, race conditions, and edge cases!`,

  'Explain JWT authentication & session security':
`### JSON Web Token (JWT) Authentication Overview

JSON Web Tokens (JWT) provide a compact, self-contained way to securely transmit information between parties as a JSON object.

#### Token Anatomy: \`header.payload.signature\`
1. **Header**: Specifies token type and signing algorithm (e.g. \`HS256\` or \`RS256\`).
2. **Payload**: Contains claims (e.g. \`userId\`, \`role\`, \`exp\`). *Note: Payloads are Base64 encoded, not encrypted.*
3. **Signature**: Cryptographic hash verifying the token was not tampered with.

#### Best Practices:
- **Short-Lived Access Tokens**: Keep access token expiration short (e.g. 15 minutes).
- **Secure Storage**: Store refresh tokens in \`HttpOnly\`, \`Secure\`, \`SameSite=Strict\` cookies to mitigate XSS attacks.
- **Verification Middleware**: Verify the token signature on every protected backend route before attaching \`req.userId\`.`,

  'How to design a scalable full-stack architecture':
`### Scalable Full-Stack Architecture Principles

A modern, scalable web architecture decouples frontend presentation from backend compute and data persistence.

#### 1. Architecture Layers:
- **Client Tier**: React SPA or Next.js SSR with client-side caching and responsive state management.
- **API Gateway**: Handles rate limiting, authentication verification, CORS, and request routing.
- **Service / Application Layer**: Stateless Node.js / Express microservices or modular monolith.
- **Database & Cache**: Primary persistence (MongoDB / PostgreSQL) paired with Redis for caching and session management.

#### 2. Scaling Dimensions:
- **Stateless Services**: Enable seamless horizontal scaling across Docker containers and Kubernetes pods.
- **Database Indexing**: Ensure high-traffic query fields have compound indexes.
- **Background Jobs**: Offload heavy computational work (emailing, media processing) to message queues (BullMQ / RabbitMQ).`
};

const allowedExtensions = new Set(['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'txt', 'md', 'csv', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg']);
const imageExtensions = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg']);
const fileExtension = file => file.name.split('.').pop()?.toLowerCase() || '';
const formatBytes = bytes => bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;

const HomeAIView = ({ onNavigate }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const endRef = useRef(null);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [history, projectList] = await Promise.all([
        geminiAPI.getConversations().catch(() => []),
        projectsAPI.getAll().catch(() => [])
      ]);
      setConversations(history || []);
      setProjects(projectList || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages, sending]);

  const newChat = () => {
    setConversation(null);
    setInput('');
    setError('');
    setAttachment(null);
    setAttachmentPreview('');
  };

  const chooseAttachment = event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const extension = fileExtension(file);
    if (!allowedExtensions.has(extension)) return setError('This file type is not supported.');
    if (file.size > 10 * 1024 * 1024) return setError('Files must be 10 MB or smaller.');
    setError('');
    setAttachment(file);
    setAttachmentPreview(imageExtensions.has(extension) ? URL.createObjectURL(file) : '');
  };

  const removeAttachment = () => {
    if (attachmentPreview) URL.revokeObjectURL(attachmentPreview);
    setAttachment(null);
    setAttachmentPreview('');
  };

  const openConversation = async (id) => {
    try {
      setError('');
      const result = await geminiAPI.getConversation(id);
      setConversation(result.conversation);
      setProjectId(result.conversation.projectId || '');
    } catch (err) {
      setError(err.message || 'Failed to load conversation');
    }
  };

  const deleteConversation = async (id) => {
    try {
      await geminiAPI.deleteConversation(id);
      setConversations(prev => prev.filter(item => item.id !== id));
      if (conversation?.id === id) newChat();
    } catch (err) {
      setError(err.message || 'Failed to delete conversation');
    }
  };

  const handleSendMessage = async (textToSend) => {
    const message = (textToSend || input).trim();
    if (!message || sending) return;

    setError('');
    setInput('');
    setSending(true);

    if (!user) {
      // Guest response
      const answer = guestMockAnswers[message] ||
        `### CollabSphere AI Response\n\nYou asked:\n> "${message}"\n\nI can analyze code, answer architectural questions, and explain system design concepts.\n\n💡 **Tip:** Sign in to your CollabSphere account to upload your actual code files, chat across persistent sessions, and enable project-aware AI context!`;

      setTimeout(() => {
        setConversation(prev => {
          const currentMessages = prev?.messages || [];
          return {
            id: 'guest-chat',
            title: message.slice(0, 30) + '...',
            messages: [
              ...currentMessages,
              { role: 'user', content: message, _id: `u-${Date.now()}` },
              { role: 'assistant', content: answer, _id: `a-${Date.now()}` }
            ]
          };
        });
        removeAttachment();
        setSending(false);
      }, 700);
      return;
    }

    try {
      let attachmentId;
      if (attachment) {
        const uploaded = projectId
          ? await projectsAPI.uploadFile(projectId, attachment)
          : await geminiAPI.uploadAttachment(attachment, conversation?.id);
        attachmentId = uploaded.file?._id || uploaded.file?.id || uploaded.attachment?.id;
      }

      const result = await geminiAPI.chat(message, conversation?.id, projectId || undefined, attachmentId);
      setConversation(result.conversation);
      setConversations(previous => {
        const item = {
          id: result.conversation.id,
          title: result.conversation.title,
          projectId: result.conversation.projectId,
          updatedAt: result.conversation.updatedAt,
          messageCount: result.conversation.messages.length
        };
        return [item, ...previous.filter(existing => existing.id !== item.id)];
      });
      removeAttachment();
    } catch (err) {
      setError(err.message || 'Unable to generate an AI response');
      setInput(message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 space-y-6"
    >
      {/* Header section styled like Home */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-6 border-b border-black/10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-neutral-50 px-3 py-1 text-xs font-semibold uppercase tracking-[.18em] text-black/60 mb-3">
            <Bot className="h-3.5 w-3.5" /> Project-Aware AI
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
            CollabSphere AI Assistant
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/60 sm:text-base">
            Ask technical questions, debug algorithms, explain dependencies, and query authorized project files.
          </p>
        </div>

        {user && projects.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-black/50">Project context:</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-medium text-black shadow-sm outline-none focus:border-black"
            >
              <option value="">Global (General knowledge)</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main chat window container */}
      <div className="rounded-3xl border border-black/10 bg-white shadow-[0_16px_50px_rgba(0,0,0,.06)] overflow-hidden flex h-[680px]">
        {/* Left Sidebar (Conversations) */}
        <aside
          className={`${
            sidebarOpen ? 'w-64 sm:w-72' : 'w-0'
          } shrink-0 overflow-hidden border-r border-black/10 bg-neutral-50/70 transition-all duration-200 flex flex-col`}
        >
          <div className="p-4 border-b border-black/10 flex items-center justify-between">
            <button
              onClick={newChat}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 transition"
            >
              <MessageSquarePlus className="h-4 w-4" /> New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <p className="px-2 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-black/40">
              History
            </p>
            {loading ? (
              <p className="p-3 text-xs text-black/40">Loading history...</p>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-xs text-black/50">No chat history yet.</p>
                {!user && (
                  <p className="mt-2 text-[11px] leading-4 text-black/40">
                    Sign in to preserve your chat history across browser sessions.
                  </p>
                )}
              </div>
            ) : (
              conversations.map((item) => (
                <div
                  key={item.id}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs transition cursor-pointer ${
                    conversation?.id === item.id
                      ? 'bg-black text-white font-semibold'
                      : 'text-black/75 hover:bg-neutral-200/60'
                  }`}
                  onClick={() => openConversation(item.id)}
                >
                  <span className="truncate flex-1 min-w-0 mr-2">{item.title}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(item.id);
                    }}
                    className={`rounded p-1 opacity-0 group-hover:opacity-100 transition ${
                      conversation?.id === item.id
                        ? 'text-white/60 hover:text-white'
                        : 'text-black/40 hover:text-red-600'
                    }`}
                    title="Delete chat"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {!user && (
            <div className="p-3 border-t border-black/10 bg-white/60">
              <p className="text-[11px] leading-4 text-black/50">
                💡 <span className="font-semibold text-black">Guest Preview</span>: Sign in to save chats and attach project files.
              </p>
            </div>
          )}
        </aside>

        {/* Right / Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Top chat subheader */}
          <div className="flex items-center justify-between border-b border-black/10 px-5 py-3.5 bg-neutral-50/40">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-lg p-1.5 text-black/50 hover:bg-neutral-200/50 hover:text-black transition"
                title={sidebarOpen ? 'Collapse sidebar' : 'Open history sidebar'}
              >
                {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
              </button>
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-black text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-black">CollabSphere AI</p>
                <p className="text-[10px] text-black/45">Powered by Gemini · Context aware</p>
              </div>
            </div>

            {conversation?.messages?.length > 0 && (
              <button
                onClick={newChat}
                className="text-xs font-medium text-black/50 hover:text-black transition"
              >
                Clear view
              </button>
            )}
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 flex items-center justify-between">
                <span>{error}</span>
                <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {!conversation?.messages?.length ? (
              <div className="my-auto flex flex-col items-center justify-center text-center py-10 max-w-xl mx-auto space-y-4">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-black text-white shadow-lg">
                  <Bot className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-black">How can I assist your code today?</h2>
                  <p className="mt-1 text-xs text-black/55">
                    Ask code questions, refactor functions, or explore developer best practices.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-2.5 w-full pt-4 text-left">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSendMessage(suggestion)}
                      className="group flex flex-col justify-between rounded-xl border border-black/10 bg-neutral-50/50 p-3.5 text-xs font-medium text-black/75 transition hover:-translate-y-0.5 hover:border-black/30 hover:bg-white hover:shadow-sm"
                    >
                      <span>{suggestion}</span>
                      <ArrowRight className="h-3.5 w-3.5 mt-3 text-black/30 group-hover:text-black transition" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              conversation.messages.map((message) => {
                const isUser = message.role === 'user';
                return (
                  <div
                    key={message._id || `${message.role}-${message.createdAt || Math.random()}`}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-sm ${
                        isUser
                          ? 'bg-black text-white rounded-br-none'
                          : 'border border-black/10 bg-neutral-50 text-black/85 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      ) : (
                        <div className="prose prose-sm max-w-none prose-pre:bg-black prose-pre:text-white prose-code:text-black">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {sending && (
              <div className="flex items-center gap-2.5 text-xs text-black/60 pt-2">
                <div className="grid h-6 w-6 place-items-center rounded-lg bg-black text-white animate-pulse">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <span>CollabSphere AI is thinking...</span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Attachment Preview (if selected) */}
          {attachment && (
            <div className="mx-4 mb-2 flex items-center gap-3 rounded-xl border border-black/10 bg-neutral-50 p-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg border border-black/10 bg-white">
                {attachmentPreview ? (
                  <img src={attachmentPreview} alt="Preview" className="h-full w-full object-cover rounded-lg" />
                ) : (
                  <FileCode2 className="h-5 w-5 text-black/70" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-black truncate">{attachment.name}</p>
                <p className="text-[10px] text-black/50">{formatBytes(attachment.size)}</p>
              </div>
              <button
                type="button"
                onClick={removeAttachment}
                className="rounded-lg p-1.5 text-black/40 hover:bg-white hover:text-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-black/10 bg-neutral-50/20">
            <div className="flex items-end gap-2.5">
              <input
                id="home-ai-file"
                type="file"
                className="hidden"
                accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.html,.css,.json,.txt,.md,.csv,.png,.jpg,.jpeg,.webp,.gif,.svg"
                onChange={chooseAttachment}
              />
              <label
                htmlFor="home-ai-file"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-black/10 bg-white text-black/55 hover:border-black/30 hover:text-black cursor-pointer transition shadow-sm"
                title="Attach code, markdown, or image file"
              >
                <Paperclip className="h-4 w-4" />
              </label>

              <div className="relative flex-1">
                <textarea
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                  placeholder="Ask CollabSphere AI anything... (Press Enter to send)"
                  className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-2.5 text-xs sm:text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              <button
                onClick={() => handleSendMessage()}
                disabled={sending || (!input.trim() && !attachment)}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-black text-white hover:bg-neutral-800 disabled:opacity-40 transition shadow-sm"
                title="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-black/40">
              CollabSphere AI is designed to understand code structure and project context.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HomeAIView;
