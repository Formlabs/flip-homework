import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh p-6 sm:p-10 flex items-center justify-center">
      <div className="mx-auto max-w-2xl text-center">
        <div className="glass p-8">
          <h2 className="text-2xl font-semibold text-zinc-100 mb-2">
            Order not found
          </h2>
          <p className="text-zinc-400 mb-6">
            The order you're looking for doesn't exist or is invalid.
          </p>
          <Link href="/" className="btn-neon">
            ← Back to printables
          </Link>
        </div>
      </div>
    </div>
  );
}

