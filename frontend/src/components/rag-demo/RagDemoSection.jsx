import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send, Bot, User, FileUp, Upload, Plus, PanelLeftClose,
  PanelLeftOpen, MessageSquare, FileText,
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active.messages, isSending]);

  const updateActiveSession = (patch) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === activeId ? { ...s, ...patch } : s))
    );
  };

  const handleNewChat = () => {
    const s = createSession();
    setSessions((prev) => [s, ...prev]);
    setActiveId(s.id);
    setQuery('');
    setUploadMessage('');
  };

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return setUploadMessage('Please select a PDF!');

    setIsUploading(true);
    setUploadMessage('');
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', selectedFile.name);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/documents/upload/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateActiveSession({
        docIds: [...active.docIds, res.data.id],
        docs: [...active.docs, { id: res.data.id, title: res.data.title }],
        title: active.title === 'New Chat' ? selectedFile.name.replace('.pdf', '') : active.title,
      });
      setUploadMessage('Vectorized successfully!');
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload Error:', error);
      setUploadMessage('Error uploading document.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!query.trim()) return;
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

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-950">
      {/* LEFT: Chat History Sidebar (collapsible) */}
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
            <div className="h-full flex items-center justify-center px-6">
              <p className="text-slate-600 text-sm text-center max-w-sm">
                Upload a document below, then ask a question to get started.
              </p>
            </div>
          ) : (
            active.messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-4 px-6 py-5 ${msg.sender === 'ai' ? 'bg-white/[0.03]' : ''}`}
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

        {/* Upload strip */}
        {active.docs.length > 0 && (
          <div className="px-6 pt-3 flex gap-2 flex-wrap">
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

        <div className="border-t border-white/10 p-4">
          <div className="max-w-3xl mx-auto space-y-2">
            <form onSubmit={handleUpload} className="flex gap-2 items-center">
              <label className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/10 text-xs text-slate-400 cursor-pointer hover:border-cyan-400/50 transition-colors truncate max-w-[200px]">
                <FileUp size={14} className="shrink-0" />
                <span className="truncate">{selectedFile ? selectedFile.name : 'Choose PDF'}</span>
                <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
              </label>
              <button
                type="submit"
                disabled={isUploading || !selectedFile}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-colors ${
                  isUploading || !selectedFile
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {isUploading ? <><Spinner /> Uploading</> : <><Upload size={12} /> Upload</>}
              </button>
              {uploadMessage && <span className="text-[11px] text-slate-500">{uploadMessage}</span>}
            </form>

            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about the policies..."
                className="flex-1 px-4 py-3 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <button
                onClick={handleSendMessage}
                className="h-11 w-11 shrink-0 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center hover:bg-cyan-300 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* RIGHT: PDF Viewer */}
      <aside className="w-[420px] shrink-0 border-l border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Document Viewer
        </div>
        <div className="flex-1 p-3">
          {active.activePdfUrl ? (
            <iframe
              key={active.activePdfUrl}
              src={active.activePdfUrl}
              className="w-full h-full rounded-lg border border-white/10"
              title="Document Viewer"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-600 text-xs text-center px-6">
              Citations will open here automatically.
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}