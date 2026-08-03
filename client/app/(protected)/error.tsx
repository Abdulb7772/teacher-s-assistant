"use client";

import { useEffect } from "react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";

export default function ProtectedError({
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
    <Alert variant="error" className="mt-8">
      <div className="flex w-full items-center justify-between gap-4">
        <span>Something went wrong loading this page.</span>
        <Button variant="ghost" size="sm" onClick={reset}>
          Try again
        </Button>
      </div>
    </Alert>
  );
}
