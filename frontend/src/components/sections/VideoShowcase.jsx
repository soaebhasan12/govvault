export default function VideoShowcase() {
  return (
    <section id="video" className="relative py-24 bg-slate-950">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-cyan-400 tracking-widest uppercase">
            See It In Action
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Live Backend Walkthrough
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Full local RAG pipeline — PDF upload, vector search, and Groq-powered
            answers, recorded end-to-end.
          </p>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-cyan-500/10">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 blur-2xl -z-10" />
          <div className="aspect-video bg-slate-900">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
              title="GovVault Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}