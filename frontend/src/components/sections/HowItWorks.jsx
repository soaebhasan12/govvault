const steps = [
  {
    number: '01',
    title: 'Upload the PDF',
    description:
      'Drop a government order or circular. Django stores the file and hands it to PyMuPDF for text extraction, page by page.',
  },
  {
    number: '02',
    title: 'Vectorize Locally',
    description:
      'Each page is embedded into a 384-dim vector using SentenceTransformers — no external API call, runs entirely on the local machine.',
  },
  {
    number: '03',
    title: 'Ask in Plain English',
    description:
      'Type a question. Your query is embedded the same way, then matched against stored chunks in Postgres using pgvector cosine distance.',
  },
  {
    number: '04',
    title: 'Get a Cited Answer',
    description:
      'The top-matching chunks are passed to Groq as context. The answer streams back with a direct link to the source page.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 bg-slate-950 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <span className="text-xs font-semibold text-cyan-400 tracking-widest uppercase">
            The Pipeline
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            From PDF to Answer in Four Steps
          </h2>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6">
          <div className="hidden md:block absolute top-6 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

          {steps.map(({ number, title, description }) => (
            <div key={number} className="relative">
              <div className="flex items-center gap-3 md:block">
                <span className="relative z-10 flex-shrink-0 h-12 w-12 rounded-full bg-slate-950 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-sm">
                  {number}
                </span>
                <h3 className="text-base font-semibold text-white md:mt-5">
                  {title}
                </h3>
              </div>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed md:pr-2">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}