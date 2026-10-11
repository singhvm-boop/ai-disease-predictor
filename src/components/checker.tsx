"use client";

import { PredictionPanel } from "@/components/prediction-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { exampleCases } from "@/lib/examples";
import { saveCheck } from "@/lib/history";
import { symptoms } from "@/lib/knowledge";
import { ageBandOptions, durationOptions, sexOptions } from "@/lib/predict";
import type { AgeBand, Duration, PredictionResult, Sex, SymptomCategory } from "@/lib/types";
import { symptomCategories } from "@/lib/types";
import { cn } from "cn";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type CheckerProps = {
  initialSymptoms: string[];
  initialSex: Sex;
  initialAge: AgeBand | "";
  initialDuration: Duration | "";
  autoRun: boolean;
};

const fieldClass =
  "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40";

export function Checker({ initialSymptoms, initialSex, initialAge, initialDuration, autoRun }: CheckerProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SymptomCategory | "All">("All");
  const [selected, setSelected] = useState<string[]>(initialSymptoms);
  const [sex, setSex] = useState<Sex>(initialSex);
  const [ageBand, setAgeBand] = useState<AgeBand | "">(initialAge);
  const [duration, setDuration] = useState<Duration | "">(initialDuration);
  const [loading, setLoading] = useState(autoRun);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return symptoms.filter((symptom) => {
      if (category !== "All" && symptom.category !== category) return false;
      if (!needle) return true;
      const haystack = [symptom.name, symptom.hint, symptom.category, ...symptom.aliases].join(" ").toLowerCase();
      return haystack.includes(needle);
    });
  }, [category, query]);

  function toggle(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
    setResult(null);
    setError(null);
  }

  async function run(symptomsToScore: string[], context?: { sex?: Sex; ageBand?: AgeBand | ""; duration?: Duration | "" }) {
    const nextSex = context?.sex ?? sex;
    const nextAge = context?.ageBand ?? ageBand;
    const nextDuration = context?.duration ?? duration;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: symptomsToScore,
          sex: nextSex,
          ageBand: nextAge || null,
          duration: nextDuration || null,
        }),
      });
      const payload = (await response.json()) as PredictionResult & { error?: string };
      if (!response.ok) {
        setResult(null);
        setError(payload.error ?? "The prediction service rejected that request.");
        return;
      }
      setResult(payload);
      saveCheck(payload);
      window.setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch {
      setResult(null);
      setError("The prediction service could not be reached. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const bootKey = `${initialSex}|${initialAge}|${initialDuration}|${initialSymptoms.join(",")}`;
  useEffect(() => {
    if (!autoRun) return;
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch("/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            symptoms: initialSymptoms,
            sex: initialSex,
            ageBand: initialAge || null,
            duration: initialDuration || null,
          }),
          signal: controller.signal,
        });
        const payload = (await response.json()) as PredictionResult & { error?: string };
        if (controller.signal.aborted) return;
        if (!response.ok) {
          setError(payload.error ?? "The prediction service rejected that request.");
          setLoading(false);
          return;
        }
        setResult(payload);
        saveCheck(payload);
        setLoading(false);
      } catch {
        if (controller.signal.aborted) return;
        setError("The prediction service could not be reached. Check your connection and try again.");
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [autoRun, bootKey, initialAge, initialDuration, initialSex, initialSymptoms]);

  return (
    <div className="space-y-10 pb-24 md:pb-0">
      <section className="grid items-end gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Healthcare support</p>
          <h1 className="mt-3 max-w-xl font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            Name the symptoms. See which conditions fit.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Meridian compares what you report with patterns for common conditions, shows the signs that match, and flags combinations that should not wait for a ranked list.
          </p>
        </div>
        <aside className="rounded-2xl bg-primary px-4 py-4 text-primary-foreground sm:px-5">
          <p className="text-sm leading-relaxed">
            This is support for learning and triage orientation. If you have chest pain, trouble breathing, one-sided weakness, or feel seriously unwell, contact emergency services instead of using this page.
          </p>
        </aside>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-3xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-2xl tracking-tight">Symptoms</h2>
              <p className="text-sm text-muted-foreground">{selected.length} selected · pick at least two for a useful ranking</p>
            </div>
            {selected.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => { setSelected([]); setResult(null); }}>
                Clear
              </Button>
            )}
          </div>

          {selected.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Selected symptoms">
              {selected.map((id) => {
                const symptom = symptoms.find((item) => item.id === id);
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => toggle(id)}
                      className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs text-primary-foreground"
                    >
                      {symptom?.name ?? id}
                      <X className="size-3" />
                      <span className="sr-only">Remove {symptom?.name ?? id}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="relative mt-4">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search fever, wheeze, burning urine…"
              aria-label="Search symptoms"
              className="h-10 pl-9"
            />
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Symptom categories">
            {(["All", ...symptomCategories] as const).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={category === item}
                onClick={() => setCategory(item)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-xs",
                  category === item ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
                )}
              >
                {item}
              </button>
            ))}
          </div>

          <ul className="mt-3 grid max-h-[28rem] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {visible.length === 0 && (
              <li className="rounded-xl bg-muted/60 px-3 py-6 text-sm text-muted-foreground sm:col-span-2">
                No symptoms match that search. Try a plainer word, such as cough, rash, or thirst.
              </li>
            )}
            {visible.map((symptom) => {
              const on = selectedSet.has(symptom.id);
              return (
                <li key={symptom.id}>
                  <button
                    type="button"
                    onClick={() => toggle(symptom.id)}
                    aria-pressed={on}
                    className={cn(
                      "h-full w-full rounded-xl px-3 py-2.5 text-left ring-1 transition-colors",
                      on ? "bg-primary/10 ring-primary" : "bg-background ring-foreground/10 hover:bg-muted",
                    )}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium">{symptom.name}</span>
                      {on && <Badge>Added</Badge>}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{symptom.hint}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-20">
          <form
            className="space-y-4 rounded-3xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5"
            onSubmit={(event) => {
              event.preventDefault();
              void run(selected);
            }}
          >
            <div>
              <h2 className="font-heading text-2xl tracking-tight">Context</h2>
              <p className="text-sm text-muted-foreground">Optional. Age and sex only adjust a few patterns.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sex">Sex</Label>
              <select id="sex" className={fieldClass} value={sex} onChange={(event) => setSex(event.target.value as Sex)}>
                {sexOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="age">Age band</Label>
              <select id="age" className={fieldClass} value={ageBand} onChange={(event) => setAgeBand(event.target.value as AgeBand | "")}>
                <option value="">Not specified</option>
                {ageBandOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="duration">How long</Label>
              <select
                id="duration"
                className={fieldClass}
                value={duration}
                onChange={(event) => setDuration(event.target.value as Duration | "")}
              >
                <option value="">Not specified</option>
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" className="h-10 w-full" disabled={loading || selected.length === 0}>
              {loading ? "Comparing patterns…" : "Predict possible conditions"}
            </Button>
            {selected.length === 0 && (
              <p className="text-xs leading-relaxed text-muted-foreground">Choose symptoms before running a prediction.</p>
            )}
            {error && (
              <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-950 ring-1 ring-rose-200" role="alert">
                <p>{error}</p>
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => void run(selected)}>
                  Try again
                </Button>
              </div>
            )}
          </form>

          <div className="rounded-3xl bg-muted/70 p-4">
            <h3 className="text-sm font-medium">Try a known pattern</h3>
            <ul className="mt-3 space-y-2">
              {exampleCases.map((example) => (
                <li key={example.id}>
                  <button
                    type="button"
                    className="w-full rounded-xl bg-card px-3 py-2 text-left ring-1 ring-foreground/10 hover:bg-background"
                    onClick={() => {
                      setSelected(example.symptoms);
                      setResult(null);
                      void run(example.symptoms);
                    }}
                  >
                    <span className="block text-sm font-medium">{example.label}</span>
                    <span className="block text-xs text-muted-foreground">{example.detail}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {result && <PredictionPanel result={result} />}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 p-3 backdrop-blur md:hidden">
        <Button className="h-11 w-full" disabled={loading || selected.length === 0} onClick={() => void run(selected)}>
          {loading ? "Comparing…" : `Predict from ${selected.length} symptom${selected.length === 1 ? "" : "s"}`}
        </Button>
      </div>
    </div>
  );
}
