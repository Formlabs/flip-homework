import Link from "next/link";
import { getPrintables } from "@/lib/http/printables";

export default async function Home() {
  const printables = await getPrintables();
  return (
    <div className="min-h-dvh p-6 sm:p-10">
      <main className="mx-auto max-w-5xl">
        <header className="mb-8 sm:mb-12">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
          <h1 className="title-gradient text-3xl sm:text-4xl font-semibold tracking-tight">
            Formlabs Internal 3D Printables
          </h1>
          <p className="text-sm text-zinc-300/80 mt-2">
            Futuristic printables. Instant previews. Smooth finishes.
          </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/orders"
                className="px-4 py-2 border border-zinc-700/60 rounded-lg text-zinc-300 hover:bg-zinc-800/50 transition-all whitespace-nowrap"
              >
                📋 My Orders
              </Link>
              <Link
                href="/upload"
                className="btn-neon whitespace-nowrap"
              >
                + Upload STL
              </Link>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {printables.map((p) => (
            <div
              key={p.id}
              className="glass p-4 sm:p-5 hover:shadow-2xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-zinc-100">{p.name}</h3>
              </div>
              <div className="flex items-center justify-between mt-3">
                <Link href={`/printable/${p.id}`} className="btn-neon">
                  Preview
                </Link>
              </div>
            </div>
          ))}
        </section>

        <p className="text-xs text-zinc-400 mt-4">
          Tip: Open a printable to see the interactive 3D model viewer.
        </p>
      </main>
    </div>
  );
}
