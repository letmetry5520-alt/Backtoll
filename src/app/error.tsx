"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Something went wrong!</h2>
      <p className="text-slate-600 mb-6">{error.message || "An unexpected error occurred in the application."}</p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
      >
        Try again
      </button>
    </div>
  );
}
