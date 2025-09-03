import Link from "next/link";
import StlViewer from "@/components/StlViewer";

type Printable = {
  id: number;
  name: string;
  color?: string;
  stl_url?: string | null;
};

async function getPrintable(id: string): Promise<Printable | null> {
  try {
    const base = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";
    const res = await fetch(`${base}/api/printables/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Submits to Next.js route which redirects on success

export default async function PrintablePreview({
  params,
}: {
  params: { id: string };
}) {
  const p = await getPrintable(params.id);
  if (!p) {
    return (
      <div className="p-8">
        <p className="mb-4">Printable not found.</p>
        <Link className="text-blue-600 underline" href="/">
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh p-6 sm:p-10">
      <div className="mx-auto max-w-5xl">
        <Link className="text-sm text-zinc-300/80 hover:text-white" href="/">
          ← Back to printables
        </Link>
        <div className="glass p-5 sm:p-6 mt-4">
          <h1 className="text-2xl font-semibold mb-1 title-gradient">
            {p.name}
          </h1>
          {p.stl_url ? (
            <div className="mt-4 rounded overflow-hidden">
              <StlViewer url={p.stl_url} height={420} />
            </div>
          ) : null}
          <div className="mt-5 flex items-center justify-between">
            <div>
              {p.color ? (
                <p className="text-xs text-zinc-400 mt-0.5">Color: {p.color}</p>
              ) : null}
            </div>
            <form
              action="/api/orders"
              method="post"
              className="flex items-center gap-3"
            >
              <label className="text-sm" htmlFor="qty">
                Qty
              </label>
              <input
                id="qty"
                name="qty"
                type="number"
                min={1}
                defaultValue={1}
                className="border border-zinc-700/60 rounded px-2 py-1 w-20 bg-transparent text-zinc-100"
              />
              <input type="hidden" name="printable_id" value={p.id} />
              <button type="submit" className="btn-neon">
                Order
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
