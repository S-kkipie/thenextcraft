export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-zinc-500 dark:border-white/15">
        proof-of-work hiring
      </span>
      <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">
        thenextcraft
      </h1>
      <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        Las startups publican retos de negocio reales. Los builders shipean su
        solución. La IA rankea, la startup contrata — por lo que construiste, no
        por tu CV.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-zinc-500">
        {["reto", "ship", "shortlist", "hire"].map((step, i, a) => (
          <span key={step} className="flex items-center gap-2">
            {step}
            {i < a.length - 1 && <span className="text-zinc-300">→</span>}
          </span>
        ))}
      </div>
    </main>
  );
}
