import Link from "next/link";
import PrintablePanel from "@/components/PrintablePanel";

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
          <PrintablePanel
            printableId={p.id}
            stlUrl={p.stl_url}
            initialColor={p.color}
          />
        </div>
      </div>
    </div>
  );
}
