import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-slate-950">
            G
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            Gov<span className="text-cyan-400">Vault</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link to="/chat" className="hover:text-white transition-colors">Live Demo</Link>
          <a href="#video" className="hover:text-white transition-colors">Video Walkthrough</a>
          <a href="#stack" className="hover:text-white transition-colors">Tech Stack</a>
        </div>

        
        <Link
          to="/chat"
          className="rounded-full bg-white text-slate-950 px-4 py-2 text-sm font-semibold hover:bg-cyan-300 transition-colors"
        >
          Try It
        </Link>
      </div>
    </nav>
  );
}