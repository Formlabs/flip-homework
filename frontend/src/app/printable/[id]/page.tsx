import Link from "next/link";
import { PrintableViewer } from "@/components/PrintableViewer";
import { getPrintable } from "@/lib/http/printables";
import { notFound } from "next/navigation";
import { Printable } from "@/types/printable";

export default async function PrintablePreview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let p: Printable | null = null;
  
  try {
    p = await getPrintable(id);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      notFound();
    }
    throw error;
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
            <div className="mt-4">
              <PrintableViewer 
                stlUrl={p.stl_url} 
                initialColor={p.color || "gray"} 
                printableId={p.id}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
