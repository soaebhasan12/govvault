import { Link } from 'react-router-dom';
import RagDemoSection from '../components/rag-demo/RagDemoSection';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white font-semibold text-sm hover:text-cyan-300 transition-colors">
            <span>←</span> Back to Home
          </Link>
          <span className="text-sm text-slate-500">GovVault Chat</span>
        </div>
      </header>
      <RagDemoSection />
    </div>
  );
}