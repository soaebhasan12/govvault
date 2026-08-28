import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send, Bot, User, FileUp, Plus, PanelLeftClose,
  PanelLeftOpen, MessageSquare, FileText, Paperclip, X,
} from 'lucide-react';
import Spinner from '../Spinner';

const createSession = () => ({
  id: crypto.randomUUID(),
  title: 'New Chat',
  messages: [],
  docIds: [],
  docs: [],
  activePdfUrl: null,
});

export default function RagDemoSection() {
  const [sessions, setSessions] = useState([createSession()]);
  const [activeId, setActiveId] = useState(sessions[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [query, setQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  const active = sessions.find((s) => s.id === activeId);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active.messages, isSending]);

  // Auto-grow the textarea as the user types, capped at a max height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [query]);

  const updateActiveSession = (patch) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === activeId ? { ...s, ...patch } : s))
    );
  };

  const handleNewChat = () => {
    // Don't stack up empty chats — ChatGPT/Claude-style dedupe
    if (active.messages.length === 0 && active.docs.length === 0) {
      textareaRef.current?.focus();
      return;
    }
    const s = createSession();
    setSessions((prev) => [s, ...prev]);
    setActiveId(s.id);
    setQuery('');
    setUploadMessage('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      handleUpload(file);
    }
  };

  const handleUpload = async (file) => {
    setIsUploading(true);
    setUploadMessage('Uploading...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/documents/upload/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const docId = res.data.id;

      // Show the PDF immediately at page 1 — don't wait for vectorization
      updateActiveSession({
        docIds: [...active.docIds, docId],
        docs: [...active.docs, { id: docId, title: res.data.title, status: 'processing' }],
        activePdfUrl: `${res.data.file}#page=1`,
        title: active.title === 'New Chat' ? file.name.replace(/\.pdf$/i, '') : active.title,
      });
      setUploadMessage('Processing document...');
      setSelectedFile(null);

      // Poll in the background until vectorization completes
      const poll = setInterval(async () => {
        try {
          const statusRes = await axios.get(`${import.meta.env.VITE_API_URL}/documents/${docId}/status/`);
          if (statusRes.data.status === 'completed') {
            clearInterval(poll);
            setUploadMessage('Ready to chat!');
            setIsUploading(false);
            setTimeout(() => setUploadMessage(''), 2500);
          } else if (statusRes.data.status === 'failed') {
            clearInterval(poll);
            setUploadMessage('Processing failed. Try another file.');
            setIsUploading(false);
          }
        } catch {
          clearInterval(poll);
          setIsUploading(false);
        }
      }, 1500);
    } catch (error) {
      console.error('Upload Error:', error);
      setUploadMessage('Error uploading document.');
      setIsUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!query.trim() || isSending) return;
    const userMsg = { sender: 'user', text: query };
    const newMessages = [...active.messages, userMsg];
    updateActiveSession({ messages: newMessages });
    setQuery('');
    setIsSending(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/chat/`, {
        query: userMsg.text,
        document_ids: active.docIds,
      });
      updateActiveSession({
        messages: [...newMessages, { sender: 'ai', text: response.data.answer }],
        activePdfUrl: response.data.source_pdf_url || active.activePdfUrl,
      });
    } catch (error) {
      console.error('Chat Error:', error);
      updateActiveSession({
        messages: [...newMessages, { sender: 'ai', text: 'Sorry, network connection error.' }],
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-950">
      {/* LEFT: Chat History Sidebar */}
      <aside
        className={`shrink-0 border-r border-white/10 flex flex-col transition-all duration-200 ${
          sidebarOpen ? 'w-64' : 'w-0'
        } overflow-hidden`}
      >
        <div className="p-3 border-b border-white/10">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
          >
            <Plus size={16} /> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-xs truncate transition-colors ${
                s.id === activeId
                  ? 'bg-cyan-400/10 text-cyan-300'
                  : 'text-slate-400 hover:bg-white/5'
              }`}
            >
              <MessageSquare size={14} className="shrink-0" />
              <span className="truncate">{s.title}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* MIDDLE: Chat */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="h-12 shrink-0 border-b border-white/10 flex items-center gap-3 px-4">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="text-slate-500 hover:text-white transition-colors"
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
          <span className="text-xs text-slate-500 truncate">{active.title}</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {active.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-6 gap-4">
              <div className="h-12 w-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center text-cyan-300">
                <Bot size={22} />
              </div>
              <p className="text-slate-500 text-sm text-center max-w-sm">
                Attach a PDF using the paperclip below, then ask a question about it.
              </p>
            </div>
          ) : (
            active.messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-4 px-6 py-5 transition-opacity duration-300 ${msg.sender === 'ai' ? 'bg-white/[0.03]' : ''}`}
              >
                <div
                  className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                    msg.sender === 'ai' ? 'bg-cyan-400 text-slate-950' : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {msg.sender === 'ai' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className="flex-1 min-w-0 text-sm text-slate-200 leading-relaxed">
                  {msg.sender === 'ai' ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))
          )}
          {isSending && (
            <div className="flex gap-4 px-6 py-5 bg-white/[0.03]">
              <div className="shrink-0 h-8 w-8 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                <Bot size={16} />
              </div>
              <span className="inline-flex gap-1 items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce" />
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <div className="border-t border-white/10 p-4">
          <div className="max-w-3xl mx-auto">
            {active.docs.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                {active.docs.map((doc) => (
                  <span
                    key={doc.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 text-slate-400 text-[11px]"
                  >
                    <FileText size={12} className="text-cyan-400" />
                    {doc.title}
                  </span>
                ))}
              </div>
            )}

            {uploadMessage && (
              <div className="mb-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                {isUploading && <Spinner />} {uploadMessage}
              </div>
            )}

            <div className="flex items-end gap-2 rounded-2xl bg-white/5 border border-white/10 focus-within:border-cyan-400/50 transition-colors px-2 py-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors disabled:opacity-40"
                title="Attach PDF"
              >
                <Paperclip size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <textarea
                ref={textareaRef}
                rows={1}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about the policies..."
                className="flex-1 resize-none bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none py-1.5 max-h-40"
              />

              <button
                onClick={handleSendMessage}
                disabled={!query.trim() || isSending}
                className="shrink-0 h-9 w-9 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center hover:bg-cyan-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* RIGHT: PDF Viewer */}
      <aside className="w-[45%] max-w-[720px] min-w-[380px] shrink-0 border-l border-white/10 flex flex-col">
        <div className="h-12 shrink-0 border-b border-white/10 flex items-center px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Document Viewer
        </div>
        <div className="flex-1 p-3">
          {active.activePdfUrl ? (
            <iframe
              key={active.activePdfUrl}
              src={active.activePdfUrl}
              className="w-full h-full rounded-lg border border-white/10 bg-slate-900"
              title="Document Viewer"
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-600 text-xs text-center px-6">
              <FileUp size={28} className="text-slate-700" />
              Upload a PDF to preview it here.
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}