import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-10">
      <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">404</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight">That page is not in Meridian</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        The condition or route you asked for is not part of this catalog.
      </p>
      <div className="mt-5 flex gap-3">
        <Button render={<Link href="/" />}>Symptom check</Button>
        <Button variant="outline" render={<Link href="/conditions" />}>
          Library
        </Button>
      </div>
    </div>
  );
}
