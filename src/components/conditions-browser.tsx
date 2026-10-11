"use client";

import { Input } from "@/components/ui/input";
import { diseases } from "@/lib/knowledge";
import { urgencyLabel } from "@/lib/labels";
import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export function ConditionsBrowser() {
  const [query, setQuery] = useState("");
  const [system, setSystem] = useState("All");
  const systems = useMemo(() => ["All", ...Array.from(new Set(diseases.map((disease) => disease.system)))], []);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return diseases.filter((disease) => {
      if (system !== "All" && disease.system !== system) return false;
      if (!needle) return true;
      return `${disease.name} ${disease.summary} ${disease.system}`.toLowerCase().includes(needle);
    });
  }, [query, system]);

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search conditions"
          aria-label="Search conditions"
          className="h-10 pl-9"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {systems.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setSystem(item)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs ${system === item ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}
            aria-pressed={system === item}
          >
            {item}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <div className="rounded-2xl bg-card p-6 text-sm text-muted-foreground ring-1 ring-foreground/10">
          No conditions match that filter. Clear the search or choose another body system.
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {visible.map((disease) => (
            <li key={disease.id}>
              <Link href={`/conditions/${disease.id}`} className="block h-full rounded-2xl bg-card p-4 ring-1 ring-foreground/10 hover:bg-muted/40">
                <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">{disease.system}</p>
                <h2 className="mt-1 font-heading text-xl tracking-tight">{disease.name}</h2>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{disease.summary}</p>
                <p className="mt-3 text-xs font-medium">{urgencyLabel(disease.urgency)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
