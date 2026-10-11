"use client";

import { Button } from "@/components/ui/button";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg py-10">
      <h1 className="font-heading text-4xl tracking-tight">Something broke while loading this page</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        The checker itself may still be fine. Retry this view, or go back and run the prediction again.
      </p>
      <Button className="mt-5" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
