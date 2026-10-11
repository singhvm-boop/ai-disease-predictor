"use client";

import { Button } from "@/components/ui/button";
import { clearHistory, historyServerSnapshot, historySnapshot, subscribeHistory, type SavedCheck } from "@/lib/history";
import { ageLabel, durationLabel, sexLabel } from "@/lib/labels";
import type { AgeBand, Duration, Sex } from "@/lib/types";
import Link from "next/link";
import { useSyncExternalStore } from "react";

function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function hrefFor(check: SavedCheck) {
  const params = new URLSearchParams();
  params.set("symptoms", check.symptomIds.join(","));
  if (check.sex && check.sex !== "unspecified") params.set("sex", check.sex);
  if (check.ageBand) params.set("age", check.ageBand);
  if (check.duration) params.set("duration", check.duration);
  return `/?${params.toString()}`;
}

function parseChecks(raw: string): SavedCheck[] {
  try {
    const parsed = JSON.parse(raw) as SavedCheck[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function HistoryPanel() {
  const raw = useSyncExternalStore(subscribeHistory, historySnapshot, historyServerSnapshot);
  const checks = parseChecks(raw);

  if (checks.length === 0) {
    return (
      <div className="rounded-2xl bg-card p-6 ring-1 ring-foreground/10">
        <h2 className="font-heading text-2xl tracking-tight">No checks yet</h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Predictions you run on this device are stored locally in the browser. Nothing is sent to an account, because Meridian does not have one.
        </p>
        <Button className="mt-4" render={<Link href="/" />}>
          Start a check
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => {
            clearHistory();
          }}
        >
          Clear history
        </Button>
      </div>
      <ul className="space-y-3">
        {checks.map((check) => (
          <li key={check.id} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">{formatWhen(check.at)}</p>
                <h2 className="mt-1 font-heading text-xl tracking-tight">
                  {check.topName ?? "No strong pattern"}
                  {check.topConfidence !== null ? ` · fit ${check.topConfidence}` : ""}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {sexLabel(check.sex as Sex)} · {ageLabel(check.ageBand as AgeBand | null)} · {durationLabel(check.duration as Duration | null)}
                </p>
              </div>
              <Button variant="outline" size="sm" render={<Link href={hrefFor(check)} />}>
                Open again
              </Button>
            </div>
            <p className="mt-3 text-sm leading-relaxed">{check.symptomNames.join(", ")}</p>
            {check.lowConfidence && <p className="mt-2 text-xs text-amber-800">Marked as a weak match.</p>}
            {check.redFlagTitles.length > 0 && (
              <p className="mt-2 text-xs font-medium text-rose-800">Flags: {check.redFlagTitles.join(", ")}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
