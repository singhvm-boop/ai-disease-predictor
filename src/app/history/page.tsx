import { HistoryPanel } from "@/components/history-panel";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Check history",
  description: "Symptom checks saved in this browser.",
};

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">On this device</p>
        <h1 className="mt-2 font-heading text-4xl tracking-tight">Recent checks</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          History stays in local storage on this browser. Clearing site data, or using another device, starts fresh.
        </p>
      </div>
      <HistoryPanel />
    </div>
  );
}
