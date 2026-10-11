import { Badge } from "@/components/ui/badge";
import { ageLabel, durationLabel, sexLabel, urgencyDetail, urgencyLabel } from "@/lib/labels";
import type { DiseasePrediction, PredictionResult, Urgency } from "@/lib/types";
import { cn } from "cn";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import Link from "next/link";

function urgencyClass(urgency: Urgency) {
  switch (urgency) {
    case "self-care":
      return "bg-emerald-50 text-emerald-900 ring-emerald-200";
    case "clinic":
      return "bg-sky-50 text-sky-950 ring-sky-200";
    case "urgent":
      return "bg-amber-50 text-amber-950 ring-amber-200";
    case "emergency":
      return "bg-rose-50 text-rose-950 ring-rose-200";
  }
}

function FitBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(4, value)}%` }} />
    </div>
  );
}

function PredictionCard({ prediction, rank }: { prediction: DiseasePrediction; rank: number }) {
  return (
    <article className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">Rank {rank}</p>
          <h3 className="mt-1 font-heading text-2xl tracking-tight">
            <Link href={`/conditions/${prediction.id}`} className="inline-flex items-center gap-1 hover:underline">
              {prediction.name}
              <ArrowUpRight className="size-4 text-muted-foreground" />
            </Link>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{prediction.system}</p>
        </div>
        <div className="min-w-28 text-right">
          <p className="font-heading text-3xl leading-none tabular-nums">{prediction.confidence}</p>
          <p className="mt-1 text-xs text-muted-foreground">fit, capped at 92</p>
        </div>
      </div>
      <div className="mt-3">
        <FitBar value={prediction.confidence} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1", urgencyClass(prediction.urgency))}>
          {urgencyLabel(prediction.urgency)}
        </span>
        <Badge variant="outline">{Math.round(prediction.coverage * 100)}% of pattern reported</Badge>
      </div>
      <p className="mt-3 text-sm leading-relaxed">{prediction.summary}</p>
      <p className="mt-2 text-sm text-muted-foreground">{urgencyDetail(prediction.urgency)}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Matched</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {prediction.matched.map((symptom) => (
              <li key={symptom.id}>
                <Badge variant={symptom.hallmark ? "default" : "secondary"}>
                  {symptom.name}
                  {symptom.hallmark ? " · key" : ""}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Key signs not reported</p>
          {prediction.missingHallmarks.length === 0 ? (
            <p className="mt-2 text-sm">The hallmark signs in this pattern were all reported.</p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {prediction.missingHallmarks.map((symptom) => (
                <li key={symptom.id}>
                  <Badge variant="outline">{symptom.name}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="mt-4 rounded-xl bg-muted/70 p-3 text-sm leading-relaxed">
        <p>{prediction.care}</p>
        <p className="mt-2">{prediction.seekCare}</p>
      </div>
    </article>
  );
}

export function PredictionPanel({ result }: { result: PredictionResult }) {
  return (
    <section id="results" className="scroll-mt-24 space-y-4">
      <div>
        <h2 className="font-heading text-3xl tracking-tight">Pattern results</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Fit scores compare your symptoms with published-style patterns. A higher score means a closer match, not a probability that you have the condition. Context: {sexLabel(result.context.sex)}, {ageLabel(result.context.ageBand)}, {durationLabel(result.context.duration)}.
        </p>
      </div>

      {result.redFlags.length > 0 && (
        <div className="space-y-3">
          {result.redFlags.map((flag) => (
            <div key={flag.id} className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-950" role="alert">
              <p className="flex items-center gap-2 font-medium">
                <AlertTriangle className="size-4" />
                {flag.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed">{flag.message}</p>
              <p className="mt-2 text-sm font-medium">{flag.action}</p>
            </div>
          ))}
        </div>
      )}

      {result.ignored.length > 0 && (
        <p className="text-sm text-muted-foreground">Ignored unrecognized ids: {result.ignored.join(", ")}.</p>
      )}

      {result.lowConfidence && (
        <div className="rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-950 ring-1 ring-amber-200">
          {result.recognized.length < 2
            ? "One symptom is not enough to separate conditions. Add the details that feel most specific."
            : "These symptoms do not line up strongly with one pattern. The list below is a weak overlap, not a likely answer. If you feel unwell, a clinician can examine you directly."}
        </div>
      )}

      {result.predictions.length === 0 ? (
        <div className="rounded-2xl bg-card p-6 ring-1 ring-foreground/10">
          <h3 className="font-heading text-xl">No pattern to rank</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            None of the entered symptoms are in the Meridian catalog. Search the symptom list and choose the closest match.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {result.predictions.map((prediction, index) => (
            <PredictionCard key={prediction.id} prediction={prediction} rank={index + 1} />
          ))}
        </div>
      )}
    </section>
  );
}
