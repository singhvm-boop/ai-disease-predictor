import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-end md:justify-between">
        <p className="max-w-xl leading-relaxed">
          Meridian is an educational healthcare support tool. It ranks conditions that share symptom patterns. It does not diagnose, prescribe, or replace a clinician, and it is not for emergencies.
        </p>
        <div className="flex gap-4">
          <Link href="/method" className="underline-offset-4 hover:underline">
            How scoring works
          </Link>
          <Link href="/conditions" className="underline-offset-4 hover:underline">
            Condition library
          </Link>
        </div>
      </div>
    </footer>
  );
}
