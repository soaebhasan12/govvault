import { FileSearch, Cpu, Boxes, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: Cpu,
    title: 'Local Embeddings, Zero API Cost',
    description:
      'Every document is vectorized on-device using SentenceTransformers (paraphrase-MiniLM-L3-v2) — no OpenAI embedding calls, no per-page billing.',
    stat: '384-dim',
    statLabel: 'vector space',
  },
  {
    icon: Boxes,
    title: 'pgvector-Backed Retrieval',
    description:
      'Chunks live in Postgres with pgvector, ranked by cosine distance. A relevance threshold filters noise before it ever reaches the LLM.',
    stat: '< 0.8',
    statLabel: 'distance cutoff',
  },
  {
    icon: FileSearch,
    title: 'Cited, Page-Level Answers',
    description:
      "Every answer traces back to the exact page it came from — the PDF viewer jumps straight to the source, so you can verify, not just trust.",
    stat: 'Top-5',
    statLabel: 'chunks retrieved',
  },
  {
    icon: ShieldCheck,
    title: 'Session-Isolated Documents',
    description:
      "Each chat session scopes retrieval to its own uploaded document_ids — one citizen's policy query never leaks context from another's session.",
    stat: '100%',
    statLabel: 'session isolation',
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-24 bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.08),transparent_50%)]" />

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-cyan-400 tracking-widest uppercase">
            Under the Hood
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Built for Trust, Not Just Answers
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Government documents demand traceability. Every layer of GovVault
            is designed so you can see exactly where an answer came from.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map(({ icon: Icon, title, description, stat, statLabel }) => (
            <div
              key={title}
              className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-sm hover:border-cyan-400/30 hover:bg-white/[0.05] transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="h-11 w-11 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-300 group-hover:bg-cyan-400/20 transition-colors">
                  <Icon size={20} />
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">{stat}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                    {statLabel}
                  </div>
                </div>
              </div>

              <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}