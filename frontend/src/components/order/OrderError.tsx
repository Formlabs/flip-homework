"use client";

export default function OrderError({
  error,
  id,
}: {
  error: string;
  id: string;
}) {
  return (
    <div className="min-h-dvh p-6 sm:p-10">
      <div className="mx-auto max-w-3xl">
        <div className="glass p-5 sm:p-6">
          <h1 className="text-2xl font-semibold mb-2 title-gradient">
            Order {id}
          </h1>
          <p className="text-sm text-red-300/90">{error}</p>
        </div>
      </div>
    </div>
  );
}
