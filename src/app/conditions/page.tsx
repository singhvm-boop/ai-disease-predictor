import { ConditionsBrowser } from "@/components/conditions-browser";
import { diseases } from "@/lib/knowledge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Condition library",
  description: "Browse the conditions Meridian can compare against reported symptoms.",
};

export default function ConditionsPage() {
  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Library</p>
        <h1 className="mt-2 font-heading text-4xl tracking-tight">Conditions in the model</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {diseases.length} patterns covering common infections, airway disease, gut and urinary problems, headaches, skin, joints, and a few endocrine and mood patterns. Each page lists the symptoms the scorer treats as important.
        </p>
      </div>
      <ConditionsBrowser />
    </div>
  );
}
