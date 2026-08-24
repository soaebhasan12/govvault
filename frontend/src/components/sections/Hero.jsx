export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.15),transparent_40%),radial-gradient(circle_at_80%_60%,rgba(99,102,241,0.15),transparent_40%)]" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-cyan-500/20 blur-[120px]" />

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-cyan-300 backdrop-blur-sm mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          RAG-Powered Document Intelligence
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.05]">
          Ask Government Orders
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Anything. Get Answers.
          </span>
        </h1>

        <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          GovVault turns dense policy PDFs into a searchable, cited, conversational
          knowledge base — powered by local vector embeddings and Llama 3 on Groq.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          
          <a href="#video"
            className="w-full sm:w-auto rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-3.5 font-semibold text-slate-950 hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
          >
            ▶ Watch Live Demo
          </a>
          
          <a href="#demo"
            className="w-full sm:w-auto rounded-full border border-white/15 px-8 py-3.5 font-semibold text-white hover:bg-white/5 transition-colors"
          >
            Explore UI
          </a>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto border-t border-white/10 pt-8">
          {[
            ["384", "Vector Dimensions"],
            ["3", "Chunks Retrieved"],
            ["100%", "Local Inference"],
          ].map(([stat, label]) => (
            <div key={label}>
              <div className="text-2xl font-bold text-white">{stat}</div>
              <div className="text-xs text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}