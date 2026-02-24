"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): JSX.Element {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-lg font-semibold text-slate-900">
        Something went wrong.
      </h2>
      <p className="max-w-md text-sm text-slate-500">
        We couldn&apos;t load the dashboard at the moment. This could be a
        temporary issue with the database connection or the network.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
      >
        Try again
      </button>
    </div>
  );
}

