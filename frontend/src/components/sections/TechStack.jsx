const stack = [
  {
    category: 'Frontend',
    items: [
      { name: 'React (Vite)', slug: 'react' },
      { name: 'Tailwind CSS v4', slug: 'tailwindcss' },
      { name: 'Axios', slug: 'axios' },
      { name: 'React Router', slug: 'reactrouter' },
    ],
  },
  {
    category: 'Backend',
    items: [
      { name: 'Django + DRF', slug: 'django' },
      { name: 'PostgreSQL', slug: 'postgresql' },
      { name: 'pgvector', slug: null },
    ],
  },
  {
    category: 'AI / ML',
    items: [
      { name: 'SentenceTransformers', slug: 'huggingface' },
      { name: 'Groq (openai/gpt-oss-20b)', slug: null },
      { name: 'PyMuPDF', slug: null },
    ],
  },
  {
    category: 'Infra',
    items: [
      { name: 'Docker', slug: 'docker' },
      { name: 'Local Media Serving', slug: null },
    ],
  },
];

export default function TechStack() {
  return (
    <section id="stack" className="relative py-24 bg-slate-950">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-cyan-400 tracking-widest uppercase">
            The Stack
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Every Layer, Chosen on Purpose
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            No managed vector DB, no paid embedding API. GovVault runs its
            full RAG pipeline on infrastructure you can inspect and own.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stack.map(({ category, items }) => (
            <div
              key={category}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-colors duration-300 hover:border-cyan-400/30"
            >
              <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                {category}
              </h3>
              <ul className="mt-3 space-y-2.5">
                {items.map(({ name, slug }) => (
                  <li key={name} className="flex items-center gap-2.5 text-sm text-slate-400">
                    {slug ? (
                      <img
                        src={`https://cdn.simpleicons.org/${slug}/ffffff`}
                        alt=""
                        className="h-4 w-4 opacity-70 flex-shrink-0"
                      />
                    ) : (
                      <span className="h-1 w-1 rounded-full bg-slate-600 flex-shrink-0" />
                    )}
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}