import { UploadForm } from "@/components/UploadForm";
import Link from "next/link";

export const metadata = {
  title: "Upload Printable - Formlabs 3D Store",
  description: "Upload your own STL file to create a custom printable",
};

export default function UploadPage() {
  return (
    <div className="min-h-dvh p-6 sm:p-10">
      <main className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm text-zinc-300/80 hover:text-white mb-4 inline-block"
        >
          ← Back to printables
        </Link>

        <header className="mb-8">
          <h1 className="title-gradient text-3xl sm:text-4xl font-semibold tracking-tight">
            Upload Your Printable
          </h1>
          <p className="text-sm text-zinc-300/80 mt-2">
            Upload your own STL file and customize it for 3D printing
          </p>
        </header>

        <div className="glass p-6 sm:p-8">
          <UploadForm />
        </div>
      </main>
    </div>
  );
}





