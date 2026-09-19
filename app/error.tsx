"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-wrap py-20 text-center">
      <h1 className="font-display text-4xl uppercase tracking-tight">
        Something went wrong
      </h1>
      <p className="mt-3 text-muted">
        An unexpected error occurred. Please try again.
      </p>
      <button onClick={reset} className="btn-primary mt-8">
        Try again
      </button>
    </div>
  );
}
