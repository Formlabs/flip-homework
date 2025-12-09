"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-dvh p-6 sm:p-10 flex items-center justify-center">
      <div className="mx-auto max-w-2xl text-center">
        <div className="glass p-8">
          <h2 className="text-2xl font-semibold text-red-400 mb-4">
            Something went wrong
          </h2>
          <p className="text-zinc-300 mb-6">
            {error.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={reset}
            className="btn-neon"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

