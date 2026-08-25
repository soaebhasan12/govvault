import { Link } from 'react-router-dom';

const links = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Tech Stack', href: '#stack' },
  { label: 'Video Walkthrough', href: '#video' },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-slate-950">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-slate-950">
                G
              </div>
              <span className="font-bold text-lg text-white tracking-tight">
                Gov<span className="text-cyan-400">Vault</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-500 leading-relaxed max-w-xs">
              A local-first RAG assistant for government documents — built as
              a hackathon project, running entirely on local inference.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Explore
            </h4>
            <ul className="mt-4 space-y-3">
              {links.map(({ label, href }) => (
                <li key={label}>
                  
                  <a href={href}
                    className="text-sm text-slate-400 hover:text-cyan-300 transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  to="/chat"
                  className="text-sm text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  Live Demo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Source
            </h4>
            
            <a href="https://github.com/soaebhasan12"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <svg className="h-4 w-4 current">
                <use href="/icons.svg#github-icon" />
              </svg>
              View on GitHub
            </a>
            <p className="mt-4 text-xs text-slate-600 leading-relaxed">
              Backend runs locally (Django + pgvector + Groq). This deployed
              site is a showcase SPA — see the video walkthrough for the
              full pipeline in action.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} GovVault. Built for a hackathon, not for production.
          </p>
          <p className="text-xs text-slate-600">
            384-dim local embeddings · Groq inference · pgvector search
          </p>
        </div>
      </div>
    </footer>
  );
}