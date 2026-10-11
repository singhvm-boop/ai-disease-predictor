import { Checker } from "@/components/checker";
import { ageBandOptions, durationOptions, sexOptions } from "@/lib/predict";
import type { AgeBand, Duration, Sex } from "@/lib/types";
import { Suspense } from "react";

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function CheckerFallback() {
  return <p className="text-sm text-muted-foreground">Loading the symptom checker…</p>;
}

async function CheckerFromSearch({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawSymptoms = one(params.symptoms) ?? "";
  const initialSymptoms = rawSymptoms
    .split(",")
    .map((id) => id.trim())
    .filter((id, index, all) => id && all.indexOf(id) === index)
    .slice(0, 30);
  const sexValue = one(params.sex);
  const ageValue = one(params.age);
  const durationValue = one(params.duration);
  const initialSex: Sex = sexOptions.some((option) => option.value === sexValue) ? (sexValue as Sex) : "unspecified";
  const initialAge: AgeBand | "" = ageBandOptions.some((option) => option.value === ageValue) ? (ageValue as AgeBand) : "";
  const initialDuration: Duration | "" = durationOptions.some((option) => option.value === durationValue)
    ? (durationValue as Duration)
    : "";

  return (
    <Checker
      initialSymptoms={initialSymptoms}
      initialSex={initialSex}
      initialAge={initialAge}
      initialDuration={initialDuration}
      autoRun={initialSymptoms.length > 0}
    />
  );
}

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <Suspense fallback={<CheckerFallback />}>
      <CheckerFromSearch searchParams={searchParams} />
    </Suspense>
  );
}
