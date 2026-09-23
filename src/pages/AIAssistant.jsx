import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, MessageSquarePlus, Send, Trash2, Sparkles, PanelLeftClose, PanelLeft, Paperclip, X, FileCode2, Image as ImageIcon } from 'lucide-react';
import { geminiAPI, projectsAPI } from '../utils/api';

const suggestions = ['Explain React hooks', 'Help me debug this JavaScript code', 'Explain JWT authentication', 'Help me prepare for a technical interview'];
const allowedExtensions = new Set(['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'txt', 'md', 'csv', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg']);
const imageExtensions = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg']);
const fileExtension = file => file.name.split('.').pop()?.toLowerCase() || '';
const formatBytes = bytes => bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;

const AIAssistant = () => {
  const [conversations, setConversations] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const endRef = useRef(null);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const [history, projectList] = await Promise.all([geminiAPI.getConversations(), projectsAPI.getAll()]);
      setConversations(history);
      setProjects(projectList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadConversations(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversation?.messages, sending]);

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
      setError(err.message);
    }
  };

  const sendMessage = async (event) => {
    event?.preventDefault();
    const message = input.trim();
    if (!message || sending) return;
    try {
      setSending(true);
      setError('');
      setInput('');
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
        const item = { id: result.conversation.id, title: result.conversation.title, projectId: result.conversation.projectId, updatedAt: result.conversation.updatedAt, messageCount: result.conversation.messages.length };
        return [item, ...previous.filter(existing => existing.id !== item.id)];
      });
      removeAttachment();
    } catch (err) {
      setError(err.message);
      setInput(message);
    } finally {
      setSending(false);
    }
  };

  const deleteConversation = async (id) => {
    try {
      await geminiAPI.deleteConversation(id);
      setConversations(previous => previous.filter(item => item.id !== id));
      if (conversation?.id === id) newChat();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto h-[calc(100vh-88px)] min-h-[620px]">
      <div className="h-full bg-white border border-black/10 rounded-2xl shadow-elevation-1 overflow-hidden flex">
        <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} shrink-0 overflow-hidden border-r border-black/10 transition-all duration-200`}>
          <div className="w-72 h-full p-4 flex flex-col">
            <button onClick={newChat} className="btn-primary w-full inline-flex items-center justify-center gap-2"><MessageSquarePlus className="w-4 h-4" /> New chat</button>
            <p className="text-xs font-semibold text-black/40 uppercase tracking-wide mt-6 mb-2">History</p>
            <div className="flex-1 overflow-y-auto space-y-1">{loading ? <p className="text-sm text-black/50 p-2">Loading chats...</p> : conversations.map(item => <div key={item.id} className={`group flex items-center gap-1 rounded-lg ${conversation?.id === item.id ? 'bg-black text-white' : 'hover:bg-neutral-50'}`}><button onClick={() => openConversation(item.id)} className="flex-1 min-w-0 text-left px-3 py-2"><span className="block text-sm font-medium truncate">{item.title}</span><span className={`block text-xs mt-1 ${conversation?.id === item.id ? 'text-white/55' : 'text-black/40'}`}>{item.messageCount} messages</span></button><button onClick={() => deleteConversation(item.id)} className={`p-2 mr-1 opacity-0 group-hover:opacity-100 ${conversation?.id === item.id ? 'text-white/55 hover:text-white' : 'text-black/35 hover:text-red-500'}`} title="Delete conversation"><Trash2 className="w-4 h-4" /></button></div>)}{!loading && conversations.length === 0 && <p className="text-sm text-black/50 p-2">No conversations yet.</p>}</div>
          </div>
        </aside>
        <main className="flex-1 min-w-0 flex flex-col">
          <header className="px-5 py-4 border-b border-black/10 flex items-center justify-between gap-4"><div className="flex items-center gap-3"><button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-neutral-100" title="Toggle conversation history">{sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}</button><div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center"><Sparkles className="w-5 h-5 text-white" /></div><div><h1 className="font-bold text-black">CollabSphere AI</h1><p className="text-xs text-black/50">Ask anything. Get help with your projects, code, and workspace context.</p></div></div><select value={projectId} onChange={event => setProjectId(event.target.value)} className="input-field w-44 text-sm"><option value="">No project context</option>{projects.map(project => <option key={project._id} value={project._id}>{project.name}</option>)}</select></header>
          <div className="flex-1 overflow-y-auto p-5 lg:p-8">{error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}{!conversation?.messages?.length ? <div className="max-w-2xl mx-auto text-center py-12"><div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center mx-auto mb-5"><Bot className="w-8 h-8 text-white" /></div><h2 className="text-2xl font-bold text-black">How can I help you today?</h2><p className="text-black/50 mt-2">CollabSphere AI can explain concepts, review code, and help with your authorized project context.</p><div className="grid sm:grid-cols-2 gap-3 mt-8">{suggestions.map(suggestion => <button key={suggestion} onClick={() => setInput(suggestion)} className="text-left p-3 rounded-xl border border-black/10 text-sm text-black/70 hover:border-black hover:bg-neutral-50">{suggestion}</button>)}</div></div> : <div className="max-w-3xl mx-auto space-y-6">{conversation.messages.map(message => <div key={message._id || `${message.role}-${message.createdAt}`} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === 'user' ? 'bg-black text-white' : 'bg-neutral-50 text-black/80 border border-black/10'}`}>{message.role === 'assistant' ? <div className="prose prose-sm max-w-none"><ReactMarkdown>{message.content}</ReactMarkdown></div> : <p className="whitespace-pre-wrap text-sm">{message.content}</p>}</div></div>)}{sending && <div className="flex items-center gap-2 text-sm text-black/50"><Bot className="w-4 h-4 text-black" /> CollabSphere AI is thinking...</div>}<div ref={endRef} /></div>}</div>
          <form onSubmit={sendMessage} className="p-4 border-t border-black/10">
            <div className="max-w-3xl mx-auto space-y-3">
              {attachment && <div className="flex items-center gap-3 rounded-xl border border-black/10 bg-neutral-50 p-3"><div className="w-12 h-12 rounded-lg bg-white border border-black/10 flex items-center justify-center overflow-hidden">{attachmentPreview ? <img src={attachmentPreview} alt="Selected attachment preview" className="w-full h-full object-cover" /> : <FileCode2 className="w-6 h-6 text-black" />}</div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-black/80 truncate">{attachment.name}</p><p className="text-xs text-black/50">{fileExtension(attachment).toUpperCase()} · {formatBytes(attachment.size)}</p></div><button type="button" onClick={removeAttachment} className="p-2 rounded-lg hover:bg-white text-black/50" title="Remove attachment"><X className="w-4 h-4" /></button></div>}
              <div className="flex items-end gap-3"><input id="ai-attachment" type="file" className="hidden" accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.html,.css,.json,.txt,.md,.csv,.png,.jpg,.jpeg,.webp,.gif,.svg" onChange={chooseAttachment} /><label htmlFor="ai-attachment" className="h-11 w-11 shrink-0 rounded-xl border border-black/10 hover:bg-neutral-50 flex items-center justify-center cursor-pointer" title="Attach file"><Paperclip className="w-5 h-5 text-black/60" /></label><textarea value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(event); } }} disabled={sending} rows={2} className="input-field resize-none" placeholder="Ask CollabSphere AI anything..." /><button disabled={sending || !input.trim()} className="btn-primary h-11 px-4 inline-flex items-center gap-2 disabled:opacity-50"><Send className="w-4 h-4" /> Send</button></div>
              <p className="text-xs text-black/40">Enter to send · Shift + Enter for a new line · Attachments up to 10 MB</p>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AIAssistant;
